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

const { width, height } = Dimensions.get('window');

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Get email from route params (passed from forgot password screen)
  const email = route?.params?.email || 'your email';
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const iconRotate = useState(new Animated.Value(0))[0];
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successFade = useRef(new Animated.Value(0)).current;
  
  // Shaky animation values
  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;

  // OTP input refs
  const inputRefs = useRef([]);
  const otpBoxAnimations = useRef(otpValues.map(() => new Animated.Value(1))).current;

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

    // Create Y-axis shaking
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
        Animated.delay(3500),
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

  // OTP box animation when typing
  const animateOtpBox = (index) => {
    Animated.sequence([
      Animated.timing(otpBoxAnimations[index], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(otpBoxAnimations[index], {
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

  // Resend timer effect
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  // Check if OTP is complete
  useEffect(() => {
    const isComplete = otpValues.every(value => value !== '') && otpValues.every(value => value.length === 1);
    setIsButtonActive(isComplete);
  }, [otpValues]);

  const handleOtpChange = (value, index) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Animate the box
    animateOtpBox(index);
    
    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && otpValues[index] === '' && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
      const newOtpValues = [...otpValues];
      newOtpValues[index - 1] = '';
      setOtpValues(newOtpValues);
    }
  };

  const handleVerifyOTP = () => {
    if (!isButtonActive || isLoading) return;
    
    animateButtonPress();
    
    // Start loading state
    setIsLoading(true);
    
    // Intense shaking animation when verifying
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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      
      // Animate success message
      Animated.timing(successFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Resume normal shaking after the intense shake
      setTimeout(() => {
        startShaking();
      }, 1000);
      
      // Navigate to next screen after success
      setTimeout(() => {
        navigation.navigate('ResetPasswordScreen', { email });
      }, 2000);
      
      console.log('Verifying OTP:', otpValues.join(''));
    }, 2000);
  };

  const handleResendOTP = () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    
    // Clear current OTP
    setOtpValues(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    
    Alert.alert(
      "OTP Sent",
      `A new verification code has been sent to ${email}`,
      [{ text: "OK", style: "default" }]
    );
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
          
          {/* Background "VERIFY" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>VERI{'\n'}FY</Text>
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
              { transform: [{ rotate: spin }, { translateX: shakeX }, { translateY: shakeY }] }
            ]}>
              <Image
                source={require("../../assets/Auth/lock-key.png")}
                style={styles.lockIcon}
                resizeMode='contain'
              />
            </Animated.View>
            
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>OTP Verification</Text>
              <View style={styles.titleUnderline} />
            </View>
            
            {/* Instruction Text */}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Enter the 6-digit verification code sent to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>
            
            {/* OTP Input Form */}
            <View style={styles.formContainer}>
              <View style={styles.otpContainer}>
                {otpValues.map((value, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.otpInputWrapper,
                      { transform: [{ scale: otpBoxAnimations[index] }] }
                    ]}
                  >
                    <TextInput
                      ref={(ref) => inputRefs.current[index] = ref}
                      style={[
                        styles.otpInput,
                        value ? styles.otpInputFilled : null
                      ]}
                      value={value}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  </Animated.View>
                ))}
              </View>
              
              {/* Timer and Resend */}
              <View style={styles.resendContainer}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Resend code in {resendTimer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Success Message */}
              {showSuccess && (
                <Animated.View style={[styles.successMessage, { opacity: successFade }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CD964" />
                  <Text style={styles.successText}>
                    OTP verified successfully!
                  </Text>
                </Animated.View>
              )}
              
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  onPress={handleVerifyOTP}
                  activeOpacity={isButtonActive ? 0.8 : 1}
                  style={{ opacity: isButtonActive ? 1 : 0.6 }}
                >
                  <View style={styles.continueButton}>
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Text style={styles.continueButtonText}>Verify OTP</Text>
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
                <Text style={styles.returnText}>Didn't receive the code? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.returnLinkText}>Try again</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Help Button */}
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => Alert.alert(
                "Need Help?",
                "If you're having trouble with OTP verification, please contact our support team at trickvybe@gmail.com",
                [{ text: "OK", style: "default" }]
              )}
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
    marginBottom: 5,
  },
  emailText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInputWrapper: {
    width: 45,
    height: 55,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: '#3672E9',
    backgroundColor: 'rgba(54, 114, 233, 0.1)',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  resendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    borderRadius: 10,
  },
  successText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
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

export default OTPVerificationScreen;