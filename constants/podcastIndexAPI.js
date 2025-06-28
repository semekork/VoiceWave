// Fixed Expo-optimized Podcast Index API client
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class ExpoPodcastIndexClient {
  constructor(apiKey, apiSecret, userAgent = 'VoiceWave/1.0.0') {
    // Use environment variables if provided, otherwise fallback to hardcoded values
    this.apiKey = apiKey || process.env.EXPO_PUBLIC_PODCAST_INDEX_API_KEY || 'CYRZVUAUQG4H6RPNNPZE';
    this.apiSecret = apiSecret || process.env.EXPO_PUBLIC_PODCAST_INDEX_API_SECRET || 'R5zvUfdu85G#SJknqr9tMQK8A$hq3QgbrKkFvX6y';
    this.userAgent = userAgent;
    this.baseUrl = 'https://api.podcastindex.org/api/1.0';
    this.memoryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.isOnline = true;
    
    // Monitor network status
    this.initNetworkMonitoring();
  }

  /**
   * Initialize network monitoring
   */
  async initNetworkMonitoring() {
    try {
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected;
      
      NetInfo.addEventListener(state => {
        this.isOnline = state.isConnected;
      });
    } catch (error) {
      console.warn('Network monitoring unavailable:', error);
    }
  }

  /**
   * Generate authentication headers using Expo Crypto
   */
  async generateAuthHeaders() {
    const apiHeaderTime = Math.floor(Date.now() / 1000);
    const data4Hash = this.apiKey + this.apiSecret + apiHeaderTime;

    let hashHex;
    
    try {
      // Use Expo Crypto for SHA-1 hashing
      hashHex = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA1,
        data4Hash
      );
    } catch (error) {
      console.error('Crypto error, using fallback:', error);
      // Fallback hash implementation
      hashHex = this.simpleHash(data4Hash);
    }

    return {
      'X-Auth-Date': apiHeaderTime.toString(),
      'X-Auth-Key': this.apiKey,
      'Authorization': hashHex,
      'User-Agent': this.userAgent,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Simple hash fallback
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Get cache key
   */
  getCacheKey(endpoint, params) {
    return `podcast_api:${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Get cached result from memory or AsyncStorage
   */
  async getCachedResult(key) {
    // Check memory cache first (fastest)
    const memoryCached = this.memoryCache.get(key);
    if (memoryCached && Date.now() - memoryCached.timestamp < this.cacheTimeout) {
      return memoryCached.data;
    }

    // Check AsyncStorage for longer-term cache
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (Date.now() - parsed.timestamp < this.cacheTimeout * 6) { // 30 minutes for persistent cache
          // Also add to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('AsyncStorage read error:', error);
    }

    return null;
  }

  /**
   * Cache result in both memory and AsyncStorage
   */
  async setCacheResult(key, data) {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };

    // Memory cache
    this.memoryCache.set(key, cacheItem);

    // Persistent cache
    try {
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('AsyncStorage write error:', error);
    }
  }

  /**
   * Make API request with Expo optimizations
   */
  async makeRequest(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache first
    const cached = await this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${endpoint}`);
      return cached;
    }

    // Check network connectivity
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      // Add parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });

      const headers = await this.generateAuthHeaders();
      
      console.log(`Making API request to: ${url.toString()}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${response.statusText}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      // Cache successful response
      await this.setCacheResult(cacheKey, data);
      
      console.log(`API request successful for ${endpoint}:`, data);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Search podcasts
   */
  async searchPodcasts(query, limit = 20) {
    if (!query?.trim()) {
      throw new Error('Search query is required');
    }

    try {
      const response = await this.makeRequest('/search/byterm', {
        q: query.trim(),
        max: Math.min(limit, 40),
        fulltext: true
      });

      return response.feeds || [];
    } catch (error) {
      console.error('Error searching podcasts:', error);
      throw error;
    }
  }

  /**
   * Get trending podcasts
   */
  async getTrendingPodcasts(limit = 20) {
    try {
      const response = await this.makeRequest('/podcasts/trending', {
        max: Math.min(limit, 40),
        since: Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)
      });

      return response.feeds || [];
    } catch (error) {
      console.error('Error getting trending podcasts:', error);
      throw error;
    }
  }

  /**
   * Get podcast episodes
   */
  async getPodcastEpisodes(feedId, limit = 50) {
    if (!feedId) {
      throw new Error('Feed ID is required');
    }

    try {
      const response = await this.makeRequest('/episodes/byfeedid', {
        id: feedId,
        max: Math.min(limit, 100)
      });

      return response.items || [];
    } catch (error) {
      console.error('Error getting podcast episodes:', error);
      throw error;
    }
  }

  /**
   * Get recent episodes
   */
  async getRecentEpisodes(limit = 50) {
    try {
      const response = await this.makeRequest('/recent/episodes', {
        max: Math.min(limit, 100),
        excludeString: 'trailer,preview,teaser'
      });

      return response.items || [];
    } catch (error) {
      console.error('Error getting recent episodes:', error);
      throw error;
    }
  }

  /**
   * Get podcasts by category - Fixed implementation
   * Uses search with category filter since there's no direct category endpoint
   */
  async getAvailableCategories() {
  try {
    // Get a sample of trending podcasts to extract categories
    const response = await this.makeRequest('/podcasts/trending', {
      max: 40,
      since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
    });

    const podcasts = response.feeds || [];
    const categoriesSet = new Set();

    podcasts.forEach(podcast => {
      if (podcast.categories) {
        // The categories object has category IDs as keys and names as values
        // We want the names (values), not the IDs (keys)
        Object.values(podcast.categories).forEach(categoryName => {
          if (categoryName && typeof categoryName === 'string') {
            categoriesSet.add(categoryName.trim());
          }
        });
      }
    });

    const categories = Array.from(categoriesSet).sort();
    
    // If we have categories, return them, otherwise return fallback
    if (categories.length > 0) {
      return categories;
    }
    
    // Fallback to common podcast categories
    return [
      'Arts', 'Business', 'Comedy', 'Education', 'Fiction', 'Government', 
      'Health & Fitness', 'History', 'Kids & Family', 'Leisure', 'Music', 
      'News', 'Religion & Spirituality', 'Science', 'Society & Culture', 
      'Sports', 'Technology', 'True Crime', 'TV & Film'
    ];
  } catch (error) {
    console.error('Error getting available categories:', error);
    // Return common podcast categories as fallback
    return [
      'Arts', 'Business', 'Comedy', 'Education', 'Fiction', 'Government', 
      'Health & Fitness', 'History', 'Kids & Family', 'Leisure', 'Music', 
      'News', 'Religion & Spirituality', 'Science', 'Society & Culture', 
      'Sports', 'Technology', 'True Crime', 'TV & Film'
    ];
  }
}

  /**
   * Get available categories - Helper method
   */
  async getPodcastsByCategory(category, limit = 20) {
  if (!category) {
    throw new Error('Category is required');
  }

  try {
    // Method 1: Search by category term
    const searchResponse = await this.makeRequest('/search/byterm', {
      q: category,
      max: Math.min(limit * 2, 40), // Get more results to filter
      fulltext: false
    });

    let categoryPodcasts = searchResponse.feeds || [];

    // Filter results that actually match the category
    categoryPodcasts = categoryPodcasts.filter(podcast => {
      if (!podcast.categories) return false;
      
      // Check both keys and values in categories object
      const podcastCategories = [
        ...Object.keys(podcast.categories).map(cat => cat.toLowerCase()),
        ...Object.values(podcast.categories).map(cat => cat.toLowerCase())
      ];
      const searchCategory = category.toLowerCase();
      
      return podcastCategories.some(cat => 
        cat.includes(searchCategory) || searchCategory.includes(cat)
      );
    });

    // If we don't have enough results, try getting trending and filter by category
    if (categoryPodcasts.length < limit) {
      try {
        const trendingResponse = await this.makeRequest('/podcasts/trending', {
          max: 40,
          since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000) // Last 30 days
        });

        const trendingPodcasts = trendingResponse.feeds || [];
        const filteredTrending = trendingPodcasts.filter(podcast => {
          if (!podcast.categories) return false;
          
          // Check both keys and values in categories object
          const podcastCategories = [
            ...Object.keys(podcast.categories).map(cat => cat.toLowerCase()),
            ...Object.values(podcast.categories).map(cat => cat.toLowerCase())
          ];
          const searchCategory = category.toLowerCase();
          
          return podcastCategories.some(cat => 
            cat.includes(searchCategory) || searchCategory.includes(cat)
          );
        });

        // Merge results, avoiding duplicates
        const existingIds = new Set(categoryPodcasts.map(p => p.id));
        filteredTrending.forEach(podcast => {
          if (!existingIds.has(podcast.id) && categoryPodcasts.length < limit) {
            categoryPodcasts.push(podcast);
          }
        });
      } catch (trendingError) {
        console.warn('Could not fetch trending podcasts for category filtering:', trendingError);
      }
    }

    return categoryPodcasts.slice(0, limit);
  } catch (error) {
    console.error('Error getting podcasts by category:', error);
    throw error;
  }
}

  /**
   * Get podcast by feed ID
   */
  async getPodcastById(feedId) {
    if (!feedId) {
      throw new Error('Feed ID is required');
    }

    try {
      const response = await this.makeRequest('/podcasts/byfeedid', {
        id: feedId
      });

      return response.feed || null;
    } catch (error) {
      console.error('Error getting podcast by ID:', error);
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const podcastKeys = keys.filter(key => key.startsWith('podcast_api:'));
      await AsyncStorage.multiRemove(podcastKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const memorySize = this.memoryCache.size;
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const podcastKeys = keys.filter(key => key.startsWith('podcast_api:'));
      return {
        memoryCache: memorySize,
        persistentCache: podcastKeys.length,
        isOnline: this.isOnline
      };
    } catch (error) {
      return {
        memoryCache: memorySize,
        persistentCache: 0,
        isOnline: this.isOnline
      };
    }
  }
}

// Create a singleton instance
let clientInstance = null;

const getClientInstance = () => {
  if (!clientInstance) {
    clientInstance = new ExpoPodcastIndexClient();
  }
  return clientInstance;
};

// API Functions that your HomeScreen expects
export const getTrendingPodcastsAPI = async (limit = 20) => {
  try {
    const client = getClientInstance();
    const podcasts = await client.getTrendingPodcasts(limit);
    return podcasts.map(transformPodcastData);
  } catch (error) {
    console.error('getTrendingPodcastsAPI error:', error);
    throw error;
  }
};

export const getRecentEpisodesAPI = async (limit = 50) => {
  try {
    const client = getClientInstance();
    const episodes = await client.getRecentEpisodes(limit);
    return episodes.map(episode => transformEpisodeData(episode, episode.feedId));
  } catch (error) {
    console.error('getRecentEpisodesAPI error:', error);
    throw error;
  }
};

export const getPodcastsByCategoryAPI = async (category, limit = 20) => {
  try {
    const client = getClientInstance();
    const podcasts = await client.getPodcastsByCategory(category, limit);
    return podcasts.map(transformPodcastData);
  } catch (error) {
    console.error('getPodcastsByCategoryAPI error:', error);
    throw error;
  }
};

// New API function to get available categories
export const getAvailableCategoriesAPI = async () => {
  try {
    const client = getClientInstance();
    return await client.getAvailableCategories();
  } catch (error) {
    console.error('getAvailableCategoriesAPI error:', error);
    throw error;
  }
};

// Global state for currently playing episode
let currentlyPlayingId = null;

export const setCurrentlyPlaying = (episodeId) => {
  currentlyPlayingId = episodeId;
};

export const getCurrentlyPlaying = () => {
  return currentlyPlayingId;
};

// React Hook for using the client
import { useState, useEffect, useRef } from 'react';

export const usePodcastClient = () => {
  const clientRef = useRef(null);
  
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = getClientInstance();
    }
  }, []);

  return clientRef.current;
};

// Hook for podcast search with loading states
export const usePodcastSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const client = usePodcastClient();

  const searchPodcasts = async (query) => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const podcasts = await client.searchPodcasts(query);
      const transformedPodcasts = podcasts.map(transformPodcastData);
      setResults(transformedPodcasts);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return { searchPodcasts, results, loading, error, clearResults };
};

// Hook for trending podcasts
export const useTrendingPodcasts = () => {
  const [loading, setLoading] = useState(false);
  const [podcasts, setPodcasts] = useState([]);
  const [error, setError] = useState(null);
  const client = usePodcastClient();

  const fetchTrending = async (limit = 20) => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const trendingPodcasts = await client.getTrendingPodcasts(limit);
      const transformedPodcasts = trendingPodcasts.map(transformPodcastData);
      setPodcasts(transformedPodcasts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [client]);

  return { podcasts, loading, error, refetch: fetchTrending };
};

// Hook for podcast episodes
export const usePodcastEpisodes = (feedId) => {
  const [loading, setLoading] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [error, setError] = useState(null);
  const client = usePodcastClient();

  const fetchEpisodes = async (limit = 50) => {
    if (!client || !feedId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const podcastEpisodes = await client.getPodcastEpisodes(feedId, limit);
      const transformedEpisodes = podcastEpisodes.map(episode => transformEpisodeData(episode, feedId));
      setEpisodes(transformedEpisodes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, [feedId, client]);

  return { episodes, loading, error, refetch: fetchEpisodes };
};

// New hook for podcasts by category
export const usePodcastsByCategory = (category) => {
  const [loading, setLoading] = useState(false);
  const [podcasts, setPodcasts] = useState([]);
  const [error, setError] = useState(null);
  const client = usePodcastClient();

  const fetchPodcastsByCategory = async (limit = 20) => {
    if (!client || !category) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const categoryPodcasts = await client.getPodcastsByCategory(category, limit);
      const transformedPodcasts = categoryPodcasts.map(transformPodcastData);
      setPodcasts(transformedPodcasts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchPodcastsByCategory();
    }
  }, [category, client]);

  return { podcasts, loading, error, refetch: fetchPodcastsByCategory };
};

// Data transformation utilities
export const transformPodcastData = (podcastIndexData) => {
  if (!podcastIndexData) return null;
  
  return {
    id: `pi_${podcastIndexData.id}`,
    title: podcastIndexData.title || 'Unknown Title',
    author: podcastIndexData.author || podcastIndexData.ownerName || 'Unknown Author',
    description: podcastIndexData.description || '',
    image: { 
      uri: podcastIndexData.image || podcastIndexData.artwork || 'https://via.placeholder.com/300x300/cccccc/ffffff?text=No+Image'
    },
    category: podcastIndexData.categories ? Object.keys(podcastIndexData.categories)[0] : 'Unknown',
    duration: 'Various',
    rating: Math.round((Math.random() * 1.0 + 4.0) * 10) / 10,
    episodeCount: podcastIndexData.episodeCount || 0,
    url: podcastIndexData.url || '',
    feedUrl: podcastIndexData.url || '',
    language: podcastIndexData.language || 'en',
    explicit: podcastIndexData.explicit || false,
    lastUpdate: podcastIndexData.lastUpdateTime ? new Date(podcastIndexData.lastUpdateTime * 1000) : new Date(),
    source: 'podcastindex'
  };
};

export const transformEpisodeData = (episodeData, podcastId) => {
  if (!episodeData) return null;
  
  return {
    id: `pie_${episodeData.id}`,
    title: episodeData.title || 'Untitled Episode',
    podcastId: podcastId,
    author: episodeData.author || episodeData.feedTitle || 'Unknown Author',
    description: episodeData.description || '',
    image: { 
      uri: episodeData.image || episodeData.feedImage || 'https://via.placeholder.com/300x300/cccccc/ffffff?text=No+Image'
    },
    duration: episodeData.duration || 0,
    publishedDate: episodeData.datePublished || Date.now() / 1000,
    publishedTimestamp: episodeData.datePublished || Date.now() / 1000,
    audioUrl: episodeData.enclosureUrl || '',
    audioSource: episodeData.enclosureUrl || '',
    audioType: episodeData.enclosureType || 'audio/mpeg',
    source: 'podcastindex',
    metadata: {
      audioSource: episodeData.enclosureUrl || '',
      plays: Math.floor(Math.random() * 1000)
    }
  };
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

export default ExpoPodcastIndexClient;