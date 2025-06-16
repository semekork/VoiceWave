// utils/openaiService.js
export class OpenAIService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.retryCount = 0;
    this.maxRetries = 3;
    this.rateLimitDelay = 1000; 
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file');
    }
  }

  // Add exponential backoff for rate limits
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check quota before making requests
  async checkQuotaStatus() {
    if (!this.apiKey) return { hasQuota: false, error: 'No API key configured' };
    
    try {
      // Make a minimal test request to check quota
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        }),
      });

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          hasQuota: false, 
          error: 'Quota exceeded',
          resetTime: response.headers.get('x-ratelimit-reset-tokens') 
        };
      }

      return { hasQuota: response.ok };
    } catch (error) {
      return { hasQuota: false, error: error.message };
    }
  }

  async sendMessage(message, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please check your environment variables.');
    }

    // Check quota first
    const quotaStatus = await this.checkQuotaStatus();
    if (!quotaStatus.hasQuota) {
      if (quotaStatus.error === 'Quota exceeded') {
        throw new Error('API quota exceeded. Please upgrade your plan or wait for quota reset.');
      }
    }

    return this.makeRequestWithRetry(message, conversationHistory);
  }

  async makeRequestWithRetry(message, conversationHistory = [], attempt = 1) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are Dameah, a helpful and friendly AI assistant for voicewave. You should:
              - Be conversational and warm in your responses
              - Provide accurate and helpful information
              - Keep responses concise but informative
              - Show empathy when appropriate
              - If you don't know something, admit it rather than guessing
              - It's okay to ask for clarification if the user's request is unclear`
            },
            ...conversationHistory.slice(-10).map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle rate limiting with exponential backoff
        if (response.status === 429 && attempt <= this.maxRetries) {
          const delay = this.rateLimitDelay * Math.pow(2, attempt - 1);
          console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${attempt}/${this.maxRetries})`);
          await this.delay(delay);
          return this.makeRequestWithRetry(message, conversationHistory, attempt + 1);
        }
        
        throw new Error(errorData.error?.message || `OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please check your OpenAI billing dashboard and consider upgrading your plan.');
      } else if (error.message.includes('rate limit')) {
        if (attempt <= this.maxRetries) {
          const delay = this.rateLimitDelay * Math.pow(2, attempt - 1);
          await this.delay(delay);
          return this.makeRequestWithRetry(message, conversationHistory, attempt + 1);
        }
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      } else if (error.message.includes('invalid_api_key')) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else if (error.message.includes('API key not configured')) {
        throw error;
      } else {
        throw new Error(`Failed to get AI response: ${error.message}`);
      }
    }
  }

  // Enhanced streaming with better error handling
  async sendMessageStream(message, conversationHistory = [], onChunk, onComplete, onError) {
    if (!this.apiKey) {
      const error = new Error('OpenAI API key not configured. Please check your environment variables.');
      onError?.(error);
      throw error;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are Dameah, a helpful and friendly AI assistant.`
            },
            ...conversationHistory.slice(-10).map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error?.message || `OpenAI API Error: ${response.status}`);
        
        if (response.status === 429) {
          error.message = 'API quota exceeded. Please check your OpenAI billing dashboard.';
        }
        
        onError?.(error);
        throw error;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete?.(fullResponse);
              return fullResponse;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                onChunk?.(content, fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }

      onComplete?.(fullResponse);
      return fullResponse;
    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      onError?.(error);
      throw error;
    }
  }

  // Enhanced API key validation with quota check
  async validateApiKey() {
    if (!this.apiKey) {
      return { valid: false, error: 'No API key provided' };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }
      
      if (response.status === 429) {
        return { valid: true, error: 'API key valid but quota exceeded' };
      }
      
      return { valid: response.ok, error: response.ok ? null : 'Unknown error' };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Get usage information (if available)
  async getUsageInfo() {
    if (!this.apiKey) return null;
    
    try {
      // Note: OpenAI doesn't provide a direct usage endpoint in the API
      // You would need to check the dashboard manually
      return { message: 'Check your OpenAI dashboard for usage information' };
    } catch (error) {
      return null;
    }
  }
}

export const openaiService = new OpenAIService();