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
import { 
  podcasts, 
  episodes, 
  searchPodcasts,
  searchEpisodes,
  searchSuggestions
} from '../../constants/podcastData';
import colors from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { addToQueue } = useGlobalAudioPlayer();

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

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery]);

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

  const performSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const podcastResults = searchPodcasts(searchQuery, 5).map(podcast => ({
        ...podcast,
        type: 'podcast',
        searchScore: calculateRelevance(podcast.title, searchQuery)
      }));

      const episodeResults = searchEpisodes(searchQuery, 5).map(episode => ({
        ...episode,
        type: 'episode',
        searchScore: calculateRelevance(episode.title, searchQuery)
      }));

      const combinedResults = [...podcastResults, ...episodeResults]
        .sort((a, b) => b.searchScore - a.searchScore)
        .slice(0, 10);

      setResults(combinedResults);
      setIsLoading(false);
    }, 500);
  };

  const calculateRelevance = (title, query) => {
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (titleLower.includes(queryLower)) {
      return titleLower.indexOf(queryLower) === 0 ? 100 : 80;
    }
    
    const words = queryLower.split(' ');
    let score = 0;
    words.forEach(word => {
      if (titleLower.includes(word)) score += 20;
    });
    
    return score;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
    
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const handleResultPress = (item) => {
    if (item.type === 'podcast') {
      navigation.navigate('PodcastDetailsScreen', { podcast: item });
    } else {
      const actualEpisode = episodes.find(ep => ep.id === item.id);
      if (actualEpisode?.metadata?.audioSource) {
        navigation.navigate('PlayerScreen', {
          episode: actualEpisode,
          podcastTitle: actualEpisode.title,
          podcastSubtitle: actualEpisode.author,
          podcastImage: actualEpisode.image
        });
      } else {
        Alert.alert('Audio Not Available', 'This episode is not available for playback.');
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setIsActive(false);
    Keyboard.dismiss();
  };

  const formatDuration = (duration) => {
    if (typeof duration === 'string') {
      return duration;
    }
    const minutes = Math.floor(duration / 60);
    return `${minutes}m`;
  };

  const renderSearchResult = ({ item, index }) => (
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
          <Image source={item.image} style={styles.resultImage} />
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
            {item.title}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {item.author || item.category}
          </Text>
          <View style={styles.resultMeta}>
            <View style={[styles.typeTag, { backgroundColor: item.type === 'podcast' ? colors.search.typeTagPodcast : colors.search.typeTagEpisode }]}>
              <Text style={styles.typeTagText}>
                {item.type === 'podcast' ? 'PODCAST' : 'EPISODE'}
              </Text>
            </View>
            {item.type === 'episode' && (
              <Text style={styles.duration}>
                {formatDuration(item.duration)}
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

  const renderQuickSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.quickSearchChip}
      onPress={() => handleSearch(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.quickSearchText}>{item}</Text>
      <Ionicons name="search" size={14} color={colors.search.chipIcon} style={styles.quickSearchIcon} />
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleSearch(item)}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.White} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textBlack} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, isActive && styles.searchInputActive]}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search podcasts and episodes"
              placeholderTextColor={colors.textSearchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchQuery && results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderSearchResult}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        ) : searchQuery && results.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="search" size={64} color={colors.search.emptyIcon} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for "{searchSuggestions[0]}" or "{searchSuggestions[1]}"
            </Text>
          </View>
        ) : (
          <View style={styles.discoverContainer}>
            {/* Quick Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Searches</Text>
              <FlatList
                data={quickSearches}
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