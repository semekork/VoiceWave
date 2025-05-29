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
  Animated
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Educational categories with enhanced metadata
const CATEGORIES = [
  {
    id: '1',
    title: 'Science & Nature',
    subtitle: '250+ podcasts',
    icon: 'flask',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A'],
    image: { uri: 'https://picsum.photos/400/200?random=science' },
    description: 'Explore the wonders of our universe',
    podcastCount: 250,
    totalHours: 1200
  },
  {
    id: '2',
    title: 'History & Culture',
    subtitle: '180+ podcasts',
    icon: 'library',
    color: '#FF7043',
    gradient: ['#FF7043', '#FF8A65'],
    image: { uri: 'https://picsum.photos/400/200?random=history' },
    description: 'Journey through time and civilizations',
    podcastCount: 180,
    totalHours: 890
  },
  {
    id: '3',
    title: 'Language Learning',
    subtitle: '120+ podcasts',
    icon: 'chatbubbles',
    color: '#42A5F5',
    gradient: ['#42A5F5', '#64B5F6'],
    image: { uri: 'https://picsum.photos/400/200?random=language' },
    description: 'Master new languages through audio',
    podcastCount: 120,
    totalHours: 650
  },
  {
    id: '4',
    title: 'Mental Wellness',
    subtitle: '95+ podcasts',
    icon: 'heart',
    color: '#AB47BC',
    gradient: ['#AB47BC', '#BA68C8'],
    image: { uri: 'https://picsum.photos/400/200?random=wellness' },
    description: 'Nurture your mind and soul',
    podcastCount: 95,
    totalHours: 420
  },
  {
    id: '5',
    title: 'Mathematics',
    subtitle: '75+ podcasts',
    icon: 'calculator',
    color: '#FFA726',
    gradient: ['#FFA726', '#FFB74D'],
    image: { uri: 'https://picsum.photos/400/200?random=math' },
    description: 'Discover the beauty of numbers',
    podcastCount: 75,
    totalHours: 380
  },
  {
    id: '6',
    title: 'Philosophy',
    subtitle: '85+ podcasts',
    icon: 'bulb',
    color: '#8D6E63',
    gradient: ['#8D6E63', '#A1887F'],
    image: { uri: 'https://picsum.photos/400/200?random=philosophy' },
    description: 'Explore life\'s big questions',
    podcastCount: 85,
    totalHours: 520
  }
];

// Curated collections
const COLLECTIONS = [
  {
    id: '1',
    title: 'Beginner\'s Science',
    subtitle: 'Perfect for curious minds starting their scientific journey',
    podcastCount: 15,
    image: { uri: 'https://picsum.photos/300/200?random=beginnerscience' },
    color: '#4CAF50',
    podcasts: [
      { title: 'Science Simplified', episodes: 45 },
      { title: 'Curious Kids Science', episodes: 32 },
      { title: 'Physics for Everyone', episodes: 28 }
    ]
  },
  {
    id: '2',
    title: 'Mindfulness Masters',
    subtitle: 'Curated meditation and wellness content',
    podcastCount: 12,
    image: { uri: 'https://picsum.photos/300/200?random=mindfulness' },
    color: '#AB47BC',
    podcasts: [
      { title: 'Daily Zen', episodes: 365 },
      { title: 'Mindful Moments', episodes: 120 },
      { title: 'Inner Peace Journey', episodes: 85 }
    ]
  },
  {
    id: '3',
    title: 'Historical Narratives',
    subtitle: 'Epic stories from the past',
    podcastCount: 18,
    image: { uri: 'https://picsum.photos/300/200?random=historical' },
    color: '#FF7043',
    podcasts: [
      { title: 'Ancient Civilizations', episodes: 55 },
      { title: 'World War Stories', episodes: 42 },
      { title: 'Renaissance Tales', episodes: 38 }
    ]
  }
];

// Featured content
const FEATURED_CONTENT = [
  {
    id: '1',
    type: 'podcast',
    title: 'The Learning Lab',
    subtitle: 'Educational Insights',
    description: 'Cutting-edge research in education and cognitive science',
    image: { uri: 'https://picsum.photos/300/400?random=featured1' },
    category: 'Education',
    rating: 4.9,
    episodeCount: 125,
    isNew: true,
    tags: ['Research', 'Education', 'Psychology']
  },
  {
    id: '2',
    type: 'series',
    title: 'Climate Change Chronicles',
    subtitle: 'Environmental Science Series',
    description: 'Understanding our planet\'s changing climate through expert analysis',
    image: { uri: 'https://picsum.photos/300/400?random=featured2' },
    category: 'Science & Nature',
    episodeCount: 24,
    isExclusive: true,
    tags: ['Climate', 'Environment', 'Science']
  }
];

export default function BrowseScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { addToQueue, currentPodcast } = useGlobalAudioPlayer();

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryScreen', { category });
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('CollectionScreen', { collection });
  };

  const handlePodcastPress = (podcast) => {
    navigation.navigate('PodcastDetailScreen', { podcast });
  };

  const formatTime = (hours) => {
    return hours > 1000 ? `${Math.floor(hours / 1000)}k+ hours` : `${hours} hours`;
  };

  const renderCategory = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, index % 2 === 1 && styles.categoryCardRight]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.categoryImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.categoryOverlay}
      >
        <View style={styles.categoryContent}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={24} color="#FFF" />
          </View>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
          <View style={styles.categoryStats}>
            <Text style={styles.categoryHours}>{formatTime(item.totalHours)}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCollection = ({ item }) => (
    <TouchableOpacity 
      style={styles.collectionCard}
      onPress={() => handleCollectionPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.collectionImage} />
      <View style={styles.collectionContent}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        <Text style={styles.collectionSubtitle}>{item.subtitle}</Text>
        <View style={styles.collectionMeta}>
          <View style={styles.collectionCount}>
            <Ionicons name="albums-outline" size={14} color="#8E8E93" />
            <Text style={styles.collectionCountText}>{item.podcastCount} podcasts</Text>
          </View>
        </View>
        <View style={styles.podcastPreview}>
          {item.podcasts.slice(0, 2).map((podcast, index) => (
            <Text key={index} style={styles.podcastPreviewText}>
              • {podcast.title} ({podcast.episodes} episodes)
            </Text>
          ))}
          {item.podcasts.length > 2 && (
            <Text style={styles.podcastPreviewMore}>
              + {item.podcasts.length - 2} more
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.collectionAccent, { backgroundColor: item.color }]} />
    </TouchableOpacity>
  );

  const renderFeatured = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => handlePodcastPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.featuredImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredOverlay}
      >
        <View style={styles.featuredContent}>
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {item.isExclusive && (
            <View style={styles.exclusiveBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.exclusiveBadgeText}>EXCLUSIVE</Text>
            </View>
          )}
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
          <Text style={styles.featuredDescription}>{item.description}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.featuredCategory}>{item.category}</Text>
            <Text style={styles.featuredDot}>•</Text>
            <Text style={styles.featuredEpisodes}>{item.episodeCount} episodes</Text>
          </View>
          <View style={styles.featuredTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} style={styles.featuredTag}>#{tag}</Text>
            ))}
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
            <Text style={styles.headerTitle}>Browse</Text>
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
      >
        {/* Main Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.mainTitle}>Discover Knowledge</Text>
          <Text style={styles.mainSubtitle}>
            Explore educational content curated for curious minds
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Educational Podcasts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50k+</Text>
            <Text style={styles.statLabel}>Hours of Content</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>25+</Text>
            <Text style={styles.statLabel}>Subject Areas</Text>
          </View>
        </View>

        {/* Featured Content */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured This Week</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FEATURED_CONTENT}
            renderItem={renderFeatured}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Subject</Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
            columnWrapperStyle={styles.categoriesRow}
          />
        </View>

        {/* Curated Collections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Curated Collections</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={COLLECTIONS}
            renderItem={renderCollection}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  mainHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#262726',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9C3141',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
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
    color: '#262726',
  },
  seeAllText: {
    fontSize: 14,
    color: '#9C3141',
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 280,
    height: 320,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredContent: {
    marginBottom: 12,
  },
  newBadge: {
    backgroundColor: '#9C3141',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  exclusiveBadgeText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredCategory: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  featuredDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 6,
  },
  featuredEpisodes: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featuredTag: {
    fontSize: 11,
    color: '#9C3141',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
    fontWeight: '600',
  },
  categoriesGrid: {
    paddingHorizontal: 20,
  },
  categoriesRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryCardRight: {
    marginLeft: 12,
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
    padding: 16,
  },
  categoryContent: {
    marginBottom: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 14,
    marginBottom: 6,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryHours: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  collectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  collectionContent: {
    padding: 16,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262726',
    marginBottom: 4,
  },
  collectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  collectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionCountText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  podcastPreview: {
    marginTop: 8,
  },
  podcastPreviewText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  podcastPreviewMore: {
    fontSize: 12,
    color: '#9C3141',
    fontWeight: '600',
    marginTop: 4,
  },
  collectionAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
  },
  bottomSpacing: {
    height: 100,
  },
});