// API methods for the Podcast Index client
import PodcastIndexClient from './podcastIndexClient';

// Extend the client with API methods
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

  return client;
};