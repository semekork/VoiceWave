// Standardized Podcast Data Structure
// All podcast objects follow this standard format:
// {
//   id: string,
//   title: string,
//   subtitle?: string,
//   author: string,
//   description?: string,
//   image: { uri: string },
//   category: string,
//   duration?: string,
//   rating?: number,
//   episodeCount?: number,
//   publishedDate?: string,
//   isNew?: boolean,
//   isSubscribed?: boolean,
//   tags?: string[],
//   level?: string,
//   metadata?: object // for additional fields like plays, progress, etc.
// }

// Main podcast collection
export const podcasts = [
  {
    id: "1",
    title: "Gratitude",
    author: "Anendlessocean",
    description: "A soothing podcast about finding gratitude in everyday moments",
    image: { uri: 'https://picsum.photos/400/400?random=crime' },
    category: "Health & Wellness",
    duration: "25m avg",
    rating: 4.8,
    episodeCount: 50,
    isNew: false,
    isSubscribed: true,
    tags: ["Gratitude", "Mindfulness", "Wellness"],
    level: "All Levels",
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
    isNew: false,
    isSubscribed: true,
    tags: ["Ambient", "Relaxation", "Peace"],
    level: "All Levels",
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
    isNew: false,
    isSubscribed: true,
    tags: ["Focus", "Productivity", "Music"],
    level: "All Levels",
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
    episodeCount: 325,
    isNew: false,
    isSubscribed: true,
    tags: ["True Crime", "Investigation", "Mystery"],
    level: "All Levels"
  },
  {
    id: "5",
    title: "The Daily",
    author: "The New York Times",
    description: "This is how the news should sound. Twenty minutes a day, five days a week, hosted by Michael Barbaro and powered by New York Times journalism.",
    image: { uri: 'https://picsum.photos/400/400?random=daily' },
    category: "News",
    duration: "20m avg",
    rating: 4.8,
    episodeCount: 1250,
    isNew: false,
    isSubscribed: true,
    tags: ["News", "Politics", "Current Events"],
    level: "All Levels",
    metadata: {
      badge: 'EXCLUSIVE'
    }
  },
  {
    id: "6",
    title: "The Joe Rogan Experience",
    author: "Joe Rogan",
    description: "The Joe Rogan Experience podcast is a long form conversation hosted by comedian Joe Rogan.",
    image: { uri: 'https://picsum.photos/400/400?random=rogan' },
    category: "Comedy",
    duration: "2h 30m avg",
    rating: 4.5,
    episodeCount: 2000,
    isNew: false,
    isSubscribed: false,
    tags: ["Comedy", "Interview", "Entertainment"],
    level: "All Levels",
    metadata: {
      badge: 'POPULAR'
    }
  },
  {
    id: "7",
    title: "Conan O'Brien Needs a Friend",
    author: "Team Coco & Earwolf",
    description: "After 25 years at the Late Night desk, Conan realized that the only people at his holiday party are the men and women who work for him.",
    image: { uri: 'https://picsum.photos/400/400?random=conan' },
    category: "Comedy",
    duration: "45m avg",
    rating: 4.6,
    episodeCount: 180,
    isNew: false,
    isSubscribed: false,
    tags: ["Comedy", "Celebrity", "Interview"],
    level: "All Levels",
    metadata: {
      badge: 'AWARD WINNER'
    }
  },
  {
    id: "8",
    title: "Serial",
    author: "Serial Productions",
    description: "Serial tells one story - a true story - over the course of a whole season.",
    image: { uri: 'https://picsum.photos/200/200?random=serial' },
    category: "True Crime",
    duration: "40m avg",
    rating: 4.9,
    episodeCount: 50,
    isNew: false,
    isSubscribed: false,
    tags: ["True Crime", "Investigation", "Documentary"],
    level: "All Levels"
  },
  {
    id: "9",
    title: "This American Life",
    author: "This American Life",
    description: "Each week we choose a theme and put together different kinds of stories on that theme.",
    image: { uri: 'https://picsum.photos/200/200?random=american' },
    category: "Society & Culture",
    duration: "60m avg",
    rating: 4.8,
    episodeCount: 800,
    isNew: false,
    isSubscribed: false,
    tags: ["Stories", "Culture", "Documentary"],
    level: "All Levels"
  },
  {
    id: "10",
    title: "Stuff You Should Know",
    author: "iHeartPodcasts",
    description: "If you've ever wanted to know about champagne, satanism, the Stonewall Uprising, chaos theory, LSD, El Nino, true crime and Rosa Parks, then look no further.",
    image: { uri: 'https://picsum.photos/200/200?random=stuff' },
    category: "Education",
    duration: "45m avg",
    rating: 4.7,
    episodeCount: 1500,
    isNew: false,
    isSubscribed: false,
    tags: ["Education", "General Knowledge", "Learning"],
    level: "All Levels"
  },
  {
    id: "11",
    title: "My Favorite Murder",
    author: "Exactly Right",
    description: "Karen Kilgariff and Georgia Hardstark hit the road and talk to folks about their hometown murders.",
    image: { uri: 'https://picsum.photos/200/200?random=murder' },
    category: "True Crime",
    duration: "90m avg",
    rating: 4.5,
    episodeCount: 400,
    isNew: false,
    isSubscribed: false,
    tags: ["True Crime", "Comedy", "Murder"],
    level: "All Levels"
  },
  {
    id: "12",
    title: "The Michelle Obama Podcast",
    author: "Spotify Studios",
    description: "The Michelle Obama Podcast features intimate and inspiring conversations between Michelle Obama and her guests.",
    image: { uri: 'https://picsum.photos/200/200?random=obama' },
    category: "Society & Culture",
    duration: "50m avg",
    rating: 4.8,
    episodeCount: 25,
    isNew: false,
    isSubscribed: false,
    tags: ["Inspiration", "Leadership", "Culture"],
    level: "All Levels"
  },
  {
    id: "13",
    title: "Radiolab",
    author: "WNYC Studios",
    description: "Investigating the strange, wonderful, and complicated realities of our world.",
    image: { uri: 'https://picsum.photos/200/200?random=radiolab' },
    category: "Science",
    duration: "60m avg",
    rating: 4.9,
    episodeCount: 400,
    isNew: false,
    isSubscribed: false,
    tags: ["Science", "Philosophy", "Storytelling"],
    level: "All Levels"
  },
  {
    id: "14",
    title: "SmartLess",
    author: "Jason Bateman, Sean Hayes, Will Arnett",
    description: "A podcast that connects and unites people from all walks of life to learn about shared experiences through thoughtful dialogue and organic hilarity.",
    image: { uri: 'https://picsum.photos/200/200?random=smartless' },
    category: "Comedy",
    duration: "60m avg",
    rating: 4.4,
    episodeCount: 200,
    isNew: false,
    isSubscribed: false,
    tags: ["Comedy", "Celebrity", "Interview"],
    level: "All Levels"
  },
  {
    id: "15",
    title: "The Dropout",
    author: "ABC News",
    description: "The story of Elizabeth Holmes and the fall of her startup Theranos.",
    image: { uri: 'https://picsum.photos/200/200?random=dropout' },
    category: "True Crime",
    duration: "45m avg",
    rating: 4.7,
    episodeCount: 15,
    isNew: true,
    isSubscribed: false,
    tags: ["Business", "Fraud", "Investigation"],
    level: "All Levels"
  },
  {
    id: "16",
    title: "Call Her Daddy",
    author: "Alex Cooper",
    description: "Your host Alex Cooper gives you an unfiltered look into her life.",
    image: { uri: 'https://picsum.photos/200/200?random=daddy' },
    category: "Society & Culture",
    duration: "75m avg",
    rating: 4.2,
    episodeCount: 300,
    isNew: false,
    isSubscribed: false,
    tags: ["Lifestyle", "Relationships", "Entertainment"],
    level: "All Levels"
  },
  {
    id: "17",
    title: "WTF with Marc Maron",
    author: "Marc Maron",
    description: "Marc Maron welcomes comedians, actors, directors, writers, authors, musicians and folks from all walks of life.",
    image: { uri: 'https://picsum.photos/200/200?random=wtf' },
    category: "Comedy",
    duration: "90m avg",
    rating: 4.5,
    episodeCount: 1400,
    isNew: false,
    isSubscribed: false,
    tags: ["Comedy", "Interview", "Entertainment"],
    level: "All Levels"
  },
  {
    id: "18",
    title: "Mindful Mornings",
    author: "Sarah Johnson",
    description: "Start your day with intention through guided meditations and mindful practices.",
    image: { uri: 'https://picsum.photos/200/200?random=note1' },
    category: "Health & Wellness",
    duration: "15m avg",
    rating: 4.6,
    episodeCount: 12,
    isNew: true,
    isSubscribed: false,
    tags: ["Meditation", "Morning Routine", "Mindfulness"],
    level: "Beginner"
  },
  {
    id: "19",
    title: "Tech Decoded",
    author: "Alex Chen",
    description: "Understanding the digital world through simple explanations of complex technology.",
    image: { uri: 'https://picsum.photos/200/200?random=note2' },
    category: "Technology",
    duration: "30m avg",
    rating: 4.5,
    episodeCount: 8,
    isNew: true,
    isSubscribed: false,
    tags: ["Technology", "Education", "Digital"],
    level: "Intermediate"
  },
  {
    id: "20",
    title: "Urban Legends Uncovered",
    author: "Maya Rodriguez",
    description: "Exploring myths and mysteries from around the world.",
    image: { uri: 'https://picsum.photos/200/200?random=note3' },
    category: "Society & Culture",
    duration: "40m avg",
    rating: 4.7,
    episodeCount: 15,
    isNew: true,
    isSubscribed: false,
    tags: ["Mythology", "Culture", "History"],
    level: "All Levels"
  },
  {
    id: "21",
    title: "The Daily Meditation Podcast",
    author: "Mary Meckley",
    description: "Daily guided meditations for inner peace and mindfulness.",
    image: { uri: 'https://picsum.photos/200/200?random=2' },
    category: "Health & Wellness",
    duration: "15m avg",
    rating: 4.8,
    episodeCount: 500,
    isNew: false,
    isSubscribed: true,
    tags: ["Meditation", "Mindfulness", "Wellness"],
    level: "Beginner"
  },
  {
    id: "22",
    title: "Hardcore History",
    author: "Dan Carlin",
    description: "In-depth exploration of historical events and their impact.",
    image: { uri: 'https://picsum.photos/200/200?random=3' },
    category: "History",
    duration: "4h avg",
    rating: 4.9,
    episodeCount: 75,
    isNew: false,
    isSubscribed: false,
    tags: ["History", "Education", "Documentary"],
    level: "Intermediate"
  },
  {
    id: "23",
    title: "Coffee Break Languages",
    author: "Radio Lingua Network",
    description: "Learn languages in short, daily lessons.",
    image: { uri: 'https://picsum.photos/200/200?random=4' },
    category: "Education",
    duration: "20m avg",
    rating: 4.7,
    episodeCount: 200,
    isNew: false,
    isSubscribed: false,
    tags: ["Languages", "Education", "Learning"],
    level: "All Levels"
  },
  
];

