// utils/huggingfaceService.js
export class HuggingFaceService {
  constructor() {
    // TEMPORARY: Hardcoded API key - Replace with your actual token
    this.apiKey = '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'; // Replace this with your actual token
    
    // Fallback to environment variable if hardcoded token is not set
    if (this.apiKey === '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') {
      this.apiKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
    }
    
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    console.log('🚀 HuggingFaceService initialized');
    console.log('🔑 API Key status:', {
      hasKey: !!this.apiKey,
      keyStart: this.apiKey ? this.apiKey.substring(0, 8) : 'none',
      keyLength: this.apiKey ? this.apiKey.length : 0,
      isPlaceholder: this.apiKey === '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'
    });
    
    // Good free models for conversation
    this.models = {
      conversational: 'microsoft/DialoGPT-large',
      textGeneration: 'gpt2',
      instruction: 'google/flan-t5-large',
      chat: 'facebook/blenderbot-400M-distill'
    };
    
    this.currentModel = this.models.instruction; // Best for assistant-like responses
    
    if (!this.apiKey || this.apiKey === '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') {
      console.warn('❌ Hugging Face API key not found. Please add your token to the hardcoded variable or .env file');
      console.log('Get your free API key at: https://huggingface.co/settings/tokens');
    } else {
      console.log('✅ Hugging Face API key loaded successfully');
    }
  }

  // Format conversation history for better context
  formatConversationHistory(conversationHistory = []) {
    const recentMessages = conversationHistory.slice(-6); // Keep last 6 messages for context
    let context = '';
    
    recentMessages.forEach(msg => {
      if (msg.sender === 'user') {
        context += `Human: ${msg.text}\n`;
      } else {
        context += `Assistant: ${msg.text}\n`;
      }
    });
    
    return context;
  }

  async sendMessage(message, conversationHistory = []) {
    console.log('🔍 Checking API key in sendMessage:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'undefined');
    
    if (!this.apiKey || this.apiKey === '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' || this.apiKey.trim() === '') {
      console.error('❌ API key validation failed:', {
        hasKey: !!this.apiKey,
        isPlaceholder: this.apiKey === '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',
        keyLength: this.apiKey ? this.apiKey.length : 0
      });
      throw new Error('Hugging Face API key not configured. Please replace the hardcoded token in huggingfaceService.js with your actual token from https://huggingface.co/settings/tokens');
    }

    try {
      const context = this.formatConversationHistory(conversationHistory);
      
      // Create a well-formatted prompt
      const prompt = `${context}Human: ${message}\nAssistant:`;

      const response = await fetch(`${this.baseUrl}/${this.currentModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            repetition_penalty: 1.1,
            return_full_text: false
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle common Hugging Face errors
        if (response.status === 503) {
          throw new Error('Model is loading. Please try again in a few seconds.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face token.');
        }
        
        throw new Error(errorData.error || `Hugging Face API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      let responseText = '';
      if (Array.isArray(data) && data.length > 0) {
        responseText = data[0].generated_text || data[0].text || '';
      } else if (data.generated_text) {
        responseText = data.generated_text;
      } else {
        responseText = "I'm having trouble generating a response right now.";
      }

      // Clean up the response
      responseText = this.cleanResponse(responseText, prompt);
      
      return responseText || "I'm sorry, I couldn't generate a proper response. Could you try rephrasing your question?";

    } catch (error) {
      console.error('Hugging Face Service Error:', error);
      
      if (error.message.includes('Model is loading')) {
        throw new Error('The AI model is starting up. Please try again in 10-15 seconds.');
      } else if (error.message.includes('API key')) {
        throw error;
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else {
        throw new Error('Failed to get AI response. Please try again.');
      }
    }
  }

  // Clean up the AI response
  cleanResponse(responseText, originalPrompt) {
    if (!responseText) return '';
    
    // Remove the original prompt if it's included
    if (responseText.includes(originalPrompt)) {
      responseText = responseText.replace(originalPrompt, '').trim();
    }
    
    // Remove common prefixes that might appear
    responseText = responseText.replace(/^(Assistant:|AI:|Bot:)\s*/i, '');
    
    // Remove repetitive text (common with some models)
    const sentences = responseText.split(/[.!?]+/);
    const uniqueSentences = [];
    const seen = new Set();
    
    for (const sentence of sentences) {
      const cleanSentence = sentence.trim().toLowerCase();
      if (cleanSentence && !seen.has(cleanSentence) && cleanSentence.length > 10) {
        seen.add(cleanSentence);
        uniqueSentences.push(sentence.trim());
      }
    }
    
    let cleaned = uniqueSentences.join('. ');
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned || responseText;
  }

  // Streaming version (Hugging Face doesn't support streaming, so we'll simulate it)
  async sendMessageStream(message, conversationHistory = [], onChunk, onComplete) {
    try {
      const fullResponse = await this.sendMessage(message, conversationHistory);
      
      // Simulate streaming by sending chunks
      const words = fullResponse.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        onChunk?.(words[i] + (i < words.length - 1 ? ' ' : ''), currentText);
        
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      onComplete?.(fullResponse);
      return fullResponse;
      
    } catch (error) {
      console.error('Hugging Face Streaming Error:', error);
      throw error;
    }
  }

  // Switch between different models
  async switchModel(modelType) {
    if (this.models[modelType]) {
      this.currentModel = this.models[modelType];
      console.log(`✅ Switched to model: ${this.currentModel}`);
    } else {
      console.warn(`❌ Unknown model type: ${modelType}`);
    }
  }

  // Test if the service is working
  async validateApiKey() {
    if (!this.apiKey || this.apiKey === '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') {
      return { valid: false, error: 'No API key provided or still using placeholder' };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.currentModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Hello',
          parameters: { max_new_tokens: 10 }
        }),
      });
      
      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }
      
      return { valid: response.ok, error: response.ok ? null : `HTTP ${response.status}` };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Get available models info
  getAvailableModels() {
    return {
      current: this.currentModel,
      available: this.models,
      descriptions: {
        conversational: 'Best for back-and-forth conversations',
        textGeneration: 'Good for creative text generation',
        instruction: 'Best for following instructions and assistant tasks',
        chat: 'Optimized for friendly chat interactions'
      }
    };
  }
}

export const huggingfaceService = new HuggingFaceService();