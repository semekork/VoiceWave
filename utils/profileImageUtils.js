// utils/profileImageUtils.js
import { supabase } from '../lib/supabase';

export const STORAGE_BUCKET = 'profile-images';

/**
 * Get a signed URL for a profile image
 * @param {string} imagePath - The storage path of the image
 * @param {number} expiresIn - Expiry time in seconds (default: 1 hour)
 * @returns {Promise<string|null>} Signed URL or null
 */
export const getSignedImageUrl = async (imagePath, expiresIn = 3600) => {
  if (!imagePath) return null;
  
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(imagePath, expiresIn);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

/**
 * Get profile image URL for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Profile image URL or null
 */
export const getUserProfileImageUrl = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profile_images')
      .select('avatar_url')
      .eq('id', userId)
      .single();
    
    if (error || !data?.avatar_url) {
      return null;
    }
    
    return await getSignedImageUrl(data.avatar_url);
  } catch (error) {
    console.error('Error getting user profile image:', error);
    return null;
  }
};

/**
 * Get multiple profile image URLs
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<Object>} Object with userId as key and image URL as value
 */
export const getBatchProfileImageUrls = async (userIds) => {
  try {
    const { data, error } = await supabase
      .rpc('get_signed_profile_image_urls', { user_ids: userIds });
    
    if (error) {
      console.error('Error getting batch profile images:', error);
      return {};
    }
    
    const imageUrls = {};
    
    for (const item of data) {
      const signedUrl = await getSignedImageUrl(item.signed_url);
      if (signedUrl) {
        imageUrls[item.user_id] = signedUrl;
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error getting batch profile images:', error);
    return {};
  }
};

/**
 * Check if user has a profile image
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has profile image
 */
export const userHasProfileImage = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();
    
    return !error && !!data?.avatar_url;
  } catch (error) {
    console.error('Error checking profile image:', error);
    return false;
  }
};

/**
 * Validate image file before upload
 * @param {string} imageUri - Local image URI
 * @returns {Promise<{valid: boolean, error?: string, size?: number}>}
 */
export const validateImageFile = async (imageUri) => {
  try {
    const info = await FileSystem.getInfoAsync(imageUri);
    
    if (!info.exists) {
      return { valid: false, error: 'File does not exist' };
    }
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (info.size > maxSize) {
      return { 
        valid: false, 
        error: 'File size too large (max 5MB)',
        size: info.size 
      };
    }
    
    return { valid: true, size: info.size };
  } catch (error) {
    return { valid: false, error: 'Failed to validate file' };
  }
};

/**
 * Generate optimized filename for profile image
 * @param {string} userId - User ID
 * @param {string} originalUri - Original image URI
 * @returns {string} Optimized filename
 */
export const generateImageFilename = (userId, originalUri) => {
  const timestamp = Date.now();
  const fileExt = originalUri.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Ensure valid image extension
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const extension = validExtensions.includes(fileExt) ? fileExt : 'jpg';
  
  return `${userId}/profile_${timestamp}.${extension}`;
};

/**
 * Compress image before upload (if needed)
 * @param {string} imageUri - Local image URI
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<string>} Compressed image URI
 */
export const compressImage = async (imageUri, quality = 0.8) => {
  try {
    // Using expo-image-manipulator for compression
    const { ImageManipulator } = require('expo-image-manipulator');
    
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 400, height: 400 } }], // Resize to 400x400
      { 
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );
    
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return imageUri; // Return original if compression fails
  }
};

/**
 * Handle image upload with optimization
 * @param {string} imageUri - Local image URI
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, path?: string, error?: string}>}
 */
export const uploadOptimizedImage = async (imageUri, userId) => {
  try {
    // Validate image
    const validation = await validateImageFile(imageUri);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Compress if needed (files larger than 1MB)
    let finalImageUri = imageUri;
    if (validation.size > 1024 * 1024) {
      finalImageUri = await compressImage(imageUri);
    }
    
    // Generate filename
    const fileName = generateImageFilename(userId, finalImageUri);
    
    // Read and upload file
    const base64 = await FileSystem.readAsStringAsync(finalImageUri, {
      encoding: 'base64',
    });
    
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, byteArray, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, path: data.path };
  } catch (error) {
    console.error('Error uploading optimized image:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};

// React hook for profile image operations
import { useState, useCallback } from 'react';

export const useProfileImageOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const uploadImage = useCallback(async (imageUri) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const result = await uploadOptimizedImage(imageUri, user.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: result.path })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      return result.path;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const deleteImage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get current avatar path
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profile?.avatar_url) {
        // Delete from storage
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([profile.avatar_url]);
      }
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
      
      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    uploadImage,
    deleteImage,
    loading,
    error,
    clearError: () => setError(null)
  };
};