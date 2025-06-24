import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useChatSession = () => {
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [user, setUser] = useState(null);
  
  const abortControllerRef = useRef(null);
  const realtimeChannelRef = useRef(null);

  // RapidAPI configuration
  const RAPIDAPI_CONFIG = {
    url: 'https://chatgpt-42.p.rapidapi.com/aitohuman',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
      'x-rapidapi-key': '6fca9451f9mshff26ffeed021e84p1ad7a6jsn5beeb189f19e'
    }
  };

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Initialize chat session
  const initializeSession = useCallback(async (customTitle = null) => {
    try {
      setError(null);
      setIsLoading(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      // Create a new chat session in Supabase
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: user?.id || null,
            title: customTitle || 'Chat with Dameah AI',
            status: 'active',
            metadata: {
              model: 'gpt-4o-mini', // Using RapidAPI ChatGPT
              temperature: 0.7,
              max_tokens: 1000,
              provider: 'rapidapi-chatgpt'
            }
          }
        ])
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Failed to create chat session: ${sessionError.message}`);
      }

      setChatSession({
        id: sessionData.id,
        userId: sessionData.user_id,
        title: sessionData.title,
        startTime: new Date(sessionData.created_at),
        isActive: sessionData.status === 'active',
        metadata: sessionData.metadata,
        provider: 'rapidapi-chatgpt'
      });

      // Add welcome message
      const welcomeMessage = {
        id: `msg_${Date.now()}`,
        text: "Hi! I'm Dameah, your AI assistant powered by ChatGPT via RapidAPI. How can I help you today?",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        session_id: sessionData.id
      };

      // Save welcome message to database
      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionData.id,
            content: welcomeMessage.text,
            role: 'assistant',
            status: 'delivered',
            metadata: {
              system_message: true,
              welcome: true
            }
          }
        ]);

      if (msgError) {
        console.warn('Failed to save welcome message:', msgError);
      }

      setMessages([welcomeMessage]);

      // Set up real-time subscription for new messages
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
      }

      realtimeChannelRef.current = supabase
        .channel(`chat_session_${sessionData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionData.id}`
          },
          (payload) => {
            const newMessage = {
              id: payload.new.id,
              text: payload.new.content,
              role: payload.new.role,
              timestamp: payload.new.created_at,
              status: payload.new.status,
              session_id: payload.new.session_id,
              metadata: payload.new.metadata
            };
            
            // Only add if it's not already in messages (avoid duplicates)
            setMessages(prev => {
              const exists = prev.some(msg => 
                msg.id === newMessage.id || 
                (msg.text === newMessage.text && msg.timestamp === newMessage.timestamp)
              );
              return exists ? prev : [...prev, newMessage];
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionData.id}`
          },
          (payload) => {
            // Update message status or content
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id 
                  ? {
                      ...msg,
                      text: payload.new.content,
                      status: payload.new.status,
                      metadata: payload.new.metadata
                    }
                  : msg
              )
            );
          }
        )
        .subscribe();

    } catch (err) {
      setError(err.message);
      console.error('Session initialization error:', err);
      
      // Add error message to display
      const errorMessage = {
        id: `msg_${Date.now()}`,
        text: `Sorry, I couldn't initialize the chat session: ${err.message}. Please try again.`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        isError: true
      };
      
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Call RapidAPI ChatGPT service
  const callRapidAPIChatGPT = useCallback(async (messageText, conversationHistory = []) => {
    try {
      // Build context from conversation history
      let contextText = '';
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5); // Last 5 messages for context
        contextText = recentHistory
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.text}`)
          .join('\n') + '\n\n';
      }

      const fullText = contextText + `Human: ${messageText}\nAssistant:`;

      const response = await fetch(RAPIDAPI_CONFIG.url, {
        method: 'POST',
        headers: RAPIDAPI_CONFIG.headers,
        body: JSON.stringify({
          text: fullText
        })
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // The API should return the AI-humanized text
      if (data && (data.result || data.text || data.response)) {
        return data.result || data.text || data.response;
      } else {
        throw new Error('Invalid response format from RapidAPI');
      }
    } catch (error) {
      console.error('RapidAPI ChatGPT Error:', error);
      throw error;
    }
  }, []);

  // Send message using RapidAPI ChatGPT
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !chatSession) return;

    setIsLoading(true);
    setError(null);

    // Add user message to state immediately
    const userMessage = {
      id: `msg_${Date.now()}`,
      text: messageText.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending',
      session_id: chatSession.id
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to database
      const { data: savedUserMsg, error: saveError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatSession.id,
            content: userMessage.text,
            role: 'user',
            status: 'sent'
          }
        ])
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save message: ${saveError.message}`);
      }

      // Update user message with database ID and status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, id: savedUserMsg.id, status: 'sent' }
            : msg
        )
      );

      // Call RapidAPI ChatGPT service
      const aiResponse = await callRapidAPIChatGPT(messageText, messages.slice(-10));

      // Create AI response message
      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        text: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        session_id: chatSession.id
      };

      // Save AI response to database
      const { data: savedAiMsg, error: saveAiError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatSession.id,
            content: aiResponse,
            role: 'assistant',
            status: 'delivered',
            metadata: {
              model: chatSession.metadata?.model || 'gpt-4o-mini',
              provider: 'rapidapi-chatgpt'
            }
          }
        ])
        .select()
        .single();

      if (saveAiError) {
        console.warn('Failed to save AI response:', saveAiError);
        // Still add to UI even if DB save fails
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Update with database ID
        setMessages(prev => [...prev, { ...aiMessage, id: savedAiMsg.id }]);
      }

      // Update user message status to delivered
      setMessages(prev => 
        prev.map(msg => 
          msg.id === savedUserMsg.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );

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

      // Add error message
      const errorMessage = {
        id: `msg_${Date.now() + 1}`,
        text: `Sorry, I encountered an issue: ${err.message}. Please try again.`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        session_id: chatSession.id,
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, chatSession, callRapidAPIChatGPT]);

  // Streaming version (simulated since RapidAPI doesn't support streaming)
  const sendMessageStream = useCallback(async (messageText) => {
    if (!messageText.trim() || !chatSession) return;

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = {
      id: `msg_${Date.now()}`,
      text: messageText.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending',
      session_id: chatSession.id
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to database
      const { data: savedUserMsg, error: saveError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatSession.id,
            content: userMessage.text,
            role: 'user',
            status: 'sent'
          }
        ])
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save message: ${saveError.message}`);
      }

      // Create AI message placeholder
      const aiMessageId = `msg_${Date.now() + 1}`;
      const aiMessage = {
        id: aiMessageId,
        text: '',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'typing',
        session_id: chatSession.id
      };

      setMessages(prev => [
        ...prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, id: savedUserMsg.id, status: 'sent' }
            : msg
        ),
        aiMessage
      ]);

      // Get full response from RapidAPI
      const fullResponse = await callRapidAPIChatGPT(messageText, messages.slice(-10));

      // Simulate streaming by revealing text gradually
      const words = fullResponse.split(' ');
      let currentText = '';

      for (let i = 0; i < words.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Stream aborted');
        }

        currentText += (i > 0 ? ' ' : '') + words[i];
        
        // Update AI message with partial content
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: currentText, status: 'typing' }
              : msg
          )
        );

        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Save final AI response to database
      const { error: saveAiError } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: chatSession.id,
            content: fullResponse,
            role: 'assistant',
            status: 'delivered',
            metadata: {
              model: chatSession.metadata?.model || 'gpt-4o-mini',
              provider: 'rapidapi-chatgpt'
            }
          }
        ]);

      if (saveAiError) {
        console.warn('Failed to save AI response:', saveAiError);
      }

      // Finalize AI message
      setMessages(prev => [
        ...prev.map(msg => {
          if (msg.id === savedUserMsg.id) {
            return { ...msg, status: 'delivered' };
          }
          if (msg.id === aiMessageId) {
            return { ...msg, text: fullResponse, status: 'delivered' };
          }
          return msg;
        })
      ]);

    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Stream aborted') {
        console.log('Stream aborted');
        return;
      }

      setError(err.message);
      console.error('Send message stream error:', err);
      
      // Remove AI placeholder and add error message
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== aiMessageId).map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        ),
        {
          id: `msg_${Date.now() + 2}`,
          text: `Sorry, I encountered an issue: ${err.message}. Please try again.`,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          status: 'delivered',
          session_id: chatSession.id,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages, chatSession, callRapidAPIChatGPT]);

  // Load conversation history
  const getConversationHistory = useCallback(async (sessionId = null) => {
    try {
      const targetSessionId = sessionId || chatSession?.id;
      if (!targetSessionId) {
        throw new Error('No session ID provided');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to load history: ${error.message}`);
      }

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        text: msg.content,
        role: msg.role,
        timestamp: msg.created_at,
        status: msg.status,
        session_id: msg.session_id,
        metadata: msg.metadata
      }));

      setMessages(formattedMessages);
      return formattedMessages;
    } catch (err) {
      setError(`Failed to load conversation history: ${err.message}`);
      return [];
    }
  }, [chatSession]);

  // Load previous conversation by ID
  const loadConversation = useCallback(async (sessionId) => {
    try {
      setIsLoading(true);
      
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error(`Failed to load session: ${sessionError.message}`);
      }

      setChatSession({
        id: sessionData.id,
        userId: sessionData.user_id,
        title: sessionData.title,
        startTime: new Date(sessionData.created_at),
        isActive: sessionData.status === 'active',
        metadata: sessionData.metadata,
        provider: 'rapidapi-chatgpt'
      });

      // Load messages
      await getConversationHistory(sessionId);

      // Set up real-time subscription for this session
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
      }

      realtimeChannelRef.current = supabase
        .channel(`chat_session_${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            const newMessage = {
              id: payload.new.id,
              text: payload.new.content,
              role: payload.new.role,
              timestamp: payload.new.created_at,
              status: payload.new.status,
              session_id: payload.new.session_id,
              metadata: payload.new.metadata
            };
            
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              return exists ? prev : [...prev, newMessage];
            });
          }
        )
        .subscribe();

    } catch (err) {
      setError(`Failed to load conversation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [getConversationHistory]);

  // Get user's chat sessions
  const getUserSessions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to load sessions: ${error.message}`);
      }

      return data;
    } catch (err) {
      setError(`Failed to load sessions: ${err.message}`);
      return [];
    }
  }, []);

  // Test RapidAPI ChatGPT connection
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const testResponse = await callRapidAPIChatGPT('Hello, this is a connection test.');
      
      const testMessage = {
        id: `msg_${Date.now()}`,
        text: `✅ RapidAPI ChatGPT connection is working! Test response: ${testResponse}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, testMessage]);
      return true;
    } catch (err) {
      const errorMessage = {
        id: `msg_${Date.now()}`,
        text: `❌ Connection test failed: ${err.message}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(`Connection test failed: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [callRapidAPIChatGPT]);

  // End current session
  const endSession = useCallback(async () => {
    try {
      if (!chatSession) return;

      // Update session status in database
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', chatSession.id);

      if (error) {
        console.warn('Failed to update session status:', error);
      }

      setChatSession(prev => prev ? { ...prev, isActive: false, endTime: new Date() } : null);
      
      // Add goodbye message
      const goodbyeMessage = {
        id: `msg_${Date.now()}`,
        text: "Session ended. Thanks for chatting with me!",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'delivered',
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, goodbyeMessage]);

      // Unsubscribe from real-time updates
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }

    } catch (err) {
      setError(err.message);
      console.error('End session error:', err);
    }
  }, [chatSession]);

  // Cancel current streaming request
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const disconnect = useCallback(() => {
    // Cancel any ongoing streams
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Unsubscribe from real-time updates
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe();
    }

    // Reset state
    setChatSession(null);
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    chatSession,
    messages,
    isLoading,
    isStreaming,
    error,
    user,

    // Session management
    initializeSession,
    loadConversation,
    endSession,
    disconnect,

    // Messaging
    sendMessage,
    sendMessageStream,
    cancelStream,

    // History
    getConversationHistory,
    getUserSessions,

    // Utilities
    testConnection,
    clearError,
    clearMessages
  };
};