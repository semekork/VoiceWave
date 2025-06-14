import React, { useEffect, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigation
import { NavigationService } from './navigationHelpers';
import { SCREEN_NAMES } from './types';

// Navigators
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Hooks
import { useAppState } from '../hooks/useAppState';



//Services
import NotificationService from '../services/NotificationService';

const RootStack = createNativeStackNavigator();

// Main App Component with Enhanced State Management
function AppContent() {
  const navigationRef = React.useRef(null);
  const { appState, initialRoute, error, isReady, refreshAppState } = useAppState();

  // Initialize navigation service
  useEffect(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    };

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

  // Show loading screen while determining app state
  if (!isReady) {
    
  }

  return (
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
  );
}

export default AppContent;