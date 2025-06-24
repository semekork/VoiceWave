import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {View,Text,StyleSheet,SafeAreaView,TouchableOpacity,StatusBar,Image,TextInput,ActivityIndicator,KeyboardAvoidingView,Platform,ScrollView,Keyboard,Alert,Animated,} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../hooks/useAuth";

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { signUp, loading, error, errors, checkPasswordStrength } = useAuth();

  const [localErrors, setLocalErrors] = useState({ fullName: "",email: "",password: "",confirmPassword: "", });

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", isValid: false, });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener( "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener( "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true,}),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true,}),
      Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true,}),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (password && checkPasswordStrength) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        score: 0,
        label: "",
        isValid: false,
      });
    }
  }, [password]); 

  const getStrengthColor = useCallback(() => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return "#FF3B30";
      case 2:
        return "#FFCC00";
      case 3:
        return "#34C759";
      case 4:
      case 5:
        return "#007AFF";
      default:
        return "#8391A1";
    }
  }, [passwordStrength.score]);

  const togglePasswordVisibility = useCallback(() => {
    Haptics.selectionAsync();
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    Haptics.selectionAsync();
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const validateField = useCallback(
    (field, value) => {
      let error = "";
      switch (field) {
        case "fullName":
          if (!value.trim()) {
            error = "Name is required";
          } else if (value.trim().length < 2) {
            error = "Name must be at least 2 characters";
          } else if (value.trim().length > 100) {
            error = "Name must be less than 100 characters";
          } else if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) {
            error =
              "Name can only contain letters, spaces, hyphens, and apostrophes";
          }
          break;

        case "email":
          if (!value.trim()) {
            error = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
            error = "Please enter a valid email";
          }
          break;

        case "password":
          if (!value) {
            error = "Password is required";
          } else if (value.length < 8) {
            error = "Password must be at least 8 characters";
          } else if (passwordStrength.score < 3 && value.length >= 8) {
            error = "Password needs uppercase, lowercase, and numbers";
          }
          break;

        case "confirmPassword":
          if (!value) {
            error = "Please confirm your password";
          } else if (password !== value) {
            error = "Passwords do not match";
          }
          break;
      }

      return error;
    },
    [password, passwordStrength.score]
  );

  const handleFieldChange = useCallback(
    (field, value) => {
      switch (field) {
        case "fullName":
          setFullName(value);
          break;
        case "email":
          setEmail(value);
          break;
        case "password":
          setPassword(value);
          break;
        case "confirmPassword":
          setConfirmPassword(value);
          break;
      }

      setLocalErrors((prev) => {
        if (prev[field]) {
          return {
            ...prev,
            [field]: "",
          };
        }
        return prev;
      });
    },
    []
  );

  const handleFieldBlur = useCallback(
    (field, value) => {
      const error = validateField(field, value);
      setLocalErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    },
    [validateField]
  );


  const validateForm = useCallback(() => {
    const newErrors = {
      fullName: validateField("fullName", fullName),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };

    setLocalErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  }, [validateField, fullName, email, password, confirmPassword]);


  const navigateToSuccess = useCallback(
    (message = null) => {
      navigation.replace("SuccessScreen", {
        message: message,
        fromRegistration: true,
      });
    },
    [navigation]
  );

  const handleSignUp = useCallback(async () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!validateForm()) {
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
      return;
    }

    try {
      // Button press animation
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

      const result = await signUp({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        confirmPassword: confirmPassword,
      });

      if (result.success) {
        const message = result.data.needsEmailVerification
          ? "We've sent you a confirmation link. Please check your email to verify your account."
          : "Account created successfully! Welcome aboard.";

        navigateToSuccess(message);
      } else {
        if (result.error.includes("already exists")) {
          Alert.alert(
            "Account Exists",
            "An account with this email already exists. Please sign in instead.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign In",
                onPress: () => navigation.replace("LoginScreen"),
              },
            ]
          );
        } else {
          Alert.alert("Registration Error", result.error);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  }, [
    validateForm,
    buttonScale,
    signUp,
    fullName,
    email,
    password,
    confirmPassword,
    navigateToSuccess,
    navigation,
  ]);

  // Show terms and conditions
  const showTermsAndConditions = useCallback(() => {
    Haptics.selectionAsync();
    navigation.navigate("TermsScreen");
  }, [navigation]);

  // Show privacy policy
  const showPrivacyPolicy = useCallback(() => {
    Haptics.selectionAsync();
    navigation.navigate("PrivacyScreen");
  }, [navigation]);

  // Optimized navigation to login
  const navigateToLogin = useCallback(() => {
    Haptics.selectionAsync();
    navigation.replace("LoginScreen"); // Use replace to prevent stack buildup
  }, [navigation]);

  // FIXED: Memoize current errors to prevent unnecessary re-renders
  const currentErrors = useMemo(() => {
    return {
      fullName: localErrors.fullName || (errors?.fullName) || "",
      email: localErrors.email || (errors?.email) || "",
      password: localErrors.password || (errors?.password) || "",
      confirmPassword: localErrors.confirmPassword || (errors?.confirmPassword) || "",
    };
  }, [localErrors, errors]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#9C3141" />
      <LinearGradient colors={["#9C3141", "#5E1B26"]} style={styles.background}>
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
              <Animated.View
                style={[
                  styles.animatedContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim },
                    ],
                  },
                ]}
              >
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
                    accessibilityLabel="App logo"
                  />
                </View>

                {/* Main Title - Hide when keyboard is visible */}
                {!isKeyboardVisible && (
                  <>
                    <View style={styles.titleContainer}>
                      <Text style={styles.titleText} accessibilityRole="header">
                        CREATE ACCOUNT
                      </Text>
                    </View>

                    {/* Tagline */}
                    <View style={styles.taglineContainer}>
                      <Text style={styles.taglineText}>
                        Start Your Journey to Smarter Learning
                      </Text>
                    </View>
                  </>
                )}

                {/* Background "SIGNUP" Letters */}
                {!isKeyboardVisible && (
                  <View
                    style={styles.backgroundLetters}
                    accessibilityElementsHidden={true}
                  >
                    <Text style={styles.backgroundLettersText}>
                      SIG{"\n"}NUP
                    </Text>
                  </View>
                )}

                {/* SignUp Form */}
                <View style={styles.formContainer}>
                  {/* Full Name Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#8391A1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={fullNameRef}
                      style={[
                        styles.input,
                        currentErrors.fullName ? styles.inputError : null,
                      ]}
                      placeholder="Enter your full name"
                      placeholderTextColor="#8391A1"
                      value={fullName}
                      onChangeText={(text) =>
                        handleFieldChange("fullName", text)
                      }
                      onBlur={() => handleFieldBlur("fullName", fullName)}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      blurOnSubmit={false}
                      accessibilityLabel="Full name input"
                      accessibilityHint="Enter your full name"
                    />
                  </View>
                  {currentErrors.fullName ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {currentErrors.fullName}
                    </Text>
                  ) : null}

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#8391A1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={emailRef}
                      style={[
                        styles.input,
                        currentErrors.email ? styles.inputError : null,
                      ]}
                      placeholder="Enter your email"
                      placeholderTextColor="#8391A1"
                      value={email}
                      onChangeText={(text) => handleFieldChange("email", text)}
                      onBlur={() => handleFieldBlur("email", email)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                      accessibilityLabel="Email input"
                      accessibilityHint="Enter your email address"
                    />
                  </View>
                  {currentErrors.email ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {currentErrors.email}
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
                      ref={passwordRef}
                      style={[
                        styles.input,
                        currentErrors.password ? styles.inputError : null,
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#8391A1"
                      value={password}
                      onChangeText={(text) =>
                        handleFieldChange("password", text)
                      }
                      onBlur={() => handleFieldBlur("password", password)}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPasswordRef.current?.focus()
                      }
                      blurOnSubmit={false}
                      accessibilityLabel="Password input"
                      accessibilityHint="Create a secure password"
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

                  {/* Password Error or Strength Indicator */}
                  {currentErrors.password ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {currentErrors.password}
                    </Text>
                  ) : password ? (
                    <View style={styles.passwordStrengthContainer}>
                      <View style={styles.strengthBars}>
                        {[1, 2, 3, 4, 5].map((level) => (
                          <View
                            key={level}
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor:
                                  passwordStrength.score >= level
                                    ? getStrengthColor()
                                    : "#E5E5E5",
                              },
                            ]}
                          />
                        ))}
                      </View>
                      <Text
                        style={[
                          styles.strengthText,
                          { color: getStrengthColor() },
                        ]}
                      >
                        {passwordStrength.label}
                      </Text>
                    </View>
                  ) : null}

                  {/* Confirm Password Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#8391A1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={confirmPasswordRef}
                      style={[
                        styles.input,
                        currentErrors.confirmPassword
                          ? styles.inputError
                          : null,
                      ]}
                      placeholder="Confirm your password"
                      placeholderTextColor="#8391A1"
                      value={confirmPassword}
                      onChangeText={(text) =>
                        handleFieldChange("confirmPassword", text)
                      }
                      onBlur={() =>
                        handleFieldBlur("confirmPassword", confirmPassword)
                      }
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
                      accessibilityLabel="Confirm password input"
                      accessibilityHint="Confirm your password"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={toggleConfirmPasswordVisibility}
                      accessibilityLabel={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={24}
                        color="#767676"
                      />
                    </TouchableOpacity>
                  </View>
                  {currentErrors.confirmPassword ? (
                    <Text style={styles.errorText} accessibilityRole="alert">
                      {currentErrors.confirmPassword}
                    </Text>
                  ) : null}

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    onPress={handleSignUp}
                    disabled={loading}
                    accessibilityLabel="Sign up button"
                    accessibilityHint="Create your account"
                    accessibilityRole="button"
                  >
                    <Animated.View
                      style={{ transform: [{ scale: buttonScale }] }}
                    >
                      <View
                        style={[
                          styles.signUpButton,
                          loading && styles.signUpButtonDisabled,
                        ]}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.signUpButtonText}>
                            Create Account
                          </Text>
                        )}
                      </View>
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Sign In Link */}
                  <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={navigateToLogin}>
                      <Text style={styles.signInLinkText}>Sign In</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Terms and Privacy */}
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
    position: "relative",
  },
  animatedContainer: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    height: 70,
    marginTop: Platform.OS === "android" ? 40 : 20,
  },
  logoContainerSmall: {
    marginBottom: 12,
    height: 50,
    marginTop: Platform.OS === "android" ? 20 : 10,
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
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "bold",
    letterSpacing: 0,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taglineContainer: {
    alignItems: "flex-start",
    marginTop: 5,
    marginBottom: 30,
  },
  taglineText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "300",
  },
  backgroundLetters: {
    position: "absolute",
    bottom: 0,
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
    fontSize: 180,
    fontWeight: "bold",
    lineHeight: 220,
  },
  formContainer: {
    width: "100%",
    zIndex: 1,
  },
  inputContainer: {
    marginBottom: 12,
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
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 4,
  },
  strengthBars: {
    flexDirection: "row",
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
    width: "100%",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#2A2526",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  signInLinkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  termsContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  termsText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
  },
  termsLinkText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;