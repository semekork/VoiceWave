import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Authentication
import { useAuth, loginService } from '../services/loginService';

// Constants
import { STORAGE_KEYS, APP_STATES } from '../constants/appContants';
import { SCREEN_NAMES } from '../navigation/types';

// Custom hook for app state management
export const useAppState = () => {
  const [appState, setAppState] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null);
  const [error, setError] = useState(null);
  
  // Use refs to track async operations and prevent state updates on unmounted components
  const mountedRef = useRef(true);
  const onboardingCacheRef = useRef(null);
  const sessionValidationRef = useRef(new Map());
  
  const { user, loading: authLoading } = useAuth();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoized function to check onboarding status with caching
  const checkOnboardingStatus = useCallback(async () => {
    // Return cached result if available
    if (onboardingCacheRef.current !== null) {
      return onboardingCacheRef.current;
    }

    try {
      const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      const result = onboardingComplete === 'true';
      
      // Cache the result
      onboardingCacheRef.current = result;
      return result;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, []);

  // Memoized function to validate user session with caching
  const validateUserSession = useCallback(async (user) => {
    if (!user) return false;
    
    // Use user ID as cache key
    const userId = user.id || user.uid || 'default';
    const cached = sessionValidationRef.current.get(userId);
    
    // Return cached result if still valid (cache for 5 minutes)
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.isValid;
    }
    
    try {
      const isValidSession = await loginService.validateCurrentSession();
      
      if (!isValidSession) {
        await loginService.signOut();
        sessionValidationRef.current.delete(userId);
        return false;
      }
      
      // Cache the validation result
      sessionValidationRef.current.set(userId, {
        isValid: true,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      sessionValidationRef.current.delete(userId);
      await loginService.signOut();
      return false;
    }
  }, []);

  // Main app state determination logic
  const determineAppState = useCallback(async () => {
    // Early return if component is unmounted
    if (!mountedRef.current) return;
    
    try {
      setError(null);

      // Wait for auth loading to complete
      if (authLoading) {
        return;
      }

      // Check authentication status first (faster check)
      if (!user) {
        if (mountedRef.current) {
          setAppState(APP_STATES.AUTHENTICATION);
          setInitialRoute(SCREEN_NAMES.AUTH_STACK);
        }
        return;
      }

      // Validate existing session before checking onboarding
      const isValidSession = await validateUserSession(user);
      
      if (!isValidSession) {
        if (mountedRef.current) {
          setAppState(APP_STATES.AUTHENTICATION);
          setInitialRoute(SCREEN_NAMES.AUTH_STACK);
        }
        return;
      }

      // Check onboarding status only if user is authenticated
      const hasCompletedOnboarding = await checkOnboardingStatus();
      
      if (!mountedRef.current) return;
      
      if (!hasCompletedOnboarding) {
        setAppState(APP_STATES.ONBOARDING);
        setInitialRoute(SCREEN_NAMES.ONBOARDING_STACK);
        return;
      }

      // User is authenticated and has completed onboarding
      setAppState(APP_STATES.MAIN_APP);
      setInitialRoute(SCREEN_NAMES.MAIN_STACK);

    } catch (error) {
      console.error('Error determining app state:', error);
      
      if (mountedRef.current) {
        setError(error);
        setAppState(APP_STATES.ERROR);
        // Fallback to auth screen
        setInitialRoute(SCREEN_NAMES.AUTH_STACK);
      }
    }
  }, [user, authLoading, checkOnboardingStatus, validateUserSession]);

  // Effect to run app state determination
  useEffect(() => {
    determineAppState();
  }, [determineAppState]);

  // Optimized refresh function that clears caches
  const refreshAppState = useCallback(() => {
    // Clear caches on manual refresh
    onboardingCacheRef.current = null;
    sessionValidationRef.current.clear();
    determineAppState();
  }, [determineAppState]);

  return {
    appState,
    initialRoute,
    error,
    isReady: appState !== null && initialRoute !== null,
    refreshAppState
  };
};