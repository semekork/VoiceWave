// podcastApiMethod.js - API methods for PodcastIndexClient
import PodcastIndexClient from './podcastIndexClient';

// Singleton instance
let clientInstance = null;

/**
 * Get or create client instance
 */
export const getClientInstance = () => {
  if (!clientInstance) {
    clientInstance = new PodcastIndexClient();
    addApiMethods(clientInstance);
  }
  return clientInstance;
};

/**
 * Create a new client instance with custom config
 */
export const createClient = (apiKey, apiSecret, userAgent) => {
  const client = new PodcastIndexClient(apiKey, apiSecret, userAgent);
  return addApiMethods(client);
};

/**
 * Add API methods to the client instance
 */
export const addApiMethods = (client) => {
  /**
   * Search podcasts
   */
  client.searchPodcasts = async function(query, limit = 20) {
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
  };

  /**
   * Get trending podcasts
   */
  client.getTrendingPodcasts = async function(limit = 20) {
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
  };

  /**
   * Get podcast episodes
   */
  client.getPodcastEpisodes = async function(feedId, limit = 50) {
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
  };

  /**
   * Get recent episodes
   */
  client.getRecentEpisodes = async function(limit = 50) {
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
  };

  /**
   * Get available categories
   */
  client.getAvailableCategories = async function() {
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
  };

  /**
   * Get podcasts by category
   */
  client.getPodcastsByCategory = async function(category, limit = 20) {
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
  };

  /**
   * Get podcast by feed ID
   */
  client.getPodcastById = async function(feedId) {
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
  };

  /**
   * Search episodes
   */
  client.searchEpisodes = async function(query, limit = 20) {
    if (!query?.trim()) {
      throw new Error('Search query is required');
    }

    try {
      const response = await this.makeRequest('/search/byterm', {
        q: query.trim(),
        max: Math.min(limit, 40),
        fulltext: true
      });

      // Return both podcasts and episodes if available
      const podcasts = response.feeds || [];
      const episodes = response.items || [];
      
      return {
        podcasts,
        episodes,
        // Combined results for backward compatibility
        results: [
          ...podcasts.map(p => ({ ...p, type: 'podcast' })),
          ...episodes.map(e => ({ ...e, type: 'episode' }))
        ]
      };
    } catch (error) {
      console.error('Error searching episodes:', error);
      throw error;
    }
  };

  /**
   * Get stats about the client
   */
  client.getStats = async function() {
    try {
      const cacheStats = await this.getCacheStats();
      return {
        ...cacheStats,
        clientType: 'PodcastIndexClient',
        baseUrl: this.baseUrl
      };
    } catch (error) {
      console.error('Error getting client stats:', error);
      return {
        memoryCache: 0,
        persistentCache: 0,
        isOnline: true,
        clientType: 'PodcastIndexClient',
        baseUrl: this.baseUrl
      };
    }
  };

  return client;
};

export default getClientInstance;