import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Get current user with better error handling
  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.log('⚠️ No authenticated user found');
        throw new Error('No authenticated user found');
      }

      console.log('✅ User authenticated:', user.id);
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      throw error;
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    let mounted = true;

    const getInitialUser = async () => {
      try {
        const user = await getCurrentUser();
        if (mounted) {
          setCurrentUserId(user.id);
          await loadProfileImage(user.id);
        }
      } catch (error) {
        if (mounted) {
          console.error('❌ Error getting initial user:', error);
          setError(error.message);
          setCurrentUserId(null);
        }
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          if (event === 'SIGNED_IN' && session?.user) {
            setCurrentUserId(session.user.id);
            setError(null);
            await loadProfileImage(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUserId(null);
            setProfileImage(null);
            setError(null);
          }
          
          if (!initialized) {
            setInitialized(true);
          }
        }
      }
    );

    // Get initial user
    getInitialUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [getCurrentUser, initialized]);

  // Initialize and load profile image
  const initializeProfileImage = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing profile image...');
      
      const user = await getCurrentUser();
      setCurrentUserId(user.id);
      await loadProfileImage(user.id);
    } catch (error) {
      console.error('❌ Error initializing profile image:', error);
      setError(error.message);
      setCurrentUserId(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [getCurrentUser]);

  const loadProfileImage = useCallback(async (userId) => {
    if (!userId) {
      console.log('⚠️ No userId provided to loadProfileImage');
      return;
    }

    try {
      console.log('🔄 Loading profile image for user:', userId);
      
      // Get profile data from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('⚠️ No profile found for user:', userId);
          setProfileImage(null);
          return;
        }
        console.error('❌ Profile query error:', profileError);
        setError(`Profile query error: ${profileError.message}`);
        return;
      }

      console.log('✅ Profile data retrieved:', profile);

      if (!profile?.avatar_url) {
        console.log('⚠️ No avatar URL in profile');
        setProfileImage(null);
        return;
      }

      console.log('🔄 Avatar URL found:', profile.avatar_url);

      // Get signed URL for the image with longer expiry
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(profile.avatar_url, 7200); // 2 hours

      if (urlError) {
        console.error('❌ Error creating signed URL:', urlError);
        setError(`Signed URL error: ${urlError.message}`);
        setProfileImage(null);
        return;
      }

      if (!signedUrl?.signedUrl) {
        console.error('❌ No signed URL returned');
        setError('No signed URL returned from storage');
        setProfileImage(null);
        return;
      }

      console.log('✅ Signed URL created successfully');
      
      // Test if the URL is accessible
      try {
        const response = await fetch(signedUrl.signedUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.error('❌ Signed URL not accessible:', response.status, response.statusText);
          setError(`Image not accessible: ${response.status}`);
          setProfileImage(null);
          return;
        }
        console.log('✅ Signed URL is accessible');
      } catch (fetchError) {
        console.error('❌ Error testing signed URL:', fetchError);
        setError(`URL test failed: ${fetchError.message}`);
        setProfileImage(null);
        return;
      }

      setProfileImage(signedUrl.signedUrl);
      setError(null); // Clear any previous errors
      console.log('✅ Profile image loaded successfully');

    } catch (error) {
      console.error('❌ Unexpected error loading profile image:', error);
      setError(`Unexpected error: ${error.message}`);
      setProfileImage(null);
    }
  }, []);

  // Enhanced permission checking
  const checkMediaLibraryPermissions = async () => {
    try {
      console.log('🔐 Checking media library permissions...');
      
      // Get current permission status
      const { status: currentStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('📱 Current media library permission status:', currentStatus);
      
      if (currentStatus === 'granted') {
        console.log('✅ Media library permission already granted');
        return true;
      }
      
      if (currentStatus === 'denied') {
        console.log('❌ Media library permission previously denied');
        throw new Error('Gallery access was previously denied. Please enable it in your device settings.');
      }
      
      // Request permission
      console.log('🔄 Requesting media library permission...');
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📱 New media library permission status:', newStatus);
      
      if (newStatus !== 'granted') {
        throw new Error('Gallery access permission is required to select photos');
      }
      
      console.log('✅ Media library permission granted');
      return true;
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      throw error;
    }
  };

  const checkCameraPermissions = async () => {
    try {
      console.log('🔐 Checking camera permissions...');
      
      // Get current permission status
      const { status: currentStatus } = await ImagePicker.getCameraPermissionsAsync();
      console.log('📷 Current camera permission status:', currentStatus);
      
      if (currentStatus === 'granted') {
        console.log('✅ Camera permission already granted');
        return true;
      }
      
      if (currentStatus === 'denied') {
        console.log('❌ Camera permission previously denied');
        throw new Error('Camera access was previously denied. Please enable it in your device settings.');
      }
      
      // Request permission
      console.log('🔄 Requesting camera permission...');
      const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('📷 New camera permission status:', newStatus);
      
      if (newStatus !== 'granted') {
        throw new Error('Camera access permission is required to take photos');
      }
      
      console.log('✅ Camera permission granted');
      return true;
    } catch (error) {
      console.error('❌ Camera permission check failed:', error);
      throw error;
    }
  };

  // Ensure user is authenticated before proceeding
  const ensureAuthenticated = async () => {
    try {
      // First check if we have a current user ID
      if (currentUserId) {
        // Verify the user is still authenticated
        const user = await getCurrentUser();
        if (user.id === currentUserId) {
          return user;
        }
      }

      // Get fresh user data
      const user = await getCurrentUser();
      setCurrentUserId(user.id);
      return user;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setCurrentUserId(null);
      throw new Error('User not authenticated. Please log in and try again.');
    }
  };

  const validateAndCompressImage = async (imageUri) => {
    try {
      console.log('🔍 Validating image:', imageUri);
      
      // Get file info
      const info = await FileSystem.getInfoAsync(imageUri);
      
      if (!info.exists) {
        throw new Error('Selected image file does not exist');
      }

      console.log('📁 File info:', {
        exists: info.exists,
        size: info.size,
        uri: info.uri
      });

      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (info.size > maxSize) {
        const sizeMB = (info.size / (1024 * 1024)).toFixed(2);
        throw new Error(`Image file is too large (${sizeMB}MB). Please select an image smaller than 5MB.`);
      }

      console.log('✅ Image validation passed');
      return imageUri;
    } catch (error) {
      console.error('❌ Image validation failed:', error);
      throw new Error(`Image validation failed: ${error.message}`);
    }
  };

  const uploadImageToSupabase = async (imageUri, userId) => {
    try {
      console.log('📤 Starting image upload to Supabase...');
      console.log('👤 User ID:', userId);
      console.log('📁 Image URI:', imageUri);
      
      // Validate the image first
      const validatedUri = await validateAndCompressImage(imageUri);
      
      // Read the image file as base64
      console.log('📖 Reading image file...');
      const base64 = await FileSystem.readAsStringAsync(validatedUri, {
        encoding: 'base64',
      });
      
      if (!base64) {
        throw new Error('Failed to read image file');
      }
      
      console.log('✅ Image file read successfully, size:', base64.length);
      
      // Convert base64 to ArrayBuffer
      console.log('🔄 Converting image to binary...');
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      console.log('✅ Image converted to binary, size:', byteArray.length);

      // Generate unique filename
      const fileExt = validatedUri.split('.').pop()?.toLowerCase() || 'jpg';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const extension = validExtensions.includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${userId}/profile_${Date.now()}.${extension}`;

      console.log('📄 Uploading file with name:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, byteArray, {
          contentType: `image/${extension}`,
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      if (!uploadData || !uploadData.path) {
        throw new Error('Upload succeeded but no file path returned');
      }

      console.log('✅ Upload successful:', uploadData);
      return uploadData.path;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  };

  const updateProfileInDatabase = async (avatarPath, userId) => {
    try {
      console.log('💾 Updating profile in database...', avatarPath);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          avatar_url: avatarPath,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }
      
      console.log('✅ Profile updated in database');
    } catch (error) {
      console.error('❌ Error updating profile in database:', error);
      throw error;
    }
  };

  const deleteOldImage = async (imagePath) => {
    if (!imagePath) return;

    try {
      console.log('🗑️ Attempting to delete old image:', imagePath);
      
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([imagePath]);

      if (error) {
        console.warn('⚠️ Could not delete old image (not critical):', error);
        return;
      }

      console.log('✅ Successfully deleted old image:', data);
    } catch (error) {
      console.warn('⚠️ Error deleting old image (not critical):', error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📱 Starting image selection from gallery...');

      // Ensure user is authenticated
      const user = await ensureAuthenticated();

      // Enhanced permission checking
      await checkMediaLibraryPermissions();

      console.log('🖼️ Launching image picker...');
      
      // Launch image picker with enhanced options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false, // Don't include EXIF data
        base64: false, // Don't include base64 (we'll read it separately)
      });

      console.log('📱 Image picker result:', {
        canceled: result.canceled,
        hasAssets: result.assets?.length > 0
      });

      if (result.canceled) {
        console.log('⚠️ User canceled image selection');
        return null;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No image selected');
      }

      const selectedAsset = result.assets[0];
      const imageUri = selectedAsset.uri;
      
      console.log('📸 Image selected:', {
        uri: imageUri,
        width: selectedAsset.width,
        height: selectedAsset.height,
        fileSize: selectedAsset.fileSize
      });
      
      // Get current profile to delete old image later
      let currentProfile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        currentProfile = data;
      } catch (error) {
        console.log('⚠️ Could not fetch current profile for cleanup:', error);
      }

      // Upload new image
      console.log('📤 Starting upload process...');
      const imagePath = await uploadImageToSupabase(imageUri, user.id);
      
      // Update profile in database
      console.log('💾 Updating database...');
      await updateProfileInDatabase(imagePath, user.id);
      
      // Delete old image in background (non-blocking)
      if (currentProfile?.avatar_url) {
        deleteOldImage(currentProfile.avatar_url).catch(error => {
          console.log('⚠️ Background deletion of old image failed (not critical):', error);
        });
      }

      // Get signed URL for immediate display
      console.log('🔗 Getting signed URL for display...');
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(imagePath, 7200);

      if (urlError) {
        console.error('❌ Error getting signed URL:', urlError);
        throw new Error(`Failed to get image URL: ${urlError.message}`);
      }

      if (!signedUrl?.signedUrl) {
        throw new Error('No signed URL returned');
      }

      setProfileImage(signedUrl.signedUrl);
      console.log('✅ Profile image updated successfully');
      return signedUrl.signedUrl;
      
    } catch (error) {
      console.error('❌ Error in pickImageFromGallery:', error);
      const errorMessage = error.message || 'Failed to select image from gallery';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📷 Starting camera photo capture...');

      // Ensure user is authenticated
      const user = await ensureAuthenticated();

      // Enhanced permission checking
      await checkCameraPermissions();

      console.log('📷 Launching camera...');
      
      // Launch camera with enhanced options
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
        base64: false,
      });

      console.log('📷 Camera result:', {
        canceled: result.canceled,
        hasAssets: result.assets?.length > 0
      });

      if (result.canceled) {
        console.log('⚠️ User canceled camera capture');
        return null;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No photo captured');
      }

      const capturedAsset = result.assets[0];
      const imageUri = capturedAsset.uri;
      
      console.log('📸 Photo captured:', {
        uri: imageUri,
        width: capturedAsset.width,
        height: capturedAsset.height,
        fileSize: capturedAsset.fileSize
      });
      
      // Get current profile to delete old image later
      let currentProfile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        currentProfile = data;
      } catch (error) {
        console.log('⚠️ Could not fetch current profile for cleanup:', error);
      }

      // Upload new image
      console.log('📤 Starting upload process...');
      const imagePath = await uploadImageToSupabase(imageUri, user.id);
      
      // Update profile in database
      console.log('💾 Updating database...');
      await updateProfileInDatabase(imagePath, user.id);
      
      // Delete old image in background (non-blocking)
      if (currentProfile?.avatar_url) {
        deleteOldImage(currentProfile.avatar_url).catch(error => {
          console.log('⚠️ Background deletion of old image failed (not critical):', error);
        });
      }

      // Get signed URL for immediate display
      console.log('🔗 Getting signed URL for display...');
      const { data: signedUrl, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(imagePath, 7200);

      if (urlError) {
        console.error('❌ Error getting signed URL:', urlError);
        throw new Error(`Failed to get image URL: ${urlError.message}`);
      }

      if (!signedUrl?.signedUrl) {
        throw new Error('No signed URL returned');
      }

      setProfileImage(signedUrl.signedUrl);
      console.log('✅ Profile image updated successfully');
      return signedUrl.signedUrl;
      
    } catch (error) {
      console.error('❌ Error in takePhotoWithCamera:', error);
      const errorMessage = error.message || 'Failed to capture photo with camera';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeProfileImage = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Removing profile image...');
      
      // Ensure user is authenticated
      const user = await ensureAuthenticated();
      
      // Get current avatar URL to delete from storage
      let currentProfile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        currentProfile = data;
      } catch (error) {
        console.log('⚠️ Could not fetch current profile for cleanup:', error);
      }

      // Update profile to remove avatar URL first
      await updateProfileInDatabase(null, user.id);
      
      // Set local state immediately
      setProfileImage(null);
      
      // Try to delete from storage (non-blocking)
      if (currentProfile?.avatar_url) {
        deleteOldImage(currentProfile.avatar_url).catch(error => {
          console.log('⚠️ Background deletion of old image failed (not critical):', error);
        });
      }
      
      console.log('✅ Profile image removed successfully');
    } catch (error) {
      console.error('❌ Error removing profile image:', error);
      setError(error.message || 'Failed to remove profile image');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfileImage = async () => {
    console.log('🔄 Refreshing profile image...');
    try {
      const user = await ensureAuthenticated();
      await loadProfileImage(user.id);
    } catch (error) {
      console.error('❌ Error refreshing profile image:', error);
      setError(error.message);
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
    try {
      const user = await ensureAuthenticated();
      
      if (!profileImage) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
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
      console.error('❌ Error getting shareable image URL:', error);
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