// Standardized Episodes Structure
export const episodes = [
  {
    id: '1',
    title: 'The Mystery of the Missing Heiress',
    podcastId: '4', // Crime Junkie
    author: 'audiochuck',
    description: 'A deep dive into a decades-old missing person case.',
    image: { uri: 'https://picsum.photos/200/200?random=ep1' },
    category: 'True Crime',
    duration: '45m',
    publishedDate: '2 days ago',
    isNew: true,
    rating: 4.8,
    metadata: {
      plays: '2.3M',
      progress: 0,
      isDownloaded: false,
      isSaved: false
    }
  },
  {
    id: '2',
    title: 'Breaking: Major Economic Changes',
    podcastId: '5', // The Daily
    author: 'The New York Times',
    description: 'Analysis of recent economic developments and their implications.',
    image: { uri: 'https://picsum.photos/200/200?random=ep2' },
    category: 'News',
    duration: '20m',
    publishedDate: '1 day ago',
    isNew: true,
    rating: 4.6,
    metadata: {
      plays: '1.8M',
      progress: 0,
      isDownloaded: false,
      isSaved: false
    }
  },
  {
    id: '3',
    title: 'Interview with Tech Entrepreneur',
    podcastId: '6', // Joe Rogan
    author: 'Joe Rogan',
    description: 'A fascinating conversation about the future of technology.',
    image: { uri: 'https://picsum.photos/200/200?random=ep3' },
    category: 'Technology',
    duration: '2h 15m',
    publishedDate: '3 days ago',
    isNew: false,
    rating: 4.7,
    metadata: {
      plays: '3.1M',
      progress: 0,
      isDownloaded: false,
      isSaved: false
    }
  },
  {
    id: '4',
    title: 'Latest Investigation Update',
    podcastId: '4', // Crime Junkie
    author: 'audiochuck',
    description: 'New developments in an ongoing investigation.',
    image: { uri: 'https://picsum.photos/200/200?random=new1' },
    category: 'True Crime',
    duration: '52m',
    publishedDate: '3 hours ago',
    isNew: true,
    rating: 4.8,
    metadata: {
      plays: '500K',
      progress: 0,
      isDownloaded: false,
      isSaved: false
    }
  },
  {
    id: '5',
    title: 'AI Revolution Continues',
    podcastId: '19', // Tech Decoded
    author: 'Alex Chen',
    description: 'Exploring the latest developments in artificial intelligence.',
    image: { uri: 'https://picsum.photos/200/200?random=new3' },
    category: 'Technology',
    duration: '33m',
    publishedDate: '8 hours ago',
    isNew: true,
    rating: 4.6,
    metadata: {
      plays: '200K',
      progress: 0,
      isDownloaded: false,
      isSaved: false
    }
  },
  {
    id: '6',
    title: 'The Future of Learning Technology',
    podcastId: '19', // Tech Decoded
    author: 'Alex Chen',
    description: 'How technology is transforming education.',
    image: { uri: 'https://picsum.photos/200/200?random=recent1' },
    category: 'Education',
    duration: '42m',
    publishedDate: '2 days ago',
    isNew: false,
    rating: 4.5,
    metadata: {
      plays: '150K',
      progress: 0.28,
      playedDuration: '12m',
      isDownloaded: false,
      isSaved: false
    }
  },
  {
    id: '7',
    title: 'Ancient Rome: Rise and Fall',
    podcastId: '22', // Hardcore History
    author: 'Dan Carlin',
    description: 'A comprehensive look at the Roman Empire.',
    image: { uri: 'https://picsum.photos/200/200?random=recent2' },
    category: 'History',
    duration: '55m',
    publishedDate: '1 week ago',
    isNew: false,
    rating: 4.9,
    metadata: {
      plays: '800K',
      progress: 1.0,
      playedDuration: '55m',
      isDownloaded: false,
      isSaved: false,
      isCompleted: true
    }
  },
  {
    id: '8',
    title: 'Meditation for Beginners',
    podcastId: '21', // Daily Meditation
    author: 'Mary Meckley',
    description: 'A gentle introduction to meditation practice.',
    image: { uri: 'https://picsum.photos/200/200?random=recent3' },
    category: 'Health & Wellness',
    duration: '25m',
    publishedDate: '3 days ago',
    isNew: false,
    rating: 4.8,
    metadata: {
      plays: '300K',
      progress: 0.72,
      playedDuration: '18m',
      isDownloaded: false,
      isSaved: false,
      isPlaying: true
    }
  }
];

