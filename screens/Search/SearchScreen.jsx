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
  Animated,
  Keyboard,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';

// Import API functions
import { 
  usePodcastClient,
  usePodcastSearch,
  getAvailableCategoriesAPI,
  getPodcastsByCategoryAPI,
  getRecentEpisodesAPI,
  formatDuration,
  formatPublishedDate
} from '../../constants/podcastIndexAPI';

import colors from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Updated quick searches with more relevant categories
const quickSearches = [
  'Technology', 'Business', 'Health', 'Education', 
  'Science', 'Comedy', 'News', 'History'
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState('all'); // 'all', 'podcasts', 'episodes'
  const [availableCategories, setAvailableCategories] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
  const [searchError, setSearchError] = useState(null); // Track search errors
  
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchTimeoutRef = useRef(null);
  const { addToQueue } = useGlobalAudioPlayer();
  
  // Use the podcast search hook
  const { 
    searchPodcasts, 
    results: hookResults, 
    loading: hookLoading, 
    error: hookError, 
    clearResults 
  } = usePodcastSearch();
  
  const podcastClient = usePodcastClient();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsActive(true);
      animateIn();
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (!searchQuery) {
        setIsActive(false);
        animateOut();
      }
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [searchQuery]);

  // Load available categories on mount
  useEffect(() => {
    loadAvailableCategories();
  }, []);

  // Update results when hook results change
  useEffect(() => {
    console.log('Hook results updated:', hookResults);
    if (hookResults && Array.isArray(hookResults)) {
      const transformedResults = hookResults.map(result => ({
        ...result,
        type: result.type || 'podcast', // Ensure type is set
        id: result.id || result.feedId || Math.random().toString(36).substr(2, 9), // Ensure ID exists
        image: result.image || result.artwork || 'https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image'
      }));
      console.log('Setting transformed results:', transformedResults);
      setResults(transformedResults);
    } else if (hasSearched && hookResults !== null) {
      // Only set empty results if we've actually searched
      setResults([]);
    }
  }, [hookResults, hasSearched]);

  // Update loading state from hook
  useEffect(() => {
    setIsLoading(hookLoading);
  }, [hookLoading]);

  // Update error state from hook
  useEffect(() => {
    setSearchError(hookError);
  }, [hookError]);

  const loadAvailableCategories = async () => {
    try {
      const categories = await getAvailableCategoriesAPI();
      if (categories && Array.isArray(categories)) {
        setAvailableCategories(categories.slice(0, 8));
      } else {
        setAvailableCategories(quickSearches);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setAvailableCategories(quickSearches);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  const performSearch = async (query) => {
    if (!query?.trim() || query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    console.log('Performing search for:', query);
    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);
    
    try {
      // Use the hook to search
      const searchResults = await searchPodcasts(query.trim());
      console.log('Search completed, results:', searchResults);
      
      // The results will be handled by the useEffect that watches hookResults
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError(error.message || 'Search failed');
      Alert.alert(
        'Search Error', 
        'Failed to search podcasts. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time search as user types
  const handleTextChange = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If text is empty, clear results immediately
    if (!text.trim()) {
      setResults([]);
      setHasSearched(false);
      clearResults();
      return;
    }
    
    // Debounce search - only search after user stops typing for 800ms
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim().length >= 2) {
        performSearch(text.trim());
      }
    }, 800);
  };

  // Handle search submission (when user presses search button)
  const handleSearchSubmit = async () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.trim()) {
      // Add to recent searches
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      
      await performSearch(searchQuery.trim());
    }
  };

  const handleQuickSearch = async (category) => {
    setSearchQuery(category);
    setIsLoading(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      console.log('Quick searching category:', category);
      const categoryPodcasts = await getPodcastsByCategoryAPI(category, 10);
      
      if (categoryPodcasts && Array.isArray(categoryPodcasts)) {
        const transformedResults = categoryPodcasts.map(podcast => ({ 
          ...podcast, 
          type: 'podcast',
          id: podcast.id || podcast.feedId || Math.random().toString(36).substr(2, 9),
          image: podcast.image || podcast.artwork || 'https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image'
        }));
        setResults(transformedResults);
        console.log('Category results set:', transformedResults);
      } else {
        setResults([]);
      }
      
      // Add to recent searches
      if (!recentSearches.includes(category)) {
        setRecentSearches(prev => [category, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Category search failed:', error);
      setSearchError(error.message || 'Category search failed');
      Alert.alert(
        'Search Error', 
        'Failed to load podcasts for this category. Please try again.',
        [{ text: 'OK' }]
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearch = async (query) => {
    setSearchQuery(query);
    await performSearch(query);
  };

  const handleResultPress = async (item) => {
    console.log('Result pressed:', item);
    
    if (item.type === 'podcast') {
      // Navigate to podcast details
      navigation.navigate('PodcastDetailsScreen', { podcast: item });
    } else {
      // Handle episode playback
      if (item.audioSource || item.audioUrl || item.enclosureUrl) {
        try {
          const audioUrl = item.audioSource || item.audioUrl || item.enclosureUrl;
          
          // Add to queue and navigate to player
          await addToQueue({
            ...item,
            metadata: {
              ...item.metadata,
              audioSource: audioUrl
            }
          });
          
          navigation.navigate('PlayerScreen', {
            episode: item,
            podcastTitle: item.title,
            podcastSubtitle: item.author,
            podcastImage: item.image
          });
        } catch (error) {
          console.error('Failed to play episode:', error);
          Alert.alert('Playback Error', 'Failed to play this episode. Please try again.');
        }
      } else {
        Alert.alert('Audio Not Available', 'This episode is not available for playback.');
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsActive(false);
    setHasSearched(false);
    setSearchError(null);
    clearResults();
    Keyboard.dismiss();
    
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const formatEpisodeDuration = (duration) => {
    if (typeof duration === 'string') {
      return duration;
    }
    if (typeof duration === 'number' && duration > 0) {
      return formatDuration(duration);
    }
    return 'Unknown';
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const renderSearchResult = ({ item, index }) => {
    console.log('Rendering result item:', item);
    
    return (
      <Animated.View
        style={[
          styles.resultItem,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, index * 10 + 50],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleResultPress(item)}
          style={styles.resultContent}
          activeOpacity={0.7}
        >
          <View style={styles.resultImageContainer}>
            <Image 
              source={{ uri: item.image || 'https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image' }}
              style={styles.resultImage}
              defaultSource={{ uri: 'https://via.placeholder.com/72x72/cccccc/ffffff?text=No+Image' }}
            />
            <View style={styles.resultImageOverlay}>
              <Ionicons 
                name={item.type === 'podcast' ? 'library-outline' : 'play'} 
                size={16} 
                color={colors.textWhite} 
              />
            </View>
          </View>
          
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {item.title || 'Unknown Title'}
            </Text>
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {item.author || item.category || 'Unknown'}
            </Text>
            <View style={styles.resultMeta}>
              <View style={[
                styles.typeTag, 
                { backgroundColor: item.type === 'podcast' ? colors.search.typeTagPodcast : colors.search.typeTagEpisode }
              ]}>
                <Text style={styles.typeTagText}>
                  {item.type === 'podcast' ? 'PODCAST' : 'EPISODE'}
                </Text>
              </View>
              {item.type === 'episode' && item.duration && (
                <Text style={styles.duration}>
                  {formatEpisodeDuration(item.duration)}
                </Text>
              )}
              {item.type === 'episode' && item.publishedTimestamp && (
                <Text style={styles.publishedDate}>
                  {formatPublishedDate(item.publishedTimestamp)}
                </Text>
              )}
              {item.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={12} color={colors.gold} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons 
              name={item.type === 'podcast' ? 'add-circle-outline' : 'play-circle-outline'} 
              size={28} 
              color={colors.search.actionButton} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderQuickSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.quickSearchChip}
      onPress={() => handleQuickSearch(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.quickSearchText}>{item}</Text>
      <Ionicons name="search" size={14} color={colors.search.chipIcon} style={styles.quickSearchIcon} />
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleRecentSearch(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recentIconContainer}>
        <Ionicons name="time-outline" size={18} color={colors.primary} />
      </View>
      <Text style={styles.recentText}>{item}</Text>
      <TouchableOpacity
        onPress={() => setRecentSearches(prev => prev.filter(search => search !== item))}
        style={styles.removeRecent}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color={colors.lightGray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Show error state for search failed
  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.search.emptyIcon} />
      </View>
      <Text style={styles.errorTitle}>Search Failed</Text>
      <Text style={styles.errorSubtitle}>
        {searchError || 'Please check your internet connection and try again'}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => performSearch(searchQuery)}
        activeOpacity={0.8}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Debug log for current state
  console.log('Current state:', {
    searchQuery, 
    isLoading, 
    hasSearched, 
    resultsLength: results.length, 
    searchError,
    hookResults: hookResults?.length || 'null'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.White} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, isActive && styles.searchInputActive]}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search podcasts and episodes"
              placeholderTextColor={colors.textSearchPlaceholder}
              value={searchQuery}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={20} color={colors.lightGray} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching podcasts...</Text>
          </View>
        ) : searchError ? (
          renderError()
        ) : hasSearched && results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.type || 'result'}-${item.id || index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="search" size={64} color={colors.search.emptyIcon} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "{searchQuery}" or browse categories below
            </Text>
          </View>
        ) : (
          <View style={styles.discoverContainer}>
            {/* Quick Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Searches</Text>
              <FlatList
                data={availableCategories.length > 0 ? availableCategories : quickSearches}
                renderItem={renderQuickSearch}
                keyExtractor={(item) => item}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.quickSearchGrid}
                columnWrapperStyle={styles.quickSearchRow}
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
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={recentSearches}
                  renderItem={renderRecentSearch}
                  keyExtractor={(item) => item}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.searchBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.searchBorder,
    elevation: 2,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.searchInputBackground,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchInputBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.searchInputBorder,
  },
  searchInputActive: {
    backgroundColor: colors.searchInputActiveBackground,
    borderColor: colors.searchInputActiveBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textBlack,
    marginLeft: 12,
    marginRight: 8,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    backgroundColor: colors.searchBackground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.searchBackground,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSearchLoading,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.search.emptyBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textSearchEmpty,
    marginBottom: 12,
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.textSearchEmptySubtitle,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsList: {
    paddingVertical: 16,
  },
  resultItem: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultImageContainer: {
    position: 'relative',
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.searchBorder,
  },
  resultImageOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.search.resultImageOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.White,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 20,
    marginRight: 16,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textBlack,
    marginBottom: 6,
    lineHeight: 22,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
    fontWeight: '500',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textWhite,
    letterSpacing: 0.8,
  },
  duration: {
    fontSize: 12,
    color: colors.gray,
    marginRight: 12,
    fontWeight: '600',
  },
  publishedDate: {
    fontSize: 12,
    color: colors.gray,
    marginRight: 12,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
    fontWeight: '600',
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.searchButtonBackground,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.search.emptyBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textSearchEmpty,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSearchEmptySubtitle,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  discoverContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textBlack,
    marginBottom: 20,
  },
  clearText: {
    fontSize: 16,
    color: colors.search.clearText,
    fontWeight: '600',
  },
  quickSearchGrid: {
    gap: 12,
  },
  quickSearchRow: {
    justifyContent: 'space-between',
    gap: 12,
  },
  quickSearchChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.search.chipBackground,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickSearchText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.search.chipText,
  },
  quickSearchIcon: {
    marginLeft: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  recentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.search.recentIconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: colors.search.chipText,
    fontWeight: '500',
  },
  removeRecent: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.searchButtonBackground,
  },
});