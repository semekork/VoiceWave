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

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    navigation.navigate("SuccessScreen");
    console.log('Signing up with:', fullName, email, password);
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
            <Text style={styles.titleText}>CREATE ACCOUNT</Text>
          </View>
          
          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>
            Start Your Journey to Smarter Learning 
            </Text>
          </View>

          {/* Background "SIGNIN" Letters */}
          <View style={styles.backgroundLetters}>
            <Text style={styles.backgroundLettersText}>SIG{'\n'}NUP</Text>
          </View>
          
          {/* SignUp Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#8391A1"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
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
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#8391A1"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
            <TouchableOpacity onPress={handleSignUp}>
            <View style={styles.SignpButton}>
            <LinearGradient
                colors={["#1963A7", "#49A1D1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.SignpButton}
              >
              <Text style={styles.SignupButtonText}>Sign Up</Text>
              </LinearGradient>
            </View>
            </TouchableOpacity>
            
            <View style={styles.SignInContainer}>
              <Text style={styles.SignInText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("LoginScreen")}>
                <Text style={styles.SignInLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
            
            
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
    marginTop: 40,
  },
  logo: {
    width: 140,
    height: 70,
  },
  titleContainer: {
    alignItems: 'left',
    marginTop: 5,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold',
    letterSpacing: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  taglineContainer: {
    alignItems: 'left',
    marginTop: 5,
    marginBottom: 4,
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
    marginTop: 40,
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
  SignpButton: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    paddingLeft: 4,
    paddingRight: 4,
    alignItems: 'center',
    marginBottom: 4,
  },
  SignupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  SignInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  SignInText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  SignInLinkText: {
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