// Categories with consistent structure
export const categories = [
  {
    id: '1',
    title: 'Arts',
    description: 'Creative expressions and artistic discussions',
    color: '#FF3B30',
    gradient: ['#FF6B6B', '#FF8E8E'],
    image: { uri: 'https://picsum.photos/400/300?random=arts' },
    podcastCount: 25
  },
  {
    id: '2',
    title: 'Business',
    description: 'Entrepreneurship, finance, and business insights',
    color: '#007AFF',
    gradient: ['#007AFF', '#4DA6FF'],
    image: { uri: 'https://picsum.photos/400/300?random=business' },
    podcastCount: 45
  },
  {
    id: '3',
    title: 'Comedy',
    description: 'Humor, entertainment, and comedic discussions',
    color: '#FF9500',
    gradient: ['#FF9500', '#FFB84D'],
    image: { uri: 'https://picsum.photos/400/300?random=comedy' },
    podcastCount: 38
  },
  {
    id: '4',
    title: 'Education',
    description: 'Learning, knowledge, and educational content',
    color: '#34C759',
    gradient: ['#34C759', '#5DD879'],
    image: { uri: 'https://picsum.photos/400/300?random=education' },
    podcastCount: 62
  },
  {
    id: '5',
    title: 'Health & Wellness',
    description: 'Mental health, fitness, and wellbeing',
    color: '#FF2D92',
    gradient: ['#FF2D92', '#FF5CB8'],
    image: { uri: 'https://picsum.photos/400/300?random=health' },
    podcastCount: 55
  },
  {
    id: '6',
    title: 'History',
    description: 'Historical events, people, and periods',
    color: '#5856D6',
    gradient: ['#5856D6', '#7B7AE0'],
    image: { uri: 'https://picsum.photos/400/300?random=history' },
    podcastCount: 33
  },
  {
    id: '7',
    title: 'News',
    description: 'Current events and news analysis',
    color: '#5AC8FA',
    gradient: ['#5AC8FA', '#7DD3FC'],
    image: { uri: 'https://picsum.photos/400/300?random=news' },
    podcastCount: 41
  },
  {
    id: '8',
    title: 'Science',
    description: 'Scientific discoveries and research',
    color: '#30D158',
    gradient: ['#30D158', '#5DE682'],
    image: { uri: 'https://picsum.photos/400/300?random=science' },
    podcastCount: 29
  },
  {
    id: '9',
    title: 'Self Development',
    description: 'Personal growth and self-improvement',
    color: '#AF52DE',
    gradient: ['#AF52DE', '#C478E8'],
    image: { uri: 'https://picsum.photos/400/300?random=selfdev' },
    podcastCount: 47
  },
  {
    id: '10',
    title: 'Society & Culture',
    description: 'Social issues and cultural discussions',
    color: '#BF5AF2',
    gradient: ['#BF5AF2', '#CF7EF5'],
    image: { uri: 'https://picsum.photos/400/300?random=society' },
    podcastCount: 52
  },
  {
    id: '11',
    title: 'Technology',
    description: 'Tech news, innovation, and digital trends',
    color: '#64D2FF',
    gradient: ['#64D2FF', '#85DDFF'],
    image: { uri: 'https://picsum.photos/400/300?random=technology' },
    podcastCount: 36
  },
  {
    id: '12',
    title: 'True Crime',
    description: 'Criminal investigations and true crime stories',
    color: '#FF453A',
    gradient: ['#FF453A', '#FF6B62'],
    image: { uri: 'https://picsum.photos/400/300?random=truecrime' },
    podcastCount: 43
  }
];

