// Mock data for top episodes
export const topEpisodes = [
  {
    id: '1',
    title: 'The Mystery of the Missing Heiress',
    podcastTitle: 'Crime Junkie',
    host: 'audiochuck',
    image: { uri: 'https://picsum.photos/200/200?random=ep1' },
    duration: '45m',
    publishedDate: '2 days ago',
    isNew: true,
    plays: '2.3M',
  },
  {
    id: '2',
    title: 'Breaking: Major Economic Changes',
    podcastTitle: 'The Daily',
    host: 'The New York Times',
    image: { uri: 'https://picsum.photos/200/200?random=ep2' }, // Changed
    duration: '20m',
    publishedDate: '1 day ago',
    isNew: true,
    plays: '1.8M',
  },
  {
    id: '3',
    title: 'Interview with Tech Entrepreneur',
    podcastTitle: 'The Joe Rogan Experience',
    host: 'Joe Rogan',
    image: { uri: 'https://picsum.photos/200/200?random=ep3' }, // Changed
    duration: '2h 15m',
    publishedDate: '3 days ago',
    isNew: false,
    plays: '3.1M',
  },
];

// Mock data for new & noteworthy
export const newNoteworthy = [
  {
    id: '1',
    title: 'Mindful Mornings',
    subtitle: 'Start your day with intention',
    host: 'Sarah Johnson',
    image: { uri: 'https://picsum.photos/200/200?random=note1' },
    rating: 4.6,
    isNew: true,
    totalEpisodes: 12,
    gradient: ['#9C3141', '#262726'],
  },
  {
    id: '2',
    title: 'Tech Decoded',
    subtitle: 'Understanding the digital world',
    host: 'Alex Chen',
    image: { uri: 'https://picsum.photos/200/200?random=note2' }, // Changed
    rating: 4.5,
    isNew: true,
    totalEpisodes: 8,
    gradient: ['#262726', '#9C3141'],
  },
  {
    id: '3',
    title: 'Urban Legends Uncovered',
    subtitle: 'Exploring myths and mysteries',
    host: 'Maya Rodriguez',
    image: { uri: 'https://picsum.photos/200/200?random=note3' }, // Changed
    rating: 4.7,
    isNew: true,
    totalEpisodes: 15,
    gradient: ['#9C3141', '#262726'],
  },
];

// Mock data for featured collections
export const featuredCollections = [
  {
    id: '1',
    title: 'True Crime Essentials',
    description: 'The best true crime podcasts',
    showCount: 15,
    image: { uri: 'https://picsum.photos/200/200?random=feat1' },
    color: '#9C3141',
  },
  {
    id: '2',
    title: 'Comedy Gold',
    description: 'Laugh-out-loud podcast moments',
    showCount: 12,
    image: { uri: 'https://picsum.photos/200/200?random=feat2' }, // Changed
    color: '#262726',
  },
  {
    id: '3',
    title: 'News & Politics',
    description: 'Stay informed with these shows',
    showCount: 18,
    image: { uri: 'https://picsum.photos/200/200?random=feat3' }, // Changed
    color: '#9C3141',
  },
  {
    id: '4',
    title: 'Science & Tech',
    description: 'Explore the world of innovation',
    showCount: 10,
    image: { uri: 'https://picsum.photos/200/200?random=feat4' }, // Changed
    color: '#262726',
  },
];

// Mock data for you might like
export const youMightLike = [
  {
    id: '1',
    title: 'History Mysteries',
    host: 'Dr. Patricia Wells',
    image: { uri: 'https://picsum.photos/200/200?random=like1' },
    rating: 4.7,
    reason: 'Based on your interest in Crime Junkie',
  },
  {
    id: '2',
    title: 'Business Insider',
    host: 'Michael Forbes',
    image: { uri: 'https://picsum.photos/200/200?random=like2' }, // Changed
    rating: 4.4,
    reason: 'Trending in your area',
  },
  {
    id: '3',
    title: 'Wellness Weekly',
    host: 'Dr. Amanda Stone',
    image: { uri: 'https://picsum.photos/200/200?random=like3' }, // Changed
    rating: 4.5,
    reason: 'Based on your listening history',
  },
  {
    id: '4',
    title: 'Comedy Central',
    host: 'Various Artists',
    image: { uri: 'https://picsum.photos/200/200?random=like4' }, // Changed
    rating: 4.3,
    reason: 'Popular in comedy',
  },
];

