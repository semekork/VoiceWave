// Enhanced version of your App.js with improved state management

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ImageBackground, SafeAreaView, Image, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation
import { NavigationService } from './navigation/navigationHelpers';
import { SCREEN_NAMES } from './navigation/types';

// Navigators
import OnboardingNavigator from './navigation/OnboardingNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';

// Context Providers
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { ProfileImageProvider } from './context/ProfileImageContext';

// Authentication
import { useAuth, loginService } from './services/loginService';

// React Native Gesture Handler import
import 'react-native-gesture-handler';

const RootStack = createNativeStackNavigator();

// Constants for better maintainability
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CURRENT_SESSION_ID: 'current_session_id',
};

const APP_STATES = {
  LOADING: 'LOADING',
  ONBOARDING: 'ONBOARDING',
  AUTHENTICATION: 'AUTHENTICATION',
  MAIN_APP: 'MAIN_APP',
  ERROR: 'ERROR'
};

// Custom hook for app state management
const useAppState = () => {
  const [appState, setAppState] = useState(APP_STATES.LOADING);
  const [initialRoute, setInitialRoute] = useState(null);
  const [error, setError] = useState(null);
  
  const { user, loading: authLoading } = useAuth();

  // Memoized function to check onboarding status
  const checkOnboardingStatus = useCallback(async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return onboardingComplete === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, []);

  // Memoized function to validate user session
  const validateUserSession = useCallback(async (user) => {
    if (!user) return false;
    
    try {
      const isValidSession = await loginService.validateCurrentSession();
      if (!isValidSession) {
        await loginService.signOut();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      await loginService.signOut();
      return false;
    }
  }, []);

  // Main app state determination logic
  const determineAppState = useCallback(async () => {
    try {
      setAppState(APP_STATES.LOADING);
      setError(null);

      // Wait for auth loading to complete
      if (authLoading) {
        return;
      }

      // Check onboarding status
      const hasCompletedOnboarding = await checkOnboardingStatus();
      
      if (!hasCompletedOnboarding) {
        setAppState(APP_STATES.ONBOARDING);
        setInitialRoute(SCREEN_NAMES.ONBOARDING_STACK);
        return;
      }

      // Check authentication status
      if (!user) {
        setAppState(APP_STATES.AUTHENTICATION);
        setInitialRoute(SCREEN_NAMES.AUTH_STACK);
        return;
      }

      // Validate existing session
      const isValidSession = await validateUserSession(user);
      
      if (isValidSession) {
        setAppState(APP_STATES.MAIN_APP);
        setInitialRoute(SCREEN_NAMES.MAIN_STACK);
      } else {
        setAppState(APP_STATES.AUTHENTICATION);
        setInitialRoute(SCREEN_NAMES.AUTH_STACK);
      }

    } catch (error) {
      console.error('Error determining app state:', error);
      setError(error);
      setAppState(APP_STATES.ERROR);
      // Fallback to auth screen
      setInitialRoute(SCREEN_NAMES.AUTH_STACK);
    }
  }, [user, authLoading, checkOnboardingStatus, validateUserSession]);

  // Effect to run app state determination
  useEffect(() => {
    determineAppState();
  }, [determineAppState]);

  return {
    appState,
    initialRoute,
    error,
    isReady: appState !== APP_STATES.LOADING && initialRoute !== null,
    refreshAppState: determineAppState
  };
};

// Main App Component with Enhanced State Management
function AppContent() {
  const navigationRef = React.useRef(null);
  const { appState, initialRoute, error, isReady, refreshAppState } = useAppState();

  // Initialize navigation service
  useEffect(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }
  }, []);

  // Handle navigation ready state
  const onNavigationReady = useCallback(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }
  }, []);

  // Show loading screen while determining app state
  if (!isReady) {
    return (
      <ImageBackground source={require('./assets/Onboarding/background.png')} style={{position: 'absolute',top: 0,left: 0,right: 0,bottom: 0,zIndex: -1,}}>
          <SafeAreaView style={{flex: 1, position: 'relative'}}>
            {/* Main content */}
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              {/* Logo */}
              <View style={{alignItems: 'center'}}>
                  <Image source={require('./assets/Logo/Logo.png')} style={{width: 310,height: 210,marginBottom: 20,}}/>
              </View>
            </View>
            
            {/* Footer */}
            <View style={{alignItems: 'center',paddingBottom: 40,}}>
              <Text style={{color: 'white',fontSize: 16,opacity: 0.9,}}>Designed & Developed by</Text>
              <Text style={{color: 'white',fontSize: 16,opacity: 0.9,}}>Caleb</Text>
            </View>
          </SafeAreaView>
          </ImageBackground>
      
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
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
  );
}

// Root App Component
export default function App() {
  return (
    <AudioPlayerProvider>
      <ProfileImageProvider>
        <AppContent />
      </ProfileImageProvider>
    </AudioPlayerProvider>
  );
}

// Enhanced utility functions

// Function to handle navigation after authentication with retry logic
export const handleAuthNavigation = async (navigationRef, user, maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      if (user) {
        // Initialize session for authenticated user
        await loginService.initializeSession();
        // Navigate to main app
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.MAIN_STACK }],
        });
      } else {
        // Navigate to auth screen
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
        });
      }
      
      // Success - break out of retry loop
      break;
      
    } catch (error) {
      attempts++;
      console.error(`Error handling auth navigation (attempt ${attempts}):`, error);
      
      if (attempts >= maxRetries) {
        // Final fallback to auth screen
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
        });
      } else {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
};

// Function to handle onboarding completion with validation
export const handleOnboardingComplete = async (navigationRef) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    
    // Verify the storage was successful
    const verification = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    
    if (verification === 'true') {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
      });
    } else {
      throw new Error('Failed to save onboarding completion status');
    }
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // Still navigate but log the error for debugging
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
    });
  }
};

// Enhanced app state reset with selective clearing
export const resetAppState = async (options = {}) => {
  const {
    clearOnboarding = true,
    clearSession = true,
    clearUserData = false
  } = options;
  
  try {
    const keysToRemove = [];
    
    if (clearOnboarding) {
      keysToRemove.push(STORAGE_KEYS.ONBOARDING_COMPLETE);
    }
    
    if (clearSession) {
      keysToRemove.push(STORAGE_KEYS.CURRENT_SESSION_ID);
    }
    
    if (clearUserData) {
      // Add other user-specific keys as needed
      keysToRemove.push('user_preferences', 'cached_data');
    }
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
    
    if (clearSession) {
      await loginService.signOut();
    }
    
    console.log('App state reset successfully');
  } catch (error) {
    console.error('Error resetting app state:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

// Debug utility to check current app state (development only)
export const debugAppState = async () => {
  if (!__DEV__) return;
  
  try {
    const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION_ID);
    
    console.log('=== DEBUG APP STATE ===');
    console.log('Onboarding Complete:', onboardingComplete);
    console.log('Session ID:', sessionId);
    console.log('Auth User:', await loginService.getCurrentUser());
    console.log('=====================');
  } catch (error) {
    console.error('Error debugging app state:', error);
  }
};