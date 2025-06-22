import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService } from '../services/loginService';
import { useAuth } from '../hooks/useAuth';
import { STORAGE_KEYS, APP_STATES } from '../constants/appContants';
import { SCREEN_NAMES } from '../navigation/types';
import { sessionService } from '../services/sessionService';

export const useAppState = () => {
  const [appState, setAppState] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null);
  const [error, setError] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  
  const mountedRef = useRef(true);
  const onboardingCacheRef = useRef(null);
  const sessionValidationRef = useRef(new Map());
  const sessionRestoredRef = useRef(false);
  
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

  // NEW: Attempt to restore saved session
  const attemptSessionRestore = useCallback(async () => {
    if (sessionRestoredRef.current) return false;
    
    try {
      console.log('Attempting to restore saved session...');
      
      // Initialize session service if not already done
      await sessionService.initialize();
      
      // Get the most recently used session
      const savedSessions = await sessionService.getSavedSessions();
      
      if (savedSessions.length === 0) {
        console.log('No saved sessions found');
        return false;
      }
      
      // Sort by last used (most recent first)
      const mostRecentSession = savedSessions.sort((a, b) => 
        (b.lastUsed || b.savedAt) - (a.lastUsed || a.savedAt)
      )[0];
      
      console.log('Found recent session:', mostRecentSession.userEmail);
      
      // Attempt to restore the most recent session
      const restoreResult = await sessionService.switchToSession(mostRecentSession.sessionId);
      
      if (restoreResult.success) {
        console.log('Session restored successfully');
        sessionRestoredRef.current = true;
        return true;
      } else {
        console.log('Failed to restore session:', restoreResult.error);
        // Remove invalid session
        await sessionService.removeSession(mostRecentSession.sessionId);
        return false;
      }
      
    } catch (error) {
      console.error('Error attempting session restore:', error);
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

      // Check onboarding status FIRST
      const hasCompletedOnboarding = await checkOnboardingStatus(forceOnboardingCheck);
      if (!mountedRef.current) return;
      
      // If onboarding is not complete, show onboarding regardless of auth status
      if (!hasCompletedOnboarding) {
        safeSetState(setAppState, APP_STATES.ONBOARDING);
        safeSetState(setInitialRoute, SCREEN_NAMES.ONBOARDING_STACK);
        safeSetState(setIsRestoringSession, false);
        return;
      }

      // NEW: If no user and we haven't tried restoring session yet, try to restore
      if (!user && isRestoringSession && !sessionRestoredRef.current) {
        console.log('No user found, attempting session restore...');
        const sessionRestored = await attemptSessionRestore();
        
        if (!mountedRef.current) return;
        
        safeSetState(setIsRestoringSession, false);
        
        if (sessionRestored) {
          // Wait a bit for the auth hook to pick up the restored session
          setTimeout(() => {
            if (mountedRef.current) {
              determineAppState(false);
            }
          }, 1000);
          return;
        }
      } else {
        safeSetState(setIsRestoringSession, false);
      }

      // If still no user after restore attempt, show auth
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

      // User is valid, proceed to main app
      safeSetState(setAppState, APP_STATES.MAIN_APP);
      safeSetState(setInitialRoute, SCREEN_NAMES.MAIN_STACK);

    } catch (error) {
      console.error('Error determining app state:', error);
      if (mountedRef.current) {
        safeSetState(setError, error);
        safeSetState(setAppState, APP_STATES.ERROR);
        safeSetState(setInitialRoute, SCREEN_NAMES.AUTH_STACK);
        safeSetState(setIsRestoringSession, false);
      }
    }
  }, [user, authLoading, checkOnboardingStatus, validateUserSession, safeSetState, attemptSessionRestore, isRestoringSession]);

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
    sessionRestoredRef.current = false; // Reset session restore flag
    safeSetState(setIsRestoringSession, true);
    
    if (Platform.OS === 'android') {
      setTimeout(() => {
        if (mountedRef.current) {
          determineAppState(true);
        }
      }, 100);
    } else {
      determineAppState(true);
    }
  }, [determineAppState, safeSetState]);

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
    isReady: appState !== null && initialRoute !== null && !isRestoringSession,
    isRestoringSession, 
    refreshAppState,
    handleOnboardingComplete
  };
};