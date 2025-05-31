import React, { createContext, useContext, useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const ProfileImageContext = createContext();

// Constants
const PROFILE_IMAGE_KEY = '@profile_image';
const DEFAULT_PROFILE_IMAGES = {
  // Different defaults for different screens
  profile: require('../assets/Logo/Logo.png'), 
  avatar: require('../assets/Logo/Logo.png'),
};

export const ProfileImageProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Load saved profile image on mount
  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      setLoading(true);
      const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      setError('Failed to load profile image');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const saveProfileImage = async (imageUri) => {
    try {
      if (imageUri) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageUri);
      } else {
        await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
      throw new Error('Failed to save profile image');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access gallery is required');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await saveProfileImage(imageUri);
        setProfileImage(imageUri);
        return imageUri;
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      setError(error.message || 'Failed to pick image from gallery');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        throw new Error('Permission to access camera is required');
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await saveProfileImage(imageUri);
        setProfileImage(imageUri);
        return imageUri;
      }
    } catch (error) {
      console.error('Error taking photo with camera:', error);
      setError(error.message || 'Failed to take photo with camera');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeProfileImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await saveProfileImage(null);
      setProfileImage(null);
    } catch (error) {
      console.error('Error removing profile image:', error);
      setError(error.message || 'Failed to remove profile image');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = async (imageUri) => {
    try {
      setLoading(true);
      setError(null);
      
      await saveProfileImage(imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error('Error updating profile image:', error);
      setError(error.message || 'Failed to update profile image');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshProfileImage = async () => {
    await loadProfileImage();
  };

  // Helper functions to get appropriate profile images
  const getProfileImage = (type = 'profile') => {
    return profileImage ? { uri: profileImage } : DEFAULT_PROFILE_IMAGES[type];
  };

  // Specific helpers for different screens
  const getProfileScreenImage = () => getProfileImage('profile');
  const getAvatarImage = () => getProfileImage('avatar');

  // For cases where you need just the URI (like for Image source that expects string)
  const getProfileImageUri = () => {
    return profileImage;
  };

  // Check if user has a custom profile image
  const hasCustomProfileImage = () => {
    return profileImage !== null;
  };

  const value = {
    // Core state
    profileImage,
    loading,
    error,
    initialized,
    
    // Actions
    pickImageFromGallery,
    takePhotoWithCamera,
    removeProfileImage,
    updateProfileImage,
    clearError,
    refreshProfileImage,
    
    // Helper functions
    getProfileImage,
    getProfileScreenImage,
    getAvatarImage,
    getProfileImageUri,
    hasCustomProfileImage,
    
    // Default images (for reference)
    defaultImages: DEFAULT_PROFILE_IMAGES,
  };

  return (
    <ProfileImageContext.Provider value={value}>
      {children}
    </ProfileImageContext.Provider>
  );
};

// Custom hook to use the context
export const useProfileImage = () => {
  const context = useContext(ProfileImageContext);
  if (!context) {
    throw new Error('useProfileImage must be used within a ProfileImageProvider');
  }
  return context;
};

export default ProfileImageContext;