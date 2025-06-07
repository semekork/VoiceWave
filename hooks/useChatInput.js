import { useState, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Custom hook for managing chat input functionality
 * Handles message input, validation, quick actions, and input interactions
 */
export const useChatInput = ({
  onSendMessage,
  isLoading = false,
  maxLength = 1000,
  enableHaptics = true,
}) => {
  // Input state
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Input reference
  const textInputRef = useRef(null);

  /**
   * Handle message text changes
   */
  const handleMessageChange = useCallback((text) => {
    setMessage(text);
    
    // Hide quick actions when user starts typing
    if (text.trim() && showQuickActions) {
      setShowQuickActions(false);
    }
    
    // Show quick actions when input is empty
    if (!text.trim() && !showQuickActions) {
      setShowQuickActions(true);
    }
  }, [showQuickActions]);

  /**
   * Handle input height changes for multiline support
   */
  const handleContentSizeChange = useCallback((event) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.max(40, Math.min(height, 120)); // Min 40, Max 120
    setInputHeight(newHeight);
  }, []);

  /**
   * Handle input focus events
   */
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
    setShowQuickActions(false);
  }, []);

  /**
   * Handle input blur events
   */
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
    
    // Show quick actions if input is empty
    if (!message.trim()) {
      setShowQuickActions(true);
    }
  }, [message]);

  /**
   * Validate message before sending
   */
  const validateMessage = useCallback((text) => {
    if (!text || text.trim() === '') {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (text.length > maxLength) {
      return { isValid: false, error: `Message too long (max ${maxLength} characters)` };
    }
    
    return { isValid: true, error: null };
  }, [maxLength]);

  /**
   * Provide haptic feedback
   */
  const triggerHapticFeedback = useCallback((type = 'medium') => {
    if (!enableHaptics || Platform.OS !== 'ios') return;
    
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  }, [enableHaptics]);

  /**
   * Send message with validation and feedback
   */
  const sendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    // Validate message
    const validation = validateMessage(trimmedMessage);
    if (!validation.isValid) {
      Alert.alert('Invalid Message', validation.error);
      triggerHapticFeedback('error');
      return false;
    }
    
    if (isLoading) {
      return false;
    }

    try {
      // Haptic feedback for send action
      triggerHapticFeedback('medium');
      
      // Clear input immediately for better UX
      setMessage('');
      setInputHeight(40);
      setShowQuickActions(false);
      
      // Call the provided send handler
      await onSendMessage(trimmedMessage);
      
      // Success feedback
      triggerHapticFeedback('success');
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Restore message on error
      setMessage(trimmedMessage);
      triggerHapticFeedback('error');
      
      Alert.alert('Send Failed', 'Failed to send message. Please try again.');
      return false;
    }
  }, [message, isLoading, onSendMessage, validateMessage, triggerHapticFeedback]);

  /**
   * Handle quick action selection
   */
  const handleQuickAction = useCallback((actionMessage) => {
    setMessage(actionMessage);
    setShowQuickActions(false);
    
    // Focus input after quick action
    setTimeout(() => {
      focusInput();
    }, 100);
    
    triggerHapticFeedback('light');
  }, []);

  /**
   * Focus the text input
   */
  const focusInput = useCallback(() => {
    textInputRef.current?.focus();
  }, []);

  /**
   * Blur the text input
   */
  const blurInput = useCallback(() => {
    textInputRef.current?.blur();
  }, []);

  /**
   * Clear the input
   */
  const clearInput = useCallback(() => {
    setMessage('');
    setInputHeight(40);
    setShowQuickActions(true);
  }, []);

  /**
   * Set predefined message
   */
  const setPresetMessage = useCallback((text) => {
    setMessage(text);
    setShowQuickActions(false);
    focusInput();
  }, [focusInput]);

  /**
   * Check if send button should be enabled
   */
  const isSendEnabled = useCallback(() => {
    return message.trim() !== '' && !isLoading;
  }, [message, isLoading]);

  /**
   * Get character count info
   */
  const getCharacterCount = useCallback(() => {
    const current = message.length;
    const remaining = maxLength - current;
    const isNearLimit = remaining <= 50;
    const isOverLimit = remaining < 0;
    
    return {
      current,
      remaining,
      max: maxLength,
      isNearLimit,
      isOverLimit,
      percentage: (current / maxLength) * 100,
    };
  }, [message, maxLength]);

  /**
   * Handle keyboard submit (Enter key)
   */
  const handleSubmitEditing = useCallback(() => {
    if (isSendEnabled()) {
      sendMessage();
    }
  }, [isSendEnabled, sendMessage]);

  /**
   * Default quick action templates
   */
  const defaultQuickActions = [
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
      id: 'support',
      text: 'I need technical support',
      icon: 'settings-outline',
      label: 'Tech Support',
    },
    {
      id: 'surprise',
      text: 'Tell me something interesting',
      icon: 'bulb-outline',
      label: 'Surprise Me',
    },
  ];

  return {
    // State
    message,
    inputHeight,
    showQuickActions,
    isInputFocused,
    
    // Refs
    textInputRef,
    
    // Actions
    handleMessageChange,
    handleContentSizeChange,
    handleInputFocus,
    handleInputBlur,
    handleSubmitEditing,
    sendMessage,
    handleQuickAction,
    focusInput,
    blurInput,
    clearInput,
    setPresetMessage,
    
    // Utilities
    isSendEnabled: isSendEnabled(),
    characterCount: getCharacterCount(),
    validateMessage,
    triggerHapticFeedback,
    
    // Defaults
    defaultQuickActions,
  };
};

export default useChatInput;