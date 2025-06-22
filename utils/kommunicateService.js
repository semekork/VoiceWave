// utils/kommunicateService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export class KommunicateService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://dashboard.kommunicate.io/rest/ws';
    this.wsUrl = 'wss://dashboard.kommunicate.io/websocket';
    this.applicationId = null;
    this.userId = null;
    this.conversationId = null;
    this.socket = null;
    this.isConnected = false;
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize Kommunicate with your app credentials
  async initialize(config) {
    try {
      this.apiKey = config.apiKey || process.env.KOMMUNICATE_API_KEY;
      this.applicationId = config.applicationId || process.env.KOMMUNICATE_APP_ID;
      
      if (!this.apiKey || !this.applicationId) {
        throw new Error('Kommunicate API key and Application ID are required');
      }
      this.userId = await this.getOrCreateUserId();
      
      return { success: true };
    } catch (error) {
      console.error('Kommunicate initialization error:', error);
      throw error;
    }
  }

  // Generate or retrieve persistent user ID
  async getOrCreateUserId() {
    try {
      let userId = await AsyncStorage.getItem('kommunicate_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('kommunicate_user_id', userId);
      }
      return userId;
    } catch (error) {
      console.error('Error managing user ID:', error);
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // Validate API credentials
  async validateApiKey() {
    try {
      const response = await fetch(`${this.baseUrl}/application/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Application-Key': this.applicationId
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: true, data };
      } else {
        const errorData = await response.json();
        return { 
          valid: false, 
          error: errorData.message || `API validation failed: ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: `Network error: ${error.message}` 
      };
    }
  }

  // Create a new conversation
  async createConversation(metadata = {}) {
    try {
      const conversationData = {
        userId: this.userId,
        applicationId: this.applicationId,
        conversationTitle: metadata.title || 'Chat with Dameah AI',
        metadata: {
          source: 'mobile_app',
          platform: 'react-native',
          ...metadata
        }
      };

      const response = await fetch(`${this.baseUrl}/conversation/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Application-Key': this.applicationId
        },
        body: JSON.stringify(conversationData)
      });

      if (response.ok) {
        const data = await response.json();
        this.conversationId = data.response.conversationId;
        return data.response;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Send message via REST API
  async sendMessage(messageText, conversationHistory = []) {
    try {
      if (!this.conversationId) {
        await this.createConversation();
      }

      const messageData = {
        message: messageText,
        type: 0, // Text message
        conversationId: this.conversationId,
        userId: this.userId,
        source: 1, // User message
        metadata: {
          timestamp: new Date().toISOString(),
          platform: 'react-native'
        }
      };

      const response = await fetch(`${this.baseUrl}/message/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Application-Key': this.applicationId
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Wait for bot response
        const botResponse = await this.waitForBotResponse();
        return botResponse || "I'm processing your message. Please wait...";
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Wait for bot response (polling method)
  async waitForBotResponse(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const messages = await this.getLatestMessages();
        const botMessage = messages.find(msg => 
          msg.source !== 1 && // Not from user
          msg.createdAt > startTime - 5000 // Recent message
        );
        
        if (botMessage) {
          return botMessage.message || botMessage.text;
        }
        
        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error polling for bot response:', error);
        break;
      }
    }
    
    return null;
  }

  // Get latest messages from conversation
  async getLatestMessages(limit = 20) {
    try {
      if (!this.conversationId) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/message/list?conversationId=${this.conversationId}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Application-Key': this.applicationId
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.response || [];
      } else {
        console.error('Failed to fetch messages');
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Stream messages using WebSocket (advanced feature)
  async sendMessageStream(messageText, conversationHistory, onChunk, onComplete) {
    try {
      // For streaming, we'll simulate it with regular message sending
      // Kommunicate WebSocket integration would require more complex setup
      
      let fullResponse = '';
      const response = await this.sendMessage(messageText, conversationHistory);
      
      // Simulate streaming by breaking response into chunks
      const words = response.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + ' ';
        fullResponse += chunk;
        
        if (onChunk) {
          onChunk(chunk, fullResponse.trim());
        }
        
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      if (onComplete) {
        onComplete(fullResponse.trim());
      }
      
    } catch (error) {
      console.error('Error in stream message:', error);
      throw error;
    }
  }

  // Initialize WebSocket connection for real-time messaging
  async initializeWebSocket() {
    try {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        return;
      }

      const wsUrl = `${this.wsUrl}?userId=${this.userId}&applicationId=${this.applicationId}`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('Kommunicate WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Process queued messages
        this.processMessageQueue();
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('Kommunicate WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('Kommunicate WebSocket error:', error);
        this.isConnected = false;
      };
      
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      throw error;
    }
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'MESSAGE':
        if (this.onMessageReceived) {
          this.onMessageReceived(data);
        }
        break;
      case 'TYPING':
        if (this.onTypingIndicator) {
          this.onTypingIndicator(data);
        }
        break;
      case 'USER_CONNECTED':
      case 'USER_DISCONNECTED':
        if (this.onUserStatusChange) {
          this.onUserStatusChange(data);
        }
        break;
      default:
        console.log('Unhandled WebSocket message type:', data.type);
    }
  }

  // Attempt to reconnect WebSocket
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Process queued messages when connection is restored
  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.sendWebSocketMessage(message);
    }
  }

  // Send message via WebSocket
  sendWebSocketMessage(messageData) {
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify(messageData));
    } else {
      this.messageQueue.push(messageData);
    }
  }

  // Set event handlers
  setEventHandlers(handlers) {
    this.onMessageReceived = handlers.onMessageReceived;
    this.onTypingIndicator = handlers.onTypingIndicator;
    this.onUserStatusChange = handlers.onUserStatusChange;
  }

  // Get conversation history
  async getConversationHistory(conversationId = null) {
    try {
      const targetConversationId = conversationId || this.conversationId;
      
      if (!targetConversationId) {
        return [];
      }

      const messages = await this.getLatestMessages(100);
      
      return messages.map(msg => ({
        id: msg.messageId || msg.id,
        text: msg.message || msg.text,
        sender: msg.source === 1 ? 'user' : 'agent',
        timestamp: new Date(msg.createdAt || msg.timestamp).toISOString(),
        status: 'delivered',
        agentName: msg.source === 1 ? null : 'Dameah AI'
      }));
      
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  // Close conversation
  async closeConversation() {
    try {
      if (this.conversationId) {
        await fetch(`${this.baseUrl}/conversation/close`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Application-Key': this.applicationId
          },
          body: JSON.stringify({
            conversationId: this.conversationId,
            userId: this.userId
          })
        });
      }

      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      this.conversationId = null;
      this.isConnected = false;
      
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  }

  // Get available bot configurations
  getAvailableModels() {
    return [
      {
        id: 'default',
        name: 'Dameah AI Assistant',
        description: 'General purpose AI assistant',
        capabilities: ['text', 'questions', 'help']
      }
    ];
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.conversationId = null;
  }
}