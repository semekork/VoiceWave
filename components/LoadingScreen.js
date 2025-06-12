import React, { useEffect, useRef } from 'react';
import { 
  View, 
  ImageBackground, 
  SafeAreaView, 
  Image, 
  Text, 
  Animated, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Enhanced loading screen component with animations and modern design
 */
const LoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Pulsing animation for logo
    const pulsingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    );
    
    const timer = setTimeout(() => {
      pulsingAnimation.start();
    }, 1000);

    return () => {
      clearTimeout(timer);
      pulsingAnimation.stop();
    };
  }, []);

  return (
    <ImageBackground 
      source={require('../assets/Onboarding/background.png')} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
      }}
      blurRadius={1}
    >
      {/* Overlay for better contrast */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }} />

      <SafeAreaView style={{ flex: 1, position: 'relative' }}>
        {/* Main content */}
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          {/* Logo Container with animations */}
          <Animated.View style={{ 
            alignItems: 'center',
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { translateY: slideUpAnim }
            ]
          }}>
            <Image 
              source={require('../assets/Logo/Logo.png')} 
              style={{
                width: Math.min(310, width * 0.8),
                height: Math.min(210, width * 0.8 * (210/310)),
                marginBottom: 30,
              }}
              resizeMode="contain"
            />
            
            {/* Loading indicator */}
            <View style={{
              marginTop: 20,
              alignItems: 'center',
            }}>
              <ActivityIndicator 
                size="large" 
                color="#ffffff" 
                style={{ marginBottom: 15 }}
              />
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '300',
                letterSpacing: 1,
                opacity: 0.9,
              }}>
                Loading...
              </Text>
            </View>
          </Animated.View>
        </View>
        
        {/* Footer with slide up animation */}
        <Animated.View style={{
          alignItems: 'center',
          paddingBottom: 50,
          paddingHorizontal: 20,
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            paddingVertical: 15,
            paddingHorizontal: 25,
            borderRadius: 25,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 14,
              opacity: 0.8,
              textAlign: 'center',
              marginBottom: 2,
              fontWeight: '300',
            }}>
              Designed & Developed by
            </Text>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
              letterSpacing: 0.5,
            }}>
              Caleb
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoadingScreen;