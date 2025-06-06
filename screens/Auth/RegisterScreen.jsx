import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar, 
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const RegisterScreen = ({ navigation }) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Input refs for keyboard navigation
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Entrance animations
  useEffect(() => {
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
      })
    ]).start();
  }, []);
  
  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    return strength;
  };
  
  // Get strength label
  const getStrengthLabel = () => {
    switch(passwordStrength) {
      case 0: return 'Weak';
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };
  
  // Get strength label color
  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '#FF3B30';
      case 1: return '#FF3B30';
      case 2: return '#FFCC00';
      case 3: return '#34C759';
      case 4: return '#007AFF';
      default: return '#8391A1';
    }
  };
  
  // Toggle password visibility with haptic feedback
  const togglePasswordVisibility = () => {
    Haptics.selectionAsync();
    setShowPassword(!showPassword);
  };
  
  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    let isValid = true;
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle sign up
  const handleSignUp = async () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!validateForm()) {
      // Shake animation for error
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Signing up with:', fullName, email, password);
      navigation.navigate("SuccessScreen");
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update password strength when password changes
  React.useEffect(() => {
    if (password) {
      checkPasswordStrength(password);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Handle Google Sign Up
  const handleGoogleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Google sign up initiated');
    // Implement Google sign up functionality
  };

  // Show terms and conditions
  const showTermsAndConditions = () => {
    Haptics.selectionAsync();
    navigation.navigate("TermsScreen");
  };

  // Show privacy policy
  const showPrivacyPolicy = () => {
    Haptics.selectionAsync();
    navigation.navigate("PrivacyScreen");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
      <LinearGradient
        colors={['#9C3141', '#5E1B26']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SafeAreaView style={styles.safeContainer}>
              {/* Animated container for all content */}
              <Animated.View style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}>
                {/* Logo */}
                <View style={[
                  styles.logoContainer,
                  isKeyboardVisible && styles.logoContainerSmall
                ]}>
                  <Image
                    source={require("../../assets/Logo/logo_white.png")}
                    style={[
                      styles.logo,
                      isKeyboardVisible && styles.logoSmall
                    ]}
                    resizeMode='contain'
                    accessibilityLabel="App logo"
                  />
                </View>
                
                {/* Main Title - Hide when keyboard is visible */}
                {!isKeyboardVisible && (
                  <>
                    <View style={styles.titleContainer}>
                      <Text style={styles.titleText} accessibilityRole="header">CREATE ACCOUNT</Text>
                    </View>
                    
                    {/* Tagline */}
                    <View style={styles.taglineContainer}>
                      <Text style={styles.taglineText}>
                        Start Your Journey to Smarter Learning 
                      </Text>
                    </View>
                  </>
                )}
                
                {/* Background "SIGNIN" Letters */}
                {!isKeyboardVisible && (
                  <View style={styles.backgroundLetters} accessibilityElementsHidden={true}>
                    <Text style={styles.backgroundLettersText}>SIG{'\n'}NUP</Text>
                  </View>
                )}
                
                {/* SignUp Form */}
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color="#8391A1" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={fullNameRef}
                      style={[styles.input, errors.fullName ? styles.inputError : null]}
                      placeholder="Enter your full name"
                      placeholderTextColor="#8391A1"
                      value={fullName}
                      onChangeText={(text) => {
                        setFullName(text);
                        if (errors.fullName) {
                          setErrors({...errors, fullName: ''});
                        }
                      }}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current.focus()}
                      blurOnSubmit={false}
                      accessibilityLabel="Full name input"
                      accessibilityHint="Enter your full name"
                    />
                  </View>
                  {errors.fullName ? (
                    <Text style={styles.errorText} accessibilityRole="alert">{errors.fullName}</Text>
                  ) : null}

                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color="#8391A1" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={emailRef}
                      style={[styles.input, errors.email ? styles.inputError : null]}
                      placeholder="Enter your email"
                      placeholderTextColor="#8391A1"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                          setErrors({...errors, email: ''});
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current.focus()}
                      blurOnSubmit={false}
                      accessibilityLabel="Email input"
                      accessibilityHint="Enter your email address"
                    />
                  </View>
                  {errors.email ? (
                    <Text style={styles.errorText} accessibilityRole="alert">{errors.email}</Text>
                  ) : null}
                  
                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color="#8391A1" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordRef}
                      style={[styles.input, errors.password ? styles.inputError : null]}
                      placeholder="Enter your password"
                      placeholderTextColor="#8391A1"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) {
                          setErrors({...errors, password: ''});
                        }
                      }}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordRef.current.focus()}
                      blurOnSubmit={false}
                      accessibilityLabel="Password input"
                      accessibilityHint="Create a secure password"
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={togglePasswordVisibility}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      accessibilityRole="button"
                    >
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={24} 
                        color="#767676" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {errors.password ? (
                    <Text style={styles.errorText} accessibilityRole="alert">{errors.password}</Text>
                  ) : password ? (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.strengthBars}>
                        {[1, 2, 3, 4].map((level) => (
                          <View
                            key={level}
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor: passwordStrength >= level ? getStrengthColor() : '#E5E5E5',
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                        {getStrengthLabel()}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.inputContainer}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color="#8391A1" 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={confirmPasswordRef}
                      style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#8391A1"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) {
                          setErrors({...errors, confirmPassword: ''});
                        }
                      }}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
                      accessibilityLabel="Confirm password input"
                      accessibilityHint="Confirm your password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={togglePasswordVisibility}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={24}
                        color="#767676" 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText} accessibilityRole="alert">{errors.confirmPassword}</Text>
                  ) : null}
                  
                  <TouchableOpacity 
                    onPress={handleSignUp}
                    disabled={isSubmitting}
                    accessibilityLabel="Sign up button"
                    accessibilityHint="Create your account"
                    accessibilityRole="button"
                  >
                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                      <LinearGradient
                        colors={["#1963A7", "#49A1D1"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.signUpButton}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.signUpButtonText}>Create Account</Text>
                        )}
                      </LinearGradient>
                    </Animated.View>
                  </TouchableOpacity>
                  
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>Or Sign Up with</Text>
                    <View style={styles.divider} />
                  </View>
                  
                  <View style={styles.socialLoginContainer}>
                    <TouchableOpacity 
                      style={styles.googleButton}
                      onPress={handleGoogleSignUp}
                      accessibilityLabel="Sign up with Google"
                      accessibilityRole="button"
                    >
                      <Image 
                        source={require("../../assets/Auth/google.png")} 
                        style={styles.googleIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.googleButtonText}>Sign up with Google</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Already have an account? </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        navigation.navigate("LoginScreen");
                      }}
                      accessibilityLabel="Sign in link"
                      accessibilityHint="Go to sign in screen"
                      accessibilityRole="link"
                    >
                      <Text style={styles.signInLinkText}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      By proceeding, you consent to our 
                      <Text 
                        style={styles.termsLinkText}
                        onPress={showTermsAndConditions}
                        accessibilityRole="link"
                      > Terms and Conditions </Text>
                      and
                      <Text 
                        style={styles.termsLinkText}
                        onPress={showPrivacyPolicy}
                        accessibilityRole="link"
                      > Privacy Policy</Text>
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  safeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    marginHorizontal: 8,
    position: 'relative',
  },
  animatedContainer: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    height: 70,
    marginTop: Platform.OS === 'android' ? 40 : 20,
  },
  logoContainerSmall: {
    marginBottom: 12,
    height: 50,
    marginTop: Platform.OS === 'android' ? 20 : 10,
  },
  logo: {
    width: 140,
    height: 70,
  },
  logoSmall: {
    width: 100,
    height: 50,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold',
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taglineContainer: {
    alignItems: 'flex-start',
    marginTop: 5,
    marginBottom: 30,
  },
  taglineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
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
    opacity: 0.08,
  },
  backgroundLettersText: {
    color: '#FFFFFF',
    fontSize: 180,
    fontWeight: 'bold',
    lineHeight: 220,
  },
  formContainer: {
    width: '100%',
    zIndex: 1,
  },
  inputContainer: {
    marginBottom: 12,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingLeft: 46,
    paddingRight: 46,
    fontSize: 16,
    color: '#333333',
    width: '100%',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  strengthBar: {
    height: 4,
    width: 16,
    borderRadius: 2,
    marginRight: 2,
  },
  strengthText: {
    fontSize: 12,
  },
  signUpButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialLoginContainer: {
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  signInLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLinkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;