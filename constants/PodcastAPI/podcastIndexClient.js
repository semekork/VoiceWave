// Core Podcast Index API client
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default class PodcastIndexClient {
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