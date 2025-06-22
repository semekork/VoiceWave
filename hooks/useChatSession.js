import { useState, useCallback, useRef } from 'react';
import { KommunicateService } from '../utils/kommunicateService';

export const useChatSession = () => {
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const kommunicateService = useRef(new KommunicateService()).current;

  const initializeSession = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize Kommunicate with configuration
      await kommunicateService.initialize({
        apiKey: process.env.KOMMUNICATE_API_KEY,
        applicationId: process.env.KOMMUNICATE_APP_ID
      });

      // Validate API credentials
      const validation = await kommunicateService.validateApiKey();
      if (!validation.valid) {
        throw new Error(`Invalid or missing Kommunicate credentials: ${validation.error}. Please check your API key and Application ID configuration.`);
      }

      // Create a new conversation
      const conversationData = await kommunicateService.createConversation({
        title: 'Chat with Dameah AI',
        userType: 'mobile_user'
      });

      const sessionId = `chat_${Date.now()}`;
      setChatSession({
        id: sessionId,
        conversationId: conversationData.conversationId,
        startTime: new Date(),
        isActive: true,
        provider: 'kommunicate'
      });
      
      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        text: "Hi! I'm Dameah, your AI assistant. How can I help you today?",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah AI'
      };
      
      setMessages([welcomeMessage]);

      // Initialize WebSocket for real-time messaging (optional)
      try {
        await kommunicateService.initializeWebSocket();
        
        // Set up event handlers for real-time updates
        kommunicateService.setEventHandlers({
          onMessageReceived: (data) => {
            const newMessage = {
              id: `msg_${Date.now()}`,
              text: data.message || data.text,
              sender: data.source === 1 ? 'user' : 'agent',
              timestamp: new Date().toISOString(),
              status: 'delivered',
              agentName: data.source === 1 ? null : 'Dameah AI'
            };
            setMessages(prev => [...prev, newMessage]);
          },
          onTypingIndicator: (data) => {
            // Handle typing indicators if needed
            console.log('Typing indicator:', data);
          },
          onUserStatusChange: (data) => {
            // Handle user status changes if needed
            console.log('User status change:', data);
          }
        });
      } catch (wsError) {
        console.warn('WebSocket initialization failed, using REST API only:', wsError);
      }

    } catch (err) {
      setError(err.message);
      console.error('Session initialization error:', err);
      
      // Add error message to show user what went wrong
      const errorMessage = {
        id: `msg_${Date.now()}`,
        text: `Sorry, I couldn't initialize the chat session: ${err.message}. Please check your Kommunicate configuration.`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'System',
        isError: true
      };
      
      setMessages([errorMessage]);
    }
  }, [kommunicateService]);

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

      // Send message via Kommunicate
      const aiResponse = await kommunicateService.sendMessage(messageText, messages);

      // Add AI message
      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        text: aiResponse,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah AI'
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
        agentName: 'Dameah AI',
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, kommunicateService]);

  // Streaming version using Kommunicate's streaming simulation
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
      agentName: 'Dameah AI'
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
      await kommunicateService.sendMessageStream(
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
          agentName: 'Dameah AI',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, kommunicateService]);

  // Get conversation history from Kommunicate
  const getConversationHistory = useCallback(async () => {
    try {
      const history = await kommunicateService.getConversationHistory();
      setMessages(history);
      return history;
    } catch (err) {
      setError(`Failed to load conversation history: ${err.message}`);
      return [];
    }
  }, [kommunicateService]);

  // Get available bot configurations
  const getModelInfo = useCallback(() => {
    return kommunicateService.getAvailableModels();
  }, [kommunicateService]);

  // Test the Kommunicate connection
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const validation = await kommunicateService.validateApiKey();
      
      const testMessage = {
        id: `msg_${Date.now()}`,
        text: validation.valid 
          ? '✅ Kommunicate connection is working properly!' 
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
  }, [kommunicateService]);

  // Load previous conversation
  const loadConversation = useCallback(async (conversationId) => {
    try {
      setIsLoading(true);
      kommunicateService.conversationId = conversationId;
      const history = await kommunicateService.getConversationHistory(conversationId);
      setMessages(history);
      
      setChatSession(prev => ({
        ...prev,
        conversationId: conversationId,
        isActive: true
      }));
    } catch (err) {
      setError(`Failed to load conversation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [kommunicateService]);

  const endSession = useCallback(async () => {
    try {
      // Close the conversation in Kommunicate
      await kommunicateService.closeConversation();
      
      setChatSession(prev => prev ? { ...prev, isActive: false, endTime: new Date() } : null);
      
      // Add goodbye message
      const goodbyeMessage = {
        id: `msg_${Date.now()}`,
        text: "Session ended. Thanks for chatting with me!",
        sender: 'agent',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        agentName: 'Dameah AI',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, goodbyeMessage]);
    } catch (err) {
      setError(err.message);
      console.error('End session error:', err);
    }
  }, [kommunicateService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Disconnect from Kommunicate
  const disconnect = useCallback(() => {
    kommunicateService.disconnect();
    setChatSession(null);
    setMessages([]);
    setError(null);
  }, [kommunicateService]);

  return {
    chatSession,
    messages,
    isLoading,
    error,
    initializeSession,
    sendMessage,
    sendMessageStream,
    getConversationHistory,
    loadConversation,
    getModelInfo,
    testConnection,
    endSession,
    clearError,
    clearMessages,
    disconnect
  };
};