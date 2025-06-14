import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SignupService {
  constructor() {
    this.registrationCache = new Map();
    this.verificationAttempts = new Map();
  }

  generateRegistrationId() {
    return 'reg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  checkPasswordStrength(password) {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    Object.values(checks).forEach(check => {
      if (check) strength += 1;
    });

    return {
      score: strength,
      checks,
      label: this.getStrengthLabel(strength),
      isValid: strength >= 3
    };
  }

  getStrengthLabel(score) {
    switch(score) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Medium';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return 'Unknown';
    }
  }

  validateFullName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
      return { isValid: false, error: 'Full name is required' };
    }

    const trimmed = fullName.trim();
    
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Full name must be at least 2 characters' };
    }

    if (trimmed.length > 100) {
      return { isValid: false, error: 'Full name must be less than 100 characters' };
    }

    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      return { isValid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { isValid: true, cleanName: trimmed };
  }

  validateRegistrationForm(formData) {
    const { fullName, email, password, confirmPassword } = formData;
    const errors = {};
    let isValid = true;

    const nameValidation = this.validateFullName(fullName);
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.error;
      isValid = false;
    }

    if (!email || !email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!this.validateEmail(email.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else {
      const passwordStrength = this.checkPasswordStrength(password);
      if (!passwordStrength.isValid) {
        errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
        isValid = false;
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    return {
      isValid,
      errors,
      cleanData: isValid ? {
        fullName: nameValidation.cleanName,
        email: email.trim().toLowerCase(),
        password
      } : null
    };
  }

  // Enhanced email existence check using Supabase RPC
  async checkEmailExists(email) {
    if (!email) {
      return { exists: false, error: 'Email is required' };
    }

    try {
      // Use a more reliable method to check if email exists
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: email.trim().toLowerCase()
      });

      if (error) {
        console.error('Error checking email existence:', error);
        // Fallback to the original method if RPC fails
        return await this.checkEmailExistsFallback(email);
      }

      return { exists: data || false, error: null };
    } catch (error) {
      console.error('Unexpected error checking email:', error);
      return await this.checkEmailExistsFallback(email);
    }
  }

  // Fallback method for checking email existence
  async checkEmailExistsFallback(email) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: 'dummy_password_' + Math.random()
      });

      if (error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed')) {
          return { exists: true, error: null };
        }
        return { exists: false, error: null };
      }

      return { exists: true, error: null };
    } catch (error) {
      console.error('Fallback email check error:', error);
      return { exists: false, error: 'Unable to verify email availability' };
    }
  }

  async storeTemporaryRegistrationData(registrationId, userData) {
    try {
      this.registrationCache.set(registrationId, {
        ...userData,
        timestamp: Date.now(),
        attempts: 0
      });

      await AsyncStorage.setItem(
        `temp_registration_${registrationId}`,
        JSON.stringify({
          ...userData,
          timestamp: Date.now()
        })
      );

      return true;
    } catch (error) {
      console.error('Error storing temporary registration data:', error);
      return false;
    }
  }

  async getTemporaryRegistrationData(registrationId) {
    try {
      let data = this.registrationCache.get(registrationId);
      
      if (!data) {
        const storedData = await AsyncStorage.getItem(`temp_registration_${registrationId}`);
        if (storedData) {
          data = JSON.parse(storedData);
        }
      }

      if (data) {
        const isExpired = (Date.now() - data.timestamp) > (60 * 60 * 1000);
        if (isExpired) {
          await this.clearTemporaryRegistrationData(registrationId);
          return null;
        }
      }

      return data;
    } catch (error) {
      console.error('Error getting temporary registration data:', error);
      return null;
    }
  }

  async clearTemporaryRegistrationData(registrationId) {
    try {
      this.registrationCache.delete(registrationId);
      await AsyncStorage.removeItem(`temp_registration_${registrationId}`);
    } catch (error) {
      console.error('Error clearing temporary registration data:', error);
    }
  }

  // Enhanced registration with better error handling
  async registerUser(formData) {
    try {
      const validation = this.validateRegistrationForm(formData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
          data: null
        };
      }

      const { fullName, email, password } = validation.cleanData;

      // Check if email already exists
      const emailCheck = await this.checkEmailExists(email);
      if (emailCheck.error) {
        return {
          success: false,
          error: emailCheck.error,
          errors: null,
          data: null
        };
      }

      if (emailCheck.exists) {
        return {
          success: false,
          error: 'An account with this email already exists',
          errors: { email: 'Email already registered' },
          data: null
        };
      }

      const registrationId = this.generateRegistrationId();

      await this.storeTemporaryRegistrationData(registrationId, {
        fullName,
        email,
        registrationId
      });

      // Enhanced signup with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName.split(' ')[0], // Use first name as display name
            registration_id: registrationId,
            registration_timestamp: new Date().toISOString(),
            app_version: '1.0.0', // Add your app version
            platform: 'mobile'
          },
          // Configure email template (if you have custom templates)
          emailRedirectTo: 'your-app://auth/callback'
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        
        let userFriendlyError = 'Failed to create account. Please try again.';
        let fieldErrors = null;

        // Enhanced error handling
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered')) {
          userFriendlyError = 'An account with this email already exists';
          fieldErrors = { email: 'Email already registered' };
        } else if (error.message.includes('Invalid email')) {
          userFriendlyError = 'Please enter a valid email address';
          fieldErrors = { email: 'Invalid email format' };
        } else if (error.message.includes('Password should be at least')) {
          userFriendlyError = 'Password does not meet requirements';
          fieldErrors = { password: 'Password too weak' };
        } else if (error.message.includes('rate limit') || 
                  error.message.includes('too many requests')) {
          userFriendlyError = 'Too many signup attempts. Please try again later.';
        } else if (error.message.includes('Email rate limit exceeded')) {
          userFriendlyError = 'Please wait before requesting another verification email.';
        }

        return {
          success: false,
          error: userFriendlyError,
          errors: fieldErrors,
          data: null,
          registrationId
        };
      }

      if (!data?.user) {
        return {
          success: false,
          error: 'Registration failed. Please try again.',
          errors: null,
          data: null,
          registrationId
        };
      }

      // Check if email confirmation is required
      const needsEmailVerification = !data.session;

      const result = {
        success: true,
        error: null,
        errors: null,
        data: {
          user: data.user,
          session: data.session,
          registrationId,
          needsEmailVerification,
          emailSent: needsEmailVerification
        }
      };

      // If user is immediately signed in
      if (data.session) {
        try {
          // Store auth data
          await this.storeAuthData(data.user, data.session);
          
          // Create/update profile
          await this.createUserProfile(data.user.id, {
            full_name: fullName,
            display_name: fullName.split(' ')[0]
          });
          
          await this.clearTemporaryRegistrationData(registrationId);
        } catch (postRegistrationError) {
          console.warn('Post-registration setup failed:', postRegistrationError);
        }
      }

      return result;
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        errors: null,
        data: null
      };
    }
  }

  // Store authentication data
  async storeAuthData(user, session) {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('session', JSON.stringify(session));
      await AsyncStorage.setItem('lastLogin', new Date().toISOString());
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }

  // Create user profile
  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error creating user profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      return { success: false, error: 'Failed to create profile' };
    }
  }

  // Enhanced email verification resend
  async resendEmailVerification(email) {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: 'your-app://auth/callback'
        }
      });

      if (error) {
        console.error('Error resending verification email:', error);
        
        let userFriendlyError = 'Failed to resend verification email';
        if (error.message.includes('rate limit') || 
            error.message.includes('too many requests')) {
          userFriendlyError = 'Please wait before requesting another verification email';
        } else if (error.message.includes('not found')) {
          userFriendlyError = 'No pending verification found for this email';
        }

        return { success: false, error: userFriendlyError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error resending verification:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }

  // Check verification status
  async checkVerificationStatus(email) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { verified: false, error: error.message };
      }

      if (user && user.email === email.trim().toLowerCase()) {
        return { 
          verified: user.email_confirmed_at !== null,
          user: user,
          error: null 
        };
      }

      return { verified: false, error: 'User not found' };
    } catch (error) {
      console.error('Error checking verification status:', error);
      return { verified: false, error: 'Unable to check verification status' };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Unexpected error getting current user:', error);
      return null;
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['user', 'session', 'lastLogin']);
      
      return { success: true };
    } catch (error) {
      console.error('Unexpected error signing out:', error);
      return { success: false, error: 'Failed to sign out' };
    }
  }
}

export const signupService = new SignupService();

// Enhanced React hook
import { useState, useCallback } from 'react';

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const signUp = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const result = await signupService.registerUser(formData);
      
      if (!result.success) {
        setError(result.error);
        if (result.errors) {
          setErrors(result.errors);
        }
      }

      return result;
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signupService.resendEmailVerification(email);
      
      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = 'Failed to resend verification email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPasswordStrength = useCallback((password) => {
    return signupService.checkPasswordStrength(password);
  }, []);

  const validateForm = useCallback((formData) => {
    return signupService.validateRegistrationForm(formData);
  }, []);

  const getCurrentUser = useCallback(async () => {
    return await signupService.getCurrentUser();
  }, []);

  const signOut = useCallback(async () => {
    return await signupService.signOut();
  }, []);

  return {
    loading,
    error,
    errors,
    signUp,
    resendVerification,
    checkPasswordStrength,
    validateForm,
    getCurrentUser,
    signOut,
    signupService
  };
};