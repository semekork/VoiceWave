import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService } from '../services/loginService';
import { STORAGE_KEYS } from '../constants/appConstants';

// Enhanced app state reset with selective clearing
export const resetAppState = async (options = {}) => {
  const {
    clearOnboarding = true,
    clearSession = true,
    clearUserData = false
  } = options;
  
  try {
    const keysToRemove = [];
    
    if (clearOnboarding) {
      keysToRemove.push(STORAGE_KEYS.ONBOARDING_COMPLETE);
    }
    
    if (clearSession) {
      keysToRemove.push(STORAGE_KEYS.CURRENT_SESSION_ID);
    }
    
    if (clearUserData) {
      // Add other user-specific keys as needed
      keysToRemove.push('user_preferences', 'cached_data');
    }
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
    
    if (clearSession) {
      await loginService.signOut();
    }
    
    console.log('App state reset successfully');
  } catch (error) {
    console.error('Error resetting app state:', error);
    throw error; // Re-throw to allow caller to handle
  }
};

// Debug utility to check current app state (development only)
export const debugAppState = async () => {
  if (!__DEV__) return;
  
  try {
    const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION_ID);
    
    console.log('=== DEBUG APP STATE ===');
    console.log('Onboarding Complete:', onboardingComplete);
    console.log('Session ID:', sessionId);
    console.log('Auth User:', await loginService.getCurrentUser());
    console.log('=====================');
  } catch (error) {
    console.error('Error debugging app state:', error);
  }
};