import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Enhanced educational and wellness categories
const TRENDING_SEARCHES = [
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

const POPULAR_PODCASTS = [
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

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['Mindfulness', 'Physics', 'Spanish']);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchInputRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { addToQueue, currentPodcast } = useGlobalAudioPlayer();

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsLoading(true);
    setIsSearching(true);
    
    // Enhanced mock results focusing on educational and wellness content
    setTimeout(() => {
      const mockResults = [
        {
          id: '1',
          type: 'podcast',
          title: 'The Science Hour',
          subtitle: 'BBC World Service',
          image: { uri: 'https://picsum.photos/200/200?random=10' },
          category: 'Science & Nature',
          rating: 4.8,
          episodeCount: 300,
          description: 'Weekly exploration of scientific discoveries and innovations',
          level: 'Intermediate',
          tags: ['Science', 'Research', 'Discovery']
        },
        {
          id: '2',
          type: 'episode',
          title: 'Understanding Quantum Physics',
          podcastTitle: 'The Science Hour',
          image: { uri: 'https://picsum.photos/200/200?random=10' },
          duration: 2850,
          publishDate: '2024-05-28',
          description: 'Breaking down quantum mechanics for curious minds',
          level: 'Advanced',
          subject: 'Physics'
        },
        {
          id: '3',
          type: 'podcast',
          title: 'Headspace: Meditation & Sleep',
          subtitle: 'Headspace',
          image: { uri: 'https://picsum.photos/200/200?random=11' },
          category: 'Mental Wellness',
          rating: 4.9,
          episodeCount: 400,
          description: 'Guided meditations and sleep stories for better mental health',
          level: 'All Levels',
          tags: ['Meditation', 'Sleep', 'Wellness']
        },
        {
          id: '4',
          type: 'episode',
          title: 'French Conversation Practice',
          podcastTitle: 'Coffee Break French',
          image: { uri: 'https://picsum.photos/200/200?random=12' },
          duration: 1200,
          publishDate: '2024-05-26',
          description: 'Practice everyday French conversations',
          level: 'Intermediate',
          subject: 'French Language'
        }
      ];
      
      setSearchResults(mockResults);
      setIsLoading(false);
    }, 1000);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const updatedRecent = [searchQuery, ...recentSearches.filter(item => item !== searchQuery)].slice(0, 8);
      setRecentSearches(updatedRecent);
      
      const historyItem = {
        id: Date.now().toString(),
        query: searchQuery,
        timestamp: new Date(),
        resultsCount: searchResults.length
      };
      setSearchHistory([historyItem, ...searchHistory].slice(0, 15));
    }
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    searchInputRef.current?.focus();
  };

  const handlePodcastPress = (podcast) => {
    navigation.navigate('PodcastDetailScreen', { podcast });
  };

  const handleEpisodePress = (episode) => {
    navigation.navigate('PlayerScreen', {
      podcastTitle: episode.title,
      podcastSubtitle: episode.podcastTitle,
      podcastImage: episode.image
    });
  };

  const handleSubscribe = (podcastId) => {
    Alert.alert('Subscribe', 'Subscribed to podcast successfully!', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderSearchResult = ({ item }) => {
    if (item.type === 'podcast') {
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => handlePodcastPress(item)}
          activeOpacity={0.7}
        >
          <Image source={item.image} style={styles.resultImage} />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
            <View style={styles.resultMeta}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={styles.levelContainer}>
                <Ionicons name="school-outline" size={12} color="#8E8E93" />
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
            <View style={styles.tagsContainer}>
              {item.tags?.slice(0, 3).map((tag, index) => (
                <Text key={index} style={styles.tag}>#{tag}</Text>
              ))}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(item.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9C3141', '#B63E54']}
              style={styles.subscribeGradient}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.subscribeText}>Follow</Text>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => handleEpisodePress(item)}
          activeOpacity={0.7}
        >
          <Image source={item.image} style={styles.resultImage} />
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.resultSubtitle}>{item.podcastTitle}</Text>
            <View style={styles.resultMeta}>
              <View style={styles.subjectContainer}>
                <Ionicons name="book-outline" size={12} color="#8E8E93" />
                <Text style={styles.subjectText}>{item.subject}</Text>
              </View>
              <Text style={styles.episodeMeta}>•</Text>
              <View style={styles.levelContainer}>
                <Ionicons name="school-outline" size={12} color="#8E8E93" />
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
              <Text style={styles.episodeMeta}>•</Text>
              <Text style={styles.episodeMeta}>{formatDate(item.publishDate)}</Text>
              <Text style={styles.episodeMeta}>•</Text>
              <Text style={styles.episodeMeta}>{formatDuration(item.duration)}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => handleEpisodePress(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9C3141', '#B63E54']}
              style={styles.playGradient}
            >
              <Ionicons name="play" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
  };

  const renderTrendingChip = ({ item }) => (
    <TouchableOpacity 
      style={styles.trendingChip}
      onPress={() => handleRecentSearchPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.trendingText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => handleRecentSearchPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recentIcon}>
        <Ionicons name="time-outline" size={18} color="#8E8E93" />
      </View>
      <Text style={styles.recentText}>{item}</Text>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => setRecentSearches(recentSearches.filter(search => search !== item))}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color="#C7C7CC" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPopularPodcast = ({ item }) => (
    <TouchableOpacity 
      style={styles.popularItem}
      onPress={() => handlePodcastPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.popularImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.popularOverlay}
      >
        <View style={styles.popularContent}>
          <Text style={styles.popularTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
          <View style={styles.popularMeta}>
            <View style={styles.popularLevel}>
              <Ionicons name="school-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.popularLevelText}>{item.level}</Text>
            </View>
            <View style={styles.popularRating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.popularRatingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Discover</Text>
            <View style={styles.headerSpacer} />
          </View>
        </BlurView>
      </Animated.View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Discover educational podcasts..."
            placeholderTextColor="#C7C7CC"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <View style={styles.searchContent}>
          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            {['all', 'courses', 'episodes'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={[styles.filterTab, activeTab === tab && styles.activeFilterTab]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterTabText, activeTab === tab && styles.activeFilterTabText]}>
                  {tab === 'all' ? 'All' : tab === 'courses' ? 'Podcasts' : 'Episodes'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9C3141" />
              <Text style={styles.loadingText}>Searching for knowledge...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults.filter(item => 
                activeTab === 'all' || item.type === (activeTab === 'courses' ? 'podcast' : 'episode')
              )}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={60} color="#E5E5EA" />
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySubtext}>Try exploring our trending topics</Text>
                </View>
              }
            />
          )}
        </View>
      ) : (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View style={styles.discoverContent}>
              {/* Trending Topics */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Topics</Text>
                <FlatList
                  data={TRENDING_SEARCHES}
                  renderItem={renderTrendingChip}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingList}
                />
              </View>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <TouchableOpacity 
                      onPress={() => setRecentSearches([])}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.recentContainer}>
                    <FlatList
                      data={recentSearches}
                      renderItem={renderRecentSearch}
                      keyExtractor={(item) => item}
                      scrollEnabled={false}
                    />
                  </View>
                </View>
              )}

              {/* Featured Educational Content */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured Educational Content</Text>
                <FlatList
                  data={POPULAR_PODCASTS}
                  renderItem={renderPopularPodcast}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularList}
                />
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 88,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#F2F2F7',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchContent: {
    flex: 1,
  },
  discoverContent: {
    flex: 1,
    paddingTop: 10,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activeFilterTab: {
    backgroundColor: '#9C3141',
    shadowColor: '#9C3141',
    shadowOpacity: 0.3,
  },
  filterTabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  clearText: {
    fontSize: 14,
    color: '#9C3141',
    fontWeight: '600',
  },
  trendingList: {
    paddingHorizontal: 20,
  },
  trendingChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  trendingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  recentContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  popularList: {
    paddingHorizontal: 20,
  },
  popularItem: {
    width: 160,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  popularImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  popularOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  popularContent: {
    marginBottom: 8,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  popularSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  popularLevelText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  popularRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularRatingText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#9C3141',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '600',
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  subjectText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  episodeMeta: {
    fontSize: 12,
    color: '#C7C7CC',
    marginHorizontal: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 11,
    color: '#9C3141',
    marginRight: 8,
    fontWeight: '500',
  },
  subscribeButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subscribeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  playButton: {
    alignSelf: 'center',
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#C7C7CC',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});