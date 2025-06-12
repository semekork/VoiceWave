export const podcasts = [
  {
    id: "1",
    title: "Gratitude",
    author: "Anendlessocean",
    description: "A soothing podcast about finding gratitude in everyday moments",
    image: require("../assets/gratitude.jpeg"),
    category: "Gospel & Spirituality",
    duration: "25m avg",
    rating: 4.8,
    episodeCount: 50,
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },
  {
    id: "2",
    title: "Waves of Peace",
    author: "LoFi Ambience",
    description: "Relaxing ambient sounds and peaceful conversations",
    image: { uri: require("../assets/gratitude.jpeg") },
    category: "Health & Wellness",
    duration: "30m avg",
    rating: 4.6,
    episodeCount: 75,
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },
  {
    id: "3",
    title: "Focus Flow",
    author: "Deep Work Beats",
    description: "Music and techniques to enhance focus and productivity",
    image: { uri: require("../assets/gratitude.jpeg") },
    category: "Self Development",
    duration: "45m avg",
    rating: 4.7,
    episodeCount: 100,
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },
  {
    id: "4",
    title: "Crime Junkie",
    author: "audiochuck",
    description: "If you can never get enough true crime... Congratulations, you've found your people.",
    image: { uri: 'https://picsum.photos/400/400?random=crime' },
    category: "True Crime",
    duration: "45m avg",
    rating: 4.7,
    episodeCount: 325
  },
  {
    id: "5",
    title: "The Daily",
    author: "The New York Times",
    description: "This is how the news should sound. Twenty minutes a day, five days a week.",
    image: { uri: 'https://picsum.photos/400/400?random=daily' },
    category: "News",
    duration: "20m avg",
    rating: 4.8,
    episodeCount: 1250
  },
  {
    id: "6",
    title: "The Joe Rogan Experience",
    author: "Joe Rogan",
    description: "Long form conversations hosted by comedian Joe Rogan.",
    image: { uri: 'https://picsum.photos/400/400?random=rogan' },
    category: "Comedy",
    duration: "2h 30m avg",
    rating: 4.5,
    episodeCount: 2000
  },
  {
    id: "7",
    title: "Serial",
    author: "Serial Productions",
    description: "Serial tells one story - a true story - over the course of a whole season.",
    image: { uri: 'https://picsum.photos/200/200?random=serial' },
    category: "True Crime",
    duration: "40m avg",
    rating: 4.9,
    episodeCount: 50
  },
  {
    id: "8",
    title: "This American Life",
    author: "This American Life",
    description: "Each week we choose a theme and put together different kinds of stories on that theme.",
    image: { uri: 'https://picsum.photos/200/200?random=american' },
    category: "Society & Culture",
    duration: "60m avg",
    rating: 4.8,
    episodeCount: 800
  },
  {
    id: "9",
    title: "Radiolab",
    author: "WNYC Studios",
    description: "Investigating the strange, wonderful, and complicated realities of our world.",
    image: { uri: 'https://picsum.photos/200/200?random=radiolab' },
    category: "Science",
    duration: "60m avg",
    rating: 4.9,
    episodeCount: 400
  },
  {
    id: "10",
    title: "Hardcore History",
    author: "Dan Carlin",
    description: "In-depth exploration of historical events and their impact.",
    image: { uri: 'https://picsum.photos/200/200?random=3' },
    category: "History",
    duration: "4h avg",
    rating: 4.9,
    episodeCount: 75
  }
];


