// hooks/useChatSession.js
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { ChatService } from '../services/chatService';
import { AIService } from '../services/aiService';
import { ChatUtils } from '../utils/chatUtils';

export const useChatSession = () => {
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize chat session
  const initializeSession = useCallback(async (userId = 'user-id') => {
    try {
      setIsLoading(true);
      setError(null);

      // Create new chat session
      const session = await ChatService.createChatSession(userId);
      setChatSession(session);

      // Create and add welcome message
      const welcomeMessage = await ChatService.createWelcomeMessage(session.id);
      setMessages([welcomeMessage]);

      // Load existing messages if any
      const existingMessages = await ChatService.loadChatHistory(session.id);
      if (existingMessages.length > 1) { // More than just welcome message
        setMessages(existingMessages);
      }

      setIsLoading(false);
      return session;
    } catch (error) {
      console.error('Error initializing chat session:', error);
      setError('Failed to initialize chat session');
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Send message and get AI response
  const sendMessage = useCallback(async (messageText) => {
    if (!chatSession || !messageText.trim()) return;

    const validation = ChatUtils.validateInput(messageText);
    if (!validation.isValid) {
      Alert.alert('Invalid Message', validation.error);
      return;
    }

    try {
      // Create and add user message
      const userMessage = ChatUtils.createUserMessage(messageText);
      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      const savedUserMsg = await ChatService.saveMessage(chatSession.id, userMessage);
      if (savedUserMsg) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, id: savedUserMsg.id, status: 'delivered' } 
              : msg
          )
        );
      }

      // Get AI response
      setIsLoading(true);
      const aiResponse = await AIService.callMistralAI(messageText, messages, chatSession.id);
      
      // Create and add AI message
      const aiMessage = ChatUtils.createAgentMessage(AIService.processAIResponse(aiResponse));
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI message to database
      await ChatService.saveMessage(chatSession.id, aiMessage);
      
      setIsLoading(false);
      return aiMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Add fallback message
      const fallbackMessage = ChatUtils.createAgentMessage(AIService.getFallbackResponse());
      setMessages(prev => [...prev, fallbackMessage]);
      await ChatService.saveMessage(chatSession.id, fallbackMessage);
      
      setError('Failed to send message');
    }
  }, [chatSession, messages]);

  // End chat session
  const endSession = useCallback(async () => {
    if (!chatSession) return;

    try {
      await ChatService.endChatSession(chatSession.id);
      setChatSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Error ending chat session:', error);
      // Still clear local state even if DB update fails
      setChatSession(null);
      setMessages([]);
    }
  }, [chatSession]);

  // Update message status
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  return {
    chatSession,
    messages,
    isLoading,
    error,
    initializeSession,
    sendMessage,
    endSession,
    updateMessageStatus,
    clearError: () => setError(null)
  };
};
