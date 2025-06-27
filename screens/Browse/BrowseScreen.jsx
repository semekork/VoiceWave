import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  RefreshControl,
  ImageBackground,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useGlobalAudioPlayer } from "../../context/AudioPlayerContext";
import { SCREEN_NAMES } from "../../navigation/types";
import {
  categories,
  podcasts,
  getRecentEpisodes,
  getTrendingEpisodes,
  getNewEpisodes,
  setCurrentlyPlaying,
} from "../../constants/podcastData";
import colors from "../../constants/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function BrowseScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const {
    addToQueue,
    currentPodcast,
    isPlaying,
    loadAudio,
    setCurrentPodcast,
    playPause,
    sound,
  } = useGlobalAudioPlayer();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [trendingEpisodes, setTrendingEpisodes] = useState([]);
  const [newEpisodes, setNewEpisodes] = useState([]);
  const [featuredShows, setFeaturedShows] = useState([]);
  const [topCharts, setTopCharts] = useState([]);
  const [heroShow, setHeroShow] = useState(null);

  // Enhanced animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
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

  // Load content with animations
  useEffect(() => {
    loadContent();

    // Entrance animations
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

  const loadContent = () => {
    setRecentEpisodes(getRecentEpisodes(8));
    setTrendingEpisodes(getTrendingEpisodes(8));
    setNewEpisodes(getNewEpisodes(8));

    // Enhanced featured shows with gradients
    const featured = podcasts
      .filter((podcast) => podcast.rating >= 4.7)
      .slice(0, 6)
      .map((podcast, index) => ({
        ...podcast,
        subtitle: podcast.author,
        badge:
          podcast.rating >= 4.9
            ? "EDITOR'S CHOICE"
            : podcast.rating >= 4.8
            ? "TRENDING"
            : "FEATURED",
        isNew: index < 2,
        gradient: getGradientForIndex(index),
        accentColor: getAccentColorForIndex(index),
      }));
    setFeaturedShows(featured);

    setHeroShow(featured[0]);

    // top charts
    const charts = podcasts
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 12)
      .map((podcast, index) => ({
        ...podcast,
        rank: index + 1,
        subtitle: podcast.author,
        plays: `${(Math.random() * 5 + 1).toFixed(1)}M`,
        growth: index < 5 ? "up" : Math.random() > 0.5 ? "up" : "down",
        isHot: index < 3,
      }));
    setTopCharts(charts);
  };

  const getGradientForIndex = (index) => {
    const gradientKeys = Object.keys(colors.gradients);
    const availableGradients = gradientKeys.filter(
      (key) => !["hero", "featured", "header", "primary", "white"].includes(key)
    );
    const gradientKey = availableGradients[index % availableGradients.length];
    return colors.gradients[gradientKey];
  };

  const getAccentColorForIndex = (index) => {
    const accentKeys = Object.keys(colors.accents);
    const accentKey = accentKeys[index % accentKeys.length];
    return colors.accents[accentKey];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    loadContent();
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
      },
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
      Alert.alert("Error", "Unable to play episode");
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
              colors={colors.gradients.hero}
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
                    onPress={() => handlePlayEpisode(heroShow)}
                  >
                    <LinearGradient
                      colors={colors.gradients.white}
                      style={styles.playButtonGradient}
                    >
                      <Ionicons
                        name="play"
                        size={20}
                        color={colors.textPrimary}
                      />
                      <Text style={styles.playButtonText}>Play</Text>
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

  const renderCollection = ({ item, index }) => (
    <Animated.View
      style={[
        styles.collectionCardWrapper,
        {
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.collectionCard} activeOpacity={0.9}>
        <LinearGradient
          colors={item.gradient}
          style={styles.collectionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.collectionIconContainer}>
            <Feather name={item.icon} size={24} color={colors.textWhite} />
          </View>
          <Text style={styles.collectionTitle}>{item.title}</Text>
          <Text style={styles.collectionDescription}>{item.description}</Text>
          <View style={styles.collectionFooter}>
            <Text style={styles.collectionCount}>{item.showCount} shows</Text>
            <Feather
              name="arrow-right"
              size={16}
              color={colors.opacity.white80}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
          colors={colors.gradients.featured}
          style={styles.featuredImageOverlay}
        />
        {item.isNew && (
          <View style={styles.newIndicator}>
            <View style={styles.newDot} />
          </View>
        )}
        <TouchableOpacity
          style={styles.featuredPlayButton}
          onPress={() => handlePlayEpisode(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.opacity.white95, colors.opacity.white80]}
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
            <Text style={styles.episodeMetaText}>{item.duration}</Text>
          </View>
          <View style={styles.episodeMetaItem}>
            <Feather name="calendar" size={10} color={colors.textSecondary} />
            <Text style={styles.episodeMetaText}>{item.publishedDate}</Text>
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
            colors={colors.gradients.header}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Browse</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Hero Section */}
        {renderHeroSection()}

        {/* Featured Shows */}
        <View style={styles.section}>
          <SectionHeader
            title="Featured Shows"
            subtitle="Editor's picks this week"
            actionText="See All"
            onActionPress={() => navigation.navigate("FeaturedShows")}
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

        {/* Trending Episodes */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending Now"
            subtitle="What everyone's listening to"
            actionText="See All"
            onActionPress={() => navigation.navigate("TrendingEpisodes")}
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

        {/* New Episodes */}
        <View style={styles.section}>
          <SectionHeader
            title="Fresh Episodes"
            subtitle="Latest releases"
            actionText="See All"
            onActionPress={() => navigation.navigate("NewEpisodes")}
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

        {/* Top Charts */}
        <View style={styles.section}>
          <SectionHeader
            title="Top Charts"
            subtitle="Most popular shows"
            actionText="View All"
            onActionPress={() => navigation.navigate("TopCharts")}
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

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {/* Enhanced Currently Playing Bar */}
      {currentPodcast && (
        <Animated.View style={[styles.nowPlayingBar, { opacity: fadeAnim }]}>
          <BlurView intensity={100} style={styles.nowPlayingBlur}>
            <LinearGradient
              colors={colors.gradients.header}
              style={styles.nowPlayingGradient}
            >
              <TouchableOpacity
                style={styles.nowPlayingContent}
                activeOpacity={0.95}
              >
                <View style={styles.nowPlayingImageContainer}>
                  <Image
                    source={currentPodcast.image}
                    style={styles.nowPlayingImage}
                  />
                  <View style={styles.nowPlayingImageBorder} />
                </View>
                <View style={styles.nowPlayingInfo}>
                  <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                    {currentPodcast.title}
                  </Text>
                  <Text style={styles.nowPlayingAuthor} numberOfLines={1}>
                    {currentPodcast.author}
                  </Text>
                </View>
                <View style={styles.nowPlayingActions}>
                  <TouchableOpacity
                    style={styles.nowPlayingButton}
                    activeOpacity={0.7}
                  >
                    <Feather name="skip-back" size={18} color={colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nowPlayingMainButton}
                    activeOpacity={0.7}
                    onPress={playPause}
                  >
                    <LinearGradient
                      colors={colors.gradients.primary}
                      style={styles.nowPlayingMainGradient}
                    >
                      <Feather
                        name={isPlaying ? "pause" : "play"}
                        size={18}
                        color={colors.textWhite}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nowPlayingButton}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="skip-forward"
                      size={18}
                      color={colors.accent}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: Platform.OS === "ios" ? 100 : 80,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
  },
  headerBlur: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.buttonBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 320,
    marginBottom: 24,
  },
  heroCard: {
    flex: 1,
    margin: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: colors.textBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroBackground: {
    flex: 1,
  },
  heroBackgroundImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 24,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.opacity.white20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    color: colors.White,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.White,
    marginBottom: 6,
    textShadowColor: colors.opacity.overlay50,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.opacity.white90,
    fontWeight: "500",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: colors.opacity.white80,
    lineHeight: 20,
    marginBottom: 20,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
  },
  playButton: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textBlack,
  },
  followButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.opacity.white30,
    backgroundColor: colors.opacity.white30,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textWhite,
  },
  tabBar: {
    paddingVertical: 16,
    backgroundColor: colors.White,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.imageBorder,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.transparent,
    gap: 6,
  },
  activeTabItem: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.textWhite,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentButtonBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.shadowBlack,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  collectionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  collectionCardWrapper: {
    width: 160,
  },
  collectionCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  collectionGradient: {
    padding: 20,
    height: 140,
    justifyContent: "space-between",
  },
  collectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.opacity.white20,
    justifyContent: "center",
    alignItems: "center",
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.White,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 12,
    color: colors.opacity.white80,
    lineHeight: 16,
  },
  collectionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  collectionCount: {
    fontSize: 11,
    color: colors.opacity.white80,
    fontWeight: "500",
  },
  featuredCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: colors.White,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  featuredImageContainer: {
    position: "relative",
    height: 120,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  newIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderColor,
  },
  newDot: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.borderColor,
  },
  featuredPlayButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredPlayGradient: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredContent: {
    padding: 16,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textWhite,
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textBlack,
    marginBottom: 4,
    lineHeight: 20,
  },
  featuredAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textBlack,
  },
  featuredCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  episodeCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: colors.White,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  episodeImageContainer: {
    position: "relative",
    height: 100,
  },
  episodeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  episodePlayButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  episodePlayBlur: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  episodeContent: {
    padding: 12,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textBlack,
    marginBottom: 4,
    lineHeight: 18,
  },
  episodeAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: "row",
    gap: 12,
  },
  episodeMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  episodeMetaText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  chartsContainer: {
    paddingHorizontal: 20,
  },
  chartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  chartRankContainer: {
    position: "relative",
    width: 32,
    alignItems: "center",
  },
  chartRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  chartRankText: {
    fontSize: 14,
    fontWeight: "700",
  },
  hotIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
  },
  chartImageContainer: {
    position: "relative",
  },
  chartImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "cover",
  },
  chartImageBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: 8,
  },
  chartContent: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textBlack,
  },
  chartAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chartMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  chartCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chartStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chartStatsText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chartActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartGrowth: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chartMoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.buttonBackgroundSecondary,
  },
  chartSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 92,
  },
  bottomSpacing: {
    height: 100,
  },
  nowPlayingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.opacity.white10,
  },
  nowPlayingBlur: {
    flex: 1,
  },
  nowPlayingGradient: {
    flex: 1,
  },
  nowPlayingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  nowPlayingImageContainer: {
    position: "relative",
  },
  nowPlayingImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "cover",
  },
  nowPlayingImageBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: colors.progressBackground,
    borderRadius: 8,
  },
  nowPlayingInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  nowPlayingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.shadowBlack,
  },
  nowPlayingAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  nowPlayingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nowPlayingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accentButtonBackground,
  },
  nowPlayingMainButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  nowPlayingMainGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