export const episodes = [
  {
    id: '1',
    title: 'The Mystery of the Missing Heiress',
    podcastId: '4',
    author: 'audiochuck',
    description: 'A deep dive into a decades-old missing person case.',
    image: { uri: 'https://picsum.photos/200/200?random=ep1' },
    category: 'True Crime',
    duration: '45m',
    publishedDate: '2 days ago',
    rating: 4.8
  },
  {
    id: '2',
    title: 'Breaking: Major Economic Changes',
    podcastId: '5',
    author: 'The New York Times',
    description: 'Analysis of recent economic developments and their implications.',
    image: { uri: 'https://picsum.photos/200/200?random=ep2' },
    category: 'News',
    duration: '20m',
    publishedDate: '1 day ago',
    rating: 4.6
  },
  {
    id: '3',
    title: 'Gratitude',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'A meditation on finding gratitude in daily life.',
    image: require('../assets/gratitude.jpeg'),
    category: 'Health & Wellness',
    duration: '25m',
    publishedDate: '3 days ago',
    rating: 4.7,
    metadata: {
      audioSource: require('../assets/audio/Anendlessocean-Gratitude.mp3')
    }
  },
  {
    id: '4',
    title: 'Latest Investigation Update',
    podcastId: '4',
    author: 'audiochuck',
    description: 'New developments in an ongoing investigation.',
    image: { uri: 'https://picsum.photos/200/200?random=new1' },
    category: 'True Crime',
    duration: '52m',
    publishedDate: '3 hours ago',
    rating: 4.8
  },
  {
    id: '5',
    title: 'Ancient Rome: Rise and Fall',
    podcastId: '10',
    author: 'Dan Carlin',
    description: 'A comprehensive look at the Roman Empire.',
    image: { uri: 'https://picsum.photos/200/200?random=recent2' },
    category: 'History',
    duration: '4h 15m',
    publishedDate: '1 week ago',
    rating: 4.9
  },
  {
    id: '6',
    title: 'Science of Sound',
    podcastId: '9',
    author: 'WNYC Studios',
    description: 'Exploring how sound shapes our world.',
    image: { uri: 'https://picsum.photos/200/200?random=recent3' },
    category: 'Science',
    duration: '55m',
    publishedDate: '5 days ago',
    rating: 4.8
  }
];


export const categories = [
  {
    id: '1',
    title: 'Comedy',
    color: '#FF9500',
    podcastCount: 38
  },
  {
    id: '2',
    title: 'Health & Wellness',
    color: '#FF2D92',
    podcastCount: 55
  },
  {
    id: '3',
    title: 'True Crime',
    color: '#FF453A',
    podcastCount: 43
  },
  {
    id: '4',
    title: 'News',
    color: '#5AC8FA',
    podcastCount: 41
  },
  {
    id: '5',
    title: 'Science',
    color: '#30D158',
    podcastCount: 29
  },
  {
    id: '6',
    title: 'History',
    color: '#5856D6',
    podcastCount: 33
  },
  {
    id: '7',
    title: 'Self Development',
    color: '#AF52DE',
    podcastCount: 47
  },
  {
    id: '8',
    title: 'Society & Culture',
    color: '#BF5AF2',
    podcastCount: 52
  }
];

export const getPodcastById = (id) => {
  return podcasts.find(podcast => podcast.id === id);
};

export const getEpisodeById = (id) => {
  return episodes.find(episode => episode.id === id);
};

export const getEpisodesByPodcast = (podcastId) => {
  return episodes.filter(episode => episode.podcastId === podcastId);
};

export const getPodcastsByCategory = (categoryName) => {
  return podcasts.filter(podcast => podcast.category === categoryName);
};

// New functions needed by HomeScreen
export const getTrendingEpisodes = (limit = 10) => {
  // Return episodes sorted by rating and recent activity
  return episodes
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit)
    .map(episode => ({
      ...episode,
      audioSource: episode.metadata?.audioSource || `https://example.com/audio/${episode.id}.mp3`
    }));
};

