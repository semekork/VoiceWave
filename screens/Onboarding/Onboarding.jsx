import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Easing,
  Dimensions,
  PanResponder
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingIndicator from '../../components/OnboardingIndicator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constants for better maintainability
const ANIMATION_DURATION = {
  FLOAT: 2000,
  ROTATE: 15000,
  FADE_SLIDE: 1000,
  WAVE_UPDATE: 1500,
  SCREEN_TRANSITION: 800
};

const ONBOARDING_SCREENS = [
  {
    id: 0,
    title: "THE\nWAVE.",
    tagline: "VoiceWave is reshaping how education sounds — inspired by the past, built for tomorrow.",
    backgroundText: "WA\nVE",
    image: require('../../assets/Onboarding/casette_tape.png'),
    gradient: ['#9C3141', '#5E1B26']
  },
  {
    id: 1,
    title: "THE\nCONNECTION.",
    tagline: "Curated podcasts built for learners in Ghana — listen, grow, and stay inspired.",
    backgroundText: "CONNECT",
    image: require('../../assets/Onboarding/microphone.png'),
    gradient: ['#9C3141', '#5E1B26']
  },
  {
    id: 2,
    title: "THE\nFUTURE.",
    tagline: "Download once, learn forever — offline access for anywhere your journey takes you.",
    backgroundText: "FUTURE",
    image: require('../../assets/Onboarding/phone.png'),
    gradient: ['#9C3141', '#5E1B26']
  }
];