// Collections with consistent structure
export const collections = [
  {
    id: '1',
    title: 'True Crime Essentials',
    description: 'The best true crime podcasts for mystery lovers',
    image: { uri: 'https://picsum.photos/200/200?random=feat1' },
    color: '#9C3141',
    podcastIds: ['4', '8', '11', '15'],
    showCount: 15,
    category: 'True Crime'
  },
  {
    id: '2',
    title: 'Comedy Gold',
    description: 'Laugh-out-loud podcast moments and comedic genius',
    image: { uri: 'https://picsum.photos/200/200?random=feat2' },
    color: '#262726',
    podcastIds: ['6', '7', '14', '17'],
    showCount: 12,
    category: 'Comedy'
  },
  {
    id: '3',
    title: 'News & Politics',
    description: 'Stay informed with these essential news shows',
    image: { uri: 'https://picsum.photos/200/200?random=feat3' },
    color: '#9C3141',
    podcastIds: ['5'],
    showCount: 18,
    category: 'News'
  },
  {
    id: '4',
    title: 'Science & Innovation',
    description: 'Explore the world of science and technology',
    image: { uri: 'https://picsum.photos/200/200?random=feat4' },
    color: '#262726',
    podcastIds: ['13', '19', '24'],
    showCount: 10,
    category: 'Science'
  }
];

