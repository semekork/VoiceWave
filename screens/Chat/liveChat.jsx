import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import custom hooks
import { useChatSession } from '../../hooks/useChatSession';
import { useChatAnimations } from '../../hooks/useChatAnimations';
import { useChatInput } from '../../hooks/useChatInput';
import { useChatStatus } from '../../hooks/useChatStatus';

// Import utilities
import { ChatUtils } from '../../utils/chatUtils';

const { width, height } = Dimensions.get('window');

const LiveChatScreen = ({ navigation }) => {
  
  const {chatSession,messages,isLoading,error,initializeSession,sendMessage,endSession,clearError} = useChatSession();

  const {fadeAnim,slideAnim,typingDots} = useChatAnimations();

  const {
    isTyping,
    isAgentOnline,
    connectionStatus,
    lastSeen,
    startTyping,
    stopTyping,
    updateConnectionStatus
  } = useChatStatus({
    initialAgentStatus: true,
    connectionCheckInterval: 30000,
    typingTimeout: 3000,
    enablePresenceTracking: true,
  });

  // Handle sending message function for the input hook
  const handleSendMessage = async (messageText) => {
    startTyping();
    updateConnectionStatus('connecting');

    try {
      await sendMessage(messageText);
      updateConnectionStatus('connected');
    } catch (error) {
      updateConnectionStatus('error');
      throw error; // Re-throw to let useChatInput handle the error
    } finally {
      stopTyping();
    }
  };

  const {
    message,
    inputHeight,
    showQuickActions,
    textInputRef,
    handleMessageChange,
    handleContentSizeChange,
    handleQuickAction,
    clearInput,
    sendMessage: sendInputMessage,
    isSendEnabled,
    handleSubmitEditing,
    handleInputFocus,
    handleInputBlur,
    defaultQuickActions
  } = useChatInput({
    onSendMessage: handleSendMessage,
    isLoading,
    maxLength: 1000,
    enableHaptics: true
  });

  const scrollViewRef = useRef();

  // Initialize chat session on mount
  useEffect(() => {
    initializeSession().catch(console.error);
  }, [initializeSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  // Handle ending chat session
  const handleEndChat = () => {
    Alert.alert(
      'End Chat Session',
      'Are you sure you want to end this chat? Your conversation will be saved.',
      [
        { text: 'Continue Chatting', style: 'cancel' },
        { 
          text: 'End Chat', 
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession();
              navigation.goBack();
            } catch (error) {
              console.error('Error ending chat:', error);
              navigation.goBack();
            }
          }
        },
      ]
    );
  };

  // Get message status icon
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="#C7C7CC" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="#C7C7CC" />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color="#34C759" />;
      default:
        return null;
    }
  };

  // Render individual message
  const renderMessage = (item, index) => {
    const isUser = item.sender === 'user';
    const showDate = ChatUtils?.shouldShowDateSeparator ? 
      ChatUtils.shouldShowDateSeparator(item, messages[index - 1], index) : 
      false;
    
    return (
      <View key={item.id}>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>
              {ChatUtils?.formatDate ? ChatUtils.formatDate(item.timestamp) : new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        <Animated.View 
          style={[
            styles.messageContainer, 
            isUser ? styles.userMessage : styles.agentMessage,
            { opacity: fadeAnim }
          ]}
        >
          {!isUser && (
            <View style={styles.agentInfo}>
              <View style={styles.agentAvatar}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <View style={[styles.onlineIndicator, { opacity: isAgentOnline ? 1 : 0 }]} />
              </View>
              <View style={styles.agentDetails}>
                <Text style={styles.agentName}>{item.agentName || 'AI Assistant'}</Text>
                <Text style={styles.agentRole}>AI Assistant • Mistral</Text>
              </View>
            </View>
          )}
          
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.agentBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.agentMessageText]}>
              {item.text}
            </Text>
          </View>
          
          <View style={[styles.messageFooter, isUser ? styles.userMessageFooter : styles.agentMessageFooter]}>
            <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.agentTimestamp]}>
              {ChatUtils?.formatTime ? ChatUtils.formatTime(item.timestamp) : new Date(item.timestamp).toLocaleTimeString()}
            </Text>
            {isUser && getMessageStatusIcon(item.status)}
          </View>
        </Animated.View>
      </View>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <Animated.View style={[styles.messageContainer, styles.agentMessage, { opacity: fadeAnim }]}>
      <View style={styles.agentInfo}>
        <View style={styles.agentAvatar}>
          <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.agentDetails}>
          <Text style={styles.agentName}>AI Assistant</Text>
          <Text style={[styles.agentRole, { color: '#34C759' }]}>thinking...</Text>
        </View>
      </View>
      
      <View style={[styles.messageBubble, styles.agentBubble, styles.typingBubble]}>
        <View style={styles.typingIndicator}>
          {typingDots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  opacity: dot,
                  transform: [{
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -3],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );

  // Get quick actions - use default if ChatUtils is not available
  const quickActions = ChatUtils?.getQuickActions ? ChatUtils.getQuickActions() : defaultQuickActions;

  return (
    <SafeAreaView style={[styles.container]} edges={['left', 'right']}>
      <SafeAreaView style={[styles.container, { backgroundColor: '#9C3141' }]} edges={['top']}>
        <SafeAreaView style={[styles.container]} edges={['bottom']}>
          <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
          
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isAgentOnline ? '#34C759' : '#FF6B6B' }]} />
                <Text style={styles.statusText}>
                  Powered by Mistral • {isAgentOnline ? lastSeen : 'Offline'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleEndChat}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          {/* Connection Status Banner */}
          {connectionStatus !== 'connected' && (
            <Animated.View 
              style={[styles.connectionBanner, { 
                backgroundColor: connectionStatus === 'connecting' ? '#FFF3CD' : '#F8D7DA' 
              }]}
            >
              <Ionicons 
                name={connectionStatus === 'connecting' ? "wifi-outline" : "warning-outline"} 
                size={16} 
                color={connectionStatus === 'connecting' ? "#856404" : "#721C24"} 
              />
              <Text style={[styles.connectionText, {
                color: connectionStatus === 'connecting' ? "#856404" : "#721C24"
              }]}>
                {connectionStatus === 'connecting' ? 'Connecting to AI...' : 'Connection error. Tap to retry.'}
              </Text>
            </Animated.View>
          )}

          <KeyboardAvoidingView 
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Messages */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Welcome Message */}
              <Animated.View 
                style={[styles.welcomeContainer, { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }]}
              >
                <View style={styles.welcomeIcon}>
                  <Ionicons name="sparkles" size={28} color="#9C3141" />
                </View>
                <Text style={styles.welcomeTitle}>AI-Powered Support</Text>
                <Text style={styles.welcomeText}>
                  You're chatting with our AI assistant powered by Mistral-7B. Ask me anything!
                </Text>
              </Animated.View>

              {messages.map((message, index) => renderMessage(message, index))}
              
              {isTyping && <TypingIndicator />}
            </ScrollView>

            {/* Quick Actions */}
            {showQuickActions && (
              <Animated.View 
                style={[styles.quickActions, { opacity: fadeAnim }]}
              >
                <Text style={styles.quickActionsTitle}>Quick Start</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickActionsContent}
                >
                  {quickActions.map((action) => (
                    <TouchableOpacity 
                      key={action.id}
                      style={styles.quickAction}
                      onPress={() => handleQuickAction(action.text || action.message)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={action.icon} size={16} color="#9C3141" />
                      <Text style={styles.quickActionText}>{action.label || action.text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Input Area */}
            <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={textInputRef}
                  style={[styles.textInput, { height: Math.max(40, inputHeight) }]}
                  value={message}
                  onChangeText={handleMessageChange}
                  onContentSizeChange={handleContentSizeChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#A8A8A8"
                  multiline
                  maxLength={1000}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmitEditing}
                  blurOnSubmit={false}
                  editable={!isLoading}
                />
                
                <TouchableOpacity 
                  style={styles.attachButton}
                  onPress={() => Alert.alert('Feature Coming Soon', 'File sharing will be available soon! 📎')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={24} color="#9C3141" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  !isSendEnabled && styles.sendButtonDisabled,
                  { transform: [{ scale: !isSendEnabled ? 0.9 : 1 }] }
                ]}
                onPress={sendInputMessage}
                disabled={!isSendEnabled}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Ionicons name="hourglass" size={20} color="#A8A8A8" />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={!isSendEnabled ? '#A8A8A8' : '#FFFFFF'} 
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#9C3141',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  connectionBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContent: {
    paddingVertical: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 24,
    marginBottom: 20,
  },
  welcomeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9C3141',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    color: '#2C2C2E',
    fontWeight: '600',
    marginBottom: 2,
  },
  agentRole: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 6,
  },
  userBubble: {
    backgroundColor: '#9C3141',
    borderBottomRightRadius: 6,
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  agentBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingBubble: {
    paddingVertical: 18,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  agentMessageText: {
    color: '#2C2C2E',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessageFooter: {
    justifyContent: 'flex-end',
    gap: 4,
  },
  agentMessageFooter: {
    justifyContent: 'flex-start',
    marginLeft: 44,
  },
  timestamp: {
    fontSize: 11,
    color: '#C7C7CC',
    fontWeight: '500',
  },
  userTimestamp: {
    textAlign: 'right',
  },
  agentTimestamp: {
    textAlign: 'left',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C7C7CC',
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    color: '#9C3141',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2E',
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  attachButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9C3141',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#F2F2F7',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default LiveChatScreen;