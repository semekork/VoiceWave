// Data transformation utilities for podcast data
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