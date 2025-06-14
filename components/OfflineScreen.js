import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import NetInfo from '@react-native-netinfo/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const OfflineScreen = ({ onRetry, onGoOffline }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [fadeAnim, pulseAnim]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        // Connection is back, notify parent component
        onRetry?.();
      } else {
        // Still offline, show feedback
        setTimeout(() => setIsRetrying(false), 1500);
      }
    } catch (error) {
      console.error('Error checking network:', error);
      setTimeout(() => setIsRetrying(false), 1500);
    }
  };

  const handleGoOffline = () => {
    onGoOffline?.();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        {/* Animated WiFi Off Icon */}
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Icon 
            name="wifi-off" 
            size={80} 
            color="#ff6b6b" 
          />
        </Animated.View>

        {/* Main Message */}
        <Text style={styles.title}>You're Offline</Text>
        <Text style={styles.subtitle}>
          Check your internet connection and try again
        </Text>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>No Internet Connection</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              isRetrying && styles.buttonDisabled
            ]}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
          >
            <Icon 
              name={isRetrying ? "hourglass-empty" : "refresh"} 
              size={20} 
              color="#ffffff" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonTextPrimary}>
              {isRetrying ? 'Checking...' : 'Try Again'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoOffline}
            activeOpacity={0.8}
          >
            <Icon 
              name="offline-bolt" 
              size={20} 
              color="#4a9eff" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonTextSecondary}>Continue Offline</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick fixes:</Text>
          <Text style={styles.tipItem}>• Check your WiFi or mobile data</Text>
          <Text style={styles.tipItem}>• Move to an area with better signal</Text>
          <Text style={styles.tipItem}>• Restart your router if using WiFi</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    marginRight: 8,
  },
  statusText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#4a9eff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 158, 255, 0.2)',
  },
  tipsTitle: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    color: '#c0c0c0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default OfflineScreen;