// Mock data for recently played
export const recentlyPlayed = [
  {
    id: '1',
    title: 'The Cold Case Files',
    podcastTitle: 'Crime Junkie',
    image: { uri: 'https://picsum.photos/200/200?random=recent1' },
    lastPlayed: '2 hours ago',
    progress: 0.6,
    duration: '45m',
  },
  {
    id: '2',
    title: 'Morning News Briefing',
    podcastTitle: 'The Daily',
    image: { uri: 'https://picsum.photos/200/200?random=recent2' }, // Changed
    lastPlayed: '1 day ago',
    progress: 0.9,
    duration: '20m',
  },
  {
    id: '3',
    title: 'Weekend Roundup',
    podcastTitle: 'Business Weekly',
    image: { uri: 'https://picsum.photos/200/200?random=recent3' }, // Changed
    lastPlayed: '2 days ago',
    progress: 0.3,
    duration: '35m',
  },
];

// Mock data for shows you follow
export const showsYouFollow = [
  {
    id: '1',
    title: 'Crime Junkie',
    host: 'audiochuck',
    image: { uri: 'https://picsum.photos/200/200?random=follow1' },
    newEpisodes: 2,
    lastEpisode: '2 days ago',
  },
  {
    id: '2',
    title: 'The Daily',
    host: 'The New York Times',
    image: { uri: 'https://picsum.photos/200/200?random=follow2' }, // Changed
    newEpisodes: 5,
    lastEpisode: '1 day ago',
  },
  {
    id: '3',
    title: 'Tech Talk',
    host: 'Silicon Valley Insider',
    image: { uri: 'https://picsum.photos/200/200?random=follow3' }, // Changed
    newEpisodes: 1,
    lastEpisode: '3 days ago',
  },
];

// Mock data for new episodes
export const newEpisodes = [
  {
    id: '1',
    title: 'Latest Investigation Update',
    podcastTitle: 'Crime Junkie',
    host: 'audiochuck',
    image: { uri: 'https://picsum.photos/200/200?random=new1' },
    publishedDate: '3 hours ago',
    duration: '52m',
    isNew: true,
  },
  {
    id: '2',
    title: 'Market Analysis Today',
    podcastTitle: 'Business Weekly',
    host: 'Financial Times',
    image: { uri: 'https://picsum.photos/200/200?random=new2' }, // Changed
    publishedDate: '5 hours ago',
    duration: '28m',
    isNew: true,
  },
  {
    id: '3',
    title: 'AI Revolution Continues',
    podcastTitle: 'Tech Decoded',
    host: 'Alex Chen',
    image: { uri: 'https://picsum.photos/200/200?random=new3' }, // Changed
    publishedDate: '8 hours ago',
    duration: '33m',
    isNew: true,
  },
];

