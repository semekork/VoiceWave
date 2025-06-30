// Main API service with public API functions
import PodcastIndexClient from './podcastIndexClient';
import { addApiMethods } from './podcastApiMethod';
import { transformPodcastData, transformEpisodeData } from './dataTransformers';

// Create a singleton instance
let clientInstance = null;

export const getClientInstance = () => {
  if (!clientInstance) {
    const baseClient = new PodcastIndexClient();
    clientInstance = addApiMethods(baseClient);
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

// Search API function
export const searchPodcastsAPI = async (query, limit = 20) => {
  try {
    const client = getClientInstance();
    const podcasts = await client.searchPodcasts(query, limit);
    return podcasts.map(transformPodcastData);
  } catch (error) {
    console.error('searchPodcastsAPI error:', error);
    throw error;
  }
};

// Get podcast episodes API function
export const getPodcastEpisodesAPI = async (feedId, limit = 50) => {
  try {
    const client = getClientInstance();
    const episodes = await client.getPodcastEpisodes(feedId, limit);
    return episodes.map(episode => transformEpisodeData(episode, feedId));
  } catch (error) {
    console.error('getPodcastEpisodesAPI error:', error);
    throw error;
  }
};

// Get podcast by ID API function
export const getPodcastByIdAPI = async (feedId) => {
  try {
    const client = getClientInstance();
    const podcast = await client.getPodcastById(feedId);
    return podcast ? transformPodcastData(podcast) : null;
  } catch (error) {
    console.error('getPodcastByIdAPI error:', error);
    throw error;
  }
};