import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing chat status and connection states
 * Handles agent status, connection monitoring, typing indicators, and presence
 */
export const useChatStatus = ({
  initialAgentStatus = true,
  connectionCheckInterval = 30000, // 30 seconds
  typingTimeout = 3000, // 3 seconds
  enablePresenceTracking = true,
}) => {
  // Connection and status state
  const [connectionStatus, setConnectionStatus] = useState('connected'); // connected, connecting, disconnected, error
  const [isAgentOnline, setIsAgentOnline] = useState(initialAgentStatus);
  const [lastSeen, setLastSeen] = useState('Active now');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({
    isConnected: true,
    connectionType: 'wifi',
    strength: 'strong',
  });
  
  // Timers and intervals
  const typingTimeoutRef = useRef(null);
  const connectionCheckRef = useRef(null);
  const lastActivityRef = useRef(new Date());

  /**
   * Update connection status with automatic transitions
   */
  const updateConnectionStatus = useCallback((status, metadata = {}) => {
    setConnectionStatus(status);
    
    // Update agent online status based on connection
    if (status === 'connected') {
      setIsAgentOnline(true);
      setLastSeen('Active now');
    } else if (status === 'disconnected' || status === 'error') {
      setIsAgentOnline(false);
      setLastSeen(`Last seen ${formatLastSeen(new Date())}`);
    }
    
    // Store additional metadata
    if (metadata.networkInfo) {
      setNetworkInfo(prev => ({ ...prev, ...metadata.networkInfo }));
    }
  }, []);

  /**
   * Format last seen timestamp
   */
  const formatLastSeen = useCallback((timestamp) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return timestamp.toLocaleDateString();
  }, []);

  /**
   * Start typing indicator with auto-timeout
   */
  const startTyping = useCallback(() => {
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set auto-stop timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, typingTimeout);
  }, [typingTimeout]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback(() => {
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  /**
   * Update loading status
   */
  const setLoadingStatus = useCallback((loading, message = '') => {
    setIsLoading(loading);
    
    if (loading) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('connected');
    }
  }, []);

  /**
   * Simulate connection check (replace with actual network monitoring)
   */
  const checkConnection = useCallback(async () => {
    try {
      // This would be replaced with actual connection testing
      // For now, we'll simulate it
      const isOnline = navigator.onLine !== undefined ? navigator.onLine : true;
      
      if (isOnline) {
        updateConnectionStatus('connected', {
          networkInfo: {
            isConnected: true,
            strength: 'strong',
            latency: Math.random() * 100 + 50, // Simulated latency
          }
        });
      } else {
        updateConnectionStatus('disconnected');
      }
      
      return isOnline;
    } catch (error) {
      console.error('Connection check failed:', error);
      updateConnectionStatus('error');
      return false;
    }
  }, [updateConnectionStatus]);

  /**
   * Track user activity for presence
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    
    if (enablePresenceTracking && connectionStatus !== 'connected') {
      checkConnection();
    }
  }, [enablePresenceTracking, connectionStatus, checkConnection]);

  /**
   * Get status display info
   */
  const getStatusDisplay = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: isAgentOnline ? lastSeen : 'Offline',
          color: isAgentOnline ? '#34C759' : '#FF6B6B',
          icon: isAgentOnline ? 'checkmark-circle' : 'close-circle',
          showDot: true,
        };
      case 'connecting':
        return {
          text: 'Connecting...',
          color: '#FF9500',
          icon: 'hourglass',
          showDot: true,
        };
      case 'disconnected':
        return {
          text: 'Disconnected',
          color: '#FF6B6B',
          icon: 'close-circle',
          showDot: true,
        };
      case 'error':
        return {
          text: 'Connection Error',
          color: '#FF3B30',
          icon: 'warning',
          showDot: true,
        };
      default:
        return {
          text: 'Unknown',
          color: '#8E8E93',
          icon: 'help-circle',
          showDot: false,
        };
    }
  }, [connectionStatus, isAgentOnline, lastSeen]);

  /**
   * Get typing indicator info
   */
  const getTypingInfo = useCallback(() => {
    if (!isTyping) return null;
    
    return {
      isVisible: true,
      text: 'AI is thinking...',
      agentName: 'AI Assistant',
      timestamp: new Date(),
    };
  }, [isTyping]);

  /**
   * Retry connection
   */
  const retryConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    
    try {
      // Add delay to show connecting state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        updateConnectionStatus('connected');
        return true;
      } else {
        updateConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      updateConnectionStatus('error');
      return false;
    }
  }, [checkConnection, updateConnectionStatus]);

  /**
   * Get connection quality indicator
   */
  const getConnectionQuality = useCallback(() => {
    if (!networkInfo.isConnected) return 'poor';
    
    const latency = networkInfo.latency || 0;
    
    if (latency < 100) return 'excellent';
    if (latency < 300) return 'good';
    if (latency < 600) return 'fair';
    return 'poor';
  }, [networkInfo]);

  /**
   * Handle agent status changes
   */
  const updateAgentStatus = useCallback((online, customLastSeen = null) => {
    setIsAgentOnline(online);
    
    if (online) {
      setLastSeen('Active now');
    } else {
      setLastSeen(customLastSeen || `Last seen ${formatLastSeen(new Date())}`);
    }
  }, [formatLastSeen]);

  /**
   * Set up connection monitoring
   */
  useEffect(() => {
    if (connectionCheckInterval > 0) {
      connectionCheckRef.current = setInterval(checkConnection, connectionCheckInterval);
    }
    
    // Initial connection check
    checkConnection();
    
    return () => {
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, [checkConnection, connectionCheckInterval]);

  /**
   * Cleanup timers on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, []);

  return {
    // Status state
    connectionStatus,
    isAgentOnline,
    lastSeen,
    isTyping,
    isLoading,
    networkInfo,
    
    // Status actions
    updateConnectionStatus,
    startTyping,
    stopTyping,
    setLoadingStatus,
    updateActivity,
    retryConnection,
    updateAgentStatus,
    
    // Status utilities
    statusDisplay: getStatusDisplay(),
    typingInfo: getTypingInfo(),
    connectionQuality: getConnectionQuality(),
    
    // Helper functions
    formatLastSeen,
    checkConnection,
  };
};

export default useChatStatus;