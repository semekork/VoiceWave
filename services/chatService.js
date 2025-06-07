// services/chatService.js
import { supabase } from '../lib/supabase';

export class ChatService {
  // Create a new chat session
  static async createChatSession(userId = 'user-id') {
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: userId,
            status: 'active',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  // Load chat history for a session
  static async loadChatHistory(sessionId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender === 'assistant' ? 'agent' : 'user',
        timestamp: new Date(msg.timestamp),
        agentName: msg.metadata?.agent_name || 'AI Assistant',
        status: msg.metadata?.status || 'delivered',
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }
  }

  // Save a message to the database
  static async saveMessage(sessionId, messageData) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          message: messageData.text,
          sender: messageData.sender === 'agent' ? 'assistant' : 'user',
          timestamp: messageData.timestamp.toISOString(),
          metadata: {
            status: messageData.status,
            agent_name: messageData.agentName,
            model: messageData.sender === 'agent' ? 'mistral-7b-instruct-v0.3' : null
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // End a chat session
  static async endChatSession(sessionId) {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending chat session:', error);
      throw error;
    }
  }

  // Create welcome message
  static async createWelcomeMessage(sessionId) {
    const welcomeMessage = {
      session_id: sessionId,
      message: "Hello! I'm your AI assistant powered by Mistral. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      metadata: {
        model: 'mistral-7b-instruct-v0.3',
        agent_name: 'AI Assistant',
        status: 'delivered'
      }
    };

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([welcomeMessage])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        text: data.message,
        sender: 'agent',
        timestamp: new Date(data.timestamp),
        agentName: 'AI Assistant',
        status: 'delivered',
      };
    } catch (error) {
      console.error('Error creating welcome message:', error);
      throw error;
    }
  }
}