import React, { useEffect, useCallback, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Navigation
import { NavigationService } from './navigationHelpers';
import { SCREEN_NAMES } from './types';

// Navigators
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Hooks
import { useAppState } from '../hooks/useAppState';

// Services
import NotificationService from '../services/NotificationService';

const RootStack = createNativeStackNavigator();

// Loading Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#9C3141" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Main App Component with Enhanced State Management
function AppContent() {
  const navigationRef = useRef(null);
  const { appState, initialRoute, error, isReady, refreshAppState, handleOnboardingComplete } = useAppState();
  const prevAppState = useRef(appState);

  // Initialize navigation service
  useEffect(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }

    NotificationService.initialize();
    return () => {
      NotificationService.cleanup();
    }
  }, []);

  // Handle navigation ready state
  const onNavigationReady = useCallback(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }
  }, []);

  // Handle app state changes and navigation
  useEffect(() => {
    if (navigationRef.current && isReady && appState !== prevAppState.current) {
      // App state changed, reset navigation stack
      const resetAction = {
        index: 0,
        routes: [{ name: initialRoute }],
      };
      
      navigationRef.current.reset(resetAction);
      prevAppState.current = appState;
    }
  }, [appState, initialRoute, isReady]);

  // Show loading screen while determining app state
  if (!isReady) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubText}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator
      ref={navigationRef}
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1E1E1E' },
        animation: 'fade',
      }}
      onReady={onNavigationReady}
    >
      {/* Onboarding Flow */}
      <RootStack.Screen
        name={SCREEN_NAMES.ONBOARDING_STACK}
        options={{ 
          animationEnabled: false,
          gestureEnabled: false 
        }}
      >
        {(props) => (
          <OnboardingNavigator 
            {...props} 
            onOnboardingComplete={handleOnboardingComplete}
          />
        )}
      </RootStack.Screen>

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
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AppContent;