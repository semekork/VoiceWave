// Utility functions for podcast formatting and state management

// Global state for currently playing episode
let currentlyPlayingId = null;

export const setCurrentlyPlaying = (episodeId) => {
  currentlyPlayingId = episodeId;
};

export const getCurrentlyPlaying = () => {
  return currentlyPlayingId;
};

// Utility functions
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return 'Unknown';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatPublishedDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diff / 604800);
    if (weeks < 4) {
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(diff / 2628000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
};

// Cache management utilities
export const clearAllCaches = async (client) => {
  if (client && typeof client.clearCache === 'function') {
    await client.clearCache();
  }
};

export const getCacheStatistics = async (client) => {
  if (client && typeof client.getCacheStats === 'function') {
    return await client.getCacheStats();
  }
  return { memoryCache: 0, persistentCache: 0, isOnline: true };
};