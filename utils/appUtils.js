import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/appConstants';

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
    throw error; 
  }
};
