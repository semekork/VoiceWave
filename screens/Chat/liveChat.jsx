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
import { LinearGradient } from 'expo-linear-gradient';

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
      throw error;
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

  
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="rgba(255, 255, 255, 0.7)" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="rgba(255, 255, 255, 0.7)" />;
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
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {ChatUtils?.formatDate ? ChatUtils.formatDate(item.timestamp) : new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </View>
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
              <View style={styles.agentAvatarContainer}>
                <LinearGradient
                  colors={['#9C3141', '#B8434D']}
                  style={styles.agentAvatar}
                >
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </LinearGradient>
                <View style={[styles.onlineIndicator, { opacity: isAgentOnline ? 1 : 0 }]} />
              </View>
              <View style={styles.agentDetails}>
                <Text style={styles.agentName}>{item.agentName || 'Dameah AI'}</Text>
                <Text style={styles.agentRole}>AI Assistant</Text>
              </View>
            </View>
          )}
          
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.agentBubble]}>
            {isUser ? (
              <LinearGradient
                colors={['#9C3141', '#B8434D']}
                style={styles.userBubbleGradient}
              >
                <Text style={[styles.messageText, styles.userMessageText]}>
                  {item.text}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.messageText, styles.agentMessageText]}>
                {item.text}
              </Text>
            )}
          </View>
          
          <View style={[styles.messageFooter, isUser ? styles.userMessageFooter : styles.agentMessageFooter]}>
            <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.agentTimestamp]}>
              {ChatUtils?.formatTime ? ChatUtils.formatTime(item.timestamp) : new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
            {isUser && getMessageStatusIcon(item.status)}
          </View>
        </Animated.View>
      </View>
    );
  };

  // Enhanced typing indicator component
  const TypingIndicator = () => (
    <Animated.View style={[styles.messageContainer, styles.agentMessage, { opacity: fadeAnim }]}>
      <View style={styles.agentInfo}>
        <View style={styles.agentAvatarContainer}>
          <LinearGradient
            colors={['#9C3141', '#B8434D']}
            style={styles.agentAvatar}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.agentDetails}>
          <Text style={styles.agentName}>Dameah AI</Text>
          <Text style={[styles.agentRole, { color: '#34C759' }]}>is thinking...</Text>
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
                      outputRange: [0, -4],
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

  // Get quick actions with fallback
  const quickActions = ChatUtils?.getQuickActions ? ChatUtils.getQuickActions() : (defaultQuickActions || []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
      
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#9C3141', '#B8434D']}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Dameah AI</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: isAgentOnline ? '#34C759' : '#FF6B6B' }]} />
              <Text style={styles.statusText}>
                {isAgentOnline ? 'Online now' : `Last seen ${lastSeen || 'recently'}`}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleEndChat}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Enhanced Connection Status Banner */}
      {connectionStatus !== 'connected' && (
        <Animated.View 
          style={[styles.connectionBanner, { 
            backgroundColor: connectionStatus === 'connecting' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 107, 107, 0.1)',
            borderBottomColor: connectionStatus === 'connecting' ? '#34C759' : '#FF6B6B'
          }]}
        >
          <View style={styles.connectionContent}>
            <Ionicons 
              name={connectionStatus === 'connecting' ? "wifi-outline" : "warning-outline"} 
              size={18} 
              color={connectionStatus === 'connecting' ? "#34C759" : "#FF6B6B"} 
            />
            <Text style={[styles.connectionText, {
              color: connectionStatus === 'connecting' ? "#34C759" : "#FF6B6B"
            }]}>
              {connectionStatus === 'connecting' ? 'Connecting to AI assistant...' : 'Connection error. Tap to retry.'}
            </Text>
          </View>
          {connectionStatus === 'connecting' && (
            <View style={styles.loadingIndicator}>
              <Animated.View style={[styles.loadingDot, { opacity: typingDots[0] }]} />
              <Animated.View style={[styles.loadingDot, { opacity: typingDots[1] }]} />
              <Animated.View style={[styles.loadingDot, { opacity: typingDots[2] }]} />
            </View>
          )}
        </Animated.View>
      )}

      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages Container */}
        <View style={styles.messagesBackground}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Welcome Message */}
            <Animated.View 
              style={[styles.welcomeContainer, { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }]}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.welcomeCard}
              >
                <View style={styles.welcomeIconContainer}>
                  <LinearGradient
                    colors={['#9C3141', '#B8434D']}
                    style={styles.welcomeIcon}
                  >
                    <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.welcomeTitle}>Welcome to Dameah AI</Text>
                <Text style={styles.welcomeText}>
                  Your intelligent assistant powered by advanced AI. I'm here to help with any questions or tasks you have!
                </Text>
                <View style={styles.welcomeFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="flash" size={16} color="#9C3141" />
                    <Text style={styles.featureText}>Instant responses</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="shield-checkmark" size={16} color="#9C3141" />
                    <Text style={styles.featureText}>Secure & private</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Render messages with safety checks */}
            {messages && Array.isArray(messages) && messages.map((message, index) => renderMessage(message, index))}
            
            {isTyping && <TypingIndicator />}
          </ScrollView>
        </View>

        {/* Enhanced Quick Actions */}
        {showQuickActions && quickActions && quickActions.length > 0 && (
          <Animated.View 
            style={[styles.quickActions, { opacity: fadeAnim }]}
          >
            <View style={styles.quickActionsHeader}>
              <Text style={styles.quickActionsTitle}>Quick Start</Text>
              <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContent}
            >
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={action.id || index}
                  style={styles.quickAction}
                  onPress={() => handleQuickAction(action.text || action.message)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F9FA']}
                    style={styles.quickActionGradient}
                  >
                    <View style={styles.quickActionIcon}>
                      <Ionicons name={action.icon || 'help-outline'} size={20} color="#9C3141" />
                    </View>
                    <Text style={styles.quickActionText}>{action.label || action.text || 'Quick Action'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Enhanced Input Area */}
        <Animated.View style={[styles.inputContainer, { opacity: fadeAnim }]}>
          <View style={styles.inputBackground}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={textInputRef}
                style={[styles.textInput, { height: Math.max(44, inputHeight || 44) }]}
                value={message || ''}
                onChangeText={handleMessageChange}
                onContentSizeChange={handleContentSizeChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Type your message..."
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
                onPress={() => Alert.alert('Coming Soon', 'File sharing will be available in the next update! 📎✨')}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={26} color="#9C3141" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                !isSendEnabled && styles.sendButtonDisabled,
              ]}
              onPress={sendInputMessage}
              disabled={!isSendEnabled}
              activeOpacity={0.8}
            >
              {isSendEnabled ? (
                <LinearGradient
                  colors={['#9C3141', '#B8434D']}
                  style={styles.sendButtonGradient}
                >
                  {isLoading ? (
                    <Ionicons name="hourglass" size={22} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={22} color="#FFFFFF" />
                  )}
                </LinearGradient>
              ) : (
                <View style={styles.sendButtonDisabledView}>
                  <Ionicons name="send" size={22} color="#A8A8A8" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  flex: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  connectionBanner: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  connectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  messagesBackground: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeIconContainer: {
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C2C2E',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6D6D80',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  welcomeFeatures: {
    flexDirection: 'row',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(156, 49, 65, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 13,
    color: '#9C3141',
    fontWeight: '600',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateContainer: {
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  messageContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  agentAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    color: '#2C2C2E',
    fontWeight: '700',
    marginBottom: 2,
  },
  agentRole: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 20,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  agentBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  userBubbleGradient: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomRightRadius: 6,
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
    fontWeight: '400',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userMessageFooter: {
    justifyContent: 'flex-end',
    gap: 6,
  },
  agentMessageFooter: {
    justifyContent: 'flex-start',
    marginLeft: 48,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(156, 49, 65, 0.7)',
    textAlign: 'right',
  },
  agentTimestamp: {
    color: '#C7C7CC',
    textAlign: 'left',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9C3141',
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2C2E',
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickAction: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(156, 49, 65, 0.1)',
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 49, 65, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: '#9C3141',
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputBackground: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(156, 49, 65, 0.1)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    minHeight: 50,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2E',
    fontWeight: '400',
    lineHeight: 22,
    paddingVertical: 8,
    paddingRight: 12,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 49, 65, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonDisabledView: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiveChatScreen;