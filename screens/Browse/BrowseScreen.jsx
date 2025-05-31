import React, { useState, useEffect, useRef } from 'react';
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
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import { 
  categories, 
  featuredShows, 
  topCharts, 
  getRecentEpisodes, 
  getTrendingEpisodes,
  collections 
} from '../../constants/podcastData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BrowseScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { addToQueue, currentPodcast, isPlaying } = useGlobalAudioPlayer();
  const [refreshing, setRefreshing] = useState(false);
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [trendingEpisodes, setTrendingEpisodes] = useState([]);

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Load dynamic content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = () => {
    setRecentEpisodes(getRecentEpisodes(5));
    setTrendingEpisodes(getTrendingEpisodes(5));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    loadContent();
    setRefreshing(false);
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryScreen', { category });
  };

  const handleShowPress = (show) => {
    navigation.navigate('PodcastDetailScreen', { podcast: show });
  };

  const handleEpisodePress = (episode) => {
    navigation.navigate('EpisodeDetailScreen', { episode });
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('CollectionScreen', { collection });
  };

  const handlePlayEpisode = (episode) => {
    addToQueue(episode);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.categoryImage} />
      <LinearGradient
        colors={[...item.gradient, 'rgba(0,0,0,0.4)']}
        style={styles.categoryOverlay}
      >
        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryCount}>{item.podcastCount} shows</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFeaturedShow = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.featuredImage} />
      <View style={styles.featuredContent}>
        {item.badge && (
          <View style={[
            styles.badge, 
            item.badge === 'EXCLUSIVE' && styles.exclusiveBadge,
            item.badge === 'POPULAR' && styles.popularBadge,
            item.badge === 'AWARD WINNER' && styles.awardBadge
          ]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.newBadgeText}>NEW EPISODES</Text>
          </View>
        )}
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.featuredSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={styles.featuredDescription} numberOfLines={3}>{item.description}</Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredCategory}>{item.category}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTopChart = ({ item }) => (
    <TouchableOpacity 
      style={styles.chartItem}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.chartRank, { backgroundColor: item.rank <= 3 ? '#FFD700' : '#F2F2F7' }]}>
        <Text style={[styles.chartRankText, { color: item.rank <= 3 ? '#000' : '#8E8E93' }]}>
          {item.rank}
        </Text>
      </View>
      <Image source={item.image} style={styles.chartImage} />
      <View style={styles.chartContent}>
        <Text style={styles.chartTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.chartSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <View style={styles.chartMeta}>
          <Text style={styles.chartCategory}>{item.category}</Text>
          <View style={styles.chartStats}>
            <Ionicons name="play" size={12} color="#8E8E93" />
            <Text style={styles.chartPlays}>2.1M</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRecentEpisode = ({ item }) => (
    <TouchableOpacity 
      style={styles.episodeCard}
      onPress={() => handleEpisodePress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.episodeImage} />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.episodeAuthor} numberOfLines={1}>{item.author}</Text>
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeDuration}>{item.duration}</Text>
          <Text style={styles.episodeDate}>{item.publishedDate}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => handlePlayEpisode(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="play" size={16} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCollection = ({ item }) => (
    <TouchableOpacity 
      style={styles.collectionCard}
      onPress={() => handleCollectionPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[item.color, item.color + '80']}
        style={styles.collectionGradient}
      >
        <View style={styles.collectionContent}>
          <Text style={styles.collectionTitle}>{item.title}</Text>
          <Text style={styles.collectionDescription}>{item.description}</Text>
          <Text style={styles.collectionCount}>{item.showCount} shows</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, actionText, onActionPress }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Browse</Text>
            <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
              <Ionicons name="search" size={24} color="#000000" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.mainTitle}>Browse</Text>
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <Ionicons name="search" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Collections Section */}
        <View style={styles.section}>
          <SectionHeader title="Featured Collections" />
          <FlatList
            data={collections}
            renderItem={renderCollection}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Featured Shows */}
        <View style={styles.section}>
          <SectionHeader 
            title="Featured Shows" 
            actionText="See All"
            onActionPress={() => navigation.navigate('FeaturedShows')}
          />
          <FlatList
            data={featuredShows}
            renderItem={renderFeaturedShow}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            snapToInterval={SCREEN_WIDTH - 80}
            decelerationRate="fast"
          />
        </View>

        {/* Recent Episodes */}
        <View style={styles.section}>
          <SectionHeader 
            title="Latest Episodes" 
            actionText="See All"
            onActionPress={() => navigation.navigate('RecentEpisodes')}
          />
          <FlatList
            data={recentEpisodes}
            renderItem={renderRecentEpisode}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <SectionHeader 
            title="Trending Now" 
            actionText="See All"
            onActionPress={() => navigation.navigate('TrendingEpisodes')}
          />
          <FlatList
            data={trendingEpisodes}
            renderItem={renderRecentEpisode}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Top Shows */}
        <View style={styles.section}>
          <SectionHeader 
            title="Top Shows" 
            actionText="See All"
            onActionPress={() => navigation.navigate('TopCharts')}
          />
          <FlatList
            data={topCharts || []}
            renderItem={renderTopChart}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Browse by Category" />
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
            columnWrapperStyle={styles.categoriesRow}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Currently Playing Bar */}
      {currentPodcast && (
        <View style={styles.currentlyPlayingBar}>
          <LinearGradient
            colors={['rgba(0,122,255,0.1)', 'rgba(0,122,255,0.05)']}
            style={styles.playingBarGradient}
          >
            <Image source={currentPodcast.image} style={styles.playingImage} />
            <View style={styles.playingContent}>
              <Text style={styles.playingTitle} numberOfLines={1}>
                {currentPodcast.title}
              </Text>
              <Text style={styles.playingAuthor} numberOfLines={1}>
                {currentPodcast.author}
              </Text>
            </View>
            <TouchableOpacity style={styles.playingButton} activeOpacity={0.7}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 88,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  searchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
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
    fontWeight: '600',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: SCREEN_WIDTH - 80,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: 16,
  },
  badge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  exclusiveBadge: {
    backgroundColor: '#5856D6',
  },
  popularBadge: {
    backgroundColor: '#FF3B30',
  },
  awardBadge: {
    backgroundColor: '#FFD700',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 24,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '400',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 4,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  chartRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chartRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  chartImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  chartContent: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  chartMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartCategory: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartPlays: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  moreButton: {
    padding: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 20,
  },
  episodeCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  episodeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  episodeContent: {
    padding: 12,
    paddingBottom: 16,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 18,
  },
  episodeAuthor: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeDuration: {
    fontSize: 11,
    color: '#8E8E93',
  },
  episodeDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  playButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  collectionCard: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  collectionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  collectionContent: {
    alignItems: 'center',
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  categoriesGrid: {
    paddingHorizontal: 20,
  },
  categoriesRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  categoryContent: {
    alignItems: 'flex-start',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSpacing: {
    height: 100,
  },
  currentlyPlayingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  playingBarGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  playingImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  playingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  playingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  playingAuthor: {
    fontSize: 12,
    color: '#8E8E93',
  },
  playingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});