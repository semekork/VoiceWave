import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar, 
  Image,
  TextInput,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const iconRotate = useState(new Animated.Value(0))[0];
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Shaky animation values
  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;

  // Spring effect for text input focus
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  const startShaking = () => {
    // Create X-axis shaking
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeX, {
          toValue: -3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: -2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(5000), 
      ])
    ).start();

    // Create Y-axis shaking (slightly different timing for more natural effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeY, {
          toValue: 2,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(shakeY, {
          toValue: -2,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(shakeY, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(shakeY, {
          toValue: -1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(shakeY, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.delay(3500), // Adjusted timing for better rhythm
      ])
    ).start();
  };

  // Button press animation
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Entrance animations
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
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Start shaking animation after initial entrance animation
    setTimeout(() => {
      startShaking();
    }, 1200);

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Validate email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsButtonActive(emailRegex.test(email));
  }, [email]);

  // Handle text input focus animation
  const handleFocus = () => {
    setEmailFocused(true);
    Animated.timing(inputScaleAnim, {
      toValue: 1.02,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setEmailFocused(false);
    Animated.timing(inputScaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleRecoverPassword = async () => {
    if (!isButtonActive || isLoading) return;
    
    animateButtonPress();
    setIsLoading(true);
    
    // Password recovery animation - more intense shaking when button is pressed
    Animated.sequence([
      Animated.parallel([
        Animated.timing(shakeX, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeY, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(shakeX, {
          toValue: -8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: -8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: -4,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 4,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeX, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    try {
      e
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'voicewave://reset-password', 
      });

      setIsLoading(false);

      if (error) {
        // Handle specific error cases
        let errorMessage = 'An error occurred while sending the recovery email.';
        
        if (error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        } else if (error.message.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'No account found with this email address.';
        }

        Alert.alert(
          'Password Recovery Failed',
          errorMessage,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Success - show confirmation
      Alert.alert(
        'Recovery Email Sent!',
        `We've sent a password recovery link to ${email}. Please check your email and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
            style: 'default'
          }
        ]
      );

    } catch (error) {
      setIsLoading(false);
      console.error('Password recovery error:', error);
      
      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Icon rotation interpolation
  const spin = iconRotate.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '10deg', '0deg']
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#9C3141', '#5E1B26']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeContainer}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="chevron-back" size={22} color="#5B2A82" />
            </View>
          </TouchableOpacity>
          
          {/* Background "RECOVERY" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>RECO{'\n'}VERY</Text>
          </View>
          
          {/* Main Content */}
          <Animated.View style={[
            styles.contentContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}>
            <Animated.View style={[
              styles.iconContainer,
              { transform: [{ rotate: spin },{ translateX: shakeX },{ translateY: shakeY }] }
            ]}>
              <Image
                source={require("../../assets/Auth/lock-key.png")}
                style={styles.lockIcon}
                resizeMode='contain'
              />
            </Animated.View>
            
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>Password Recovery</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            {/* Instruction Text */}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Enter the email address associated with your account and we'll send you
                a link to reset your password
              </Text>
            </View>
            
            {/* Email Form */}
            <View style={styles.formContainer}>
              <Text style={styles.emailLabel}>Email Address</Text>
              
              <Animated.View style={[
                styles.inputWrapper,
                { transform: [{ scale: inputScaleAnim }] }
              ]}>
                <View style={[
                  styles.inputContainer, 
                  email ? styles.inputContainerActive : null,
                  emailFocused ? styles.inputContainerFocused : null
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={emailFocused ? "#3672E9" : "#8391A1"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#8391A1"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    editable={!isLoading}
                  />
                </View>
                {email && !isLoading && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setEmail('')}
                  >
                    <Ionicons name="close-circle" size={18} color="#8391A1" />
                  </TouchableOpacity>
                )}
              </Animated.View>
              
              {/* Input Validation Hint */}
              {email && !isButtonActive && (
                <Animated.View style={styles.validationHint}>
                  <Ionicons name="alert-circle-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.validationText}>Please enter a valid email address</Text>
                </Animated.View>
              )}
              
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  onPress={handleRecoverPassword}
                  activeOpacity={isButtonActive && !isLoading ? 0.8 : 1}
                  style={{ opacity: isButtonActive && !isLoading ? 1 : 0.6 }}
                  disabled={!isButtonActive || isLoading}
                >
                  <View style={styles.continueButton}>
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Text style={styles.continueButtonText}>Continue</Text>
                          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </>
                      )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Return to login option */}
            {!keyboardVisible && (
              <View style={styles.returnContainer}>
                <Text style={styles.returnText}>Remember your password? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('LoginScreen')}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  disabled={isLoading}
                >
                  <Text style={[styles.returnLinkText, { opacity: isLoading ? 0.5 : 1 }]}>Login</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Help Button */}
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => Alert.alert(
                "Need Help?",
                "If you're having trouble recovering your password, please contact our support team at trickvybe@gmail.com",
                [{ text: "OK", style: "default" }]
              )}
              disabled={isLoading}
            >
              <Ionicons name="help-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
              <Text style={styles.helpText}>Need help?</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
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
  backButton: {
    marginBottom: 10,
    zIndex: 10,
    marginLeft: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  contentContainer: {
    justifyContent: 'center',
    zIndex: 5,
  },
  iconContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  lockIcon: {
    width: 160,
    height: 160,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 10,
    opacity: 0.7,
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 22,
    textAlign: 'center',
  },
  backgroundLetters: {
    position: 'absolute',
    bottom: 0,
    right: -20,
    zIndex: 0,
    opacity: 0.07,
    justifyContent: 'center',
  },
  backgroundLettersText: {
    color: '#FFFFFF',
    fontSize: 120,
    fontWeight: 'bold',
    lineHeight: 110,
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 5,
  },
  emailLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  inputContainer: {
    flex: 1,
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainerActive: {
    borderWidth: 1,
    borderColor: '#3672E9',
  },
  inputContainerFocused: {
    borderWidth: 1.5,
    borderColor: '#3672E9',
    shadowColor: '#3672E9',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
  },
  validationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 5,
  },
  continueButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 8,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#2A2526",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  returnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    top: 80,
  },
  returnText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  returnLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -120,
    alignSelf: 'center',
    padding: 10,
  },
  helpText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginLeft: 5,
  }
});

export default ForgotPasswordScreen;