// User Library Data
export const userLibrary = {
  downloaded: episodes.slice(0, 4).map(ep => ({
    ...ep,
    metadata: {
      ...ep.metadata,
      isDownloaded: true,
      fileSize: '35.2 MB',
      downloadDate: 'Yesterday'
    }
  })),
  recentlyPlayed: episodes.slice(4, 8),
  subscriptions: podcasts.filter(p => p.isSubscribed),
  saved: episodes.slice(0, 3).map(ep => ({
    ...ep,
    metadata: {
      ...ep.metadata,
      isSaved: true,
      savedDate: '2 days ago'
    }
  }))
};

// Library sections configuration
export const librarySections = [
  {
    id: 'downloaded',
    title: 'Downloaded',
    icon: 'arrow-down-circle',
    count: userLibrary.downloaded.length,
    showCount: true,
    route: 'Downloaded'
  },
  {
    id: 'recently_played',
    title: 'Recently Played',
    icon: 'time',
    count: userLibrary.recentlyPlayed.length,
    showCount: false,
    route: 'RecentlyPlayed'
  },
  {
    id: 'shows',
    title: 'Shows',
    icon: 'mic',
    count: userLibrary.subscriptions.length,
    showCount: true,
    route: 'Shows'
  },
  {
    id: 'saved_episodes',
    title: 'Saved Episodes',
    icon: 'bookmark',
    count: userLibrary.saved.length,
    showCount: true,
    route: 'SavedEpisodes'
  },
  {
    id: 'stations',
    title: 'Stations',
    icon: 'radio',
    showCount: false,
    route: 'Stations'
  }
];