// Browse Categories - Apple Podcasts style
export const categories = [
  {
    id: '1',
    title: 'Arts',
    color: '#FF3B30',
    gradient: ['#FF6B6B', '#FF8E8E'],
    image: { uri: 'https://picsum.photos/400/300?random=arts' },
  },
  {
    id: '2',
    title: 'Business',
    color: '#007AFF',
    gradient: ['#007AFF', '#4DA6FF'],
    image: { uri: 'https://picsum.photos/400/300?random=business' },
  },
  {
    id: '3',
    title: 'Comedy',
    color: '#FF9500',
    gradient: ['#FF9500', '#FFB84D'],
    image: { uri: 'https://picsum.photos/400/300?random=comedy' },
  },
  {
    id: '4',
    title: 'Education',
    color: '#34C759',
    gradient: ['#34C759', '#5DD879'],
    image: { uri: 'https://picsum.photos/400/300?random=education' },
  },
  {
    id: '5',
    title: 'Fiction',
    color: '#AF52DE',
    gradient: ['#AF52DE', '#C478E8'],
    image: { uri: 'https://picsum.photos/400/300?random=fiction' },
  },
  {
    id: '6',
    title: 'Government',
    color: '#8E8E93',
    gradient: ['#8E8E93', '#AEAEB2'],
    image: { uri: 'https://picsum.photos/400/300?random=government' },
  },
  {
    id: '7',
    title: 'Health & Fitness',
    color: '#FF2D92',
    gradient: ['#FF2D92', '#FF5CB8'],
    image: { uri: 'https://picsum.photos/400/300?random=health' },
  },
  {
    id: '8',
    title: 'History',
    color: '#5856D6',
    gradient: ['#5856D6', '#7B7AE0'],
    image: { uri: 'https://picsum.photos/400/300?random=history' },
  },
  {
    id: '9',
    title: 'Kids & Family',
    color: '#32D74B',
    gradient: ['#32D74B', '#5EE46E'],
    image: { uri: 'https://picsum.photos/400/300?random=kids' },
  },
  {
    id: '10',
    title: 'Leisure',
    color: '#FF6482',
    gradient: ['#FF6482', '#FF8BA5'],
    image: { uri: 'https://picsum.photos/400/300?random=leisure' },
  },
  {
    id: '11',
    title: 'Music',
    color: '#FF375F',
    gradient: ['#FF375F', '#FF6B82'],
    image: { uri: 'https://picsum.photos/400/300?random=music' },
  },
  {
    id: '12',
    title: 'News',
    color: '#5AC8FA',
    gradient: ['#5AC8FA', '#7DD3FC'],
    image: { uri: 'https://picsum.photos/400/300?random=news' },
  },
  {
    id: '13',
    title: 'Religion & Spirituality',
    color: '#FFCC02',
    gradient: ['#FFCC02', '#FFD633'],
    image: { uri: 'https://picsum.photos/400/300?random=religion' },
  },
  {
    id: '14',
    title: 'Science',
    color: '#30D158',
    gradient: ['#30D158', '#5DE682'],
    image: { uri: 'https://picsum.photos/400/300?random=science' },
  },
  {
    id: '15',
    title: 'Society & Culture',
    color: '#BF5AF2',
    gradient: ['#BF5AF2', '#CF7EF5'],
    image: { uri: 'https://picsum.photos/400/300?random=society' },
  },
  {
    id: '16',
    title: 'Sports',
    color: '#FF9F0A',
    gradient: ['#FF9F0A', '#FFB84D'],
    image: { uri: 'https://picsum.photos/400/300?random=sports' },
  },
  {
    id: '17',
    title: 'Technology',
    color: '#64D2FF',
    gradient: ['#64D2FF', '#85DDFF'],
    image: { uri: 'https://picsum.photos/400/300?random=technology' },
  },
  {
    id: '18',
    title: 'True Crime',
    color: '#FF453A',
    gradient: ['#FF453A', '#FF6B62'],
    image: { uri: 'https://picsum.photos/400/300?random=truecrime' },
  },
];

// Featured shows
export const featuredShows = [
  {
    id: '1',
    title: 'The Daily',
    subtitle: 'The New York Times',
    description: 'This is how the news should sound. Twenty minutes a day, five days a week, hosted by Michael Barbaro and powered by New York Times journalism.',
    image: { uri: 'https://picsum.photos/400/400?random=daily' },
    category: 'News',
    isNew: false,
    badge: 'EXCLUSIVE',
    rating: 4.8,
    totalEpisodes: 1250,
  },
  {
    id: '2',
    title: 'Crime Junkie',
    subtitle: 'audiochuck',
    description: 'If you can never get enough true crime... Congratulations, you\'ve found your people.',
    image: { uri: 'https://picsum.photos/400/400?random=crime' },
    category: 'True Crime',
    isNew: true,
    badge: null,
    rating: 4.7,
    totalEpisodes: 325,
  },
  {
    id: '3',
    title: 'The Joe Rogan Experience',
    subtitle: 'Joe Rogan',
    description: 'The Joe Rogan Experience podcast is a long form conversation hosted by comedian Joe Rogan.',
    image: { uri: 'https://picsum.photos/400/400?random=rogan' },
    category: 'Comedy',
    isNew: false,
    badge: 'POPULAR',
    rating: 4.5,
    totalEpisodes: 2000,
  },
  {
    id: '4',
    title: 'Conan O\'Brien Needs a Friend',
    subtitle: 'Team Coco & Earwolf',
    description: 'After 25 years at the Late Night desk, Conan realized that the only people at his holiday party are the men and women who work for him.',
    image: { uri: 'https://picsum.photos/400/400?random=conan' },
    category: 'Comedy',
    isNew: false,
    badge: 'AWARD WINNER',
    rating: 4.6,
    totalEpisodes: 180,
  },
];

