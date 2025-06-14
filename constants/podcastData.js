export const podcasts = [
  {
    id: "1",
    title: "Octagon",
    author: "Anendlessocean",
    description: "Anendlessocean's Octagon is a genre-bending debut that fuses R&B, gospel, and Afro-soul into a deeply personal sonic experience. With smooth vocals and introspective lyrics, he explores love, faith, and self-discovery across eight immersive tracks.",
    image: require("../assets/gratitude.jpeg"),
    category: "Gospel & Spirituality",
    duration: "25m avg",
    rating: 4.8,
    episodeCount: 8,
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },
  {
    id: "2",
    title: "Waves of Peace",
    author: "LoFi Ambience",
    description: "Relaxing ambient sounds and peaceful conversations designed to help you unwind and find your inner peace. Each episode features carefully curated soundscapes and guided meditations.",
    image: { uri: require("../assets/gratitude.jpeg") },
    category: "Health & Wellness",
    duration: "30m avg",
    rating: 4.6,
    episodeCount: 12,
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },
  {
    id: "3",
    title: "Focus Flow",
    author: "Deep Work Beats",
    description: "Music and techniques to enhance focus and productivity. Discover the science behind deep work and learn practical strategies to maximize your concentration and output.",
    image: { uri: require("../assets/gratitude.jpeg") },
    category: "Self Development",
    duration: "45m avg",
    rating: 4.7,
    episodeCount: 15,
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
  // Octagon by Anendlessocean Episodes
  {
    id: 'octagon_1',
    title: 'Gratitude',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'Opening with a prayer of thanksgiving, this track sets the tone for the entire album with its message of finding grace in everyday moments.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '4m 23s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.9,
    isNew: false,
    isPlayed: true,
    episodeNumber: 1,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Gratitude.mp3")
    }
  },
  {
    id: 'octagon_2',
    title: 'D2d',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'A delicate exploration of love and vulnerability, using the metaphor of flower petals to describe the fragility and beauty of human connection.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '3m 45s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.7,
    isNew: false,
    isPlayed: false,
    episodeNumber: 2,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/D2d.mp3")
    }
  },
  {
    id: 'octagon_3',
    title: 'Confidential',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'An introspective journey about the urge to escape when life becomes overwhelming, balanced with the realization that sometimes we must face our challenges.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '4m 12s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: false,
    isPlayed: false,
    episodeNumber: 3,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Confidential.mp3")
    }
  },
  {
    id: 'octagon_4',
    title: 'Jesus',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'A meditation on patience and trust in divine timing. This track explores the tension between human urgency and spiritual surrender.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '5m 01s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.6,
    isNew: false,
    isPlayed: false,
    episodeNumber: 4,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Jesus.mp3")
    }
  },
  {
    id: 'octagon_5',
    title: 'Juba',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'A smooth, R&B-influenced track that captures the feeling of driving along the coast, representing freedom and the journey of self-discovery.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '3m 58s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.9,
    isNew: false,
    isPlayed: false,
    episodeNumber: 5,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Juba.mp3")
    }
  },
  {
    id: 'octagon_6',
    title: 'Lnb',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'An intimate exploration of solitude versus loneliness, finding strength in being alone while acknowledging the human need for connection.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '4m 34s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.5,
    isNew: false,
    isPlayed: false,
    episodeNumber: 6,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Lnb.mp3")
    }
  },
  {
    id: 'octagon_7',
    title: 'P&A',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'A powerful track about being overwhelmed by life\'s pressures and finding the strength to rise above them through faith and perseverance.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '4m 47s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: false,
    isPlayed: false,
    episodeNumber: 7,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/P&A.mp3")
    }
  },
  {
    id: 'octagon_8',
    title: 'Signs',
    podcastId: '1',
    author: 'Anendlessocean',
    description: 'The album\'s closing statement, bringing together all the themes explored throughout the journey. A perfect octagon represents completion and infinity.',
    image: require("../assets/gratitude.jpeg"),
    category: 'Gospel & Spirituality',
    duration: '2m 56s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.7,
    isNew: false,
    isPlayed: false,
    episodeNumber: 8,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Signs.mp3")
    }
  },

  {
    id: 'octagon_9',
    title: 'Sori',
    podcastId: '1',
    author: 'Anenedlessocean',
    description: 'Start your day with peaceful sounds and guided meditation to center your mind and prepare for the day ahead.',
    image: { uri: require("../assets/gratitude.jpeg") },
    category: 'Health & Wellness',
    duration: '25m 30s',
    publishedDate: '2 days ago',
    publishedTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: true,
    isPlayed: false,
    
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/Sori.mp3")
    }
  },
  {
    id: 'octagon_10',
    title: 'System Euphoria',
    podcastId: '1',
    author: 'Anenedlessocean',
    description: 'Immerse yourself in the calming sounds of ocean waves combined with gentle rainfall for deep relaxation.',
    image: { uri: require("../assets/gratitude.jpeg") },
    category: 'Health & Wellness',
    duration: '45m 00s',
    publishedDate: '5 days ago',
    publishedTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    rating: 4.6,
    isNew: false,
    isPlayed: true,
    episodeNumber: 2,
    
    metadata: {
      audioSource: require("../assets/audio/anendlessocean/System Euphoria.mp3")
    }
  },

  // Waves of Peace Episodes
  {
    id: 'waves_1',
    title: 'Morning Meditation',
    podcastId: '2',
    author: 'LoFi Ambience',
    description: 'Start your day with peaceful sounds and guided meditation to center your mind and prepare for the day ahead.',
    image: { uri: require("../assets/gratitude.jpeg") },
    category: 'Health & Wellness',
    duration: '25m 30s',
    publishedDate: '2 days ago',
    publishedTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: true,
    isPlayed: false,
    episodeNumber: 1,
    
    metadata: {}

  },
  {
    id: 'waves_2',
    title: 'Ocean Waves for Relaxation',
    podcastId: '2',
    author: 'LoFi Ambience',
    description: 'Immerse yourself in the calming sounds of ocean waves combined with gentle rainfall for deep relaxation.',
    image: { uri: require("../assets/gratitude.jpeg") },
    category: 'Health & Wellness',
    duration: '45m 00s',
    publishedDate: '5 days ago',
    publishedTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    rating: 4.6,
    isNew: false,
    isPlayed: true,
    episodeNumber: 2,
    
    metadata: {
    }
  },

  // Focus Flow Episodes
  {
    id: 'focus_1',
    title: 'Deep Work Session #1',
    podcastId: '3',
    author: 'Deep Work Beats',
    description: 'Carefully curated instrumental music designed to enhance focus and productivity during intensive work sessions.',
    image: { uri: require("../assets/gratitude.jpeg") },
    category: 'Self Development',
    duration: '60m 00s',
    publishedDate: '3 days ago',
    publishedTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    rating: 4.7,
    isNew: true,
    isPlayed: false,
    episodeNumber: 1,
    
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },
  {
    id: 'focus_2',
    title: 'The Science of Concentration',
    podcastId: '3',
    author: 'Deep Work Beats',
    description: 'Understanding the neurological basis of focus and practical techniques to improve your concentration span.',
    image: { uri: require("../assets/gratitude.jpeg") },
    category: 'Self Development',
    duration: '35m 45s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.9,
    isNew: false,
    isPlayed: true,
    episodeNumber: 2,
    
    metadata: {
      audioSource: require("../assets/audio/Anendlessocean-Gratitude.mp3")
    }
  },

  // Crime Junkie Episodes
  {
    id: 'crime_1',
    title: 'The Mystery of the Missing Heiress',
    podcastId: '4',
    author: 'audiochuck',
    description: 'A deep dive into a decades-old missing person case that has baffled investigators and captivated the public.',
    image: { uri: 'https://picsum.photos/200/200?random=ep1' },
    category: 'True Crime',
    duration: '45m 12s',
    publishedDate: '2 days ago',
    publishedTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: true,
    isPlayed: false,
    episodeNumber: 325,
    season: 8
  },
  {
    id: 'crime_2',
    title: 'Latest Investigation Update',
    podcastId: '4',
    author: 'audiochuck',
    description: 'New developments in an ongoing investigation that could change everything we thought we knew.',
    image: { uri: 'https://picsum.photos/200/200?random=new1' },
    category: 'True Crime',
    duration: '52m 08s',
    publishedDate: '3 hours ago',
    publishedTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: true,
    isPlayed: false,
    episodeNumber: 326,
    season: 8
  },

  // The Daily Episodes
  {
    id: 'daily_1',
    title: 'Breaking: Major Economic Changes',
    podcastId: '5',
    author: 'The New York Times',
    description: 'Analysis of recent economic developments and their implications for everyday Americans.',
    image: { uri: 'https://picsum.photos/200/200?random=ep2' },
    category: 'News',
    duration: '20m 15s',
    publishedDate: '1 day ago',
    publishedTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    rating: 4.6,
    isNew: true,
    isPlayed: false,
    episodeNumber: 1250,
    season: 6
  },

  // Radiolab Episodes
  {
    id: 'radio_1',
    title: 'Science of Sound',
    podcastId: '9',
    author: 'WNYC Studios',
    description: 'Exploring how sound shapes our world and influences our daily experiences in ways we never imagined.',
    image: { uri: 'https://picsum.photos/200/200?random=recent3' },
    category: 'Science',
    duration: '55m 32s',
    publishedDate: '5 days ago',
    publishedTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    isNew: false,
    isPlayed: false,
    episodeNumber: 400,
    season: 20
  },

  // Hardcore History Episodes
  {
    id: 'history_1',
    title: 'Ancient Rome: Rise and Fall',
    podcastId: '10',
    author: 'Dan Carlin',
    description: 'A comprehensive look at the Roman Empire from its humble beginnings to its eventual collapse and lasting legacy.',
    image: { uri: 'https://picsum.photos/200/200?random=recent2' },
    category: 'History',
    duration: '4h 15m',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rating: 4.9,
    isNew: false,
    isPlayed: false,
    episodeNumber: 75,
    season: 1
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
  },
  {
    id: '9',
    title: 'Gospel & Spirituality',
    color: '#9C3141',
    podcastCount: 25
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
  'Comedy', 'News', 'Science', 'History', 'Health', 'Octagon', 'Anendlessocean'
];