import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGlobalAudioPlayer } from "../../context/AudioPlayerContext";
import styles from "./DetialsStyles.js";
import colors from "../../constants/colors.js";

// Import API functions
import {
  getPodcastByIdAPI,
  getPodcastEpisodesAPI,
} from "../../constants/PodcastAPI/podcastApiService.js";

import {
  setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate,
} from "../../constants/PodcastAPI/podcastUtils.js";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HEADER_HEIGHT = 320;

export default function PodcastDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { 
    loadAudio, 
    setCurrentPodcast, 
    playPause, 
    sound,
    addToQueue,
    queue
  } = useGlobalAudioPlayer();

  // Get podcast data from route params or fetch by ID
  const podcastId = route?.params?.podcast?.id || route?.params?.podcastId;
  const podcastFromParams = route?.params?.podcast;
  const episodesFromParams = route?.params?.episodes || [];
  const hasPreloadedEpisodes = route?.params?.hasPreloadedEpisodes || false;

  // State management
  const [podcast, setPodcast] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [downloadedEpisodes, setDownloadedEpisodes] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Initialize podcast data
  const initializePodcast = useMemo(() => {
    // First try to use the podcast data passed from HomeScreen
    if (podcastFromParams && podcastFromParams.id) {
      console.log("Using podcast from params:", podcastFromParams);
      return podcastFromParams;
    }

    // Default fallback
    console.log("Using default podcast");
    return {
      id: "default",
      title: "Default Podcast",
      author: "Default Host",
      image: { uri: "https://picsum.photos/400/400?random=1" },
      category: "Entertainment",
      rating: 4.5,
      episodeCount: 0,
      description: "A great podcast for your listening pleasure.",
    };
  }, [podcastFromParams]);

  useEffect(() => {
    loadPodcastDetails();
  }, [podcastId, podcastFromParams]);

  const loadPodcastDetails = async () => {
    setIsLoading(true);
    setEpisodesLoading(true);
    
    try {
      let podcastData = initializePodcast;

      // If we have a podcast ID but no full data, try to fetch it
      if (podcastId && podcastId !== "default" && !podcastFromParams) {
        try {
          // Extract the actual feed ID from our transformed ID
          const feedId = podcastId.startsWith('pi_') ? podcastId.substring(3) : podcastId;
          const fetchedPodcast = await getPodcastByIdAPI(feedId);
          if (fetchedPodcast) {
            podcastData = fetchedPodcast;
            console.log("Fetched podcast by ID:", fetchedPodcast);
          }
        } catch (fetchError) {
          console.warn("Could not fetch podcast by ID, using available data:", fetchError);
        }
      }

      setPodcast(podcastData);
      setIsSubscribed(Math.random() > 0.5); // Random subscription state for demo

      // Use preloaded episodes first, then try to load more if needed
      if (hasPreloadedEpisodes && episodesFromParams.length > 0) {
        console.log("Using preloaded episodes:", episodesFromParams);
        setEpisodes(episodesFromParams);
        setEpisodesLoading(false);
        
        // Optionally load more episodes in the background
        loadAdditionalEpisodes(podcastData, episodesFromParams.length);
      } else {
        // Load episodes if we don't have preloaded ones
        await loadEpisodes(podcastData);
      }
      
    } catch (error) {
      console.error("Error loading podcast details:", error);
      setPodcast(initializePodcast);
      setEpisodes(episodesFromParams); // Still use passed episodes if available
      setEpisodesLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEpisodes = async (podcastData) => {
    if (!podcastData || !podcastData.id || podcastData.id === "default") {
      setEpisodes([]);
      setEpisodesLoading(false);
      return;
    }

    try {
      // Extract the actual feed ID from our transformed ID
      const feedId = podcastData.id.startsWith('pi_') ? podcastData.id.substring(3) : podcastData.id;
      console.log("Loading episodes for feed ID:", feedId);
      
      const podcastEpisodes = await getPodcastEpisodesAPI(feedId, 50);
      console.log("Loaded episodes:", podcastEpisodes);

      setEpisodes(podcastEpisodes || []);
    } catch (error) {
      console.error("Error loading episodes:", error);
      setEpisodes([]);
      
      // Show user-friendly error message only if we don't have preloaded episodes
      if (!hasPreloadedEpisodes || episodesFromParams.length === 0) {
        Alert.alert(
          "Episodes Unavailable",
          "Unable to load episodes for this podcast. Please check your connection and try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setEpisodesLoading(false);
    }
  };

  const loadAdditionalEpisodes = async (podcastData, currentCount) => {
    if (!podcastData || !podcastData.id || podcastData.id === "default") return;

    try {
      const feedId = podcastData.id.startsWith('pi_') ? podcastData.id.substring(3) : podcastData.id;
      const allEpisodes = await getPodcastEpisodesAPI(feedId, 100); // Load more episodes
      
      if (allEpisodes && allEpisodes.length > currentCount) {
        console.log("Loaded additional episodes:", allEpisodes.length - currentCount);
        setEpisodes(allEpisodes);
      }
    } catch (error) {
      console.warn("Could not load additional episodes:", error);
      // Don't show error since we already have some episodes
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPodcastDetails();
    setRefreshing(false);
  };

  // Helper function to normalize image format
  const normalizeImageSource = (imageSource) => {
    if (!imageSource) return null;

    if (typeof imageSource === "object" && imageSource.uri) {
      return imageSource;
    }

    if (typeof imageSource === "string") {
      return { uri: imageSource };
    }

    if (typeof imageSource === "number") {
      return imageSource;
    }

    return null;
  };

  // Helper function to create podcast object for player/queue
  const createPodcastObject = (episode) => {
    const episodeImage = normalizeImageSource(episode.image);
    const podcastImage = normalizeImageSource(podcast?.image);
    const primaryImage = episodeImage || podcastImage;

    return {
      id: episode.id,
      title: episode.title,
      author: episode.author || podcast?.author || "Unknown Host",
      image: primaryImage,
      audioSource:
        episode.audioSource ||
        episode.metadata?.audioSource ||
        episode.audioUrl ||
        `https://example.com/audio/${episode.id}.mp3`,
      subtitle: episode.subtitle || episode.description,
      description: episode.description || `Episode: ${episode.title}`,
      duration: episode.duration,
      publishedDate: episode.publishedDate || episode.publishedTimestamp,
      podcastTitle: podcast?.title,
      podcastAuthor: podcast?.author,
      podcastImage: podcastImage,
    };
  };

  // Get the latest episode (most recent)
  const getLatestEpisode = () => {
    if (!episodes || episodes.length === 0) return null;
    
    // Sort episodes by published date to get the most recent one
    const sortedByDate = [...episodes].sort((a, b) => {
      const dateA = a.publishedTimestamp || new Date(a.publishedDate || 0);
      const dateB = b.publishedTimestamp || new Date(b.publishedDate || 0);
      return dateB - dateA;
    });
    
    return sortedByDate[0];
  };

  const playLatestEpisode = async () => {
    const latestEpisode = getLatestEpisode();
    if (!latestEpisode) {
      Alert.alert("No Episodes", "No episodes available to play.");
      return;
    }

    try {
      console.log("Playing latest episode:", latestEpisode);
      const podcastForPlayer = createPodcastObject(latestEpisode);

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(latestEpisode.id);

      if (sound) {
        playPause();
      }

      // Navigate to PlayerScreen if it exists in navigation
      if (navigation.getState().routeNames.includes("PlayerScreen")) {
        navigation.navigate("PlayerScreen", {
          podcast: podcastForPlayer,
          episode: {
            ...latestEpisode,
            image: podcastForPlayer.image,
            podcastImage: podcastForPlayer.podcastImage,
            podcastTitle: podcast?.title,
            podcastAuthor: podcast?.author,
          },
        });
      }
    } catch (error) {
      console.error("Error playing latest episode:", error);
      Alert.alert("Error", "Unable to play episode. Please try again.");
    }
  };

  const playEpisode = async (episode) => {
    if (!episode) return;

    try {
      console.log("Playing episode:", episode);
      console.log("Podcast data:", podcast);

      const podcastForPlayer = createPodcastObject(episode);

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);

      if (sound) {
        playPause();
      }

      // Navigate to PlayerScreen if it exists in navigation
      if (navigation.getState().routeNames.includes("PlayerScreen")) {
        navigation.navigate("PlayerScreen", {
          podcast: podcastForPlayer,
          episode: {
            ...episode,
            image: podcastForPlayer.image,
            podcastImage: podcastForPlayer.podcastImage,
            podcastTitle: podcast?.title,
            podcastAuthor: podcast?.author,
          },
        });
      }
    } catch (error) {
      console.error("Error playing episode:", error);
      Alert.alert("Error", "Unable to play episode. Please try again.");
    }
  };

  // Add single episode to queue
  const addEpisodeToQueue = async (episode) => {
    if (!episode) return;

    try {
      console.log("Adding episode to queue:", episode);
      const podcastForQueue = createPodcastObject(episode);
      
      addToQueue(podcastForQueue);
      
      Alert.alert(
        "Added to Queue",
        `"${episode.title}" has been added to your queue.`,
        [
          { text: "OK" },
          { 
            text: "View Queue", 
            onPress: () => navigation.navigate("QueueScreen") 
          }
        ]
      );

    } catch (error) {
      console.error("Error adding episode to queue:", error);
      Alert.alert("Error", "Unable to add episode to queue. Please try again.");
    }
  };

  // Add all episodes to queue
  const addAllEpisodesToQueue = async () => {
    if (!episodes || episodes.length === 0) return;

    try {
      const episodesToAdd = episodes.map(episode => createPodcastObject(episode));
      
      // Add all episodes to queue
      episodesToAdd.forEach(episode => addToQueue(episode));
      
      Alert.alert(
        "Added to Queue",
        `${episodes.length} episodes have been added to your queue.`,
        [
          { text: "OK" },
          { 
            text: "View Queue", 
            onPress: () => navigation.navigate("QueueScreen") 
          }
        ]
      );

    } catch (error) {
      console.error("Error adding episodes to queue:", error);
      Alert.alert("Error", "Unable to add episodes to queue. Please try again.");
    }
  };

  // Show action sheet for episode options
  const showEpisodeOptions = (episode) => {
    Alert.alert(
      episode.title,
      "What would you like to do?",
      [
        { text: "Play Now", onPress: () => playEpisode(episode) },
        { text: "Add to Queue", onPress: () => addEpisodeToQueue(episode) },
        { text: "Download", onPress: () => handleDownloadEpisode(episode) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // PodcastDetailsScreen specific functions
  const handleSubscribe = () => {
    const newSubscriptionState = !isSubscribed;
    setIsSubscribed(newSubscriptionState);
    Alert.alert(
      newSubscriptionState ? "Subscribed!" : "Unsubscribed",
      newSubscriptionState
        ? `You are now subscribed to ${podcast?.title}`
        : `You have unsubscribed from ${podcast?.title}`
    );
  };

  const handleDownloadEpisode = (episode) => {
    if (!episode) return;
    const newDownloaded = new Set(downloadedEpisodes);
    if (newDownloaded.has(episode.id)) {
      newDownloaded.delete(episode.id);
      Alert.alert(
        "Download Removed",
        `${episode.title} removed from downloads`
      );
    } else {
      newDownloaded.add(episode.id);
      Alert.alert(
        "Downloaded",
        `${episode.title} downloaded for offline listening`
      );
    }
    setDownloadedEpisodes(newDownloaded);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this podcast: ${podcast?.title} by ${podcast?.author}`,
        title: podcast?.title,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSortPress = () => {
    Alert.alert("Sort Episodes", "Choose how to sort episodes", [
      { text: "Newest First", onPress: () => setSortBy("newest") },
      { text: "Oldest First", onPress: () => setSortBy("oldest") },
      { text: "Played", onPress: () => setSortBy("played") },
      { text: "Unplayed", onPress: () => setSortBy("unplayed") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Rendering functions
  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons
          key={i}
          name="star"
          size={16}
          color={colors.warning}
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={16}
          color={colors.warning}
        />
      );
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color={colors.warning}
        />
      );
    }
    return stars;
  };

  const renderEpisodeItem = (episode) => (
    <TouchableOpacity
      key={episode.id}
      style={styles.episodeItem}
      onPress={() => playEpisode(episode)}
      onLongPress={() => showEpisodeOptions(episode)}
    >
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {episode.title}
        </Text>
        <Text style={styles.episodePodcast} numberOfLines={1}>
          {episode.author}
        </Text>
        <Text style={styles.episodeDate}>
          {formatPublishedDate(episode.publishedDate)} •{" "}
          {formatDuration(episode.duration)}
        </Text>
        <Text style={styles.episodeDescription} numberOfLines={3}>
          {episode.description}
        </Text>
      </View>
      {episode.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <View style={styles.episodeActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownloadEpisode(episode)}
        >
          <Ionicons
            name={
              downloadedEpisodes.has(episode.id)
                ? "checkmark-circle"
                : "download-outline"
            }
            size={24}
            color={
              downloadedEpisodes.has(episode.id) ? "#34C759" : colors.primary
            }
          />
        </TouchableOpacity>
        
        {/* Add to Queue Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => addEpisodeToQueue(episode)}
        >
          <Ionicons
            name="list-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => playEpisode(episode)}>
          <Ionicons
            name="play-circle-outline"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Animated values for details screen
  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const actionButtonsTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: "clamp",
  });

  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            (a.publishedTimestamp || new Date(0)) -
            (b.publishedTimestamp || new Date(0))
          );
        case "played":
          return (b.isPlayed ? 1 : 0) - (a.isPlayed ? 1 : 0);
        case "unplayed":
          return (a.isPlayed ? 1 : 0) - (b.isPlayed ? 1 : 0);
        default:
          return (
            (b.publishedTimestamp || new Date(0)) -
            (a.publishedTimestamp || new Date(0))
          );
      }
    });
  }, [episodes, sortBy]);

  // Show loading screen while podcast data is loading
  if (isLoading || !podcast) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading podcast...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main render - PodcastDetailsScreen only
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View style={[styles.floatingHeader, { opacity: titleOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <View style={styles.floatingHeaderContent}>
            <TouchableOpacity onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.floatingTitle} numberOfLines={1}>
              {podcast.title}
            </Text>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}

      >
        <Animated.View
          style={[
            styles.heroSection,
            {
              transform: [
                { scale: headerScale },
                { translateY: headerTranslateY },
              ],
            },
          ]}
        >
          <Image source={podcast.image} style={styles.backgroundImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroHeader}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.headerButton}
              >
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerButton}
              >
                <Ionicons name="share-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
              <Image source={podcast.image} style={styles.podcastImage} />
              <Text style={styles.podcastTitle}>{podcast.title}</Text>
              <Text style={styles.podcastHost}>by {podcast.author}</Text>

              {podcast.rating && (
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(podcast.rating)}
                  </View>
                  <Text style={styles.ratingText}>
                    {podcast.rating} • {podcast.episodeCount || episodes.length}{" "}
                    episodes
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingActionButtons,
            { transform: [{ translateY: actionButtonsTranslateY }] },
          ]}
        >
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSubscribed ? "checkmark" : "add"}
              size={20}
              color="#fff"
            />
            <Text style={styles.subscribeText}>
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButtonHero}
            onPress={playLatestEpisode}
            activeOpacity={0.8}
            disabled={episodes.length === 0}
          >
            <Ionicons name="play" size={20} color="#9C3141" />
            <Text style={styles.playButtonText}>Play Latest</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.contentSection}>
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {podcast.description}
            </Text>
            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.showMoreText}>
                {showFullDescription ? "Show Less" : "Show More"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.episodesSection}>
            <View style={styles.episodesHeader}>
              <Text style={styles.sectionTitle}>
                Episodes ({episodes.length})
              </Text>
              <View style={styles.episodeHeaderActions}>
                {episodes.length > 1 && (
                  <TouchableOpacity
                    style={styles.sortButton}
                    onPress={handleSortPress}
                  >
                    <Ionicons name="funnel-outline" size={20} color="#9C3141" />
                    <Text style={styles.sortText}>Sort</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {episodesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading episodes...</Text>
              </View>
            ) : episodes.length === 0 ? (
              <View style={styles.noEpisodesContainer}>
                <Ionicons
                  name="musical-notes-outline"
                  size={48}
                  color="#C7C7CC"
                />
                <Text style={styles.noEpisodesText}>No episodes available</Text>
                <Text style={styles.noEpisodesSubtext}>
                  Check back later for new content
                </Text>
              </View>
            ) : (
              sortedEpisodes.map((episode, index) => renderEpisodeItem(episode))
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}