// Top charts
export const topCharts = [
  {
    id: '1',
    title: 'Serial',
    subtitle: 'Serial Productions',
    image: { uri: 'https://picsum.photos/200/200?random=serial' },
    rank: 1,
    category: 'True Crime',
    rating: 4.9,
  },
  {
    id: '2',
    title: 'This American Life',
    subtitle: 'This American Life',
    image: { uri: 'https://picsum.photos/200/200?random=american' },
    rank: 2,
    category: 'Society & Culture',
    rating: 4.8,
  },
  {
    id: '3',
    title: 'Conan O\'Brien Needs a Friend',
    subtitle: 'Team Coco & Earwolf',
    image: { uri: 'https://picsum.photos/200/200?random=conan' },
    rank: 3,
    category: 'Comedy',
    rating: 4.6,
  },
  {
    id: '4',
    title: 'Stuff You Should Know',
    subtitle: 'iHeartPodcasts',
    image: { uri: 'https://picsum.photos/200/200?random=stuff' },
    rank: 4,
    category: 'Education',
    rating: 4.7,
  },
  {
    id: '5',
    title: 'My Favorite Murder',
    subtitle: 'Exactly Right',
    image: { uri: 'https://picsum.photos/200/200?random=murder' },
    rank: 5,
    category: 'True Crime',
    rating: 4.5,
  },
  {
    id: '6',
    title: 'The Michelle Obama Podcast',
    subtitle: 'Spotify Studios',
    image: { uri: 'https://picsum.photos/200/200?random=obama' },
    rank: 6,
    category: 'Society & Culture',
    rating: 4.8,
  },
  {
    id: '7',
    title: 'Radiolab',
    subtitle: 'WNYC Studios',
    image: { uri: 'https://picsum.photos/200/200?random=radiolab' },
    rank: 7,
    category: 'Science',
    rating: 4.6,
  },
  {
    id: '8',
    title: 'SmartLess',
    subtitle: 'Jason Bateman, Sean Hayes, Will Arnett',
    image: { uri: 'https://picsum.photos/200/200?random=smartless' },
    rank: 8,
    category: 'Comedy',
    rating: 4.4,
  },
];

// Trending podcasts
export const trendingPodcasts = [
  {
    id: '1',
    title: 'The Dropout',
    subtitle: 'ABC News',
    image: { uri: 'https://picsum.photos/200/200?random=dropout' },
    category: 'True Crime',
    isNew: true,
    rating: 4.7,
  },
  {
    id: '2',
    title: 'Call Her Daddy',
    subtitle: 'Alex Cooper',
    image: { uri: 'https://picsum.photos/200/200?random=daddy' },
    category: 'Society & Culture',
    isNew: false,
    rating: 4.2,
  },
  {
    id: '3',
    title: 'WTF with Marc Maron',
    subtitle: 'Marc Maron',
    image: { uri: 'https://picsum.photos/200/200?random=wtf' },
    category: 'Comedy',
    isNew: false,
    rating: 4.5,
  },
];

// Search suggestions
export const searchSuggestions = [
  'Crime Junkie',
  'The Daily',
  'Joe Rogan',
  'Serial',
  'True Crime',
  'Comedy',
  'News',
  'Business',
  'Technology',
  'Health',
];

