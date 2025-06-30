// React hooks for podcast functionality
import { useState, useEffect, useRef } from 'react';
import { getClientInstance } from './podcastApiMethod';
import { transformPodcastData, transformEpisodeData } from './dataTransformers';

// React Hook for using the client
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

// Hook for podcasts by category
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