// Search and recommendation data
export const searchSuggestions = [
  'Crime Junkie', 'The Daily', 'Joe Rogan', 'Serial', 'True Crime',
  'Comedy', 'News', 'Business', 'Technology', 'Health', 'Education',
  'History', 'Science', 'Meditation', 'Self Development'
];

export const trendingSearches = [
  'Science & Nature', 'History & Culture', 'Language Learning',
  'Mental Health', 'Philosophy', 'Mathematics', 'Self Development',
  'Health & Wellness', 'Psychology', 'Economics', 'Literature', 'Meditation'
];

// Utility functions with standardized data
// Complete utility functions for podcast data management

export const getTrendingEpisodes = (limit = 10) => {
  return episodes
    .sort((a, b) => {
      // Sort by plays count (extracted from metadata.plays string)
      const getPlaysCount = (plays) => {
        if (!plays) return 0;
        const num = parseFloat(plays);
        if (plays.includes('M')) return num * 1000000;
        if (plays.includes('K')) return num * 1000;
        return num;
      };
      
      const aPlays = getPlaysCount(a.metadata?.plays);
      const bPlays = getPlaysCount(b.metadata?.plays);
      return bPlays - aPlays;
    })
    .slice(0, limit);
};

export const getRecentEpisodes = (limit = 10) => {
  return episodes
    .sort((a, b) => {
      // Sort by published date (newest first)
      const getDateValue = (dateString) => {
        if (dateString.includes('hour')) return new Date().getTime() - (parseInt(dateString) * 60 * 60 * 1000);
        if (dateString.includes('day')) return new Date().getTime() - (parseInt(dateString) * 24 * 60 * 60 * 1000);
        if (dateString.includes('week')) return new Date().getTime() - (parseInt(dateString) * 7 * 24 * 60 * 60 * 1000);
        return new Date().getTime();
      };
      
      return getDateValue(a.publishedDate) - getDateValue(b.publishedDate);
    })
    .slice(0, limit);
};

export const getNewEpisodes = (limit = 10) => {
  return episodes
    .filter(episode => episode.isNew)
    .sort((a, b) => {
      // Sort new episodes by published date
      const getDateValue = (dateString) => {
        if (dateString.includes('hour')) return new Date().getTime() - (parseInt(dateString) * 60 * 60 * 1000);
        if (dateString.includes('day')) return new Date().getTime() - (parseInt(dateString) * 24 * 60 * 60 * 1000);
        return new Date().getTime();
      };
      
      return getDateValue(a.publishedDate) - getDateValue(b.publishedDate);
    })
    .slice(0, limit);
};

