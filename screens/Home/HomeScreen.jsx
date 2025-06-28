import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useGreeting from '../../hooks/useGreeting';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useProfileImage } from '../../context/ProfileImageContext';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import { SCREEN_NAMES } from '../../navigation/types';
import colors from '../../constants/colors.js';

import { 
  // API functions only
  getTrendingPodcastsAPI,
  getRecentEpisodesAPI,
  getPodcastsByCategoryAPI,
  setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate
} from '../../constants/podcastIndexAPI.js';

export default function HomeScreen() {
  const { greeting } = useGreeting('');
  const navigation = useNavigation();
  const { getAvatarImage, profileImage } = useProfileImage();
  
  const {
    loadAudio,
    setCurrentPodcast,
    playPause,
    sound
  } = useGlobalAudioPlayer();

  // State for API data
  const [apiData, setApiData] = useState({
    trendingPodcasts: [],
    recentEpisodes: [],
    categoryRecommendations: [],
    isLoading: true,
    error: null
  });

  const [refreshing, setRefreshing] = useState(false);

  // Load API data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setApiData(prev => ({ ...prev, isLoading: true, error: null }));

      // Load data from API only
      const [trending, recent, recommendations] = await Promise.allSettled([
        getTrendingPodcastsAPI(4),
        getRecentEpisodesAPI(5),
        getPodcastsByCategoryAPI('Health & Wellness', 5)
      ]);

      setApiData({
        trendingPodcasts: trending.status === 'fulfilled' ? trending.value : [],
        recentEpisodes: recent.status === 'fulfilled' ? recent.value : [],
        categoryRecommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading initial data:', error);
      setApiData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load content. Please check your connection and try again.'
      }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const navigateToPodcastDetails = (podcast) => {
    if (!podcast?.id) {
      Alert.alert('Error', 'Unable to load podcast details');
      return;
    }

    console.log('Navigating to details with podcast:', podcast);

    // Navigate to PodcastDetailsScreen with proper podcast data
    navigation.navigate(SCREEN_NAMES.DETAILS, { 
      podcast: {
        ...podcast,
        id: podcast.id,
        title: podcast.title,
        author: podcast.author || podcast.host,
        image: podcast.image,
        subtitle: podcast.subtitle || podcast.author,
        description: podcast.description || `${podcast.title} is a great podcast`,
        category: podcast.category || 'Entertainment',
        rating: podcast.rating || 4.5,
        totalEpisodes: podcast.episodeCount || podcast.totalEpisodes || 10,
        episodeCount: podcast.episodeCount || podcast.totalEpisodes || 10
      }
    });
  };

  const playEpisode = async (episode) => {
    try {
      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author,
        image: episode.image,
        audioSource: episode.audioSource || episode.metadata?.audioSource || episode.audioUrl || `https://example.com/audio/${episode.id}.mp3`,
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate
      };

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);
      
      if (sound) {
        playPause();
      }
    } catch (error) {
      console.error('Error playing episode:', error);
      Alert.alert('Error', 'Unable to play episode. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color={colors.warning} />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color={colors.warning} />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color={colors.warning} />);
    }
    return stars;
  };

  const renderEpisodeItem = (episode) => (
    <TouchableOpacity 
      key={episode.id} 
      style={styles.episodeItem}
      onPress={() => playEpisode(episode)}
    >
      <Image 
        source={episode.image} 
        style={styles.episodeImage}
        defaultSource={require('../../assets/Auth/google.png')} // Add a placeholder image
      />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>{episode.title}</Text>
        <Text style={styles.episodePodcast} numberOfLines={1}>{episode.author}</Text>
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeDuration}>{formatDuration(episode.duration)}</Text>
          <Text style={styles.episodePlays}>{episode.metadata?.plays || Math.floor(Math.random() * 1000)} plays</Text>
          <Text style={styles.episodeDate}>{formatPublishedDate(episode.publishedDate || episode.publishedTimestamp)}</Text>
        </View>
      </View>
      {episode.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => playEpisode(episode)}>
        <Ionicons name="play-circle-outline" size={32} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPodcastItem = (podcast) => (
    <TouchableOpacity 
      key={podcast.id} 
      style={styles.podcastItem}
      onPress={() => navigateToPodcastDetails(podcast)}
    >
      <Image 
        source={podcast.image} 
        style={styles.podcastImage}
        defaultSource={require('../../assets/blankpp.png')} // Add a placeholder image
      />
      <View style={styles.podcastContent}>
        <Text style={styles.podcastTitle}>{podcast.title}</Text>
        <Text style={styles.podcastHost}>{podcast.author}</Text>
        <View style={styles.podcastRating}>
          {podcast.rating && renderStars(podcast.rating)}
          <Text style={styles.podcastRatingText}>{podcast.rating ? podcast.rating.toFixed(1) : 'N/A'}</Text>
        </View>

      </View>
    </TouchableOpacity>
  );

  const renderErrorMessage = () => {
    if (!apiData.error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={20} color={colors.warning} />
        <Text style={styles.errorText}>{apiData.error}</Text>
      </View>
    );
  };

  const renderSection = (title, data, renderItem) => {
    // Only render if API data is available
    if (data && data.length > 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {data.map(renderItem)}
        </View>
      );
    }

    return null;
  };

  const renderEmptyState = () => {
    if (apiData.isLoading) return null;
    
    const hasAnyData = apiData.trendingPodcasts.length > 0 || 
                       apiData.recentEpisodes.length > 0 || 
                       apiData.categoryRecommendations.length > 0;
    
    if (!hasAnyData) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="radio-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>No Content Available</Text>
          <Text style={styles.emptyStateMessage}>
            Unable to load podcast content. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BlurView intensity={95} tint="extraLight" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.heading}>{greeting}</Text>
          <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.PROFILE)}>
            <Image 
              source={profileImage ? { uri: profileImage } : getAvatarImage()}
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Error Message */}
      {renderErrorMessage()}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >

        {/* Trending Podcasts (API only) */}
        {renderSection('Trending Podcasts', apiData.trendingPodcasts, renderPodcastItem)}

        {/* Recent Episodes (API only) */}
        {renderSection('Recent Episodes', apiData.recentEpisodes, renderEpisodeItem)}

        {/* You Might Like (API only) */}
        {renderSection('You Might Like', apiData.categoryRecommendations, renderPodcastItem)}

        {/* Empty State */}
        {renderEmptyState()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBackground,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heading: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.textBlack,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.avatarBackground,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textBlack,
    marginBottom: 16,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Error State
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBackground || '#FFF3CD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.errorText || '#856404',
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Episode Item Styles
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  episodeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textBlack,
    marginBottom: 4,
  },
  episodePodcast: {
    fontSize: 14,
    color: colors.textEpisodeMeta,
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeDuration: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.durationBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  episodePlays: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
  },
  episodeDate: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
  },
  
  // Podcast Item Styles
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  podcastImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  podcastContent: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textBlack,
    marginBottom: 4,
  },
  podcastHost: {
    fontSize: 14,
    color: colors.textEpisodeMeta,
    marginBottom: 8,
  },
  podcastRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  podcastRatingText: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
    marginLeft: 4,
  },
  
  newBadge: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  newBadgeText: {
    color: colors.White,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
});