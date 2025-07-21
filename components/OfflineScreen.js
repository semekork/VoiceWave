import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OfflineScreen = ({ onRetry, onGoOffline }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Entrance animations matching LoginScreen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim]);

  // Enhanced button press animation matching LoginScreen
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRetry = async () => {
    animateButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRetrying(true);
    
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        // Connection is back, notify parent component
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onRetry?.();
      } else {
        // Still offline, show feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => setIsRetrying(false), 1500);
      }
    } catch (error) {
      console.error('Error checking network:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setIsRetrying(false), 1500);
    }
  };

  const handleGoOffline = () => {
    Haptics.selectionAsync();
    onGoOffline?.();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
      <LinearGradient colors={["#9C3141", "#5E1B26"]} style={styles.background}>
        <SafeAreaView style={styles.safeContainer}>
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Background "OFFLINE" Letters */}
            <View
              style={styles.backgroundLetters}
              accessibilityElementsHidden={true}
            >
              <Text style={styles.backgroundLettersText}>OFF{"\n"}LINE</Text>
            </View>

            {/* Main Content */}
            <View style={styles.contentSection}>
              {/* Animated WiFi Off Icon */}
              <Animated.View 
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Ionicons 
                  name="wifi-outline" 
                  size={80} 
                  color="#FFFFFF" 
                  style={styles.wifiIcon}
                />
                <View style={styles.iconSlash} />
              </Animated.View>

              {/* Title Section */}
              <View style={styles.titleContainer}>
                <Text style={styles.titleText} accessibilityRole="header">
                  YOU'RE OFFLINE
                </Text>
              </View>

              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>
                  Check your internet connection and try again
                </Text>
              </View>

              {/* Connection Status */}
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>No Internet Connection</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {/* Retry Button */}
                <TouchableOpacity
                  onPress={handleRetry}
                  disabled={isRetrying}
                  accessibilityLabel="Retry connection"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to check internet connection"
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{ transform: [{ scale: buttonScaleAnim }] }}
                  >
                    <View
                      style={[
                        styles.primaryButton,
                        isRetrying && styles.buttonDisabled,
                      ]}
                    >
                      {isRetrying ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text style={styles.primaryButtonText}>
                            Checking...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Ionicons 
                            name="refresh-outline" 
                            size={20} 
                            color="#FFFFFF" 
                            style={styles.buttonIcon}
                          />
                          <Text style={styles.primaryButtonText}>Try Again</Text>
                        </>
                      )}
                      </View>
                  </Animated.View>
                </TouchableOpacity>

                {/* Continue Offline Button */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleGoOffline}
                  accessibilityLabel="Continue offline"
                  accessibilityRole="button"
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="cloud-offline-outline" 
                    size={20} 
                    color="#FFFFFF" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.secondaryButtonText}>Continue Offline</Text>
                </TouchableOpacity>
              </View>

              {/* Tips Section */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Quick fixes:</Text>
                <Text style={styles.tipItem}>• Check your WiFi or mobile data</Text>
                <Text style={styles.tipItem}>• Move to an area with better signal</Text>
                <Text style={styles.tipItem}>• Restart your router if using WiFi</Text>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Background Letters (matching LoginScreen)
  backgroundLetters: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    zIndex: 0,
    height: "70%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    opacity: 0.08,
  },
  backgroundLettersText: {
    color: "#FFFFFF",
    fontSize: Math.min(screenWidth * 0.4, 160),
    fontWeight: "bold",
    lineHeight: Math.min(screenWidth * 0.5, 200),
  },

  // Main Content
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
  },

  // Icon Section
  iconContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  wifiIcon: {
    opacity: 0.8,
  },
  iconSlash: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF3B30',
    transform: [{ rotate: '45deg' }],
  },

  // Title Section (matching LoginScreen)
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: Math.min(screenWidth * 0.08, 32),
    fontWeight: "bold",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "300",
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Status Section
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  statusText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },

  // Buttons (matching LoginScreen style)
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor:'#333333',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Tips Section
  tipsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    opacity: 0.8,
  },
});

export default OfflineScreen;