import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar, 
  Image,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Login logic would go here
    console.log('Logging in with:', email, password);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#9C3141', '#5E1B26']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/Logo/logo_white.png")}
              style={styles.logo}
              resizeMode='contain'
            />
          </View>
          
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>WELCOME</Text>
          </View>
          
          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>
              A better way to learn, anytime, anywhere.
            </Text>
          </View>

          {/* Background "LOGIN" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>LOG{'\n'}IN</Text>
          </View>
          
          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#8391A1"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#8391A1"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#767676" 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswordScreen")}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin}>
            <View style={styles.loginButton}>
              <LinearGradient
                colors={["#1963A7", "#49A1D1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
              <Text style={styles.loginButtonText}>Continue</Text>
              </LinearGradient>
            </View>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or Login with</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialLoginContainer}>
              <TouchableOpacity style={styles.googleButton}>
                <Image 
                  source={require("../../assets/Auth/google.png")} 
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
              
            </View>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("RegisterScreen")}>
                <Text style={styles.registerLinkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.bioAuthContainer}>
              <Image 
                source={require("../../assets/Auth/fingerprint.png")} 
                style={styles.bioAuthIcon}
                resizeMode="contain"
              />
              <Image 
                source={require("../../assets/Auth/face-id.png")} 
                style={styles.bioAuthIcon}
                resizeMode="contain"
              />
              <Text style={styles.bioAuthText}>Use Bio-Authentication?</Text>
            </TouchableOpacity>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By proceeding, you consent to our 
                <Text style={styles.termsLinkText}> Terms and Conditions </Text>
                and
                <Text style={styles.termsLinkText}> Privacy Policy</Text>
              </Text>
            </View>
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
    marginHorizontal: 8,
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
    alignItems: 'left',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 50,
    fontWeight: 'bold',
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  taglineContainer: {
    alignItems: 'left',
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
    justifyContent: 'left',
    alignItems: 'left',
  },
  backgroundLettersText: {
    color: 'rgba(255, 255, 255, 0.1)',
    fontSize: 180,
    fontWeight: 'bold',
    lineHeight: 220,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#333333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    paddingLeft: 4,
    paddingRight: 4,
    alignItems: 'center',
    marginBottom: 4,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingLeft: 20,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  googleIcon: {
    width: 40,
    height: 40,
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
  },
  bioAuthIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
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
  },
  termsLinkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;