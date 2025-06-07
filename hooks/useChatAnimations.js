import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Custom hook for managing chat screen animations
 * Handles fade-in, slide-in, and typing indicator animations
 */
export const useChatAnimations = () => {
  // Main animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Message-specific animations
  const messageSlideAnim = useRef(new Animated.Value(50)).current;
  const messageOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // Typing indicator animation values
  const typingDots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  /**
   * Initialize main screen animations (fade and slide)
   */
  const initializeScreenAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Start continuous typing indicator animation
   */
  const startTypingAnimation = () => {
    const animations = typingDots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(animation => animation.start());
    return animations;
  };

  /**
   * Stop typing indicator animation
   */
  const stopTypingAnimation = () => {
    typingDots.forEach(dot => {
      dot.stopAnimation();
      dot.setValue(0);
    });
  };

  /**
   * Animate new message entrance
   */
  const animateMessageEntrance = (callback) => {
    // Reset values
    messageSlideAnim.setValue(50);
    messageOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(messageOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(messageSlideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  /**
   * Animate quick actions appearance
   */
  const animateQuickActions = (show = true) => {
    return Animated.timing(fadeAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    });
  };

  /**
   * Animate send button state changes
   */
  const animateSendButton = (enabled = true) => {
    return Animated.spring(fadeAnim, {
      toValue: enabled ? 1 : 0.6,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    });
  };

  /**
   * Animate connection status banner
   */
  const animateConnectionStatus = (show = true) => {
    const bannerAnim = useRef(new Animated.Value(show ? 1 : 0)).current;
    
    return Animated.timing(bannerAnim, {
      toValue: show ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    });
  };

  /**
   * Pulse animation for online indicator
   */
  const createPulseAnimation = () => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    return Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  };

  /**
   * Shake animation for error states
   */
  const createShakeAnimation = () => {
    const shakeAnim = useRef(new Animated.Value(0)).current;
    
    return Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);
  };

  /**
   * Smooth scroll animation trigger
   */
  const triggerScrollAnimation = (scrollViewRef, delay = 100) => {
    if (scrollViewRef?.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, delay);
    }
  };

  // Initialize animations on mount
  useEffect(() => {
    initializeScreenAnimations();
    
    // Don't start typing animation immediately - let it be controlled by the component
    return () => {
      stopTypingAnimation();
    };
  }, []);

  return {
    // Animation values
    fadeAnim,
    slideAnim,
    typingDots,
    messageSlideAnim,
    messageOpacityAnim,
    
    // Animation functions
    initializeScreenAnimations,
    startTypingAnimation,
    stopTypingAnimation,
    animateMessageEntrance,
    animateQuickActions,
    animateSendButton,
    animateConnectionStatus,
    createPulseAnimation,
    createShakeAnimation,
    triggerScrollAnimation,
  };
};

export default useChatAnimations;