export const getSubscribedPodcasts = () => {
  return podcasts.filter(podcast => podcast.isSubscribed);
};

export const getDownloadedEpisodes = () => {
  return episodes.filter(episode => episode.metadata?.isDownloaded);
};

export const getSavedEpisodes = () => {
  return episodes.filter(episode => episode.metadata?.isSaved);
};

export const getInProgressEpisodes = () => {
  return episodes.filter(episode => 
    episode.metadata?.progress && 
    episode.metadata.progress > 0 && 
    episode.metadata.progress < 1
  );
};

export const getCompletedEpisodes = () => {
  return episodes.filter(episode => 
    episode.metadata?.isCompleted || episode.metadata?.progress === 1
  );
};

export const getCurrentlyPlayingEpisode = () => {
  return episodes.find(episode => episode.metadata?.isPlaying);
};

export const searchPodcasts = (query, limit = 20) => {
  const searchTerm = query.toLowerCase();
  
  return podcasts.filter(podcast => 
    podcast.title.toLowerCase().includes(searchTerm) ||
    podcast.author.toLowerCase().includes(searchTerm) ||
    podcast.description?.toLowerCase().includes(searchTerm) ||
    podcast.category.toLowerCase().includes(searchTerm) ||
    podcast.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  ).slice(0, limit);
};

export const searchEpisodes = (query, limit = 20) => {
  const searchTerm = query.toLowerCase();
  
  return episodes.filter(episode => 
    episode.title.toLowerCase().includes(searchTerm) ||
    episode.author.toLowerCase().includes(searchTerm) ||
    episode.description?.toLowerCase().includes(searchTerm) ||
    episode.category.toLowerCase().includes(searchTerm)
  ).slice(0, limit);
};

export const searchAll = (query, limit = 20) => {
  const podcastResults = searchPodcasts(query, Math.ceil(limit / 2));
  const episodeResults = searchEpisodes(query, Math.ceil(limit / 2));
  
  return {
    podcasts: podcastResults,
    episodes: episodeResults,
    total: podcastResults.length + episodeResults.length
  };
};

export const getPodcastRecommendations = (basedOnPodcastId, limit = 10) => {
  const basePodcast = getPodcastById(basedOnPodcastId);
  if (!basePodcast) return [];
  
  return podcasts
    .filter(podcast => 
      podcast.id !== basedOnPodcastId && 
      (podcast.category === basePodcast.category ||
       podcast.tags?.some(tag => basePodcast.tags?.includes(tag)))
    )
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
};

export const getPodcastsByCategory = (categoryName) => {
  return podcasts.filter(podcast => podcast.category === categoryName);
};

export const getCategoryRecommendations = (categoryName, limit = 10) => {
  return getPodcastsByCategory(categoryName)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
};

export const getPopularPodcastsByCategory = (categoryName, limit = 10) => {
  return getPodcastsByCategory(categoryName)
    .sort((a, b) => (b.episodeCount || 0) - (a.episodeCount || 0))
    .slice(0, limit);
};

export const getPodcastStatistics = (podcastId) => {
  const podcast = getPodcastById(podcastId);
  const podcastEpisodes = getEpisodesByPodcast(podcastId);
  
  if (!podcast) return null;
  
  const totalPlays = podcastEpisodes.reduce((sum, episode) => {
    const plays = episode.metadata?.plays || '0';
    const num = parseFloat(plays);
    if (plays.includes('M')) return sum + (num * 1000000);
    if (plays.includes('K')) return sum + (num * 1000);
    return sum + num;
  }, 0);
  
  const averageRating = podcastEpisodes.length > 0 
    ? podcastEpisodes.reduce((sum, ep) => sum + (ep.rating || 0), 0) / podcastEpisodes.length 
    : podcast.rating || 0;
  
  return {
    id: podcast.id,
    title: podcast.title,
    totalEpisodes: podcastEpisodes.length,
    totalPlays,
    averageRating: Math.round(averageRating * 10) / 10,
    category: podcast.category,
    isSubscribed: podcast.isSubscribed,
    tags: podcast.tags || []
  };
};

