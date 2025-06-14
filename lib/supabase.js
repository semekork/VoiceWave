import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://kbuzvbqxasscjhquvias.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtidXp2YnF4YXNzY2pocXV2aWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDQwMDEsImV4cCI6MjA2NDgyMDAwMX0.uUaxzHSLQD7PMxu80imKnu4__Ybw7M64-zTEk8dF1iA';

// Enhanced Expo SecureStore implementation with error handling
const ExpoSecureStorage = {
  getItem: async (key) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting ${key} from secure storage:`, error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting ${key} in secure storage:`, error);
      throw error;
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
      throw error;
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add debug mode for development
    debug: __DEV__,
  },
  // Add global options
  global: {
    headers: {
      'X-Client-Info': 'expo-app',
    },
  },
});

// Auth state listener for debugging
if (__DEV__) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email || 'No user');
  });
}