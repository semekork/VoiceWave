// utils/chatUtils.js
import { v4 as uuidv4 } from 'uuid'

export class ChatUtils {
  // Generate unique message ID
  static generateMessageId() {
    return uuidv4()
  }

  // Create user message object
  static createUserMessage(text, status = 'sending') {
    return {
      id: this.generateMessageId(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: status,
    }
  }

  // Create agent message object
  static createAgentMessage(text, agentName = 'AI Assistant', status = 'delivered') {
    return {
      id: this.generateMessageId(),
      text: text.trim(),
      sender: 'agent',
      timestamp: new Date(),
      agentName: agentName,
      status: status,
    }
  }

  // Validate message input
  static validateInput(text, maxLength = 1000) {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: 'Message must be text' }
    }

    const trimmed = text.trim()
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' }
    }

    if (trimmed.length > maxLength) {
      return { isValid: false, error: `Message too long (max ${maxLength} characters)` }
    }

    return { isValid: true, trimmed }
  }

  // Format timestamp for display
  static formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Format date for display
  static formatDate(timestamp) {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  // Check if date separator should be shown
  static shouldShowDateSeparator(currentMessage, previousMessage, index) {
    if (index === 0) return true
    if (!previousMessage) return true

    const currentDate = new Date(currentMessage.timestamp).toDateString()
    const previousDate = new Date(previousMessage.timestamp).toDateString()

    return currentDate !== previousDate
  }

  // Get quick action suggestions
  static getQuickActions() {
    return [
      {
        id: 'help',
        text: 'How can you help me?',
        icon: 'help-circle-outline',
        label: 'Get Help',
      },
      {
        id: 'capabilities',
        text: 'What are your capabilities?',
        icon: 'sparkles-outline',
        label: 'Capabilities',
      },
      {
        id: 'examples',
        text: 'Show me some examples',
        icon: 'list-outline',
        label: 'Examples',
      },
      {
        id: 'creative',
        text: 'Help me with creative writing',
        icon: 'create-outline',
        label: 'Creative',
      },
      {
        id: 'code',
        text: 'Help me with coding',
        icon: 'code-outline',
        label: 'Coding',
      },
      {
        id: 'analysis',
        text: 'Analyze this data for me',
        icon: 'analytics-outline',
        label: 'Analysis',
      },
    ]
  }

  // Clean and format AI response
  static cleanAIResponse(response) {
    if (!response || typeof response !== 'string') {
      return 'I apologize, but I encountered an error processing your request.'
    }

    return response
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
  }

  // Format conversation history for AI context
  static formatConversationHistory(messages, maxMessages = 10) {
    return messages
      .slice(-maxMessages) // Take last N messages
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
  }

  // Generate conversation summary for context
  static generateConversationSummary(messages) {
    if (messages.length <= 4) return null

    const recentMessages = messages.slice(-6, -1) // Exclude current message
    const summary = `Previous conversation context: ${recentMessages.length} messages exchanged.`
    
    return summary
  }

  // Check if message contains sensitive information
  static containsSensitiveInfo(text) {
    const sensitivePatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (basic)
      /\b\d{10,}\b/, // Phone numbers
    ]

    return sensitivePatterns.some(pattern => pattern.test(text))
  }

  // Sanitize message for storage
  static sanitizeMessage(text) {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
  }

  // Get message status color
  static getStatusColor(status) {
    switch (status) {
      case 'sending':
        return '#FF9500'
      case 'sent':
        return '#C7C7CC'
      case 'delivered':
        return '#34C759'
      case 'failed':
        return '#FF3B30'
      default:
        return '#C7C7CC'
    }
  }

  // Calculate reading time estimate
  static getReadingTimeEstimate(text) {
    const wordsPerMinute = 200
    const words = text.split(' ').length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes === 1 ? '1 min read' : `${minutes} min read`
  }

  // Generate typing indicator text
  static getTypingIndicatorText(agentName = 'AI Assistant') {
    const indicators = [
      `${agentName} is thinking...`,
      `${agentName} is typing...`,
      `${agentName} is processing...`,
      'Generating response...',
    ]
    return indicators[Math.floor(Math.random() * indicators.length)]
  }
}