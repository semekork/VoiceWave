// services/aiService.js
import { supabase } from '../lib/supabase';

export class AIService {
  // Call Mistral AI through Supabase Edge Function
  static async callMistralAI(userMessage, conversationHistory = [], sessionId = null) {
    try {
      // Prepare conversation context (last 6 messages for context)
      const context = conversationHistory.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      context.push({ role: 'user', content: userMessage });

      const { data, error } = await supabase.functions.invoke('mistral-chat', {
        body: {
          messages: context,
          model: 'mistralai/Mistral-7B-Instruct-v0.3',
          max_tokens: 500,
          temperature: 0.7,
          session_id: sessionId
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('Error calling Mistral AI:', error);
      throw error;
    }
  }

  // Generate fallback response for errors
  static getFallbackResponse() {
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
  }

  // Validate message before sending to AI
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message must be a non-empty string' };
    }

    if (message.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (message.length > 1000) {
      return { isValid: false, error: 'Message too long (max 1000 characters)' };
    }

    return { isValid: true };
  }

  // Process AI response
  static processAIResponse(response) {
    if (!response || typeof response !== 'string') {
      return this.getFallbackResponse();
    }

    // Clean up response (remove any unwanted characters, format, etc.)
    return response.trim();
  }
}