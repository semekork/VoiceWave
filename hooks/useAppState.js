import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication
import { useAuth, loginService } from '../services/loginService';

// Constants
import { STORAGE_KEYS, APP_STATES } from '../constants/appContants';
import { SCREEN_NAMES } from '../navigation/types';

// Custom hook for app state management
export const useAppState = () => {
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