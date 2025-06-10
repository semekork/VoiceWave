import React, { createContext, useContext, useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

const ProfileImageContext = createContext();

const STORAGE_BUCKET = 'profile-images';
const DEFAULT_PROFILE_IMAGES = {
  profile: require('../assets/blankpp.png'), 
  avatar: require('../assets/blankpp.png'),
};

export const ProfileImageProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Initialize and load profile image
  useEffect(() => {
    initializeProfileImage();
  }, []);

  const initializeProfileImage = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('No authenticated user found');
        return;
      }

      setCurrentUserId(user.id);
      await loadProfileImage(user.id);
    } catch (error) {
      console.error('Error initializing profile image:', error);
      setError('Failed to initialize profile image');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const loadProfileImage = async (userId = currentUserId) => {
    if (!userId) return;

    try {
      // Get profile data from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profile?.avatar_url) {
        // Get signed URL for the image with longer expiry
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(profile.avatar_url, 7200); // 2 hours

        if (urlError) {
          console.error('Error getting signed URL:', urlError);
          setProfileImage(null);
        } else {
          setProfileImage(signedUrl.signedUrl);
        }
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
      setError('Failed to load profile image');
      setProfileImage(null);
    }
  };

  // Enhanced method to get image with retry logic
  const getImageWithRetry = async (userId = currentUserId, retries = 3) => {
    if (!userId) return null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profile?.avatar_url) {
          return null;
        }

        // Try to get signed URL
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(profile.avatar_url, 7200);

        if (urlError) {
          if (attempt === retries) {
            throw urlError;
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return signedUrl.signedUrl;
      } catch (error) {
        if (attempt === retries) {
          console.error(`Failed to get image after ${retries} attempts:`, error);
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    return null;
  };

  // Method to check if image URL is still valid
  const isImageUrlValid = async (imageUrl) => {
    if (!imageUrl) return false;
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Enhanced method to get current image with validation
  const getCurrentProfileImage = async (forceRefresh = false) => {
    try {
      // If we have a cached image and not forcing refresh, check if it's still valid
      if (!forceRefresh && profileImage) {
        const isValid = await isImageUrlValid(profileImage);
        if (isValid) {
          return profileImage;
        }
      }

      // Get fresh image URL
      const freshImageUrl = await getImageWithRetry();
      setProfileImage(freshImageUrl);
      return freshImageUrl;
    } catch (error) {
      console.error('Error getting current profile image:', error);
      setError('Failed to load profile image');
      return null;
    }
  };

  const validateAndCompressImage = async (imageUri) => {
    try {
      // Get file info
      const info = await FileSystem.getInfoAsync(imageUri);
      
      if (!info.exists) {
        throw new Error('File does not exist');
      }

      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (info.size > maxSize) {
        throw new Error('File size too large (max 5MB)');
      }

      // If file is larger than 1MB, we should compress it
      // For now, we'll just return the original URI
      // You can implement compression using expo-image-manipulator here
      return imageUri;
    } catch (error) {
      throw new Error(`Image validation failed: ${error.message}`);
    }
  };

  const uploadImageToSupabase = async (imageUri) => {
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    try {
      // Validate and potentially compress the image
      const validatedUri = await validateAndCompressImage(imageUri);
      
      // Read the image file
      const base64 = await FileSystem.readAsStringAsync(validatedUri, {
        encoding: 'base64',
      });
      
      // Convert base64 to ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Generate unique filename
      const fileExt = validatedUri.split('.').pop()?.toLowerCase() || 'jpg';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const extension = validExtensions.includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${currentUserId}/profile_${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, byteArray, {
          contentType: `image/${extension}`,
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      return uploadData.path;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const updateProfileInDatabase = async (avatarPath) => {
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          avatar_url: avatarPath,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating profile in database:', error);
      throw error;
    }
  };

  const deleteOldImage = async (imagePath) => {
    if (!imagePath) return;

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([imagePath]);

      if (error) {
        console.error('Error deleting old image:', error);
      }
    } catch (error) {
      console.error('Error deleting old image:', error);
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
        
        // Get current profile to delete old image
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUserId)
          .single();

        // Upload new image
        const imagePath = await uploadImageToSupabase(imageUri);
        
        // Update profile in database
        await updateProfileInDatabase(imagePath);
        
        // Delete old image if it exists
        if (currentProfile?.avatar_url) {
          await deleteOldImage(currentProfile.avatar_url);
        }

        // Get signed URL for immediate display
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(imagePath, 7200);

        if (urlError) {
          throw urlError;
        }

        setProfileImage(signedUrl.signedUrl);
        return signedUrl.signedUrl;
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
        
        // Get current profile to delete old image
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', currentUserId)
          .single();

        // Upload new image
        const imagePath = await uploadImageToSupabase(imageUri);
        
        // Update profile in database
        await updateProfileInDatabase(imagePath);
        
        // Delete old image if it exists
        if (currentProfile?.avatar_url) {
          await deleteOldImage(currentProfile.avatar_url);
        }

        // Get signed URL for immediate display
        const { data: signedUrl, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(imagePath, 7200);

        if (urlError) {
          throw urlError;
        }

        setProfileImage(signedUrl.signedUrl);
        return signedUrl.signedUrl;
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
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }
      
      // Get current avatar URL to delete from storage
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', currentUserId)
        .single();

      // Delete from storage if exists
      if (profile?.avatar_url) {
        await deleteOldImage(profile.avatar_url);
      }
      
      // Update profile to remove avatar URL
      await updateProfileInDatabase(null);
      
      setProfileImage(null);
    } catch (error) {
      console.error('Error removing profile image:', error);
      setError(error.message || 'Failed to remove profile image');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfileImage = async () => {
    if (currentUserId) {
      await loadProfileImage(currentUserId);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Helper functions
  const getProfileImage = (type = 'profile') => {
    return profileImage ? { uri: profileImage } : DEFAULT_PROFILE_IMAGES[type];
  };

  const getProfileScreenImage = () => getProfileImage('profile');
  const getAvatarImage = () => getProfileImage('avatar');
  const getProfileImageUri = () => profileImage;
  const hasCustomProfileImage = () => profileImage !== null;

  // Get fresh signed URL for sharing
  const getShareableImageUrl = async () => {
    if (!currentUserId || !profileImage) return null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', currentUserId)
        .single();

      if (profile?.avatar_url) {
        const { data: signedUrl, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(profile.avatar_url, 7200);

        if (error) {
          throw error;
        }

        return signedUrl.signedUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting shareable image URL:', error);
      return null;
    }
  };

  const value = {
    // Core state
    profileImage,
    loading,
    error,
    initialized,
    currentUserId,
    
    // Actions
    pickImageFromGallery,
    takePhotoWithCamera,
    removeProfileImage,
    clearError,
    refreshProfileImage,
    getCurrentProfileImage,
    
    // Helper functions
    getProfileImage,
    getProfileScreenImage,
    getAvatarImage,
    getProfileImageUri,
    hasCustomProfileImage,
    getShareableImageUrl,
    
    // Default images
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