const Onboarding = ({ navigation }) => {
  // State management
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation refs
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const backgroundFadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Animation references for cleanup
  const animationRefs = useRef([]);
  
  // Memoized wave heights for performance
  const [waveHeights, setWaveHeights] = useState(() => 
    Array.from({ length: 7 }, () => ({
      height: 10 + Math.random() * 30,
      opacity: 0.4 + Math.random() * 0.6,
    }))
  );

  // Cleanup function for animations
  const cleanupAnimations = useCallback(() => {
    animationRefs.current.forEach(animation => {
      if (animation && animation.stop) {
        animation.stop();
      }
    });
    animationRefs.current = [];
  }, []);

  // Enhanced floating animation with spring physics
  const startFloatingAnimation = useCallback(() => {
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: ANIMATION_DURATION.FLOAT,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION.FLOAT,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        })
      ])
    );
    floatingAnimation.start();
    animationRefs.current.push(floatingAnimation);
  }, [floatAnim]);

  // Enhanced rotation animation
  const startRotationAnimation = useCallback(() => {
    const rotatingAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.ROTATE,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotatingAnimation.start();
    animationRefs.current.push(rotatingAnimation);
  }, [rotateAnim]);

  // Enhanced fade and slide animation with stagger effect
  const resetAndRunFadeSlideAnimation = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.95);
    
    const fadeSlideAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.FADE_SLIDE,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION.FADE_SLIDE,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION.FADE_SLIDE,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    ]);
    
    fadeSlideAnimation.start();
    animationRefs.current.push(fadeSlideAnimation);
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Wave animation for microphone screen
  const updateWaveHeights = useCallback(() => {
    if (currentScreen === 1) {
      setWaveHeights(
        Array.from({ length: 7 }, (_, index) => ({
          height: 10 + Math.random() * 35 + Math.sin(Date.now() / 1000 + index) * 5,
          opacity: 0.3 + Math.random() * 0.7,
        }))
      );
    }
  }, [currentScreen]);

  // Screen transition with smooth background change
  const transitionToScreen = useCallback((nextScreen) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Fade out current content
    Animated.parallel([
      Animated.timing(backgroundFadeAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION.SCREEN_TRANSITION / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: ANIMATION_DURATION.SCREEN_TRANSITION / 2,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Change screen
      setCurrentScreen(nextScreen);
      
      // Fade in new content
      Animated.parallel([
        Animated.timing(backgroundFadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.SCREEN_TRANSITION / 2,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsTransitioning(false);
        resetAndRunFadeSlideAnimation();
      });
    });
  }, [isTransitioning, backgroundFadeAnim, scaleAnim, resetAndRunFadeSlideAnimation]);

  // Swipe gesture handling
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50 && currentScreen > 0) {
        // Swipe right - go to previous screen
        transitionToScreen(currentScreen - 1);
      } else if (gestureState.dx < -50 && currentScreen < ONBOARDING_SCREENS.length - 1) {
        // Swipe left - go to next screen
        transitionToScreen(currentScreen + 1);
      }
    },
  }), [currentScreen, transitionToScreen]);

  // Navigation handler
  const goToNextScreen = useCallback(() => {
    if (currentScreen < ONBOARDING_SCREENS.length - 1) {
      transitionToScreen(currentScreen + 1);
    } else {
      navigation.navigate('GetStartedScreen');
    }
  }, [currentScreen, transitionToScreen, navigation]);

  // Skip to end handler
  const skipToEnd = useCallback(() => {
    navigation.navigate('GetStartedScreen');
  }, [navigation]);

  // Main useEffect for animations
  useEffect(() => {
    cleanupAnimations();
    
    startFloatingAnimation();
    startRotationAnimation();
    resetAndRunFadeSlideAnimation();
    
    // Wave animation interval
    const waveInterval = setInterval(updateWaveHeights, ANIMATION_DURATION.WAVE_UPDATE);
    
    return () => {
      clearInterval(waveInterval);
      cleanupAnimations();
    };
  }, [currentScreen, startFloatingAnimation, startRotationAnimation, resetAndRunFadeSlideAnimation, updateWaveHeights, cleanupAnimations]);

  // Memoized style calculations
  const animatedStyles = useMemo(() => ({
    floating: {
      transform: [{ translateY: floatAnim }]
    },
    fadeSlide: {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim }
      ]
    },
    backgroundFade: {
      opacity: backgroundFadeAnim
    },
    rotation: {
      transform: [{
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        })
      }]
    }
  }), [floatAnim, fadeAnim, slideAnim, scaleAnim, backgroundFadeAnim, rotateAnim]);

  // Current screen data
  const currentScreenData = ONBOARDING_SCREENS[currentScreen];

  // Render decorative elements based on screen
  const renderDecorativeElements = useCallback(() => {
    switch (currentScreen) {
      case 0:
        return (
          <View style={styles.decorativeElements}>
            <View style={styles.decorativeCircle} />
            <View style={styles.decorativeLine} />
            <View style={styles.decorativeSmallCircle} />
          </View>
        );
      case 1:
        return (
          <View style={styles.soundWaveContainer}>
            {waveHeights.map((wave, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.soundWaveLine,
                  {
                    height: wave.height,
                    opacity: wave.opacity,
                    transform: [{
                      scaleY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1]
                      })
                    }]
                  },
                ]}
              />
            ))}
          </View>
        );
      case 2:
        return (
          <>
            <Animated.View style={[styles.decorativeElements, animatedStyles.rotation]}>
              <View style={styles.decorativeCircle} />
              <View style={styles.decorativeInnerCircle} />
            </Animated.View>
            <View style={styles.dotsContainer}>
              {[...Array(5)].map((_, i) => (
                <Animated.View 
                  key={i} 
                  style={[
                    styles.dot,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1]
                        })
                      }]
                    }
                  ]} 
                />
              ))}
            </View>
          </>
        );
      default:
        return null;
    }
  }, [currentScreen, waveHeights, fadeAnim, animatedStyles.rotation]);

  // Render floating image
  const renderFloatingImage = useCallback(() => {
    const imageStyle = currentScreen === 0 ? styles.cassetteContainer : styles.floatingImageContainer;
    
    return (
      <Animated.View style={[imageStyle, animatedStyles.floating]}>
        <Animated.Image
          source={currentScreenData.image}
          style={[
            styles.floatingImage,
            {
              opacity: fadeAnim,
              transform: [{
                scale: scaleAnim.interpolate({
                  inputRange: [0.9, 1],
                  outputRange: [0.9, 1]
                })
              }]
            }
          ]}
          resizeMode="contain"
        />
        {currentScreen === 1 && <View style={styles.microphoneShadow} />}
      </Animated.View>
    );
  }, [currentScreen, currentScreenData.image, animatedStyles.floating, fadeAnim, scaleAnim]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={currentScreenData.gradient[0]} />
      <LinearGradient
        colors={currentScreenData.gradient}
        style={styles.background}
      >
        <Animated.View style={[styles.backgroundContainer, animatedStyles.backgroundFade]}>
          <SafeAreaView style={styles.safeContainer} {...panResponder.panHandlers}>
            <OnboardingIndicator total={3} activeIndex={currentScreen} />
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/Logo/logo_white.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            {/* Main Title */}
            <Animated.View style={[styles.titleContainer, animatedStyles.fadeSlide]}>
              <Text style={[
                styles.titleText, 
                currentScreen === 0 && styles.largeTitleText
              ]}>
                {currentScreenData.title}
              </Text>
            </Animated.View>
            
            {/* Tagline */}
            <Animated.View style={[styles.taglineContainer, animatedStyles.fadeSlide]}>
              <Text style={styles.taglineText}>
                {currentScreenData.tagline}
              </Text>
            </Animated.View>
            
            {/* Background Letters */}
            <View style={styles.backgroundLetters}>
              <Text style={[
                styles.backgroundLettersText,
                currentScreen === 0 && styles.largeBackgroundText
              ]}>
                {currentScreenData.backgroundText}
              </Text>
            </View>
            
            {/* Decorative Elements */}
            {renderDecorativeElements()}
            
            {/* Floating Image */}
            {renderFloatingImage()}
            
            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.nextButton, isTransitioning && styles.disabledButton]}
                onPress={goToNextScreen}
                disabled={isTransitioning}
                activeOpacity={0.8}
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
        </Animated.View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundContainer: {
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
    marginTop: 20,
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
    fontWeight: '800',
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
    opacity: 0.9,
  },
  backgroundLetters: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    height: '60%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  backgroundLettersText: {
    color: 'rgba(255, 255, 255, 0.08)',
    fontSize: 160,
    fontWeight: '900',
    lineHeight: 180,
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
  decorativeSmallCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorativeInnerCircle: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cassetteContainer: {
    position: 'absolute',
    right: 0,
    bottom: 120,
    zIndex: 10,
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
    marginHorizontal: 2,
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressDotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
});

export default Onboarding;