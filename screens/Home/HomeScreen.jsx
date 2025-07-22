import { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import styles from "./homeStyle.js";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import useGreeting from "../../hooks/useGreeting";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useProfileImage } from "../../context/ProfileImageContext";
import { useGlobalAudioPlayer } from "../../context/AudioPlayerContext";
import { SCREEN_NAMES } from "../../navigation/types";
import colors from "../../constants/colors.js";
import renderStars from "../../components/renderStar.js";

import {
  getTrendingPodcastsAPI,
  getRecentEpisodesAPI,
  getPodcastsByCategoryAPI,
  getPodcastEpisodesAPI,
} from "../../constants/PodcastAPI/podcastApiService.js";

import {
  setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate,
} from "../../constants/PodcastAPI/podcastUtils.js";

export default function HomeScreen() {
  const { greeting, emoji } = useGreeting("");
  const navigation = useNavigation();
  const { getAvatarImage, profileImage } = useProfileImage();

  const { loadAudio, setCurrentPodcast, playPause, sound } =
    useGlobalAudioPlayer();

  // State for API data
  const [apiData, setApiData] = useState({
    trendingPodcasts: [],
    recentEpisodes: [],
    categoryRecommendations: [],
    isLoading: true,
    error: null,
  });

  // Add state to store episodes by podcast ID
  const [episodesByPodcast, setEpisodesByPodcast] = useState(new Map());

  const [refreshing, setRefreshing] = useState(false);

  // Load API data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setApiData((prev) => ({ ...prev, isLoading: true, error: null }));

      // Load data from API only
      const [trending, recent, recommendations] = await Promise.allSettled([
        getTrendingPodcastsAPI(4),
        getRecentEpisodesAPI(5),
        getPodcastsByCategoryAPI("Documentary", 5),
      ]);

      const trendingPodcasts = trending.status === "fulfilled" ? trending.value : [];
      const recentEpisodes = recent.status === "fulfilled" ? recent.value : [];
      const categoryRecommendations = recommendations.status === "fulfilled" ? recommendations.value : [];

      setApiData({
        trendingPodcasts,
        recentEpisodes,
        categoryRecommendations,
        isLoading: false,
        error: null,
      });

      await preloadPodcastEpisodes([...trendingPodcasts, ...categoryRecommendations]);

    } catch (error) {
      console.error("Error loading initial data:", error);
      setApiData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          "Failed to load content. Please check your connection and try again.",
      }));
    }
  };

  // Function to preload episodes for podcasts
  const preloadPodcastEpisodes = async (podcasts) => {
    const episodesMap = new Map();
    
    const episodePromises = podcasts.map(async (podcast) => {
      if (!podcast || !podcast.id) return;
      
      try {
        const feedId = podcast.id.startsWith('pi_') ? podcast.id.substring(3) : podcast.id;
        const episodes = await getPodcastEpisodesAPI(feedId, 20);
        
        if (episodes && episodes.length > 0) {
          episodesMap.set(podcast.id, episodes);
        }
      } catch (error) {
        console.warn(`Failed to load episodes for podcast ${podcast.id}:`, error);
      }
    });

    await Promise.allSettled(episodePromises);
    setEpisodesByPodcast(episodesMap);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const navigateToPodcastDetails = (podcast) => {
    if (!podcast?.id) {
      Alert.alert("Error", "Unable to load podcast details");
      return;
    }

    console.log("Navigating to details with podcast:", podcast);

    // Get episodes for this podcast from our preloaded data
    const podcastEpisodes = episodesByPodcast.get(podcast.id) || [];

    // Navigate to PodcastDetailsScreen with proper podcast data and episodes
    navigation.navigate(SCREEN_NAMES.DETAILS, {
    podcast: {
      ...podcast,
      id: podcast.id,
      title: podcast.title,
      author: podcast.author || podcast.host,
      image: podcast.image,
      subtitle: podcast.subtitle || podcast.author,
      description: podcast.description || `${podcast.title} is a great podcast`,
      category: podcast.category || "Entertainment",
      rating: podcast.rating || 4.5,
      totalEpisodes: podcast.episodeCount || podcast.totalEpisodes || podcastEpisodes.length,
      episodeCount: podcast.episodeCount || podcast.totalEpisodes || podcastEpisodes.length,
    },
    episodes: podcastEpisodes, // Pass the preloaded episodes
    hasPreloadedEpisodes: podcastEpisodes.length > 0, // Flag to indicate we have episodes
  });
  };

  const playEpisode = async (episode) => {
    try {
      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author,
        image: episode.image,
        audioSource:
          episode.audioSource ||
          episode.metadata?.audioSource ||
          episode.audioUrl ||
          `https://example.com/audio/${episode.id}.mp3`,
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate,
      };

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);

      if (sound) {
        playPause();
      }
    } catch (error) {
      console.error("Error playing episode:", error);
      Alert.alert("Error", "Unable to play episode. Please try again.");
    }
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
        defaultSource={require("../../assets/Auth/google.png")}
      />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episode.title}
        </Text>
        <Text style={styles.episodePodcast} numberOfLines={1}>
          {episode.author}
        </Text>
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeDuration}>
            {formatDuration(episode.duration)}
          </Text>
          <Text style={styles.episodePlays}>
            {episode.metadata?.plays || Math.floor(Math.random() * 1000)} plays
          </Text>
          <Text style={styles.episodeDate}>
            {formatPublishedDate(
              episode.publishedDate || episode.publishedTimestamp
            )}
          </Text>
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

  const renderPodcastItem = (podcast) => {
    // Get episode count from preloaded episodes if available
    const podcastEpisodes = episodesByPodcast.get(podcast.id) || [];
    const episodeCount = podcastEpisodes.length || podcast.episodeCount || podcast.totalEpisodes;

    return (
      <TouchableOpacity
        key={podcast.id}
        style={styles.podcastItem}
        onPress={() => navigateToPodcastDetails(podcast)}
      >
        <Image
          source={podcast.image}
          style={styles.podcastImage}
          defaultSource={require("../../assets/blankpp.png")}
        />
        <View style={styles.podcastContent}>
          <Text style={styles.podcastTitle}>{podcast.title}</Text>
          <Text style={styles.podcastHost}>{podcast.author}</Text>
          <View style={styles.podcastRating}>
            {podcast.rating && renderStars(podcast.rating)}
            <Text style={styles.podcastRatingText}>
              {podcast.rating ? podcast.rating.toFixed(1) : "N/A"}
            </Text>
          </View>
          {episodeCount > 0 && (
            <Text style={styles.episodeCount}>
              {episodeCount} episode{episodeCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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

    const hasAnyData =
      apiData.trendingPodcasts.length > 0 ||
      apiData.recentEpisodes.length > 0 ||
      apiData.categoryRecommendations.length > 0;

    if (!hasAnyData) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="radio-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyStateTitle}>No Content Available</Text>
          <Text style={styles.emptyStateMessage}>
            Unable to load podcast content. Please check your internet
            connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadInitialData}
          >
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
          <Text style={styles.heading}>{greeting} {emoji}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREEN_NAMES.PROFILE)}
          >
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
      >
        {/* Trending Podcasts (API only) */}
        {renderSection(
          "Trending Podcasts",
          apiData.trendingPodcasts,
          renderPodcastItem
        )}

        {/* Recent Episodes (API only) */}
        {renderSection(
          "Recent Episodes",
          apiData.recentEpisodes,
          renderEpisodeItem
        )}

        {/* You Might Like (API only) */}
        {renderSection(
          "You Might Like",
          apiData.categoryRecommendations,
          renderPodcastItem
        )}

        {/* Empty State */}
        {renderEmptyState()}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}