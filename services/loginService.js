// services/loginService.js
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LoginService {
  constructor() {
    this.currentSessionId = null;
  }

  // Generate a unique session ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Get device and location information
  async getDeviceInfo() {
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      // Get location data
      const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
      const locationData = await locationResponse.json();

      return {
        ip: ipData.ip,
        userAgent: navigator.userAgent || 'React Native App',
        location: {
          city: locationData.city,
          region: locationData.region,
          country: locationData.country_name,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timezone: locationData.timezone,
        }
      };
    } catch (error) {
      console.warn('Could not fetch device info:', error);
      return {
        ip: 'Unknown',
        userAgent: navigator.userAgent || 'React Native App',
        location: {
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
        }
      };
    }
  }

  // Record login activity
  async recordLoginActivity(userId) {
    try {
      const deviceInfo = await this.getDeviceInfo();
      this.currentSessionId = this.generateSessionId();

      const { data, error } = await supabase.rpc('record_login_activity', {
        p_user_id: userId,
        p_ip_address: deviceInfo.ip,
        p_user_agent: deviceInfo.userAgent,
        p_location: deviceInfo.location,
        p_session_id: this.currentSessionId
      });

      if (error) {
        console.error('Error recording login activity:', error);
        return null;
      }

      // Store session ID locally
      await AsyncStorage.setItem('current_session_id', this.currentSessionId);
      
      return data;
    } catch (error) {
      console.error('Error in recordLoginActivity:', error);
      return null;
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Record login activity
        await this.recordLoginActivity(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password, additionalData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData
        }
      });

      if (error) throw error;

      if (data.user) {
        // Record login activity for new user
        await this.recordLoginActivity(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  }

  // Sign out and end current session
  async signOut() {
    try {
      // End current session in database
      if (this.currentSessionId) {
        await supabase.rpc('end_login_session', {
          p_session_id: this.currentSessionId
        });
      }

      // Clear local session ID
      await AsyncStorage.removeItem('current_session_id');
      this.currentSessionId = null;

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }

  // Get current session ID
  async getCurrentSessionId() {
    if (!this.currentSessionId) {
      this.currentSessionId = await AsyncStorage.getItem('current_session_id');
    }
    return this.currentSessionId;
  }

  // Initialize session on app start (for existing users)
  async initializeSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const storedSessionId = await AsyncStorage.getItem('current_session_id');
        
        if (!storedSessionId) {
          // If no stored session ID, create a new one
          await this.recordLoginActivity(user.id);
        } else {
          this.currentSessionId = storedSessionId;
        }
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  // Check if current session is still valid
  async validateCurrentSession() {
    try {
      const sessionId = await this.getCurrentSessionId();
      if (!sessionId) return false;

      const { data, error } = await supabase
        .from('login_activities')
        .select('is_current')
        .eq('session_id', sessionId)
        .single();

      if (error || !data) return false;

      return data.is_current;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  // End specific session
  async endSession(sessionId) {
    try {
      const { error } = await supabase.rpc('end_login_session', {
        p_session_id: sessionId
      });

      if (error) throw error;

      // If ending current session, clear local storage
      if (sessionId === this.currentSessionId) {
        await AsyncStorage.removeItem('current_session_id');
        this.currentSessionId = null;
      }

      return { error: null };
    } catch (error) {
      console.error('Error ending session:', error);
      return { error };
    }
  }

  // End all other sessions except current
  async endAllOtherSessions() {
    try {
      const { data: activities, error } = await supabase
        .from('login_activities')
        .select('session_id')
        .eq('is_current', true)
        .neq('session_id', this.currentSessionId);

      if (error) throw error;

      if (activities && activities.length > 0) {
        const promises = activities.map(activity => 
          supabase.rpc('end_login_session', { p_session_id: activity.session_id })
        );
        
        await Promise.all(promises);
      }

      return { error: null };
    } catch (error) {
      console.error('Error ending all other sessions:', error);
      return { error };
    }
  }

  // Get login activities for current user
  async getLoginActivities(limit = 20) {
    try {
      const { data, error } = await supabase.rpc('get_user_login_activities', {
        limit_count: limit
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching login activities:', error);
      return { data: null, error };
    }
  }

  // Report suspicious activity
  async reportSuspiciousActivity(activityId, reason = 'User reported as suspicious') {
    try {
      // You might want to create a separate table for reported activities
      // For now, we'll just log it
      console.log('Suspicious activity reported:', { activityId, reason });
      
      // Here you could send this to your backend for investigation
      // or store it in a separate table
      
      return { error: null };
    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
      return { error };
    }
  }

  // Set up auth state listener
  setupAuthStateListener(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Record login activity for automatic sign-ins (like refresh tokens)
        const currentSessionId = await this.getCurrentSessionId();
        if (!currentSessionId) {
          await this.recordLoginActivity(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clean up session data
        await AsyncStorage.removeItem('current_session_id');
        this.currentSessionId = null;
      }
      
      if (callback) {
        callback(event, session);
      }
    });
  }
}

// Export singleton instance
export const loginService = new LoginService();

// Hook for easy access in components
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        await loginService.initializeSession();
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = loginService.setupAuthStateListener((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const result = await loginService.signInWithEmail(email, password);
    setLoading(false);
    return result;
  };

  const signUp = async (email, password, additionalData) => {
    setLoading(true);
    const result = await loginService.signUpWithEmail(email, password, additionalData);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await loginService.signOut();
    setLoading(false);
    return result;
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    loginService
  };
};