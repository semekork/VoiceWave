import React from 'react';
import { View, ImageBackground, SafeAreaView, Image, Text } from 'react-native';

/**
 * Loading screen component shown while determining app state
 */
const LoadingScreen = () => {
  return (
    <ImageBackground 
      source={require('../assets/Onboarding/background.png')} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
      }}
    >
      <SafeAreaView style={{ flex: 1, position: 'relative' }}>
        {/* Main content */}
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          {/* Logo */}
          <View style={{ alignItems: 'center' }}>
            <Image 
              source={require('../assets/Logo/Logo.png')} 
              style={{
                width: 310,
                height: 210,
                marginBottom: 20,
              }}
            />
          </View>
        </View>
        
        {/* Footer */}
        <View style={{
          alignItems: 'center',
          paddingBottom: 40,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 16,
            opacity: 0.9,
          }}>
            Designed & Developed by
          </Text>
          <Text style={{
            color: 'white',
            fontSize: 16,
            opacity: 0.9,
          }}>
            Caleb
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoadingScreen;