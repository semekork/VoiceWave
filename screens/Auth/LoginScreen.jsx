import { useState, useRef, useEffect } from "react";
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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../hooks/useAuth";
import { useBiometric } from "../../hooks/useBiometric";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn, user, loading: authLoading, loginService } = useAuth();

  const {
    isSupported: isBiometricSupported,
    biometricType,
    isEnabled: isBiometricEnabled,
    isLoading: isBiometricLoading,
    isInitialized,
    authenticate,
    saveCredentials,
    removeCredentials,
    promptToEnable,
    getBiometricIcon,
    getBiometricDisplayName,
    getBiometricButtonText,
  } = useBiometric();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Input refs for focus handling
  const passwordInputRef = useRef(null);

  // Handle biometric authentication using the hook
  const handleBioAuth = async () => {
    if (!isBiometricSupported) {
      Alert.alert(
        "Biometric Authentication Unavailable",
        "Biometric authentication is not supported or not set up on this device. Please ensure you have fingerprint or face recognition configured in your device settings.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (!isBiometricEnabled) {
      Alert.alert(
        "Setup Biometric Authentication",
        "To use biometric authentication, please log in with your email and password first, then enable biometric authentication in the prompt that follows.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    try {
      // Use the biometric hook's authenticate method
      const result = await authenticate(async (email, password) => {
        return await signIn(email, password);
      });

      if (result.success) {
        console.log("Biometric login successful");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Handle different error scenarios
        switch (result.reason) {
          case 'invalid_credentials':
            Alert.alert(
              "Authentication Failed",
              "Your saved credentials appear to be invalid. Please log in manually and update your biometric authentication.",
              [
                {
                  text: "Remove Biometric Auth",
                  style: "destructive",
                  onPress: () => removeCredentials(),
                },
                { text: "Cancel", style: "cancel" },
              ]
            );
            break;
          case 'user_cancelled':
            console.log("Biometric authentication cancelled by user");
            break;
          case 'auth_failed':
            // Error already handled by the hook
            break;
          default:
            // Other errors are handled by the hook
            break;
        }
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Error",
        "An error occurred during biometric authentication."
      );
    }
  };

  // Validate email format
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(text)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Validate password
  const validatePassword = (text) => {
    if (!text) {
      setPasswordError("Password is required");
      return false;
    } else if (text.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // Enhanced button press animation
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Login handler with biometric integration
  const handleLogin = async () => {
    animateButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);

      try {
        const { data, error } = await signIn(email.trim(), password);

        if (error) {
          // Handle specific authentication errors
          let errorMessage = "Login failed. Please try again.";

          if (error.message.includes("Invalid login credentials")) {
            errorMessage =
              "Invalid email or password. Please check your credentials.";
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage =
              "Please verify your email address before logging in.";
          } else if (error.message.includes("Too many requests")) {
            errorMessage = "Too many login attempts. Please try again later.";
          } else if (error.message.includes("User not found")) {
            errorMessage = "No account found with this email address.";
          }

          Alert.alert("Login Error", errorMessage);
          console.error("Login error:", error);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else if (data?.user) {
          // Successful login
          console.log("Login successful");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Get current session to verify it's active
          const sessionId = await loginService.getCurrentSessionId();

          // Use the biometric hook to prompt for enabling biometric authentication
          if (isBiometricSupported && !isBiometricEnabled) {
            promptToEnable(email.trim(), password);
          }
        }
      } catch (error) {
        console.error("Unexpected login error:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Password Reset
  const handleForgotPassword = async () => {
    Haptics.selectionAsync();
    navigation.navigate("ForgotPasswordScreen");
  };

  // Toggle password visibility with haptic feedback
  const togglePasswordVisibility = () => {
    Haptics.selectionAsync();
    setShowPassword(!showPassword);
  };

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
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
      }),
    ]).start();
  }, []);

  // Navigation effect
  useEffect(() => {
    if (user && !authLoading) {
      const checkProfileAndNavigate = async () => {
        try {
          navigation.navigate("MainStack");
        } catch (error) {
          console.error("Error checking profile:", error);
          navigation.navigate("MainStack");
        }
      };

      checkProfileAndNavigate();
    }
  }, [user, authLoading, navigation]);

  // Show terms and conditions
  const showTermsAndConditions = () => {
    Haptics.selectionAsync();
    navigation.navigate("TermsScreen", {
      showPrivacyPolicy: true,
    });
  };

  const showPrivacyPolicy = () => {
    Haptics.selectionAsync();
    navigation.navigate("TermsScreen", {
      showPrivacyPolicy: true,
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
      <LinearGradient colors={["#9C3141", "#5E1B26"]} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <SafeAreaView style={styles.safeContainer}>
            <Animated.View
              style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                {/* Logo */}
                <View
                  style={[
                    styles.logoContainer,
                    isKeyboardVisible && styles.logoContainerSmall,
                  ]}
                >
                  <Image
                    source={require("../../assets/Logo/logo_white.png")}
                    style={[styles.logo, isKeyboardVisible && styles.logoSmall]}
                    resizeMode="contain"
                    accessible={true}
                    accessibilityLabel="App logo"
                  />
                </View>

                {/* Title and Tagline - Hide when keyboard is visible */}
                {!isKeyboardVisible && (
                  <>
                    <View style={styles.titleContainer}>
                      <Text style={styles.titleText} accessibilityRole="header">
                        WELCOME
                      </Text>
                    </View>

                    <View style={styles.taglineContainer}>
                      <Text style={styles.taglineText}>
                        A better way to learn, anytime, anywhere.
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Background "LOGIN" Letters */}
              {!isKeyboardVisible && (
                <View
                  style={styles.backgroundLetters}
                  accessibilityElementsHidden={true}
                >
                  <Text style={styles.backgroundLettersText}>LOG{"\n"}IN</Text>
                </View>
              )}

              {/* Form Section */}
              <View style={styles.formSection}>
                <View style={styles.formContainer}>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#8391A1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        emailError ? styles.inputError : null,
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor="#8391A1"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) validateEmail(text);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      blurOnSubmit={false}
                      accessibilityLabel="Email input"
                      accessibilityHint="Enter your email address"
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {emailError}
                    </Text>
                  ) : null}

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#8391A1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordInputRef}
                      style={[
                        styles.input,
                        passwordError ? styles.inputError : null,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#8391A1"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) validatePassword(text);
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
                      accessibilityLabel={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {passwordError}
                    </Text>
                  ) : null}

                  {/* Forgot Password */}
                  <View style={styles.forgotPasswordContainer}>
                    <TouchableOpacity
                      onPress={handleForgotPassword}
                      accessibilityLabel="Forgot Password"
                      accessibilityRole="button"
                    >
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    accessibilityLabel="Login button"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to log in"
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={{ transform: [{ scale: buttonScaleAnim }] }}
                    >
                      <View
                        style={[
                          styles.loginButton,
                          isLoading && styles.loginButtonDisabled,
                        ]}
                      >
                        {isLoading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text style={styles.loadingText}>
                              Signing in...
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                      </View>
                    </Animated.View>
                  </TouchableOpacity>

                  
                  {isInitialized && isBiometricSupported && (
                    <TouchableOpacity
                      style={[
                        styles.bioAuthContainer,
                        isBiometricEnabled && styles.bioAuthContainerEnabled,
                      ]}
                      onPress={handleBioAuth}
                      disabled={isBiometricLoading}
                      accessibilityLabel={`Use biometric authentication: ${getBiometricButtonText()}`}
                      accessibilityRole="button"
                      activeOpacity={0.7}
                    >
                      {isBiometricLoading ? (
                        <ActivityIndicator
                          color="#FFFFFF"
                          size="small"
                          style={styles.bioAuthLoader}
                        />
                      ) : (
                        <Image
                          source={getBiometricIcon()}
                          style={[
                            styles.bioAuthIcon,
                            isBiometricEnabled && styles.bioAuthIconEnabled,
                          ]}
                          resizeMode="contain"
                        />
                      )}
                      <Text
                        style={[
                          styles.bioAuthText,
                          isBiometricEnabled && styles.bioAuthTextEnabled,
                        ]}
                      >
                        {getBiometricButtonText()}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Footer Section */}
              <View style={styles.footerSection}>
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>
                    Don't have an account?{" "}
                  </Text>
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

                <View style={styles.termsContainer}>
                  <Text style={styles.termsText}>
                    By proceeding, you consent to our
                    <Text
                      style={styles.termsLinkText}
                      onPress={showTermsAndConditions}
                      accessibilityRole="link"
                    >
                      {" "}
                      Terms and Conditions{" "}
                    </Text>
                    and
                    <Text
                      style={styles.termsLinkText}
                      onPress={showPrivacyPolicy}
                      accessibilityRole="link"
                    >
                      {" "}
                      Privacy Policy
                    </Text>
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
  },
  animatedContainer: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Header Section
  headerSection: {
    flex: 0,
    paddingTop: 16,
  },
  logoContainer: {
    alignItems: "flex-start",
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
    alignItems: "flex-start",
    marginBottom: 8,
    marginLeft: 10,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: Math.min(screenWidth * 0.13, 50),
    fontWeight: "bold",
    letterSpacing: 0,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taglineContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
    marginLeft: 10,
  },
  taglineText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "300",
    opacity: 0.9,
  },

  // Background Letters
  backgroundLetters: {
    position: "absolute",
    bottom: -40,
    left: 0,
    right: 0,
    zIndex: 0,
    height: "60%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    opacity: 0.08,
  },
  backgroundLettersText: {
    color: "#FFFFFF",
    fontSize: Math.min(screenWidth * 0.45, 180),
    fontWeight: "bold",
    lineHeight: Math.min(screenWidth * 0.55, 220),
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  formContainer: {
    width: "95%",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 18,
    paddingLeft: 46,
    paddingRight: 46,
    fontSize: 16,
    color: "#333333",
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "500",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#2A2526",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  bioAuthContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bioAuthContainerEnabled: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  bioAuthIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    opacity: 0.7,
  },
  bioAuthIconEnabled: {
    opacity: 1,
  },
  bioAuthText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
  bioAuthTextEnabled: {
    opacity: 1,
  },
  bioAuthLoader: {
    marginRight: 12,
  },
  footerSection: {
    flex: 0,
    paddingBottom: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  registerText: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.8,
  },
  registerLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  termsContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  termsText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.7,
  },
  termsLinkText: {
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});

export default LoginScreen;