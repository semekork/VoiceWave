import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
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
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGlobalAudioPlayer } from "../../context/AudioPlayerContext";
import colors from "../../constants/colors.js";

// Import local data functions for PodcastDetailsScreen
import {
  getPodcastById,
  getEpisodesByPodcast,
} from "../../constants/PodcastAPI/podcastApiMethod.js";

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

  const { loadAudio, setCurrentPodcast, playPause, sound } =
    useGlobalAudioPlayer();

  // Get podcast data from route params or fetch by ID
  const podcastId = route?.params?.podcast?.id || route?.params?.podcastId;
  const podcastFromParams = route?.params?.podcast;

  // HomeScreen state
  const [apiData, setApiData] = useState({
    trendingPodcasts: [],
    recentEpisodes: [],
    categoryRecommendations: [],
    isLoading: true,
    error: null,
  });

  const podcast = useMemo(() => {
    // First try to use the podcast data passed from HomeScreen
    if (podcastFromParams && podcastFromParams.id) {
      console.log("Using podcast from params:", podcastFromParams);
      return podcastFromParams;
    }

    // Fallback to fetching by ID from local data
    if (podcastId) {
      const fetchedPodcast = getPodcastById(podcastId);
      console.log("Fetched podcast by ID:", fetchedPodcast);
      return fetchedPodcast;
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
  }, [podcastId, podcastFromParams]);

  // Load data based on screen mode
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [downloadedEpisodes, setDownloadedEpisodes] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("Loading podcast details for:", podcast);
    loadPodcastDetails();
  }, [podcast.id]);

  const loadPodcastDetails = () => {
    setIsLoading(true);
    try {
      // Get episodes for this podcast
      const podcastEpisodes = getEpisodesByPodcast(podcast.id);
      console.log("Loaded episodes:", podcastEpisodes);

      setEpisodes(podcastEpisodes || []);
      setIsSubscribed(Math.random() > 0.5); // Random subscription state for demo
    } catch (error) {
      console.error("Error loading podcast details:", error);
      setEpisodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadPodcastDetails();
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

  const playEpisode = async (episode) => {
    if (!episode) return;

    try {
      console.log("Playing episode:", episode);
      console.log("Podcast data:", podcast);

      const episodeImage = normalizeImageSource(episode.image);
      const podcastImage = normalizeImageSource(podcast?.image);
      const primaryImage = episodeImage || podcastImage;

      const podcastForPlayer = {
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
            image: primaryImage,
            podcastImage: podcastImage,
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

  // PodcastDetailsScreen specific functions
  const handleSubscribe = () => {
    const newSubscriptionState = !isSubscribed;
    setIsSubscribed(newSubscriptionState);
    Alert.alert(
      newSubscriptionState ? "Subscribed!" : "Unsubscribed",
      newSubscriptionState
        ? `You are now subscribed to ${podcast.title}`
        : `You have unsubscribed from ${podcast.title}`
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
        message: `Check out this podcast: ${podcast.title} by ${podcast.author}`,
        title: podcast.title,
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
          size={isDetailsMode ? 16 : 12}
          color={colors.warning}
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons
          key="half"
          name="star-half"
          size={isDetailsMode ? 16 : 12}
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
          size={isDetailsMode ? 16 : 12}
          color={colors.warning}
        />
      );
    }
    return stars;
  };

  const renderEpisodeItem = (episode) => (
    <TouchableOpacity
      key={episode.id}
      style={isDetailsMode ? styles.detailsEpisodeItem : styles.homeEpisodeItem}
      onPress={() => playEpisode(episode)}
    >
      {!isDetailsMode && (
        <Image
          source={episode.image}
          style={styles.episodeImage}
          defaultSource={require("../../assets/Auth/google.png")}
        />
      )}
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
          {!isDetailsMode && (
            <>
              <Text style={styles.episodePlays}>
                {episode.metadata?.plays || Math.floor(Math.random() * 1000)}{" "}
                plays
              </Text>
              <Text style={styles.episodeDate}>
                {formatPublishedDate(
                  episode.publishedDate || episode.publishedTimestamp
                )}
              </Text>
            </>
          )}
        </View>
        {isDetailsMode && (
          <>
            <Text style={styles.episodeDate}>
              {formatPublishedDate(episode.publishedDate)} •{" "}
              {formatDuration(episode.duration)}
            </Text>
            <Text style={styles.episodeDescription} numberOfLines={3}>
              {episode.description}
            </Text>
          </>
        )}
      </View>
      {episode.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <View style={styles.episodeActions}>
        {isDetailsMode && (
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
        )}
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

  const renderPodcastItem = (podcast) => (
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
        {podcast.source === "podcastindex" && (
          <View style={styles.apiSourceBadge}>
            <Text style={styles.apiSourceText}>•</Text>
          </View>
        )}
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
          <TouchableOpacity style={styles.retryButton} onPress={loadHomeData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

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

  // Render HomeScreen
  if (!isDetailsMode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <BlurView intensity={95} tint="extraLight" style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.heading}>{greeting}</Text>
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
          {renderSection(
            "Trending Podcasts",
            apiData.trendingPodcasts,
            renderPodcastItem
          )}
          {renderSection(
            "Recent Episodes",
            apiData.recentEpisodes,
            renderEpisodeItem
          )}
          {renderSection(
            "You Might Like",
            apiData.categoryRecommendations,
            renderPodcastItem
          )}
          {renderEmptyState()}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render PodcastDetailsScreen
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
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
            onPress={() => playEpisode(episodes[0])}
            activeOpacity={0.8}
            disabled={!episodes[0]}
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

            {episodes.length === 0 ? (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: Platform.OS === "ios" ? 90 : 70,
  },
  headerBlur: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
  },
  floatingHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  floatingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 20,
  },
  heroSection: {
    height: HEADER_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroGradient: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  podcastImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  podcastTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  podcastHost: {
    fontSize: 16,
    color: "#E5E5E7",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#E5E5E7",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  floatingActionButtons: {
    position: "absolute",
    top: HEADER_HEIGHT - 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    zIndex: 100,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9C3141",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
    minHeight: 56,
  },
  subscribeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  playButtonHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
    minHeight: 56,
  },
  playButton: {
    padding: 4,
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    color: "#9C3141",
    fontSize: 16,
    fontWeight: "600",
  },
  contentSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    paddingTop: 50,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#48484A",
    marginBottom: 12,
  },
  showMoreText: {
    fontSize: 16,
    color: "#9C3141",
    fontWeight: "500",
  },
  episodesSection: {
    marginBottom: 20,
  },
  episodesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  sortText: {
    fontSize: 16,
    color: "#9C3141",
    fontWeight: "500",
  },
  noEpisodesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noEpisodesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#48484A",
    marginTop: 16,
  },
  noEpisodesSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  episodeItem: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  episodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  newBadge: {
    backgroundColor: "#9C3141",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
  },
  episodeNumber: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  episodeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(156, 49, 65, 0.1)",
    minWidth: 40,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: "#48484A",
    marginBottom: 8,
  },
  episodeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playedText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
});
