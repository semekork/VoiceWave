// hooks/useChatSession.js
import { useState, useCallback, useRef } from 'react';
import { OpenAIService } from '../utils/openaiService';

export const useChatSession = () => {
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const openaiService = useRef(new OpenAIService()).current;

  const initializeSession = useCallback(async () => {
    try {
      setError(null);
      
      // Validate API key first
      const isValidKey = await openaiService.validateApiKey();
      if (!isValidKey) {
        throw new Error('Invalid or missing OpenAI API key. Please check your .env configuration.');
      }

      const sessionId = `chat_${Date.now()}`;
      setChatSession({
        id: sessionId,
        startTime: new Date(),
        isActive: true,
        provider: 'openai'
      });
      
      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        text: "Hi! I'm Dameah, your AI assistant powered by OpenAI. How can I help you today?",
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
        text: `Sorry, I couldn't initialize the chat session: ${err.message}. Please check your API configuration.`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'System',
        isError: true
      };
      
      setMessages([errorMessage]);
    }
  }, [openaiService]);

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

      // Get OpenAI response
      const aiResponse = await openaiService.sendMessage(messageText, messages);

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
  }, [messages, openaiService]);

  // Enhanced streaming version
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
      await openaiService.sendMessageStream(
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
  }, [messages, openaiService]);

  const endSession = useCallback(async () => {
    try {
      setChatSession(prev => prev ? { ...prev, isActive: false, endTime: new Date() } : null);
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

  return {
    chatSession,
    messages,
    isLoading,
    error,
    initializeSession,
    sendMessage,
    sendMessageStream,
    endSession,
    clearError
  };
};