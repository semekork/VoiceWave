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
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { SCREEN_NAMES } from '../../navigation/types';
import { useAuth } from '../../services/loginService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn, user, loading: authLoading, loginService } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Biometric authentication state
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Input refs for focus handling
  const passwordInputRef = useRef(null);
  
  // Initialize biometric authentication
  useEffect(() => {
    checkBiometricSupport();
    checkBiometricCredentials();
  }, []);
  
  // Check if biometric authentication is supported
  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setIsBiometricSupported(compatible && enrolled);
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris');
      }
      
      console.log('Biometric support:', { compatible, enrolled, supportedTypes });
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsBiometricSupported(false);
    }
  };
  
  // Check if user has saved biometric credentials
  const checkBiometricCredentials = async () => {
    try {
      const savedCredentials = await SecureStore.getItemAsync('biometric_credentials');
      setIsBiometricEnabled(!!savedCredentials);
      
      // If credentials exist and biometrics are supported, show prompt
      if (savedCredentials && isBiometricSupported) {
        // Optionally auto-prompt for biometric auth on app start
        // handleBioAuth();
      }
    } catch (error) {
      console.error('Error checking biometric credentials:', error);
    }
  };
  
  // Save credentials for biometric authentication
  const saveBiometricCredentials = async (email, password) => {
    try {
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync('biometric_credentials', credentials);
      setIsBiometricEnabled(true);
      
      Alert.alert(
        'Biometric Authentication Enabled',
        'Your credentials have been saved securely. You can now use biometric authentication to log in.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      Alert.alert('Error', 'Failed to save credentials for biometric authentication.');
    }
  };
  
  // Remove saved biometric credentials
  const removeBiometricCredentials = async () => {
    try {
      await SecureStore.deleteItemAsync('biometric_credentials');
      setIsBiometricEnabled(false);
      
      Alert.alert(
        'Biometric Authentication Disabled',
        'Your saved credentials have been removed.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error removing biometric credentials:', error);
    }
  };
  
  // Handle biometric authentication
  const handleBioAuth = async () => {
    if (!isBiometricSupported) {
      Alert.alert(
        'Biometric Authentication Unavailable',
        'Biometric authentication is not supported or not set up on this device. Please ensure you have fingerprint or face recognition configured in your device settings.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (!isBiometricEnabled) {
      Alert.alert(
        'Setup Biometric Authentication',
        'To use biometric authentication, please log in with your email and password first, then enable biometric authentication in the prompt that follows.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsBiometricLoading(true);
    
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        requireConfirmation: false,
      });
      
      if (biometricAuth.success) {
        // Retrieve saved credentials
        const savedCredentials = await SecureStore.getItemAsync('biometric_credentials');
        
        if (savedCredentials) {
          const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
          
          // Authenticate with saved credentials
          const { data, error } = await signIn(savedEmail, savedPassword);
          
          if (error) {
            Alert.alert(
              'Authentication Failed',
              'Your saved credentials appear to be invalid. Please log in manually and update your biometric authentication.',
              [
                {
                  text: 'Remove Biometric Auth',
                  style: 'destructive',
                  onPress: removeBiometricCredentials
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          } else if (data?.user) {
            console.log('Biometric login successful:', data.user);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Navigation will be handled by the auth state listener
          }
        } else {
          Alert.alert('Error', 'No saved credentials found. Please log in manually first.');
          setIsBiometricEnabled(false);
        }
      } else if (biometricAuth.error === 'user_cancel') {
        console.log('Biometric authentication cancelled by user');
      } else {
        console.log('Biometric authentication failed:', biometricAuth.error);
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication failed. Please try again or use your email and password.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'An error occurred during biometric authentication.');
    } finally {
      setIsBiometricLoading(false);
    }
  };
  
  // Validate email format
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(text)) {
      setEmailError('Please enter a valid email');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  // Validate password
  const validatePassword = (text) => {
    if (!text) {
      setPasswordError('Password is required');
      return false;
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Login handler using LoginService
  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      
      try {
        const { data, error } = await signIn(email.trim(), password);

        if (error) {
          // Handle specific authentication errors
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before logging in.';
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (error.message.includes('User not found')) {
            errorMessage = 'No account found with this email address.';
          }
          
          Alert.alert('Login Error', errorMessage);
          console.error('Login error:', error);
        } else if (data?.user) {
          // Successful login - LoginService has already recorded the activity
          console.log('Login successful:', data.user);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Get current session to verify it's active
          const sessionId = await loginService.getCurrentSessionId();
          console.log('Current session ID:', sessionId);
          
          // Offer to enable biometric authentication if supported and not already enabled
          if (isBiometricSupported && !isBiometricEnabled) {
            Alert.alert(
              'Enable Biometric Authentication?',
              `Would you like to enable ${biometricType === 'face' ? 'Face ID' : 'fingerprint'} authentication for faster login?`,
              [
                {
                  text: 'Not Now',
                  style: 'cancel'
                },
                {
                  text: 'Enable',
                  style: 'default',
                  onPress: () => saveBiometricCredentials(email.trim(), password)
                }
              ]
            );
          }
          
          // Navigation will be handled by the auth state listener in useAuth
        }
      } catch (error) {
        console.error('Unexpected login error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Google Sign In - Enhanced with session tracking
  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsGoogleLoading(true);
    
    try {
      // Note: Google OAuth with session tracking would need additional implementation
      // This is a placeholder for the enhanced functionality
      Alert.alert(
        'Google Sign In',
        'Google Sign In with enhanced session tracking will be implemented based on your OAuth setup.',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      Alert.alert('Error', 'An unexpected error occurred during Google sign in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Password Reset
  const handleForgotPassword = async () => {
    Haptics.selectionAsync();
    navigation.navigate('ForgotPasswordScreen');
  };
  
  // Toggle password visibility with haptic feedback
  const togglePasswordVisibility = () => {
    Haptics.selectionAsync();
    setShowPassword(!showPassword);
  };
  
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

  // Handle navigation based on auth state
  useEffect(() => {
    if (user && !authLoading) {
      // User is authenticated, check if profile is complete
      const checkProfileAndNavigate = async () => {
        try {
          // Here you would check if the user's profile is complete
          // For now, we'll navigate to the main stack
          navigation.navigate('MainStack');
        } catch (error) {
          console.error('Error checking profile:', error);
          // Navigate anyway, let the app handle incomplete profiles
          navigation.navigate('MainStack');
        }
      };

      checkProfileAndNavigate();
    }
  }, [user, authLoading, navigation]);

  // Show terms and conditions
  const showTermsAndConditions = () => {
    Haptics.selectionAsync();
    navigation.navigate(SCREEN_NAMES.TERMS, { 
      showPrivacyPolicy: false 
    });
  };

  const showPrivacyPolicy = () => {
    Haptics.selectionAsync();
    navigation.navigate(SCREEN_NAMES.TERMS, { 
      showPrivacyPolicy: true 
    });
  };

  // Get biometric icon based on type
  const getBiometricIcon = () => {
    if (biometricType === 'face') {
      return require("../../assets/Auth/face-id.png");
    }
    return require("../../assets/Auth/fingerprint.png");
  };

  // Get biometric text based on type and status
  const getBiometricText = () => {
    if (!isBiometricSupported) {
      return 'Biometric authentication not available';
    }
    
    if (isBiometricEnabled) {
      return `Use ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'}`;
    }
    
    return `Enable ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'}`;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
      <LinearGradient
        colors={['#9C3141', '#5E1B26']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
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
                  accessible={true}
                  accessibilityLabel="App logo"
                />
              </View>
              
              {/* Main Title - Hide when keyboard is visible */}
              {!isKeyboardVisible && (
                <>
                  <View style={styles.titleContainer}>
                    <Text style={styles.titleText} accessibilityRole="header">WELCOME</Text>
                  </View>
                  
                  {/* Tagline */}
                  <View style={styles.taglineContainer}>
                    <Text style={styles.taglineText}>
                      A better way to learn, anytime, anywhere.
                    </Text>
                  </View>
                </>
              )}

              {/* Background "LOGIN" Letters */}
              {!isKeyboardVisible && (
                <View style={styles.backgroundLetters} accessibilityElementsHidden={true}>
                  <Text style={styles.backgroundLettersText}>LOG{'\n'}IN</Text>
                </View>
              )}
              
              {/* Login Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color="#8391A1" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, emailError ? styles.inputError : null]}
                    placeholder="Enter your email"
                    placeholderTextColor="#8391A1"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      validateEmail(text);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current.focus()}
                    blurOnSubmit={false}
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText} accessibilityRole="alert">{emailError}</Text>
                ) : null}
                
                <View style={styles.inputContainer}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color="#8391A1" 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    style={[styles.input, passwordError ? styles.inputError : null]}
                    placeholder="Enter your password"
                    placeholderTextColor="#8391A1"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      validatePassword(text);
                    }}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
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
                {passwordError ? (
                  <Text style={styles.errorText} accessibilityRole="alert">{passwordError}</Text>
                ) : null}

                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity 
                    onPress={handleForgotPassword}
                    accessibilityLabel="Forgot Password"
                    accessibilityRole="button"
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={handleLogin}
                  disabled={isLoading}
                  accessibilityLabel="Login button"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to log in"
                >
                  <Animated.View>
                    <LinearGradient
                      colors={["#1963A7", "#49A1D1"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.loginButtonText}>Continue</Text>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
                
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Or Login with</Text>
                  <View style={styles.divider} />
                </View>
                
                <View style={styles.socialLoginContainer}>
                  <TouchableOpacity 
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    accessibilityLabel="Sign in with Google"
                    accessibilityRole="button"
                  >
                    {isGoogleLoading ? (
                      <ActivityIndicator color="#333333" size="small" />
                    ) : (
                      <>
                        <Image 
                          source={require("../../assets/Auth/google.png")} 
                          style={styles.googleIcon}
                          resizeMode="contain"
                        />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      navigation.navigate("RegisterScreen");
                    }}
                    accessibilityLabel="Create Account"
                    accessibilityRole="button"
                  >
                    <Text style={styles.registerLinkText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Enhanced Biometric Authentication Section */}
                {isBiometricSupported && (
                  <TouchableOpacity 
                    style={[
                      styles.bioAuthContainer,
                      isBiometricEnabled && styles.bioAuthContainerEnabled,
                      !isBiometricSupported && styles.bioAuthContainerDisabled
                    ]}
                    onPress={handleBioAuth}
                    disabled={isBiometricLoading || !isBiometricSupported}
                    accessibilityLabel={`Use biometric authentication: ${getBiometricText()}`}
                    accessibilityRole="button"
                  >
                    {isBiometricLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" style={styles.bioAuthLoader} />
                    ) : (
                      <>
                        <Image 
                          source={getBiometricIcon()} 
                          style={[
                            styles.bioAuthIcon,
                            isBiometricEnabled && styles.bioAuthIconEnabled
                          ]}
                          resizeMode="contain"
                        />
                        {biometricType === 'face' && (
                          <Image 
                            source={require("../../assets/Auth/fingerprint.png")} 
                            style={[
                              styles.bioAuthIcon,
                              { opacity: 0.3 }
                            ]}
                            resizeMode="contain"
                          />
                        )}
                      </>
                    )}
                    <Text style={[
                      styles.bioAuthText,
                      isBiometricEnabled && styles.bioAuthTextEnabled,
                      !isBiometricSupported && styles.bioAuthTextDisabled
                    ]}>
                      {getBiometricText()}
                    </Text>
                  </TouchableOpacity>
                )}
                
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
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    height: 70,
  },
  logoContainerSmall: {
    marginBottom: 12,
    height: 50,
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
    fontSize: 50,
    fontWeight: 'bold',
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taglineContainer: {
    alignItems: 'flex-start',
    marginTop: 5,
    marginBottom: 40,
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
    borderWidth: 1,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  registerLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bioAuthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bioAuthIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    tintColor: '#FFFFFF',
  },
  bioAuthText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLinkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;