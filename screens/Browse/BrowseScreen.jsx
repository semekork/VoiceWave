import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Animated,
  ImageBackground,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useGlobalAudioPlayer } from "../../context/AudioPlayerContext";
import { SCREEN_NAMES } from "../../navigation/types";
import {
  getTrendingPodcastsAPI,
  getRecentEpisodesAPI,
  getPodcastsByCategoryAPI,
  getAvailableCategoriesAPI,
} from "../../constants/PodcastAPI/podcastApiService";
import { setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate, } from "../../constants/PodcastAPI/podcastUtils";
import colors from "../../constants/colors";
import styles from "./browseStyles";
import SkeletonPreloader from "./Preloader";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function BrowseScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const {
    loadAudio,
    setCurrentPodcast,
    playPause,
    sound,
  } = useGlobalAudioPlayer();

  // Enhanced state management for loading
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); 
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [trendingEpisodes, setTrendingEpisodes] = useState([]);
  const [newEpisodes, setNewEpisodes] = useState([]);
  const [featuredShows, setFeaturedShows] = useState([]);
  const [topCharts, setTopCharts] = useState([]);
  const [heroShow, setHeroShow] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState([]);
  const [error, setError] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); 

  // Enhanced animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const heroParallax = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 1.2],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 200, 300],
    outputRange: [1, 0.7, 0.3],
    extrapolate: "clamp",
  });

  
  useEffect(() => {
    loadContent(true);

    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); 

  const loadContent = async (isInitialLoad = false) => {
    try {
      
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setBackgroundLoading(true);
      }
      
      setError(null);

      const [
        trendingPodcastsData,
        recentEpisodesData,
        categoriesData,
        comedyPodcasts,
        newsPodcasts,
        techPodcasts,
      ] = await Promise.all([
        getTrendingPodcastsAPI(20),
        getRecentEpisodesAPI(20),
        getAvailableCategoriesAPI(),
        getPodcastsByCategoryAPI("Comedy", 10),
        getPodcastsByCategoryAPI("News", 10),
        getPodcastsByCategoryAPI("Technology", 10),
      ]);

      // Set trending podcasts
      setTrendingPodcasts(trendingPodcastsData);

      // Set recent episodes
      setRecentEpisodes(recentEpisodesData.slice(0, 8));

      // Create trending episodes from recent episodes
      const shuffledEpisodes = [...recentEpisodesData].sort(
        () => 0.5 - Math.random()
      );
      setTrendingEpisodes(shuffledEpisodes.slice(0, 8));

      // Create new episodes (most recent)
      const sortedByDate = [...recentEpisodesData].sort(
        (a, b) => b.publishedTimestamp - a.publishedTimestamp
      );
      setNewEpisodes(sortedByDate.slice(0, 8));

      // Set categories
      setCategories(categoriesData);

      // Enhanced featured shows with gradients
      const featured = trendingPodcastsData
        .filter((podcast) => podcast.rating >= 4.0)
        .slice(0, 6)
        .map((podcast, index) => ({
          ...podcast,
          subtitle: podcast.author,
          badge:
            podcast.rating >= 4.5
              ? "EDITOR'S CHOICE"
              : podcast.rating >= 4.2
              ? "TRENDING"
              : "FEATURED",
          isNew: index < 2,
          gradient: getGradientForIndex(index),
          accentColor: getAccentColorForIndex(index),
        }));
      setFeaturedShows(featured);

      // Set hero show
      if (featured.length > 0) {
        setHeroShow(featured[0]);
      }

      // Create top charts by combining different categories
      const allPodcasts = [
        ...trendingPodcastsData.slice(0, 4),
        ...comedyPodcasts.slice(0, 3),
        ...newsPodcasts.slice(0, 3),
        ...techPodcasts.slice(0, 2),
      ];

      const charts = allPodcasts
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 12)
        .map((podcast, index) => ({
          ...podcast,
          rank: index + 1,
          subtitle: podcast.author,
          plays: `${(Math.random() * 5 + 1).toFixed(1)}M`,
          growth: index < 5 ? "up" : Math.random() > 0.5 ? "up" : "down",
          isHot: index < 3,
          accentColor: getAccentColorForIndex(index),
        }));
      setTopCharts(charts);

      setHasLoadedOnce(true);
      
    } catch (error) {
      console.error("Error loading content:", error);
      setError(error.message);
      
      // Only show alert if this is not a background refresh
      if (!backgroundLoading && !refreshing) {
      }
    } finally {
      // Clear all loading states
      setInitialLoading(false);
      setBackgroundLoading(false);
    }
  };

  const getGradientForIndex = (index) => {
    const gradientKeys = Object.keys(colors.gradients || {});
    const availableGradients = gradientKeys.filter(
      (key) => !["hero", "featured", "header", "primary", "white"].includes(key)
    );
    if (availableGradients.length === 0) {
      return [colors.accent || "#007AFF", colors.primary || "#5856D6"];
    }
    const gradientKey = availableGradients[index % availableGradients.length];
    return colors.gradients[gradientKey];
  };

  const getAccentColorForIndex = (index) => {
    const accentKeys = Object.keys(colors.accents || {});
    if (accentKeys.length === 0) {
      return colors.accent || "#007AFF";
    }
    const accentKey = accentKeys[index % accentKeys.length];
    return colors.accents[accentKey];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent(false);
    setRefreshing(false);
  };

  const navigateToPodcastDetails = (podcast) => {
    if (!podcast?.id) {
      Alert.alert("Error", "Unable to load podcast details");
      return;
    }

    navigation.navigate(SCREEN_NAMES.DETAILS, {
      podcast: {
        ...podcast,
        host: podcast.author || podcast.host,
        subtitle: podcast.subtitle || podcast.author,
        description:
          podcast.description || `${podcast.title} is a great podcast`,
        category: podcast.category || "Entertainment",
        rating: podcast.rating || 4.5,
        totalEpisodes: podcast.episodeCount || 10,
        feedUrl: podcast.feedUrl || podcast.url,
      },
    });
  };

  const playEpisode = async (episode) => {
    try {
      if (!episode.audioUrl && !episode.audioSource) {
        Alert.alert("Error", "Audio source not available for this episode");
        return;
      }

      const audioSource =
        episode.audioUrl ||
        episode.audioSource ||
        episode.metadata?.audioSource;

      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author,
        image: episode.image,
        audioSource: audioSource,
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate,
      };

      await loadAudio(audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);

      if (sound) {
        playPause();
      }
    } catch (error) {
      console.error("Error playing episode:", error);
      Alert.alert(
        "Error",
        "Unable to play episode. Please try another episode."
      );
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("CategoryScreen", { category });
  };

  const handleShowPress = (show) => {
    navigateToPodcastDetails(show);
  };

  const handleEpisodePress = (episode) => {
    navigation.navigate(SCREEN_NAMES.EDETAILS, { episode });
  };

  const handlePlayEpisode = (episode) => {
    playEpisode(episode);
  };

  const tabs = [
    { id: "discover", title: "Discover", icon: "compass" },
    { id: "trending", title: "Trending", icon: "trending-up" },
    { id: "new", title: "New", icon: "zap" },
    { id: "charts", title: "Charts", icon: "bar-chart-2" },
  ];

  const renderHeroSection = () => (
    <Animated.View
      style={[
        styles.heroSection,
        {
          transform: [{ translateY: heroParallax }, { scale: heroScale }],
          opacity: heroOpacity,
        },
      ]}
    >
      {heroShow && (
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => handleShowPress(heroShow)}
          activeOpacity={0.95}
        >
          <ImageBackground
            source={heroShow.image}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
          >
            <LinearGradient
              colors={colors.gradients?.hero}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Feather name="award" size={12} color={colors.textWhite} />
                  <Text style={styles.heroBadgeText}>FEATURED</Text>
                </View>
                <Text style={styles.heroTitle}>{heroShow.title}</Text>
                <Text style={styles.heroSubtitle}>{heroShow.author}</Text>
                <Text style={styles.heroDescription} numberOfLines={2}>
                  {heroShow.description}
                </Text>
                <View style={styles.heroActions}>
                  <TouchableOpacity
                    style={styles.playButton}
                    activeOpacity={0.8}
                    onPress={() => handleShowPress(heroShow)}
                  >
                    <LinearGradient
                      colors={colors.gradients?.white}
                      style={styles.playButtonGradient}
                    >
                      <Ionicons
                        name="play"
                        size={20}
                        color={colors.textPrimary}
                      />
                      <Text style={styles.playButtonText}>Explore</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.followButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderFeaturedShow = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.featuredCard, { marginLeft: index === 0 ? 20 : 0 }]}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.95}
    >
      <View style={styles.featuredImageContainer}>
        <Image source={item.image} style={styles.featuredImage} />
        <LinearGradient
          colors={colors.gradients?.featured}
          style={styles.featuredImageOverlay}
        />
        {item.isNew && (
          <View style={styles.newIndicator}>
            <View style={styles.newDot} />
          </View>
        )}
        <TouchableOpacity
          style={styles.featuredPlayButton}
          onPress={() => handleShowPress(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.opacity?.white95, colors.opacity?.white80]}
            style={styles.featuredPlayGradient}
          >
            <Ionicons name="play" size={16} color={colors.textPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.featuredContent}>
        <View
          style={[styles.featuredBadge, { backgroundColor: item.accentColor }]}
        >
          <Text style={styles.featuredBadgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.featuredAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.featuredMeta}>
          <View style={styles.featuredRating}>
            <Ionicons name="star" size={12} color={colors.gold} />
            <Text style={styles.featuredRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.featuredCategory}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEpisodeCard = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.episodeCard, { marginLeft: index === 0 ? 20 : 0 }]}
      onPress={() => handleEpisodePress(item)}
      activeOpacity={0.95}
    >
      <View style={styles.episodeImageContainer}>
        <Image source={item.image} style={styles.episodeImage} />
        <TouchableOpacity
          style={styles.episodePlayButton}
          onPress={() => handlePlayEpisode(item)}
          activeOpacity={0.8}
        >
          <BlurView intensity={80} style={styles.episodePlayBlur}>
            <Ionicons name="play" size={14} color={colors.accent} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.episodeAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.episodeMeta}>
          <View style={styles.episodeMetaItem}>
            <Feather name="clock" size={10} color={colors.textSecondary} />
            <Text style={styles.episodeMetaText}>
              {typeof item.duration === "number"
                ? formatDuration(item.duration)
                : item.duration}
            </Text>
          </View>
          <View style={styles.episodeMetaItem}>
            <Feather name="calendar" size={10} color={colors.textSecondary} />
            <Text style={styles.episodeMetaText}>
              {formatPublishedDate(item.publishedTimestamp)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTopChart = ({ item, index }) => (
    <TouchableOpacity
      style={styles.chartItem}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.95}
    >
      <View style={styles.chartRankContainer}>
        <View
          style={[
            styles.chartRank,
            {
              backgroundColor:
                item.rank <= 3 ? colors.gold : colors.transparent,
              borderWidth: item.rank <= 3 ? 0 : 1,
              borderColor: colors.imageBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.chartRankText,
              {
                color:
                  item.rank <= 3 ? colors.textPrimary : colors.textSecondary,
              },
            ]}
          >
            {item.rank}
          </Text>
        </View>
        {item.isHot && (
          <View style={styles.hotIndicator}>
            <Feather name="trending-up" size={8} color={colors.error} />
          </View>
        )}
      </View>

      <View style={styles.chartImageContainer}>
        <Image source={item.image} style={styles.chartImage} />
        <View
          style={[
            styles.chartImageBorder,
            { borderColor: item.accentColor || colors.imageBorder },
          ]}
        />
      </View>

      <View style={styles.chartContent}>
        <Text style={styles.chartTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.chartAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.chartMeta}>
          <Text style={styles.chartCategory}>{item.category}</Text>
          <View style={styles.chartStats}>
            <Feather name="play" size={10} color={colors.textSecondary} />
            <Text style={styles.chartStatsText}>{item.plays}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartActions}>
        <View
          style={[
            styles.chartGrowth,
            {
              backgroundColor:
                item.growth === "up" ? colors.success : colors.error,
            },
          ]}
        >
          <Feather
            name={item.growth === "up" ? "arrow-up" : "arrow-down"}
            size={10}
            color={colors.textWhite}
          />
        </View>
        <TouchableOpacity style={styles.chartMoreButton} activeOpacity={0.7}>
          <Feather
            name="more-horizontal"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({
    title,
    subtitle,
    actionText,
    onActionPress,
    icon,
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {icon && (
          <View style={styles.sectionIcon}>
            <Feather name={icon} size={20} color={colors.accent} />
          </View>
        )}
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {actionText && (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>{actionText}</Text>
          <Feather name="arrow-right" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Show skeleton preloader only on initial load
  if (initialLoading) {
    return <SkeletonPreloader />;
  }

  // Error state - only show if no content has been loaded before
  if (error && !hasLoadedOnce) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.transparent}
          translucent
        />
        <Animated.View style={[styles.titleSection, { opacity: titleOpacity }]}>
          <Text style={styles.mainTitle}>Browse</Text>
        </Animated.View>
        <SkeletonPreloader/>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.transparent}
        translucent
      />
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <LinearGradient
            colors={colors.gradients?.header}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Browse</Text>
              {backgroundLoading && (
                <View style={styles.backgroundLoadingIndicator}>
                  <Feather name="refresh-cw" size={16} color={colors.accent} />
                </View>
              )}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >

        {/* Title Section */}
        <Animated.View style={[styles.titleSection, { opacity: titleOpacity }]}>
          <Text style={styles.mainTitle}>Browse</Text>
        </Animated.View>

        {/* Hero Section */}
        {renderHeroSection()}

        {/* Featured Shows */}
        {featuredShows.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Featured Shows"
              subtitle="Editor's picks this week"
              icon="award"
            />
            <FlatList
              data={featuredShows}
              renderItem={renderFeaturedShow}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={220}
              decelerationRate="fast"
            />
          </View>
        )}

        {/* Trending Episodes */}
        {trendingEpisodes.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Trending Now"
              subtitle="What everyone's listening to"
              icon="trending-up"
            />
            <FlatList
              data={trendingEpisodes}
              renderItem={renderEpisodeCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={180}
              decelerationRate="fast"
            />
          </View>
        )}

        {/* New Episodes */}
        {newEpisodes.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Fresh Episodes"
              subtitle="Latest releases"
              icon="zap"
            />
            <FlatList
              data={newEpisodes}
              renderItem={renderEpisodeCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={180}
              decelerationRate="fast"
            />
          </View>
        )}

        {/* Top Charts */}
        {topCharts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Top Charts"
              subtitle="Most popular shows"
              icon="bar-chart-2"
            />
            <View style={styles.chartsContainer}>
              {topCharts.map((item, index) => (
                <View key={item.id}>
                  {renderTopChart({ item, index })}
                  {index < topCharts.length - 1 && (
                    <View style={styles.chartSeparator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}