export const getUserLibraryStats = () => {
  const subscribed = getSubscribedPodcasts().length;
  const downloaded = getDownloadedEpisodes().length;
  const saved = getSavedEpisodes().length;
  const inProgress = getInProgressEpisodes().length;
  const completed = getCompletedEpisodes().length;
  
  // Calculate total listening time
  const totalListeningTime = episodes
    .filter(ep => ep.metadata?.playedDuration)
    .reduce((total, ep) => {
      const duration = ep.metadata.playedDuration;
      const minutes = parseInt(duration);
      return total + minutes;
    }, 0);
  
  return {
    subscribed,
    downloaded,
    saved,
    inProgress,
    completed,
    totalListeningTime: `${Math.floor(totalListeningTime / 60)}h ${totalListeningTime % 60}m`
  };
};

export const getCollectionById = (id) => {
  return collections.find(collection => collection.id === id);
};

export const getCollectionPodcasts = (collectionId) => {
  const collection = getCollectionById(collectionId);
  if (!collection) return [];
  
  return collection.podcastIds.map(id => getPodcastById(id)).filter(Boolean);
};

export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
};

export const getPopularCategories = (limit = 6) => {
  return categories
    .sort((a, b) => (b.podcastCount || 0) - (a.podcastCount || 0))
    .slice(0, limit);
};

export const formatDuration = (duration) => {
  if (!duration) return '0m';
  
  const match = duration.match(/(\d+)h?\s*(\d+)?m?/);
  if (!match) return duration;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
};

export const formatPlaysCount = (plays) => {
  if (!plays) return '0';
  return plays;
};

export const formatPublishedDate = (dateString) => {
  // Convert relative date strings to more readable format
  if (dateString.includes('hour')) {
    const hours = parseInt(dateString);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (dateString.includes('day')) {
    const days = parseInt(dateString);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }
  if (dateString.includes('week')) {
    const weeks = parseInt(dateString);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  return dateString;
};

export const toggleSubscription = (podcastId) => {
  const podcastIndex = podcasts.findIndex(p => p.id === podcastId);
  if (podcastIndex !== -1) {
    podcasts[podcastIndex].isSubscribed = !podcasts[podcastIndex].isSubscribed;
    return podcasts[podcastIndex].isSubscribed;
  }
  return false;
};

export const toggleEpisodeSaved = (episodeId) => {
  const episodeIndex = episodes.findIndex(e => e.id === episodeId);
  if (episodeIndex !== -1) {
    if (!episodes[episodeIndex].metadata) {
      episodes[episodeIndex].metadata = {};
    }
    episodes[episodeIndex].metadata.isSaved = !episodes[episodeIndex].metadata.isSaved;
    return episodes[episodeIndex].metadata.isSaved;
  }
  return false;
};

export const updateEpisodeProgress = (episodeId, progress, playedDuration) => {
  const episodeIndex = episodes.findIndex(e => e.id === episodeId);
  if (episodeIndex !== -1) {
    if (!episodes[episodeIndex].metadata) {
      episodes[episodeIndex].metadata = {};
    }
    episodes[episodeIndex].metadata.progress = progress;
    episodes[episodeIndex].metadata.playedDuration = playedDuration;
    episodes[episodeIndex].metadata.isCompleted = progress >= 1;
    return true;
  }
  return false;
};

export const setCurrentlyPlaying = (episodeId) => {
  // Clear currently playing status from all episodes
  episodes.forEach(episode => {
    if (episode.metadata) {
      episode.metadata.isPlaying = false;
    }
  });
  
  // Set the new currently playing episode
  const episodeIndex = episodes.findIndex(e => e.id === episodeId);
  if (episodeIndex !== -1) {
    if (!episodes[episodeIndex].metadata) {
      episodes[episodeIndex].metadata = {};
    }
    episodes[episodeIndex].metadata.isPlaying = true;
    return true;
  }
  return false;
};

// Add these helper functions as well

export const getPodcastById = (id) => {
  return podcasts.find(podcast => podcast.id === id);
};

export const getEpisodesByPodcast = (podcastId) => {
  return episodes.filter(episode => episode.podcastId === podcastId);
};