import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';

class BiometricAuthService {
  constructor() {
    this.isSupported = false;
    this.biometricType = null;
    this.isEnabled = false;
    this.STORAGE_KEY = 'biometric_credentials';
  }

  /**
   * Initialize biometric authentication service
   * Checks device support and existing credentials
   */
  async initialize() {
    try {
      await this.checkBiometricSupport();
      await this.checkBiometricCredentials();
      return {
        isSupported: this.isSupported,
        biometricType: this.biometricType,
        isEnabled: this.isEnabled,
      };
    } catch (error) {
      console.error('Error initializing biometric auth service:', error);
      return {
        isSupported: false,
        biometricType: null,
        isEnabled: false,
      };
    }
  }

  /**
   * Check if biometric authentication is supported on the device
   */
  async checkBiometricSupport() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      this.isSupported = compatible && enrolled;

      // Determine biometric type
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        this.biometricType = 'face';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        this.biometricType = 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        this.biometricType = 'iris';
      }

      console.log('Biometric support check:', {
        compatible,
        enrolled,
        supportedTypes,
        biometricType: this.biometricType,
      });

      return {
        isSupported: this.isSupported,
        biometricType: this.biometricType,
      };
    } catch (error) {
      console.error('Error checking biometric support:', error);
      this.isSupported = false;
      this.biometricType = null;
      return {
        isSupported: false,
        biometricType: null,
      };
    }
  }

  /**
   * Check if user has saved biometric credentials
   */
  async checkBiometricCredentials() {
    try {
      const savedCredentials = await SecureStore.getItemAsync(this.STORAGE_KEY);
      this.isEnabled = !!savedCredentials;
      return this.isEnabled;
    } catch (error) {
      console.error('Error checking biometric credentials:', error);
      this.isEnabled = false;
      return false;
    }
  }

  /**
   * Save credentials for biometric authentication
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  async saveCredentials(email, password) {
    try {
      const credentials = JSON.stringify({ email, password });
      await SecureStore.setItemAsync(this.STORAGE_KEY, credentials);
      this.isEnabled = true;

      Alert.alert(
        'Biometric Authentication Enabled',
        'Your credentials have been saved securely. You can now use biometric authentication to log in.',
        [{ text: 'OK', style: 'default' }]
      );

      return { success: true };
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      Alert.alert(
        'Error',
        'Failed to save credentials for biometric authentication.'
      );
      return { success: false, error };
    }
  }

  /**
   * Remove saved biometric credentials
   */
  async removeCredentials() {
    try {
      await SecureStore.deleteItemAsync(this.STORAGE_KEY);
      this.isEnabled = false;

      Alert.alert(
        'Biometric Authentication Disabled',
        'Your saved credentials have been removed.',
        [{ text: 'OK', style: 'default' }]
      );

      return { success: true };
    } catch (error) {
      console.error('Error removing biometric credentials:', error);
      return { success: false, error };
    }
  }

  /**
   * Get saved credentials from secure storage
   */
  async getCredentials() {
    try {
      const savedCredentials = await SecureStore.getItemAsync(this.STORAGE_KEY);
      if (savedCredentials) {
        return JSON.parse(savedCredentials);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving biometric credentials:', error);
      return null;
    }
  }

  /**
   * Authenticate using biometric authentication
   * @param {function} signInCallback - Callback function to handle sign in with retrieved credentials
   */
  async authenticate(signInCallback) {
    // Check if biometric authentication is supported
    if (!this.isSupported) {
      Alert.alert(
        'Biometric Authentication Unavailable',
        'Biometric authentication is not supported or not set up on this device. Please ensure you have fingerprint or face recognition configured in your device settings.',
        [{ text: 'OK', style: 'default' }]
      );
      return { success: false, reason: 'not_supported' };
    }

    // Check if biometric authentication is enabled
    if (!this.isEnabled) {
      Alert.alert(
        'Setup Biometric Authentication',
        'To use biometric authentication, please log in with your email and password first, then enable biometric authentication in the prompt that follows.',
        [{ text: 'OK', style: 'default' }]
      );
      return { success: false, reason: 'not_enabled' };
    }

    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Show biometric authentication prompt
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        requireConfirmation: false,
      });

      if (biometricAuth.success) {
        // Retrieve saved credentials
        const credentials = await this.getCredentials();

        if (credentials) {
          const { email, password } = credentials;

          // Use the provided callback to sign in
          const result = await signInCallback(email, password);

          if (result.error) {
            // Handle authentication error with saved credentials
            Alert.alert(
              'Authentication Failed',
              'Your saved credentials appear to be invalid. Please log in manually and update your biometric authentication.',
              [
                {
                  text: 'Remove Biometric Auth',
                  style: 'destructive',
                  onPress: () => this.removeCredentials(),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
            return { success: false, reason: 'invalid_credentials', error: result.error };
          } else if (result.data?.user) {
            console.log('Biometric login successful:', result.data.user);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { success: true, data: result.data };
          }
        } else {
          Alert.alert(
            'Error',
            'No saved credentials found. Please log in manually first.'
          );
          this.isEnabled = false;
          return { success: false, reason: 'no_credentials' };
        }
      } else if (biometricAuth.error === 'user_cancel') {
        console.log('Biometric authentication cancelled by user');
        return { success: false, reason: 'user_cancelled' };
      } else {
        console.log('Biometric authentication failed:', biometricAuth.error);
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication failed. Please try again or use your email and password.',
          [{ text: 'OK', style: 'default' }]
        );
        return { success: false, reason: 'auth_failed', error: biometricAuth.error };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Error',
        'An error occurred during biometric authentication.'
      );
      return { success: false, reason: 'unexpected_error', error };
    }
  }

  /**
   * Get biometric type display name
   */
  getBiometricDisplayName() {
    switch (this.biometricType) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Get appropriate text for biometric button based on current state
   */
  getBiometricButtonText() {
    if (!this.isSupported) {
      return 'Biometric authentication not available';
    }

    if (this.isEnabled) {
      return `Use ${this.getBiometricDisplayName()}`;
    }

    return `Enable ${this.getBiometricDisplayName()}`;
  }

  /**
   * Get biometric icon source based on type
   */
  getBiometricIcon() {
    if (this.biometricType === 'face') {
      return require('../assets/Auth/face-id.png');
    }
    return require('../assets/Auth/fingerprint.png');
  }

  /**
   * Prompt user to enable biometric authentication after successful login
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  promptToEnable(email, password) {
    if (this.isSupported && !this.isEnabled) {
      setTimeout(() => {
        Alert.alert(
          'Enable Biometric Authentication?',
          `Would you like to enable ${this.getBiometricDisplayName()} authentication for faster login?`,
          [
            {
              text: 'Not Now',
              style: 'cancel',
            },
            {
              text: 'Enable',
              style: 'default',
              onPress: () => this.saveCredentials(email, password),
            },
          ]
        );
      }, 500);
    }
  }

  /**
   * Get current state of biometric authentication
   */
  getState() {
    return {
      isSupported: this.isSupported,
      biometricType: this.biometricType,
      isEnabled: this.isEnabled,
      displayName: this.getBiometricDisplayName(),
      buttonText: this.getBiometricButtonText(),
    };
  }
}

// Export singleton instance
export default new BiometricAuthService();