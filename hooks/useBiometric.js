import { useState, useEffect } from 'react';
import BiometricAuthService from '../services/BiometricAuthService';

/**
 * Custom hook for biometric authentication
 * Provides state management and methods for biometric authentication
 */
export const useBiometric = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize biometric authentication
   */
  const initialize = async () => {
    try {
      setIsLoading(true);
      const result = await BiometricAuthService.initialize();
      
      setIsSupported(result.isSupported);
      setBiometricType(result.biometricType);
      setIsEnabled(result.isEnabled);
      setIsInitialized(true);
      
      return result;
    } catch (error) {
      console.error('Error initializing biometric authentication:', error);
      return {
        isSupported: false,
        biometricType: null,
        isEnabled: false,
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Authenticate using biometric authentication
   * @param {function} signInCallback - Function to handle sign in with credentials
   */
  const authenticate = async (signInCallback) => {
    setIsLoading(true);
    try {
      const result = await BiometricAuthService.authenticate(signInCallback);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save credentials for biometric authentication
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const saveCredentials = async (email, password) => {
    const result = await BiometricAuthService.saveCredentials(email, password);
    if (result.success) {
      setIsEnabled(true);
    }
    return result;
  };

  /**
   * Remove saved biometric credentials
   */
  const removeCredentials = async () => {
    const result = await BiometricAuthService.removeCredentials();
    if (result.success) {
      setIsEnabled(false);
    }
    return result;
  };

  /**
   * Refresh biometric credentials status
   */
  const refreshStatus = async () => {
    const isCredentialsEnabled = await BiometricAuthService.checkBiometricCredentials();
    setIsEnabled(isCredentialsEnabled);
    return isCredentialsEnabled;
  };

  /**
   * Prompt user to enable biometric authentication
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const promptToEnable = (email, password) => {
    BiometricAuthService.promptToEnable(email, password);
  };

  /**
   * Get biometric icon for UI
   */
  const getBiometricIcon = () => {
    return BiometricAuthService.getBiometricIcon();
  };

  /**
   * Get display name for the biometric type
   */
  const getBiometricDisplayName = () => {
    return BiometricAuthService.getBiometricDisplayName();
  };

  /**
   * Get appropriate button text based on current state
   */
  const getBiometricButtonText = () => {
    return BiometricAuthService.getBiometricButtonText();
  };

  /**
   * Get current state
   */
  const getState = () => {
    return BiometricAuthService.getState();
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  return {
    // State
    isSupported,
    biometricType,
    isEnabled,
    isLoading,
    isInitialized,
    
    // Methods
    initialize,
    authenticate,
    saveCredentials,
    removeCredentials,
    refreshStatus,
    promptToEnable,
    getBiometricIcon,
    getBiometricDisplayName,
    getBiometricButtonText,
    getState,
  };
};