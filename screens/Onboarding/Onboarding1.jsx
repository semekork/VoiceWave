import React, { useEffect, useRef } from 'react';
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

const Onboarding1 = ({ navigation }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, []);

  const floatingStyle = {
    transform: [{ translateY: floatAnim }]
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#9C3141', '#9C3141']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeContainer}>
        <OnboardingIndicator total={3} activeIndex={0} />
          
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/Logo/logo_white.png")}
              style={styles.logo}
              resizeMode='contain'
            />
          </View>
          
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>THE{'\n'}WAVE.</Text>
          </View>
          
          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>
              VoiceWave is reshaping how education sounds — inspired by the past, built for tomorrow.
            </Text>
          </View>
          
          {/* Background "WA" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>WA{'\n'}VE</Text>
          </View>
          
          {/* Cassette Tape Image with Floating Animation */}
          <Animated.View style={[styles.cassetteContainer, floatingStyle]}>
            <Image
              source={require('../../assets/Onboarding/casette_tape.png')}
              style={styles.cassetteImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Next Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => navigation.navigate('Onboarding2')}
            >
              <Image
                source={require('../../assets/Onboarding/button.png')}
                style={styles.buttonLines}
                resizeMode="contain"
              />
              <Text style={styles.nextButtonText}>Next</Text>
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
    fontSize: 80,
    fontWeight: 'bold',
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
    fontSize: 200,
    fontWeight: 'bold',
    lineHeight: 220,
  },
  cassetteContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 10,
  },
  cassetteImage: {
    width: 240,
    height: 240,
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
  },
  buttonLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  }
});

export default Onboarding1;