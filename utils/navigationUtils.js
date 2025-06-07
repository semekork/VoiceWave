import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginService } from '../services/loginService';
import { STORAGE_KEYS } from '../constants/appConstants';
import { SCREEN_NAMES } from '../navigation/types';

// Function to handle navigation after authentication with retry logic
export const handleAuthNavigation = async (navigationRef, user, maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      if (user) {
        // Initialize session for authenticated user
        await loginService.initializeSession();
        // Navigate to main app
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.MAIN_STACK }],
        });
      } else {
        // Navigate to auth screen
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
        });
      }
      
      // Success - break out of retry loop
      break;
      
    } catch (error) {
      attempts++;
      console.error(`Error handling auth navigation (attempt ${attempts}):`, error);
      
      if (attempts >= maxRetries) {
        // Final fallback to auth screen
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
        });
      } else {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
};

// Function to handle onboarding completion with validation
export const handleOnboardingComplete = async (navigationRef) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    
    // Verify the storage was successful
    const verification = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    
    if (verification === 'true') {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
      });
    } else {
      throw new Error('Failed to save onboarding completion status');
    }
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // Still navigate but log the error for debugging
    navigationRef.current?.reset({
      index: 0,
      routes: [{ name: SCREEN_NAMES.AUTH_STACK }],
    });
  }
};