//Library section
export const librarySections = [
  {
    id: 'downloaded',
    title: 'Downloaded',
    icon: 'arrow-down-circle',
    count: 12,
    showCount: true,
    route: 'Downloaded'
  },
  {
    id: 'recently_played',
    title: 'Recently Played',
    icon: 'time',
    showCount: false,
    route: 'RecentlyPlayed'
  },
  {
    id: 'shows',
    title: 'Shows',
    icon: 'mic',
    count: 23,
    showCount: true,
    route: 'Shows'
  },
  {
    id: 'saved_episodes',
    title: 'Saved Episodes',
    icon: 'bookmark',
    count: 8,
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

// Recently played episodes data
export const recentEpisodes = [
  {
    id: '1',
    title: 'The Future of Learning Technology',
    showTitle: 'EdTech Insights',
    duration: '42m',
    playedDuration: '12m',
    progress: 0.28,
    publishDate: '2 days ago',
    isPlaying: false,
    artwork: { uri: 'https://picsum.photos/200/200?random=recent1' }
  },
  {
    id: '2',
    title: 'Ancient Rome: Rise and Fall',
    showTitle: 'History Uncovered',
    duration: '55m',
    playedDuration: '55m',
    progress: 1.0,
    publishDate: '1 week ago',
    isCompleted: true,
    artwork: { uri: 'https://picsum.photos/200/200?random=recent2' }
  },
  {
    id: '3',
    title: 'Meditation for Beginners',
    showTitle: 'Mindful Living',
    duration: '25m',
    playedDuration: '18m',
    progress: 0.72,
    publishDate: '3 days ago',
    isPlaying: true,
    artwork: { uri: 'https://picsum.photos/200/200?random=recent3' }
  },
  {
    id: '4',
    title: 'Climate Change Solutions',
    showTitle: 'Science Today',
    duration: '38m',
    playedDuration: '5m',
    progress: 0.13,
    publishDate: '4 days ago',
    isPlaying: false,
    artwork: { uri: 'https://picsum.photos/200/200?random=recent4' }
  }
];

// Downloaded episodes data
export const downloadedEpisodes = [
  {
    id: '1',
    title: 'Quantum Physics Explained Simply',
    showTitle: 'Science Made Easy',
    duration: '38m',
    fileSize: '35.2 MB',
    downloadDate: 'Yesterday',
    artwork: { uri: 'https://picsum.photos/200/200?random=download1' }
  },
  {
    id: '2',
    title: 'The Art of Critical Thinking',
    showTitle: 'Philosophy Today',
    duration: '47m',
    fileSize: '43.1 MB',
    downloadDate: '2 days ago',
    artwork: { uri: 'https://picsum.photos/200/200?random=download2' }
  },
  {
    id: '3',
    title: 'Machine Learning Basics',
    showTitle: 'Tech Decoded',
    duration: '52m',
    fileSize: '48.5 MB',
    downloadDate: '3 days ago',
    artwork: { uri: 'https://picsum.photos/200/200?random=download3' }
  },
  {
    id: '4',
    title: 'Medieval History Deep Dive',
    showTitle: 'History Chronicles',
    duration: '1h 15m',
    fileSize: '68.3 MB',
    downloadDate: '1 week ago',
    artwork: { uri: 'https://picsum.photos/200/200?random=download4' }
  }
];

// Subscribed shows data
export const subscribedShows = [
  {
    id: '1',
    title: 'Science Simplified',
    author: 'Dr. Sarah Chen',
    episodeCount: 145,
    newEpisodes: 3,
    lastUpdated: '2 days ago',
    isSubscribed: true,
    artwork: { uri: 'https://picsum.photos/300/300?random=show1' }
  },
  {
    id: '2',
    title: 'History Chronicles',
    author: 'Professor Mike Johnson',
    episodeCount: 89,
    newEpisodes: 1,
    lastUpdated: '1 week ago',
    isSubscribed: true,
    artwork: { uri: 'https://picsum.photos/300/300?random=show2' }
  },
  {
    id: '3',
    title: 'Mindful Moments',
    author: 'Lisa Wellness',
    episodeCount: 67,
    newEpisodes: 0,
    lastUpdated: '2 weeks ago',
    isSubscribed: true,
    artwork: { uri: 'https://picsum.photos/300/300?random=show3' }
  },
  {
    id: '4',
    title: 'Tech Talk Daily',
    author: 'Alex Rodriguez',
    episodeCount: 234,
    newEpisodes: 5,
    lastUpdated: '1 day ago',
    isSubscribed: true,
    artwork: { uri: 'https://picsum.photos/300/300?random=show4' }
  },
  {
    id: '5',
    title: 'Philosophy Corner',
    author: 'Dr. Emma Watson',
    episodeCount: 78,
    newEpisodes: 2,
    lastUpdated: '3 days ago',
    isSubscribed: true,
    artwork: { uri: 'https://picsum.photos/300/300?random=show5' }
  }
];

// Saved episodes data
export const savedEpisodes = [
  {
    id: '1',
    title: 'Understanding Cryptocurrency',
    showTitle: 'Business Weekly',
    duration: '34m',
    savedDate: '2 days ago',
    publishDate: '1 week ago',
    artwork: { uri: 'https://picsum.photos/200/200?random=saved1' }
  },
  {
    id: '2',
    title: 'The Psychology of Habits',
    showTitle: 'Mindful Living',
    duration: '41m',
    savedDate: '5 days ago',
    publishDate: '2 weeks ago',
    artwork: { uri: 'https://picsum.photos/200/200?random=saved2' }
  },
  {
    id: '3',
    title: 'Space Exploration Updates',
    showTitle: 'Science Today',
    duration: '29m',
    savedDate: '1 week ago',
    publishDate: '3 weeks ago',
    artwork: { uri: 'https://picsum.photos/200/200?random=saved3' }
  }
];

// Enhanced educational and wellness categories
export const trendingSearches = [
  'Science & Nature',
  'History & Culture',
  'Language Learning',
  'Mental Health',
  'Philosophy',
  'Mathematics',
  'Self Development',
  'Health & Wellness',
  'Psychology',
  'Economics',
  'Literature',
  'Meditation'
];

export const popularPodcasts = [
  {
    id: '1',
    title: 'Radiolab',
    subtitle: 'WNYC Studios',
    image: { uri: 'https://picsum.photos/200/200?random=1' },
    category: 'Science & Nature',
    rating: 4.9,
    isSubscribed: false,
    level: 'All Levels',
    duration: '60 min avg',
    description: 'Investigating the strange, wonderful, and complicated realities of our world',
    episodeCount: 400,
    tags: ['Science', 'Philosophy', 'Storytelling']
  },
  {
    id: '2',
    title: 'The Daily Meditation Podcast',
    subtitle: 'Mary Meckley',
    image: { uri: 'https://picsum.photos/200/200?random=2' },
    category: 'Mental Wellness',
    rating: 4.8,
    isSubscribed: true,
    level: 'Beginner',
    duration: '10-20 min',
    description: 'Daily guided meditations for inner peace and mindfulness',
    episodeCount: 500,
    tags: ['Meditation', 'Mindfulness', 'Wellness']
  },
  {
    id: '3',
    title: 'Hardcore History',
    subtitle: 'Dan Carlin',
    image: { uri: 'https://picsum.photos/200/200?random=3' },
    category: 'History & Culture',
    rating: 4.9,
    isSubscribed: false,
    level: 'Intermediate',
    duration: '3-6 hours',
    description: 'In-depth exploration of historical events and their impact',
    episodeCount: 75,
    tags: ['History', 'Education', 'Documentary']
  },
  {
    id: '4',
    title: 'Coffee Break Languages',
    subtitle: 'Radio Lingua Network',
    image: { uri: 'https://picsum.photos/200/200?random=4' },
    category: 'Language Learning',
    rating: 4.7,
    isSubscribed: false,
    level: 'All Levels',
    duration: '15-30 min',
    description: 'Learn languages in short, daily lessons',
    episodeCount: 200,
    tags: ['Languages', 'Education', 'Learning']
  },
  {
    id: '5',
    title: 'TED Talks Daily',
    subtitle: 'TED',
    image: { uri: 'https://picsum.photos/200/200?random=5' },
    category: 'Self Development',
    rating: 4.8,
    isSubscribed: true,
    level: 'All Levels',
    duration: '5-18 min',
    description: 'The best talks and performances from TED',
    episodeCount: 2000,
    tags: ['Ideas', 'Innovation', 'Inspiration']
  }
];

// Utility function to get all podcasts for search
export const getAllPodcasts = () => {
  return [
    ...youMightLike,
    ...featuredShows,
    ...topCharts,
    ...trendingPodcasts,
    ...newNoteworthy,
  ];
};

// Utility function to get podcasts by category
export const getPodcastsByCategory = (categoryName) => {
  const allPodcasts = getAllPodcasts();
  return allPodcasts.filter(podcast => 
    podcast.category?.toLowerCase() === categoryName.toLowerCase()
  );
};

// Utility function to get random podcasts
export const getRandomPodcasts = (count = 5) => {
  const allPodcasts = getAllPodcasts();
  const shuffled = [...allPodcasts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};