export const getNewEpisodes = (limit = 10) => {
  // Return most recent episodes marked as new or recently published
  return episodes
    .filter(episode => {
      const publishedDate = episode.publishedDate;
      return publishedDate.includes('hour') || publishedDate.includes('day') || publishedDate === '1 week ago';
    })
    .sort((a, b) => {
      const getDateValue = (dateString) => {
        if (dateString.includes('hour')) return new Date().getTime() - (parseInt(dateString) * 60 * 60 * 1000);
        if (dateString.includes('day')) return new Date().getTime() - (parseInt(dateString) * 24 * 60 * 60 * 1000);
        if (dateString.includes('week')) return new Date().getTime() - (parseInt(dateString) * 7 * 24 * 60 * 60 * 1000);
        return new Date().getTime();
      };
      return getDateValue(b.publishedDate) - getDateValue(a.publishedDate);
    })
    .slice(0, limit)
    .map(episode => ({
      ...episode,
      isNew: true,
      audioSource: episode.metadata?.audioSource || `https://example.com/audio/${episode.id}.mp3`
    }));
};

export const getInProgressEpisodes = (limit = 10) => {
  // Return episodes with simulated progress data
  return episodes
    .slice(0, limit)
    .map(episode => ({
      ...episode,
      metadata: {
        ...episode.metadata,
        progress: Math.random() * 0.8 + 0.1, // Random progress between 10% and 90%
        plays: Math.floor(Math.random() * 1000) + 100
      },
      audioSource: episode.metadata?.audioSource || `https://example.com/audio/${episode.id}.mp3`
    }));
};

export const getSubscribedPodcasts = (limit = 10) => {
  // Return a subset of podcasts as "subscribed"
  return podcasts
    .filter(podcast => podcast.rating >= 4.5) // High-rated podcasts as subscribed
    .slice(0, limit);
};

export const getCategoryRecommendations = (categoryName, limit = 10) => {
  // Get podcasts from the specified category
  return podcasts
    .filter(podcast => podcast.category === categoryName)
    .slice(0, limit);
};

// Currently playing state management
let currentlyPlayingId = null;

export const setCurrentlyPlaying = (episodeId) => {
  currentlyPlayingId = episodeId;
};

export const getCurrentlyPlaying = () => {
  return currentlyPlayingId;
};

// Utility functions for formatting
export const formatDuration = (duration) => {
  if (!duration) return '0m';
  return duration;
};

export const formatPublishedDate = (publishedDate) => {
  if (!publishedDate) return 'Unknown';
  return publishedDate;
};

// Search functions (from your original data)
export const getRecentEpisodes = (limit = 10) => {
  return episodes
    .sort((a, b) => {
      const getDateValue = (dateString) => {
        if (dateString.includes('hour')) return new Date().getTime() - (parseInt(dateString) * 60 * 60 * 1000);
        if (dateString.includes('day')) return new Date().getTime() - (parseInt(dateString) * 24 * 60 * 60 * 1000);
        if (dateString.includes('week')) return new Date().getTime() - (parseInt(dateString) * 7 * 24 * 60 * 60 * 1000);
        return new Date().getTime();
      };
      return getDateValue(b.publishedDate) - getDateValue(a.publishedDate);
    })
    .slice(0, limit);
};

export const searchPodcasts = (query, limit = 20) => {
  const searchTerm = query.toLowerCase();
  return podcasts.filter(podcast => 
    podcast.title.toLowerCase().includes(searchTerm) ||
    podcast.author.toLowerCase().includes(searchTerm) ||
    podcast.description?.toLowerCase().includes(searchTerm) ||
    podcast.category.toLowerCase().includes(searchTerm)
  ).slice(0, limit);
};

export const searchEpisodes = (query, limit = 20) => {
  const searchTerm = query.toLowerCase();
  return episodes.filter(episode => 
    episode.title.toLowerCase().includes(searchTerm) ||
    episode.author.toLowerCase().includes(searchTerm) ||
    episode.description?.toLowerCase().includes(searchTerm)
  ).slice(0, limit);
};

// Search suggestions
export const searchSuggestions = [
  'Crime Junkie', 'The Daily', 'Joe Rogan', 'Serial', 'True Crime',
  'Comedy', 'News', 'Science', 'History', 'Health'
];
