import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingIndicator from '../../components/OnboardingIndicator';

const Onboarding = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  
  
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [waveHeights, setWaveHeights] = useState(
    Array.from({ length: 7 }, () => ({
      height: 10 + Math.random() * 30,
      opacity: 0.4 + Math.random() * 0.6,
    }))
  );
  
  useEffect(() => {
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15, 
          duration: 2000, 
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true, 
        }),
        Animated.timing(floatAnim, {
          toValue: 0, 
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    );
    floatingAnimation.start();

    const rotatingAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotatingAnimation.start();

    resetAndRunFadeSlideAnimation();
    
    const interval = setInterval(() => {
      if (currentScreen === 1) {
        setWaveHeights(
          Array.from({ length: 7 }, () => ({
            height: 10 + Math.random() * 30,
            opacity: 0.4 + Math.random() * 0.6,
          }))
        );
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      floatingAnimation.stop();
      rotatingAnimation.stop();
    };
  }, [currentScreen]);

  const resetAndRunFadeSlideAnimation = () => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    // Run fade and slide animations
    const fadeSlideAnimation = Animated.stagger(300, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ])
    ]);
    
    fadeSlideAnimation.start();
  };

   const goToNextScreen = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
      resetAndRunFadeSlideAnimation();
    } else {
      navigation.navigate('GetStarted');
    }
  };

  const floatingStyle = {
    transform: [{ translateY: floatAnim }]
  };

  const fadeSlideStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Screen-specific content
  const getScreenTitle = () => {
    switch (currentScreen) {
      case 0: return "THE\nWAVE.";
      case 1: return "THE\nCONNECTION.";
      case 2: return "THE\nFUTURE.";
      default: return "";
    }
  };

  const getScreenTagline = () => {
    switch (currentScreen) {
      case 0: return "VoiceWave is reshaping how education sounds — inspired by the past, built for tomorrow.";
      case 1: return "Curated podcasts built for learners in Ghana — listen, grow, and stay inspired.";
      case 2: return "Download once, learn forever — offline access for anywhere your journey takes you.";
      default: return "";
    }
  };

  const getBackgroundText = () => {
    switch (currentScreen) {
      case 0: return "WA\nVE";
      case 1: return "CONNECT";
      case 2: return "FUTURE";
      default: return "";
    }
  };

  const renderFloatingImage = () => {
    switch (currentScreen) {
      case 0:
        return (
          <Animated.View style={[styles.floatingImageContainer, floatingStyle]}>
            <Image
              source={require('../../assets/Onboarding/casette_tape.png')}
              style={styles.floatingImage}
              resizeMode="contain"
            />
          </Animated.View>
        );
      case 1:
        return (
          <Animated.View style={[styles.floatingImageContainer, floatingStyle]}>
            <Image
              source={require('../../assets/Onboarding/microphone.png')}
              style={styles.floatingImage}
              resizeMode="contain"
            />
            <View style={styles.microphoneShadow} />
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View style={[styles.floatingImageContainer, floatingStyle]}>
            <Image
              source={require('../../assets/Onboarding/phone.png')}
              style={styles.floatingImage}
              resizeMode="contain"
            />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const renderDecorativeElements = () => {
    switch (currentScreen) {
      case 0:
        return (
          <View style={styles.decorativeElements}>
            <View style={styles.decorativeCircle}></View>
            <View style={styles.decorativeLine}></View>
          </View>
        );
      case 1:
        return (
          <View style={styles.soundWaveContainer}>
            {waveHeights.map((wave, index) => (
              <View
                key={index}
                style={[
                  styles.soundWaveLine,
                  {
                    height: wave.height,
                    marginHorizontal: 2,
                    opacity: wave.opacity,
                  },
                ]}
              />
            ))}
          </View>
        );
      case 2:
        return (
          <>
            <Animated.View style={[styles.decorativeElements, { transform: [{ rotate: spin }] }]}>
              <View style={styles.decorativeCircle}></View>
              <View style={styles.decorativeInnerCircle}></View>
            </Animated.View>
            <View style={styles.dotsContainer}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.dot} />
              ))}
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#9C3141', '#5E1B26']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeContainer}>
          <OnboardingIndicator total={3} activeIndex={currentScreen} />
          
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/Logo/logo_white.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Main Title */}
          <Animated.View style={[styles.titleContainer, fadeSlideStyle]}>
            <Text style={[
              styles.titleText, 
              currentScreen === 0 ? styles.largeTitleText : {}
            ]}>
              {getScreenTitle()}
            </Text>
          </Animated.View>
          
          {/* Tagline */}
          <Animated.View style={[styles.taglineContainer, fadeSlideStyle]}>
            <Text style={styles.taglineText}>
              {getScreenTagline()}
            </Text>
          </Animated.View>
          
          {/* Background Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={[
              styles.backgroundLettersText,
              currentScreen === 0 ? styles.largeBackgroundText : {}
            ]}>
              {getBackgroundText()}
            </Text>
          </View>
          
          {/* Decorative Elements (different for each screen) */}
          {renderDecorativeElements()}
          
          {/* Floating Image (different for each screen) */}
          {renderFloatingImage()}
          
          {/* Next Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={goToNextScreen}
            >
              <Image
                source={require('../../assets/Onboarding/button.png')}
                style={styles.buttonLines}
                resizeMode="contain"
              />
              <Text style={styles.nextButtonText}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 16,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 70,
  },
  titleContainer: {
    marginLeft: 10,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 50,
    fontWeight: 'bold',
    lineHeight: 55,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  largeTitleText: {
    fontSize: 80,
    lineHeight: 88,
    letterSpacing: -1,
  },
  taglineContainer: {
    marginTop: 20,
    marginLeft: 10,
    width: '90%',
  },
  taglineText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  backgroundLetters: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    height: '60%',
    justifyContent: 'left',
    alignItems: 'left',
  },
  backgroundLettersText: {
    color: 'rgba(255, 255, 255, 0.1)',
    fontSize: 160,
    fontWeight: 'bold',
    lineHeight: 200,
  },
  largeBackgroundText: {
    fontSize: 200,
    lineHeight: 220,
  },
  decorativeElements: {
    position: 'absolute',
    top: 120,
    right: 40,
    zIndex: 1,
  },
  decorativeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorativeLine: {
    position: 'absolute',
    top: 40,
    left: -60,
    width: 120,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ rotate: '45deg' }],
  },
  decorativeInnerCircle: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingImageContainer: {
    position: 'absolute',
    right: -25,
    bottom: 180,
    zIndex: 10,
  },
  floatingImage: {
    width: 240,
    height: 240,
  },
  microphoneShadow: {
    position: 'absolute',
    bottom: -5,
    left: 60,
    width: 100,
    height: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
    transform: [{ scaleX: 1.2 }],
  },
  soundWaveContainer: {
    position: 'absolute',
    top: 160,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  soundWaveLine: {
    width: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 160,
    left: 40,
    flexDirection: 'row',
    zIndex: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    opacity: 0.4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    zIndex: 20,
  },
  nextButton: {
    width: 140,
    height: 140,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
});

export default Onboarding;