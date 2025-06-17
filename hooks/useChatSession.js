import { useState, useCallback, useRef } from 'react';
import { HuggingFaceService } from '../utils/huggingfaceService';

export const useChatSession = () => {
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const huggingfaceService = useRef(new HuggingFaceService()).current;

  const initializeSession = useCallback(async () => {
    try {
      setError(null);
      
      // Validate Hugging Face API key
      const validation = await huggingfaceService.validateApiKey();
      if (!validation.valid) {
        throw new Error(`Invalid or missing Hugging Face API key: ${validation.error}. Please check your .env configuration and get your free key at https://huggingface.co/settings/tokens`);
      }

      const sessionId = `chat_${Date.now()}`;
      setChatSession({
        id: sessionId,
        startTime: new Date(),
        isActive: true,
        provider: 'huggingface'
      });
      
      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        text: "Hi! I'm Dameah, your AI assistant powered by Hugging Face. How can I help you today?",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah'
      };
      
      setMessages([welcomeMessage]);
    } catch (err) {
      setError(err.message);
      console.error('Session initialization error:', err);
      
      // Add error message to show user what went wrong
      const errorMessage = {
        id: `msg_${Date.now()}`,
        text: `Sorry, I couldn't initialize the chat session: ${err.message}. Please check your Hugging Face API configuration.`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'System',
        isError: true
      };
      
      setMessages([errorMessage]);
    }
  }, [huggingfaceService]);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage = {
      id: `msg_${Date.now()}`,
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Update user message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );

      // Get Hugging Face response
      const aiResponse = await huggingfaceService.sendMessage(messageText, messages);

      // Add AI message
      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        text: aiResponse,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah'
      };

      setMessages(prev => [
        ...prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        ),
        aiMessage
      ]);

    } catch (err) {
      setError(err.message);
      console.error('Send message error:', err);
      
      // Update user message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );

      // Add error message with helpful context
      const errorMessage = {
        id: `msg_${Date.now() + 2}`,
        text: `Sorry, I encountered an issue: ${err.message}. Please try again.`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah',
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, huggingfaceService]);

  // Streaming version
  const sendMessageStream = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage = {
      id: `msg_${Date.now()}`,
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);

    // Create AI message placeholder
    const aiMessageId = `msg_${Date.now() + 1}`;
    const aiMessage = {
      id: aiMessageId,
      text: '',
      sender: 'agent',
      timestamp: new Date().toISOString(),
      status: 'typing',
      agentName: 'Dameah'
    };

    setMessages(prev => [
      ...prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'sent' }
          : msg
      ),
      aiMessage
    ]);

    try {
      await huggingfaceService.sendMessageStream(
        messageText, 
        messages,
        // onChunk callback - updates message as it streams
        (chunk, fullResponse) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, text: fullResponse, status: 'typing' }
                : msg
            )
          );
        },
        // onComplete callback
        (fullResponse) => {
          setMessages(prev => [
            ...prev.map(msg => {
              if (msg.id === userMessage.id) {
                return { ...msg, status: 'delivered' };
              }
              if (msg.id === aiMessageId) {
                return { ...msg, text: fullResponse, status: 'delivered' };
              }
              return msg;
            })
          ]);
        }
      );

    } catch (err) {
      setError(err.message);
      console.error('Send message stream error:', err);
      
      // Remove the AI placeholder message and add error message
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== aiMessageId).map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        ),
        {
          id: `msg_${Date.now() + 2}`,
          text: `Sorry, I encountered an issue: ${err.message}. Please try again.`,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          agentName: 'Dameah',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, huggingfaceService]);

  // Switch between different Hugging Face models
  const switchModel = useCallback(async (modelType) => {
    try {
      await huggingfaceService.switchModel(modelType);
      
      const switchMessage = {
        id: `msg_${Date.now()}`,
        text: `Switched to ${modelType} model. The conversation style may change slightly.`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'System',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, switchMessage]);
    } catch (err) {
      setError(`Failed to switch model: ${err.message}`);
    }
  }, [huggingfaceService]);

  // Get available models and current model info
  const getModelInfo = useCallback(() => {
    return huggingfaceService.getAvailableModels();
  }, [huggingfaceService]);

  // Test the Hugging Face connection
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const validation = await huggingfaceService.validateApiKey();
      
      const testMessage = {
        id: `msg_${Date.now()}`,
        text: validation.valid 
          ? '✅ Hugging Face connection is working properly!' 
          : `❌ Connection failed: ${validation.error}`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'System',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, testMessage]);
      return validation.valid;
    } catch (err) {
      setError(`Connection test failed: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [huggingfaceService]);

  const endSession = useCallback(async () => {
    try {
      setChatSession(prev => prev ? { ...prev, isActive: false, endTime: new Date() } : null);
      
      // Add goodbye message
      const goodbyeMessage = {
        id: `msg_${Date.now()}`,
        text: "Session ended. Thanks for chatting with me!",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, goodbyeMessage]);
      
      // Save conversation history to AsyncStorage if needed
      // await AsyncStorage.setItem(`chat_${chatSession?.id}`, JSON.stringify(messages));
    } catch (err) {
      setError(err.message);
      console.error('End session error:', err);
    }
  }, [chatSession?.id, messages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    chatSession,
    messages,
    isLoading,
    error,
    initializeSession,
    sendMessage,
    sendMessageStream,
    switchModel,
    getModelInfo,
    testConnection,
    endSession,
    clearError,
    clearMessages
  };
};