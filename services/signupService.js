import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceInfo, getClientIP, getLocationFromIP, isValidIP } from '../utils/deviceUtils';

class SignupService {
  constructor() {
    this.registrationCache = new Map();
    this.verificationAttempts = new Map();
  }

  generateRegistrationId() {
    return 'reg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
      // First check profiles table for existing email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (profileData) {
        return { exists: true, error: null };
      }

      // If not found in profiles, use RPC function if available
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

  async recordSignupActivity(userId, sessionId, registrationData) {
  try {
    console.log('Recording signup activity as login activity...');
    
    // Get device information in parallel
    const [deviceInfo, ipAddress] = await Promise.all([
      getDeviceInfo(),
      getClientIP()
    ]);
    
    // Get location information
    let locationData = null;
    if (ipAddress && isValidIP(ipAddress)) {
      try {
        locationData = await getLocationFromIP(ipAddress);
      } catch (e) {
        console.warn('Could not get location data during signup:', e);
      }
    }
    
      
      // Enhanced device info for signup
      const enhancedDeviceInfo = {
      ...deviceInfo,
      activity_type: 'signup',
      registration_id: registrationData?.registrationId,
      signup_method: 'email',
      platform: registrationData?.platform || 'mobile',
      app_version: registrationData?.app_version || '1.0.0'
      };
      
      // Record the signup activity using the same RPC as login
      const { data, error } = await supabase.rpc('record_login_activity', {
      p_user_id: userId,
      p_ip_address: ipAddress || 'Unknown',
      p_user_agent: navigator.userAgent,
      p_location: locationData,
      p_session_id: sessionId
    });

      if (error) {
        console.error('Error recording signup activity:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Signup activity recorded successfully');
      return {
        success: true,
        data,
        sessionId,
        ipAddress,
        deviceInfo: enhancedDeviceInfo,
        locationData
      };
    } catch (error) {
      console.error('Unexpected error recording signup activity:', error);
      return { success: false, error: 'Failed to record signup activity' };
    }
  }

  // FIXED: Complete profile creation with all fields from your schema
  async createUserProfile(userId, profileData) {
    if (!userId) {
      console.error('Cannot create profile: userId is required');
      return { success: false, error: 'User ID is required' };
    }

    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log('Profile already exists for user:', userId);
        return { success: true, data: existingProfile };
      }

      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error checking profile existence:', checkError);
        return { success: false, error: checkError.message };
      }

      const now = new Date().toISOString();

      // Create new profile with all required fields from your schema
      const profileInsert = {
        id: userId,
        display_name: profileData.display_name || profileData.full_name?.split(' ')[0] || null,
        full_name: profileData.full_name || null,
        email: profileData.email || null,
        bio: null,
        avatar_url: null,
        location: null,
        total_listening_time: 0,
        subscriptions_count: 0,
        downloads_count: 0,
        notifications_enabled: true,
        auto_download_enabled: false,
        cellular_data_enabled: false,
        profile_visibility: 'public',
        show_listening_activity: true,
        dark_mode_enabled: false,
        two_factor_enabled: false,
        created_at: now,
        updated_at: now,
        pending_email: null,
        email_change_token: null,
        email_change_requested_at: null,
        password_changed_at: null,
        registration_id: profileData.registration_id || null,
        registration_timestamp: profileData.registration_timestamp || now,
        app_version: profileData.app_version || '1.0.0',
        platform: profileData.platform || 'mobile',
        email_verified_at: profileData.email_verified_at || null,
        verification_attempts: 0,
        last_verification_attempt: null
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return { success: false, error: error.message };
      }

      console.log('User profile created successfully for:', userId);
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      return { success: false, error: 'Failed to create profile' };
    }
  }

  // Enhanced registration with proper profile creation order and login activity tracking
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
      const registrationTimestamp = new Date().toISOString();

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
            display_name: fullName.split(' ')[0],
            registration_id: registrationId,
            registration_timestamp: registrationTimestamp,
            app_version: '1.0.0',
            platform: 'mobile'
          },
          emailRedirectTo: 'voicewave://auth/callback'
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        
        let userFriendlyError = 'Failed to create account. Please try again.';
        let fieldErrors = null;

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
      const sessionId = data.session?.access_token || this.generateSessionId();

      const result = {
        success: true,
        error: null,
        errors: null,
        data: {
          user: data.user,
          session: data.session,
          registrationId,
          needsEmailVerification,
          emailSent: needsEmailVerification,
          sessionId
        }
      };

      try {
        console.log('Creating user profile...');
        const profileData = {
          full_name: fullName,
          display_name: fullName.split(' ')[0],
          email: email,
          registration_id: registrationId,
          registration_timestamp: registrationTimestamp,
          app_version: '1.0.0',
          platform: 'mobile',
          email_verified_at: data.session ? new Date().toISOString() : null
        };

        const profileResult = await this.createUserProfile(data.user.id, profileData);

        if (!profileResult.success) {
          console.error('Failed to create profile during signup:', profileResult.error);
          // Return error since profile creation is critical
          return {
            success: false,
            error: 'Account created but profile setup failed. Please contact support.',
            errors: null,
            data: null,
            registrationId
          };
        }

        // NEW: Record signup activity as login activity
        try {
          const signupActivityResult = await this.recordSignupActivity(
            data.user.id, 
            sessionId,
            {
              registrationId,
              platform: 'mobile',
              app_version: '1.0.0'
            }
          );

          if (signupActivityResult.success) {
            console.log('Signup activity recorded successfully');
            result.data.signupActivity = signupActivityResult;
          } else {
            console.warn('Failed to record signup activity:', signupActivityResult.error);
          }
        } catch (activityError) {
          console.warn('Error recording signup activity:', activityError);
        }

        if (data.session && data.user) {
          await this.storeAuthData(data.user, data.session);
          await this.clearTemporaryRegistrationData(registrationId);
        }

        console.log('User registration and profile creation completed successfully');
      } catch (postRegistrationError) {
        console.error('Error in post-registration setup:', postRegistrationError);
        return {
          success: false,
          error: 'Account created but setup failed. Please contact support.',
          errors: null,
          data: null,
          registrationId
        };
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
          emailRedirectTo: 'voicewave://auth/callback'
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
        const isVerified = user.email_confirmed_at !== null;
        
        // Update profile with verification status if verified
        if (isVerified) {
          await supabase
            .from('profiles')
            .update({ 
              email_verified_at: user.email_confirmed_at,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
        
        return { 
          verified: isVerified,
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
    } finally {
      // Clear registration cache
      this.registrationCache.clear();
      this.verificationAttempts.clear();
    }
  }
}

export const signupService = new SignupService();