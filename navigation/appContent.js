import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Navigation
import { NavigationService } from '../navigation/navigationHelpers';
import { SCREEN_NAMES } from '../navigation/types';

// Navigators
import OnboardingNavigator from '../navigation/OnboardingNavigator';
import AuthNavigator from '../navigation/AuthNavigator';
import MainNavigator from '../navigation/MainNavigator';
import { useAppState } from '../hooks/useAppState';

// Screens
import OfflineScreen from '../components/OfflineScreen';

// Services
import NotificationService from '../services/NotificationService';

const RootStack = createNativeStackNavigator();

// Enhanced Loading Component with restoration message
const LoadingScreen = ({ isRestoringSession }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#9C3141" />
    <Text style={styles.loadingText}>
      {isRestoringSession ? 'Restoring your session...' : 'Loading...'}
    </Text>
  </View>
);

// Main App Component with Enhanced State Management
function AppContent() {
  const navigationRef = useRef(null);
  const { 
    appState, 
    initialRoute, 
    error, 
    isReady, 
    isRestoringSession, 
    refreshAppState, 
    handleOnboardingComplete 
  } = useAppState();
  const prevAppState = useRef(appState);
  
  // Network connectivity state
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [showOfflineScreen, setShowOfflineScreen] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  // Initialize navigation service and network monitoring
  useEffect(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }

    NotificationService.initialize();

    // Set up network connectivity monitoring
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = isConnected && isInternetReachable;
      const isNowConnected = state.isConnected && state.isInternetReachable;
      
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      
      // Show offline screen if connection is lost and not in offline mode
      if (wasConnected && !isNowConnected && !offlineMode) {
        setShowOfflineScreen(true);
      }
      
      // Hide offline screen if connection is restored
      if (!wasConnected && isNowConnected) {
        setShowOfflineScreen(false);
        setOfflineMode(false);
        // Refresh app state when connection is restored (might help with session restoration)
        refreshAppState?.();
      }
    });

    return () => {
      NotificationService.cleanup();
      unsubscribe();
    };
  }, [isConnected, isInternetReachable, offlineMode, refreshAppState]);

  // Handle navigation ready state
  const onNavigationReady = useCallback(() => {
    if (navigationRef.current) {
      NavigationService.setTopLevelNavigator(navigationRef.current);
    }
  }, []);

  // Handle app state changes and navigation
  useEffect(() => {
    if (navigationRef.current && isReady && appState !== prevAppState.current && !showOfflineScreen) {
      // App state changed, reset navigation stack
      const resetAction = {
        index: 0,
        routes: [{ name: initialRoute }],
      };
      
      navigationRef.current.reset(resetAction);
      prevAppState.current = appState;
    }
  }, [appState, initialRoute, isReady, showOfflineScreen]);

  // Handle retry connection
  const handleRetryConnection = useCallback(async () => {
    try {
      const netInfo = await NetInfo.fetch();
      
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        setShowOfflineScreen(false);
        setOfflineMode(false);
        // Refresh app state when connection is restored
        refreshAppState?.();
      }
    } catch (error) {
      console.error('Error checking network connection:', error);
    }
  }, [refreshAppState]);

  // Handle continue in offline mode
  const handleGoOffline = useCallback(() => {
    setOfflineMode(true);
    setShowOfflineScreen(false);
  }, []);

  // Show loading screen while determining app state or restoring session
  if (!isReady || isRestoringSession) {
    return <LoadingScreen isRestoringSession={isRestoringSession} />;
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorSubText}>Please restart the app</Text>
        <Text style={styles.errorDetails}>{error.message || 'Unknown error'}</Text>
      </View>
    );
  }

  // Show offline screen when no connection and not in offline mode
  if (showOfflineScreen) {
    return (
      <OfflineScreen
        onRetry={handleRetryConnection}
        onGoOffline={handleGoOffline}
      />
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
            isOfflineMode={offlineMode}
            isConnected={isConnected && isInternetReachable}
          />
        )}
      </RootStack.Screen>

      {/* Authentication Flow */}
      <RootStack.Screen
        name={SCREEN_NAMES.AUTH_STACK}
        options={{ 
          animationEnabled: true,
          animation: 'slide_from_right' 
        }}
      >
        {(props) => (
          <AuthNavigator 
            {...props}
            isOfflineMode={offlineMode}
            isConnected={isConnected && isInternetReachable}
          />
        )}
      </RootStack.Screen>

      {/* Main Application Flow */}
      <RootStack.Screen
        name={SCREEN_NAMES.MAIN_STACK}
        options={{ 
          animationEnabled: false,
          gestureEnabled: false 
        }}
      >
        {(props) => (
          <MainNavigator 
            {...props}
            isOfflineMode={offlineMode}
            isConnected={isConnected && isInternetReachable}
          />
        )}
      </RootStack.Screen>
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
    color: '#CCCCCC',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
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
  errorDetails: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AppContent;