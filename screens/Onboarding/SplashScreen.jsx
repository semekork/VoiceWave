import React, { useEffect } from 'react';
import { View, Text, StyleSheet,Image,ImageBackground, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding1');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground source={require('../../assets/Onboarding/background.png')} style={styles.stripedBackground}>
    <SafeAreaView style={styles.container}>
      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
            <Image source={require('../../assets/Logo/Logo.png')} style={styles.logo}/>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Designed & Developed by</Text>
        <Text style={styles.footerText}>Caleb</Text>
      </View>
    </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  stripedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 310,
    height: 210,
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
});

export default SplashScreen;