import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService } from '../services/loginService';
import { useAuth } from '../hooks/useAuth';
import { STORAGE_KEYS, APP_STATES } from '../constants/appContants';
import { SCREEN_NAMES } from '../navigation/types';

export const useAppState = () => {
  const [appState, setAppState] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null);
  const [error, setError] = useState(null);
  
  const mountedRef = useRef(true);
  const onboardingCacheRef = useRef(null);
  const sessionValidationRef = useRef(new Map());
  
  const { user, loading: authLoading } = useAuth();

  const safeSetState = useCallback((setter, value) => {
    if (!mountedRef.current) return;
    
    if (Platform.OS === 'android') {
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          setter(value);
        }
      });
    } else {
      setter(value);
    }
  }, []);

  const useDebouncedCallback = (callback, delay) => {
    const timeoutRef = useRef();
    
    return useMemo(() => {
      return (...args) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            callback(...args);
          }
        }, delay);
      };
    }, [callback, delay]);
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      if (Platform.OS === 'android') {
        onboardingCacheRef.current = null;
        sessionValidationRef.current.clear();
        
        if (global.gc) {
          setTimeout(() => global.gc(), 100);
        }
      }
    };
  }, []);

  const checkOnboardingStatus = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && onboardingCacheRef.current !== null) {
      return onboardingCacheRef.current;
    }

    try {
      if (Platform.OS === 'android') {
        await new Promise(resolve => InteractionManager.runAfterInteractions(resolve));
      }

      const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      const result = onboardingComplete === 'true';

      onboardingCacheRef.current = result;
      return result;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, []);

  const validateUserSession = useCallback(async (user) => {
    if (!user) return false;
    
    const userId = user.id || user.uid || 'default';
    const cached = sessionValidationRef.current.get(userId);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.isValid;
    }
    
    try {
      if (Platform.OS === 'android') {
        await new Promise(resolve => InteractionManager.runAfterInteractions(resolve));
      }
      
      const isValidSession = await loginService.validateCurrentSession();
      
      if (!isValidSession) {
        await loginService.signOut();
        sessionValidationRef.current.delete(userId);
        return false;
      }
      
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

  const determineAppState = useCallback(async (forceOnboardingCheck = false) => {
    if (!mountedRef.current) return;
    
    try {
      safeSetState(setError, null);

      if (authLoading) {
        return;
      }

      // FIXED: Check onboarding status FIRST, regardless of authentication
      const hasCompletedOnboarding = await checkOnboardingStatus(forceOnboardingCheck);
      if (!mountedRef.current) return;
      
      // If onboarding is not complete, show onboarding regardless of auth status
      if (!hasCompletedOnboarding) {
        safeSetState(setAppState, APP_STATES.ONBOARDING);
        safeSetState(setInitialRoute, SCREEN_NAMES.ONBOARDING_STACK);
        return;
      }

      // Only check authentication AFTER onboarding is confirmed complete
      if (!user) {
        if (mountedRef.current) {
          safeSetState(setAppState, APP_STATES.AUTHENTICATION);
          safeSetState(setInitialRoute, SCREEN_NAMES.AUTH_STACK);
        }
        return;
      }

      // Validate existing user session
      const isValidSession = await validateUserSession(user);
      if (!mountedRef.current) return;
      
      if (!isValidSession) {
        if (mountedRef.current) {
          safeSetState(setAppState, APP_STATES.AUTHENTICATION);
          safeSetState(setInitialRoute, SCREEN_NAMES.AUTH_STACK);
        }
        return;
      }

      
      safeSetState(setAppState, APP_STATES.MAIN_APP);
      safeSetState(setInitialRoute, SCREEN_NAMES.MAIN_STACK);

    } catch (error) {
      console.error('Error determining app state:', error);
      if (mountedRef.current) {
        safeSetState(setError, error);
        safeSetState(setAppState, APP_STATES.ERROR);
        safeSetState(setInitialRoute, SCREEN_NAMES.AUTH_STACK);
      }
    }
  }, [user, authLoading, checkOnboardingStatus, validateUserSession, safeSetState]);

  const debouncedDetermineAppState = useDebouncedCallback(
    determineAppState, 
    Platform.OS === 'android' ? 200 : 0
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      debouncedDetermineAppState();
    } else {
      determineAppState();
    }
  }, [determineAppState, debouncedDetermineAppState]);

  useEffect(() => {
    let isActive = true;
    
    const checkOnboardingCompletion = async () => {
      if (!isActive || !mountedRef.current || appState !== APP_STATES.ONBOARDING) {
        return;
      }
      
      try {
        if (Platform.OS === 'android') {
          await new Promise(resolve => InteractionManager.runAfterInteractions(resolve));
        }
        
        const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
        
        if (!isActive || !mountedRef.current) return;
        
        if (onboardingComplete === 'true' && onboardingCacheRef.current !== true) {
          onboardingCacheRef.current = null;
          
          if (Platform.OS === 'android') {
            setTimeout(() => {
              if (isActive && mountedRef.current) {
                determineAppState(true);
              }
            }, 0);
          } else {
            determineAppState(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding completion:', error);
      }
      
      if (isActive && mountedRef.current && appState === APP_STATES.ONBOARDING) {
        const interval = Platform.OS === 'android' ? 2000 : 1000;
        setTimeout(checkOnboardingCompletion, interval);
      }
    };
    
    if (appState === APP_STATES.ONBOARDING) {
      const startDelay = Platform.OS === 'android' ? 100 : 0;
      setTimeout(checkOnboardingCompletion, startDelay);
    }
    
    return () => {
      isActive = false;
    };
  }, [appState, determineAppState]);

  const refreshAppState = useCallback(() => {
    onboardingCacheRef.current = null;
    sessionValidationRef.current.clear();
    
    if (Platform.OS === 'android') {
      setTimeout(() => {
        if (mountedRef.current) {
          determineAppState(true);
        }
      }, 100);
    } else {
      determineAppState(true);
    }
  }, [determineAppState]);

  const handleOnboardingComplete = useCallback(() => {
    onboardingCacheRef.current = null;
    
    if (Platform.OS === 'android') {
      InteractionManager.runAfterInteractions(() => {
        if (mountedRef.current) {
          determineAppState(true);
        }
      });
    } else {
      determineAppState(true);
    }
  }, [determineAppState]);

  return {
    appState,
    initialRoute,
    error,
    isReady: appState !== null && initialRoute !== null,
    refreshAppState,
    handleOnboardingComplete
  };
};