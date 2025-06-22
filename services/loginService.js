import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LoginService {
  constructor() {
    this.currentSessionId = null;
    this.isInitialized = false;
  }

  // Generate a unique session ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Get device and location information with better error handling
  async getDeviceInfo() {
    try {
      let deviceInfo = {
        ip: 'Unknown',
        userAgent: 'React Native App',
        location: {
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
          latitude: null,
          longitude: null,
          timezone: 'Unknown',
        }
      };

      // Try to get IP address with timeout
      try {
        const ipResponse = await Promise.race([
          fetch('https://api.ipify.org?format=json'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          deviceInfo.ip = ipData.ip || 'Unknown';

          // Try to get location data with timeout
          try {
            const locationResponse = await Promise.race([
              fetch(`https://ipapi.co/${ipData.ip}/json/`),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              if (locationData && !locationData.error) {
                deviceInfo.location = {
                  city: locationData.city || 'Unknown',
                  region: locationData.region || 'Unknown',
                  country: locationData.country_name || 'Unknown',
                  latitude: locationData.latitude || null,
                  longitude: locationData.longitude || null,
                  timezone: locationData.timezone || 'Unknown',
                };
              }
            }
          } catch (locationError) {
            console.warn('Could not fetch location info:', locationError.message);
          }
        }
      } catch (ipError) {
        console.warn('Could not fetch IP info:', ipError.message);
      }

      // Set user agent safely
      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        deviceInfo.userAgent = navigator.userAgent;
      }

      return deviceInfo;
    } catch (error) {
      console.warn('Error in getDeviceInfo:', error);
      return {
        ip: 'Unknown',
        userAgent: 'React Native App',
        location: {
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown',
          latitude: null,
          longitude: null,
          timezone: 'Unknown',
        }
      };
    }
  }

  // Ensure user profile exists before recording login activity
  async ensureUserProfile(userId, userData = {}) {
    if (!userId) {
      console.warn('No userId provided to ensureUserProfile');
      return false;
    }

    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Profile exists, no need to create
        return true;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error checking profile existence:', checkError);
        return false;
      }

      // Profile doesn't exist, create it
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData.full_name || userData.user_metadata?.full_name || null,
          display_name: userData.display_name || userData.user_metadata?.display_name || null,
          email: userData.email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('Error creating user profile:', createError);
        return false;
      }

      console.log('User profile created successfully for:', userId);
      return true;
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      return false;
    }
  }

  // Record login activity with profile creation check
  async recordLoginActivity(userId, userData = {}) {
    if (!userId) {
      console.warn('No userId provided to recordLoginActivity');
      return null;
    }

    try {
      // Ensure user profile exists first
      const profileExists = await this.ensureUserProfile(userId, userData);
      if (!profileExists) {
        console.warn('Could not ensure user profile exists, skipping login activity recording');
        return null;
      }

      const deviceInfo = await this.getDeviceInfo();
      this.currentSessionId = this.generateSessionId();

      // Now record login activity
      const { data, error } = await supabase.rpc('record_login_activity', {
        p_user_id: userId,
        p_ip_address: deviceInfo.ip,
        p_user_agent: deviceInfo.userAgent,
        p_location: deviceInfo.location,
        p_session_id: this.currentSessionId
      });

      if (error) {
        console.error('Error recording login activity:', error);
        // Don't fail authentication if we can't record activity
        return null;
      }

      // Store session ID locally
      try {
        await AsyncStorage.setItem('current_session_id', this.currentSessionId);
      } catch (storageError) {
        console.warn('Could not store session ID:', storageError);
      }
      
      return data;
    } catch (error) {
      console.error('Error in recordLoginActivity:', error);
      return null;
    }
  }

  // Get current authentication token
  async getCurrentToken() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting current token:', error);
      return null;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Validate session with stored token - Fixed version
  async validateSessionWithToken(token) {
    if (!token) {
      console.log('No token provided for validation');
      return false;
    }

    try {
      // Create a temporary client with the token
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('Token validation failed:', error?.message || 'No user found');
        return false;
      }

      // Additional validation: check if session is still active in database
      const sessionId = await this.getCurrentSessionId();
      if (sessionId) {
        const isSessionValid = await this.validateCurrentSession();
        return isSessionValid;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  // Refresh authentication state with stored data
  async refreshAuth(user, token) {
    if (!user || !token) {
      console.warn('Missing user or token in refreshAuth');
      return false;
    }

    try {
      console.log('Refreshing authentication state for user:', user.id);
      
      // Initialize session if needed
      await this.initializeSession();
      
      return true;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      return false;
    }
  }

  // Sign in with email and password - Fixed version
  async signInWithEmail(email, password) {
    if (!email || !password) {
      return { data: null, error: new Error('Email and password are required') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Record login activity (don't fail if this fails)
        try {
          await this.recordLoginActivity(data.user.id, data.user);
        } catch (recordError) {
          console.warn('Could not record login activity:', recordError);
        }
        
        // Store authentication data for persistence
        try {
          await this.storeAuthData(data.user, data.session.access_token);
        } catch (storeError) {
          console.warn('Could not store auth data:', storeError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  }

  // Sign up with email and password - Fixed version
  async signUpWithEmail(email, password, additionalData = {}) {
    if (!email || !password) {
      return { data: null, error: new Error('Email and password are required') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: additionalData
        }
      });

      if (error) throw error;

      if (data.user) {
        // For new signups, record login activity with user data
        try {
          const userDataForProfile = {
            ...data.user,
            ...additionalData,
            email: data.user.email
          };
          await this.recordLoginActivity(data.user.id, userDataForProfile);
        } catch (recordError) {
          console.warn('Could not record login activity:', recordError);
        }
        
        // Store authentication data for persistence
        if (data.session?.access_token) {
          try {
            await this.storeAuthData(data.user, data.session.access_token);
          } catch (storeError) {
            console.warn('Could not store auth data:', storeError);
          }
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  }

  // Store authentication data for persistence
  async storeAuthData(user, token) {
    if (!user || !token) {
      console.warn('Missing user or token in storeAuthData');
      return;
    }

    try {
      await AsyncStorage.multiSet([
        ['user_token', token],
        ['user_data', JSON.stringify(user)],
        ['last_login', new Date().toISOString()]
      ]);
      console.log('Authentication data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error; // Re-throw storage errors as they're critical
    }
  }

  // Clear stored authentication data
  async clearStoredAuthData() {
    try {
      await AsyncStorage.multiRemove([
        'user_token',
        'user_data',
        'last_login',
        'current_session_id'
      ]);
      console.log('Stored authentication data cleared');
    } catch (error) {
      console.error('Error clearing stored auth data:', error);
    }
  }

  // Get stored authentication data
  async getStoredAuthData() {
    try {
      const [token, userData, lastLogin] = await AsyncStorage.multiGet([
        'user_token',
        'user_data',
        'last_login'
      ]);

      if (!token[1] || !userData[1]) {
        return null;
      }

      let parsedUserData;
      try {
        parsedUserData = JSON.parse(userData[1]);
      } catch (parseError) {
        console.error('Error parsing stored user data:', parseError);
        await this.clearStoredAuthData(); // Clear corrupted data
        return null;
      }

      return {
        token: token[1],
        user: parsedUserData,
        lastLogin: lastLogin[1]
      };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return null;
    }
  }

  // Check if stored authentication is still valid
  async isStoredAuthValid() {
    try {
      const storedAuth = await this.getStoredAuthData();
      
      if (!storedAuth) {
        return false;
      }

      // Check if login is still valid (optional: implement token expiry)
      if (storedAuth.lastLogin) {
        try {
          const loginTime = new Date(storedAuth.lastLogin);
          const now = new Date();
          const daysSinceLogin = (now - loginTime) / (1000 * 60 * 60 * 24);
          
          // If more than 30 days, require re-login (adjust as needed)
          if (daysSinceLogin > 30) {
            console.log('Stored auth expired, clearing data');
            await this.clearStoredAuthData();
            return false;
          }
        } catch (dateError) {
          console.warn('Error checking login date:', dateError);
          // Continue with token validation
        }
      }

      // Validate the stored token
      const isTokenValid = await this.validateSessionWithToken(storedAuth.token);
      
      if (!isTokenValid) {
        console.log('Stored token invalid, clearing data');
        await this.clearStoredAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking stored auth validity:', error);
      await this.clearStoredAuthData();
      return false;
    }
  }

  // Sign out and end current session
  async signOut() {
    try {
      // End current session in database (don't fail if this fails)
      if (this.currentSessionId) {
        try {
          await supabase.rpc('end_login_session', {
            p_session_id: this.currentSessionId
          });
        } catch (rpcError) {
          console.warn('Could not end session in database:', rpcError);
        }
      }

      // Clear all stored authentication data
      await this.clearStoredAuthData();
      this.currentSessionId = null;

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Error signing out from Supabase:', error);
        // Don't throw here as we've already cleared local data
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  }

  // Get current session ID
  async getCurrentSessionId() {
    if (!this.currentSessionId) {
      try {
        this.currentSessionId = await AsyncStorage.getItem('current_session_id');
      } catch (error) {
        console.warn('Error getting session ID:', error);
      }
    }
    return this.currentSessionId;
  }

  // Initialize session on app start (for existing users)
  async initializeSession() {
    if (this.isInitialized) {
      return;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.warn('Error getting user in initializeSession:', error);
        return;
      }
      
      if (user) {
        const storedSessionId = await AsyncStorage.getItem('current_session_id');
        
        if (!storedSessionId) {
          // If no stored session ID, create a new one
          await this.recordLoginActivity(user.id, user);
        } else {
          this.currentSessionId = storedSessionId;
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  // Initialize session with stored authentication data
  async initializeSessionWithStoredAuth() {
    try {
      const storedAuth = await this.getStoredAuthData();
      
      if (!storedAuth) {
        return false;
      }

      // Check if stored auth is still valid
      const isValid = await this.isStoredAuthValid();
      
      if (!isValid) {
        return false;
      }

      // Initialize session with stored user data
      const storedSessionId = await AsyncStorage.getItem('current_session_id');
      
      if (!storedSessionId) {
        // Create new session for restored user
        await this.recordLoginActivity(storedAuth.user.id, storedAuth.user);
      } else {
        this.currentSessionId = storedSessionId;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing session with stored auth:', error);
      return false;
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

      if (error) {
        console.warn('Error validating session:', error);
        return false;
      }

      return data?.is_current || false;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  // Set up auth state listener
  setupAuthStateListener(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // Record login activity for automatic sign-ins (like refresh tokens)
          const currentSessionId = await this.getCurrentSessionId();
          if (!currentSessionId) {
            await this.recordLoginActivity(session.user.id, session.user);
          }
          
          // Store authentication data
          if (session.access_token) {
            await this.storeAuthData(session.user, session.access_token);
          }
        } else if (event === 'SIGNED_OUT') {
          // Clean up session data
          await this.clearStoredAuthData();
          this.currentSessionId = null;
          this.isInitialized = false;
        }
        
        if (callback) {
          callback(event, session);
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
        if (callback) {
          callback(event, session);
        }
      }
    });

    return subscription;
  }

  // Additional utility methods for debugging
  async getDebugInfo() {
    if (!__DEV__) return {};
    
    try {
      const [storedAuth, sessionId, currentUser] = await Promise.all([
        this.getStoredAuthData(),
        this.getCurrentSessionId(),
        this.getCurrentUser()
      ]);

      return {
        storedAuth: storedAuth ? { hasToken: !!storedAuth.token, hasUser: !!storedAuth.user } : null,
        sessionId,
        currentUser: currentUser ? { id: currentUser.id, email: currentUser.email } : null,
        isInitialized: this.isInitialized
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Export singleton instance
export const loginService = new LoginService();