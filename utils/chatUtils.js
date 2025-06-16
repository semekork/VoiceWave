/**
 * Utility functions for chat functionality
 * Handles message formatting, date/time utilities, and quick actions
 */
export class ChatUtils {
  /**
   * Format timestamp to readable time
   */
  static formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  /**
   * Format timestamp to readable date
   */
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(date, today)) {
      return 'Today';
    } else if (this.isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Determine if date separator should be shown
   */
  static shouldShowDateSeparator(currentMessage, previousMessage, index) {
    if (index === 0) return true;
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);

    return !this.isSameDay(currentDate, previousDate);
  }

  /**
   * Get default quick actions
   */
  static getQuickActions() {
    return [
      {
        id: 1,
        label: "Help me with...",
        text: "Help me with something",
        message: "Help me with something",
        icon: "help-circle",
      },
      {
        id: 2,
        label: "Explain this",
        text: "Can you explain this to me?",
        message: "Can you explain this to me?",
        icon: "book",
      },
      {
        id: 3,
        label: "Get started",
        text: "How do I get started?",
        message: "How do I get started?",
        icon: "play-circle",
      },
      {
        id: 4,
        label: "Show examples",
        text: "Can you show me some examples?",
        message: "Can you show me some examples?",
        icon: "list",
      },
      {
        id: 5,
        label: "Best practices",
        text: "What are the best practices?",
        message: "What are the best practices?",
        icon: "star",
      },
    ];
  }

  /**
   * Generate unique message ID
   */
  static generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate message before sending
   */
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message must be a string' };
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > 1000) {
      return { isValid: false, error: 'Message too long (max 1000 characters)' };
    }

    return { isValid: true, message: trimmed };
  }

  /**
   * Format message for display
   */
  static formatMessageText(text) {
    if (!text) return '';
    
    // Basic text formatting
    return text
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
      .trim();
  }

  /**
   * Get message status color
   */
  static getMessageStatusColor(status) {
    switch (status) {
      case 'sending':
        return '#C7C7CC';
      case 'sent':
        return '#C7C7CC';
      case 'delivered':
        return '#34C759';
      case 'failed':
        return '#FF3B30';
      default:
        return '#C7C7CC';
    }
  }

  /**
   * Estimate reading time for message
   */
  static estimateReadingTime(text) {
    if (!text) return 0;
    
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = words / wordsPerMinute;
    
    return Math.max(1, Math.ceil(minutes));
  }

  /**
   * Create system message
   */
  static createSystemMessage(text, type = 'info') {
    return {
      id: this.generateMessageId(),
      text,
      sender: 'system',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      type,
      isSystem: true,
    };
  }

  /**
   * Create welcome message
   */
  static createWelcomeMessage(agentName = 'AI Assistant') {
    return {
      id: this.generateMessageId(),
      text: `Hi! I'm ${agentName}, your AI assistant. How can I help you today?`,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      agentName,
      isWelcome: true,
    };
  }

  /**
   * Create error message
   */
  static createErrorMessage(errorText, originalMessage = null) {
    return {
      id: this.generateMessageId(),
      text: `Sorry, I encountered an issue: ${errorText}. Please try again.`,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      agentName: 'System',
      isError: true,
      originalMessage,
    };
  }

  /**
   * Check if message is from user
   */
  static isUserMessage(message) {
    return message.sender === 'user';
  }

  /**
   * Check if message is from agent
   */
  static isAgentMessage(message) {
    return message.sender === 'agent';
  }

  /**
   * Check if message is system message
   */
  static isSystemMessage(message) {
    return message.sender === 'system' || message.isSystem;
  }

  /**
   * Get conversation summary
   */
  static getConversationSummary(messages) {
    const userMessages = messages.filter(this.isUserMessage);
    const agentMessages = messages.filter(this.isAgentMessage);
    const totalMessages = messages.length;
    
    return {
      totalMessages,
      userMessages: userMessages.length,
      agentMessages: agentMessages.length,
      startTime: messages[0]?.timestamp,
      lastMessageTime: messages[messages.length - 1]?.timestamp,
    };
  }

  /**
   * Search messages
   */
  static searchMessages(messages, query) {
    if (!query || !query.trim()) {
      return messages;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return messages.filter(message => 
      message.text?.toLowerCase().includes(searchTerm) ||
      message.agentName?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Group messages by date
   */
  static groupMessagesByDate(messages) {
    const groups = {};
    
    messages.forEach(message => {
      const date = this.formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }
}