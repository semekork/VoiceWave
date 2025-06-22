import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loginService } from '../services/loginService';
import { signupService } from '../services/signupService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to get current session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Error getting initial session:', sessionError);
        }
        
        if (session?.user && isMounted) {
          // Active session found
          setSession(session);
          setUser(session.user);
          await loginService.initializeSession();
        } else {
          // No active session, check for stored authentication
          const storedAuth = await loginService.getStoredAuthData();
          
          if (storedAuth && await loginService.isStoredAuthValid() && isMounted) {
            console.log('Restoring authentication from stored data');
            
            // Try to restore session with stored data
            const restored = await loginService.initializeSessionWithStoredAuth();
            
            if (restored && isMounted) {
              setUser(storedAuth.user);
              // Note: session might not be fully restored, but user data is available
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setError(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    const subscription = loginService.setupAuthStateListener((event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setError(null);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Enhanced refresh auth function
  const refreshAuth = async (userData, token) => {
    try {
      setLoading(true);
      setError(null);
      
      // Restore authentication state
      const success = await loginService.refreshAuth(userData, token);
      
      if (success) {
        setUser(userData);
        console.log('Authentication refreshed successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginService.signInWithEmail(email, password);
      if (result.error) {
        setError(result.error);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign up function using signupService
  const signUp = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signupService.registerUser(formData);
      
      if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        errors: null,
        data: null
      };
    } finally {
      setLoading(false);
    }
  };

  // Resend email verification using signupService
  const resendEmailVerification = async (email) => {
    try {
      return await signupService.resendEmailVerification(email);
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  };

  // Check verification status using signupService
  const checkVerificationStatus = async (email) => {
    try {
      return await signupService.checkVerificationStatus(email);
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { verified: false, error: 'Unable to check verification status' };
    }
  };

  // Check if email exists using signupService
  const checkEmailExists = async (email) => {
    try {
      return await signupService.checkEmailExists(email);
    } catch (error) {
      console.error('Error checking email existence:', error);
      return { exists: false, error: 'Unable to verify email availability' };
    }
  };

  // Get current user using signupService
  const getCurrentUser = async () => {
    try {
      return await signupService.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginService.signOut();
      if (result.error) {
        setError(result.error);
      }
      setUser(null);
      setSession(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Validation functions from signupService
  const validateEmail = (email) => {
    return signupService.validateEmail(email);
  };

  const validateFullName = (fullName) => {
    return signupService.validateFullName(fullName);
  };

  const checkPasswordStrength = (password) => {
    return signupService.checkPasswordStrength(password);
  };

  const validateSignupForm = (formData) => {
    return signupService.validateRegistrationForm(formData);
  };

  // Temporary registration data functions
  const storeTemporaryRegistrationData = async (registrationId, userData) => {
    try {
      return await signupService.storeTemporaryRegistrationData(registrationId, userData);
    } catch (error) {
      console.error('Error storing temporary registration data:', error);
      return false;
    }
  };

  const getTemporaryRegistrationData = async (registrationId) => {
    try {
      return await signupService.getTemporaryRegistrationData(registrationId);
    } catch (error) {
      console.error('Error getting temporary registration data:', error);
      return null;
    }
  };

  const clearTemporaryRegistrationData = async (registrationId) => {
    try {
      return await signupService.clearTemporaryRegistrationData(registrationId);
    } catch (error) {
      console.error('Error clearing temporary registration data:', error);
    }
  };

  return {
    // State
    user,
    session,
    loading,
    error,
    
    // Authentication functions
    signIn,
    signUp,
    signOut,
    refreshAuth,
    
    // Signup utilities from signupService
    resendEmailVerification,
    checkVerificationStatus,
    checkEmailExists,
    getCurrentUser,
    validateEmail,
    validateFullName,
    checkPasswordStrength,
    validateSignupForm,
    
    storeTemporaryRegistrationData,
    getTemporaryRegistrationData,
    clearTemporaryRegistrationData,
    
    
    loginService,
    signupService
  };
};