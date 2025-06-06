import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationService } from '../../navigation/navigationHelpers';
import { SCREEN_NAMES } from '../../navigation/types';


const { width, height } = Dimensions.get('window');

const GoodbyeScreen = ({ navigation, route }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(true);

  const userData = route?.params?.userData || {};
  const username = userData.username || 'Listener';

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Show content after animation
    setTimeout(() => setShowContent(true), 1000);

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1 && isCountdownActive) {
          clearInterval(countdownInterval);
          // Modified navigation reset
          NavigationService.reset({
            index: 0,
            routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [fadeAnim, scaleAnim, slideAnim, isCountdownActive]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Animated Background */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="mic" size={36} color="#FFFFFF" />
          </View>
          <View style={styles.iconGlow} />
        </View>

        {/* Main Message */}
        <Text style={styles.title}>Until next time, {username}</Text>
        <Text style={styles.subtitle}>
          Thank you for being part of our podcast community
        </Text>

        {/* Memory Message */}
        {showContent && (
          <Animated.View 
            style={[
              styles.memoryContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.memoryBox}>
            <Ionicons name="headset" size={20} color="#9C3141" />
              <Text style={styles.memoryText}>
                Every great conversation starts with a single voice. 
                Your stories and insights will always have a place here.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Stats Container */}
        {showContent && (
          <Animated.View 
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Stories to tell</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>🎙️</Text>
              <Text style={styles.statLabel}>Conversations shared</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>💭</Text>
              <Text style={styles.statLabel}>Ideas exchanged</Text>
            </View>
          </Animated.View>
        )}

        {/* Quote */}
        {showContent && (
          <Animated.View 
            style={[
              styles.quoteContainer,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.quote}>
              "The human voice is the most perfect instrument of all"
            </Text>
            <Text style={styles.quoteAuthor}>- Arvo Pärt</Text>
          </Animated.View>
        )}

        {/* Countdown */}
        {showContent && isCountdownActive && (
          <Animated.View 
            style={[
              styles.countdownContainer,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={styles.countdownText}>
              Redirecting in {countdown} seconds
            </Text>
            <View style={styles.countdownBar}>
              <Animated.View 
                style={[
                  styles.countdownFill,
                  { width: `${((10 - countdown) / 10) * 100}%` }
                ]} 
              />
            </View>
          </Animated.View>
        )}
      </Animated.View>


      {/* Footer Message */}
      {showContent && (
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={styles.footerText}>
            The mic is always open for your return. Keep listening, keep learning.
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#9C3141',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#C85A70',
    bottom: 100,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#E08A9B',
    top: '40%',
    right: 20,
  },
  circle4: {
    width: 80,
    height: 80,
    backgroundColor: '#9C3141',
    top: '65%',
    left: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(156, 49, 65, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(156, 49, 65, 0.3)',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(156, 49, 65, 0.05)',
    top: -10,
    left: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8C8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
  },
  memoryContainer: {
    marginBottom: 20,
    width: '100%',
  },
  memoryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  memoryText: {
    fontSize: 14,
    color: '#E8E8F0',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9C3141',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#B8B8C8',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  quoteContainer: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quote: {
    fontSize: 16,
    color: '#E8E8F0',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 22,
    fontWeight: '400',
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#9C3141',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 12,
    color: '#B8B8C8',
    marginBottom: 8,
    fontWeight: '500',
  },
  countdownBar: {
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  countdownFill: {
    height: '100%',
    backgroundColor: '#9C3141',
    borderRadius: 2,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    width: '100%',
  },
  stayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C5CE7',
    borderRadius: 20,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  stayButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8E8F0',
    marginRight: 10,
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#9090A0',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '400',
  },
});

export default GoodbyeScreen;