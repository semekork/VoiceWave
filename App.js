import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationService } from './navigation/navigationHelpers';
import { SCREEN_NAMES } from './navigation/types';

// Navigators
import OnboardingNavigator from './navigation/OnboardingNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';

// Context Providers
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { ProfileImageProvider } from './context/ProfileImageContext';

// React Native Gesture Handler import
import 'react-native-gesture-handler';

const RootStack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState(SCREEN_NAMES.MAIN_STACK); 
  // Initialize navigation service
  useEffect(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }
  }, []);

  // Check authentication and onboarding status
  useEffect(() => {
    const checkAppState = async () => {
      try {
        // You can add logic here to check:
        // - If user has completed onboarding
        // - If user is authenticated
        // - Any other app state checks
        
        // Example logic (uncomment and modify as needed):
        // const hasCompletedOnboarding = await checkOnboardingStatus();
        // const isAuthenticated = await checkAuthStatus();
        
        // if (!hasCompletedOnboarding) {
        //   setInitialRoute(SCREEN_NAMES.ONBOARDING_STACK);
        // } else if (!isAuthenticated) {
        //   setInitialRoute(SCREEN_NAMES.AUTH_STACK);
        // } else {
        //   setInitialRoute(SCREEN_NAMES.MAIN_STACK);
        // }
        
        setIsReady(true);
      } catch (error) {
        console.error('Error checking app state:', error);
        setIsReady(true);
      }
    };

    checkAppState();
  }, []);

  const onNavigationReady = () => {
    setIsReady(true);
  };

  if (!isReady) {
    // You can return a loading screen here
    return null;
  }

  return (
    <AudioPlayerProvider>
      <ProfileImageProvider>
        <NavigationContainer
          ref={navigationRef => {
            NavigationService.setTopLevelNavigator(navigationRef);
          }}
          onReady={onNavigationReady}
        >
          <StatusBar style="light" />
          <RootStack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#1E1E1E' },
              animation: 'fade',
            }}
          >
            {/* Onboarding Flow */}
            <RootStack.Screen
              name={SCREEN_NAMES.ONBOARDING_STACK}
              component={OnboardingNavigator}
              options={{ 
                animationEnabled: false,
                gestureEnabled: false 
              }}
            />

            {/* Authentication Flow */}
            <RootStack.Screen
              name={SCREEN_NAMES.AUTH_STACK}
              component={AuthNavigator}
              options={{ 
                animationEnabled: true,
                animation: 'slide_from_right' 
              }}
            />

            {/* Main Application Flow */}
            <RootStack.Screen
              name={SCREEN_NAMES.MAIN_STACK}
              component={MainNavigator}
              options={{ 
                animationEnabled: false,
                gestureEnabled: false 
              }}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      </ProfileImageProvider>
    </AudioPlayerProvider>
  );
}