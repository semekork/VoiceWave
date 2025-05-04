import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ImageBackground,
  Animated,
  Dimensions
} from 'react-native';
import { Entypo } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PodcastSplashScreen = ({ onGetStarted }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  // Circle animations
  const circle1YAnim = useState(new Animated.Value(0))[0];
  const circle1XAnim = useState(new Animated.Value(0))[0];
  const circle2YAnim = useState(new Animated.Value(0))[0];
  const circle2XAnim = useState(new Animated.Value(0))[0];
  const circle1ScaleAnim = useState(new Animated.Value(1))[0];
  const circle2ScaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Main content animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Circle 1 floating animations
    Animated.loop(
      Animated.parallel([
        // Y-axis movement
        Animated.sequence([
          Animated.timing(circle1YAnim, {
            toValue: 15,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(circle1YAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(circle1YAnim, {
            toValue: -10,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(circle1YAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
        // X-axis movement
        Animated.sequence([
          Animated.timing(circle1XAnim, {
            toValue: 10,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1XAnim, {
            toValue: -5,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1XAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        // Scale animation
        Animated.sequence([
          Animated.timing(circle1ScaleAnim, {
            toValue: 1.1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1ScaleAnim, {
            toValue: 0.95,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1ScaleAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
    
    // Circle 2 floating animations (slightly different timing for varied effect)
    Animated.loop(
      Animated.parallel([
        // Y-axis movement
        Animated.sequence([
          Animated.timing(circle2YAnim, {
            toValue: -12,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(circle2YAnim, {
            toValue: 5,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(circle2YAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
        // X-axis movement
        Animated.sequence([
          Animated.timing(circle2XAnim, {
            toValue: -8,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(circle2XAnim, {
            toValue: 12,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(circle2XAnim, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ]),
        // Scale animation
        Animated.sequence([
          Animated.timing(circle2ScaleAnim, {
            toValue: 0.9,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(circle2ScaleAnim, {
            toValue: 1.05,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(circle2ScaleAnim, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
    
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/Onboarding/background_gs.png')} 
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        {/* Animated decorative elements */}
        <Animated.View 
          style={[
            styles.decorativeCircle1,
            { 
              transform: [
                { translateY: circle1YAnim },
                { translateX: circle1XAnim },
                { scale: circle1ScaleAnim }
              ] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle2,
            { 
              transform: [
                { translateY: circle2YAnim },
                { translateX: circle2XAnim },
                { scale: circle2ScaleAnim }
              ] 
            }
          ]} 
        />
        
        {/* Main content container */}
        <View style={styles.contentContainer}>
          <View style={styles.textBubble}>
            <Text style={styles.titleText}>THE BEST</Text>
            <Text style={styles.podcastText}>PODCAST</Text>
            <Text style={styles.planetText}>ON THE PLANET</Text>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/Logo/logo_black.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
          {/* Button with pulse animation */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '95%' }}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={onGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <View style={styles.arrowCircle}>
                <Entypo name="chevron-right" size={35} color="black" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  textBubble: {
    backgroundColor: '#FEFEF3',
    borderRadius: 40,
    paddingHorizontal: 25,
    paddingVertical: 20,
    width: '95%',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#222',
  },
  podcastText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#222',
    lineHeight: 70,
  },
  planetText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  logoContainer: {
    position: 'absolute',
    right: 10,
    top: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logoImage: {
    width: 120,
    height: 52,
  },
  button: {
    backgroundColor: '#9C3141',
    borderRadius: 50,
    paddingVertical: 22,
    paddingLeft: 40,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  arrowCircle: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(156, 49, 65, 0.2)',
    top: 40,
    left: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(156, 49, 65, 0.15)',
    top: 90,
    right: -20,
  },
});

export default PodcastSplashScreen;