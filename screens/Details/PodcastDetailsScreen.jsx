import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Share,
  Alert,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRoute, useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_HEIGHT = 320; // Reduced height since buttons moved out

// Mock episode data for the selected podcast
const generateEpisodes = (podcastTitle) => [
  {
    id: '1',
    title: 'The Beginning of Everything',
    description: 'In this premiere episode, we explore the origins of our journey and what listeners can expect from this podcast series.',
    duration: '45m 32s',
    publishedDate: '2 days ago',
    publishedTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isNew: true,
    isPlayed: false,
    downloadUrl: 'https://example.com/episode1.mp3',
    episodeNumber: 1,
    season: 1
  },
  {
    id: '2',
    title: 'Deep Dive into the Unknown',
    description: 'Join us as we venture into uncharted territory and discover fascinating insights that will change your perspective.',
    duration: '52m 18s',
    publishedDate: '1 week ago',
    publishedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isNew: false,
    isPlayed: true,
    downloadUrl: 'https://example.com/episode2.mp3',
    episodeNumber: 2,
    season: 1
  },
  {
    id: '3',
    title: 'Conversations That Matter',
    description: 'Special guest interviews and meaningful discussions about topics that shape our world today.',
    duration: '38m 45s',
    publishedDate: '2 weeks ago',
    publishedTimestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isNew: false,
    isPlayed: false,
    downloadUrl: 'https://example.com/episode3.mp3',
    episodeNumber: 3,
    season: 1
  },
  {
    id: '4',
    title: 'Behind the Scenes',
    description: 'Get an exclusive look at what goes into creating each episode and meet the team behind the magic.',
    duration: '29m 12s',
    publishedDate: '3 weeks ago',
    publishedTimestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    isNew: false,
    isPlayed: true,
    downloadUrl: 'https://example.com/episode4.mp3',
    episodeNumber: 4,
    season: 1
  },
  {
    id: '5',
    title: 'Looking Forward',
    description: 'What does the future hold? We discuss upcoming trends and predictions in this forward-thinking episode.',
    duration: '41m 56s',
    publishedDate: '1 month ago',
    publishedTimestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isNew: false,
    isPlayed: false,
    downloadUrl: 'https://example.com/episode5.mp3',
    episodeNumber: 5,
    season: 1
  }
];

export default function PodcastDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const defaultPodcast = useMemo(() => ({
    title: 'Default Podcast',
    subtitle: 'Default Host',
    image: { uri: 'https://picsum.photos/400/400?random=1' }, // Better placeholder
    category: 'Entertainment',
    rating: 4.5,
    totalEpisodes: 5
  }), []);
  
  const podcast = route?.params?.podcast || defaultPodcast;
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [downloadedEpisodes, setDownloadedEpisodes] = useState(new Set());
  
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setEpisodes(generateEpisodes(podcast.title));
    setIsSubscribed(Math.random() > 0.5);
  }, [podcast.title]);

  // Animated header effects
  const headerScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Animation for floating action buttons
  const actionButtonsTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const handleSubscribe = () => {
    const newSubscriptionState = !isSubscribed;
    setIsSubscribed(newSubscriptionState);
    Alert.alert(
      newSubscriptionState ? 'Subscribed!' : 'Unsubscribed',
      newSubscriptionState 
        ? `You are now subscribed to ${podcast.title}` 
        : `You have unsubscribed from ${podcast.title}`
    );
  };

  const handlePlayEpisode = (episode) => {
    if (!episode) return;
    Alert.alert('Playing Episode', `Now playing: ${episode.title}`);
  };

  const handleDownloadEpisode = (episode) => {
    if (!episode) return;
    const newDownloaded = new Set(downloadedEpisodes);
    if (newDownloaded.has(episode.id)) {
      newDownloaded.delete(episode.id);
      Alert.alert('Download Removed', `${episode.title} removed from downloads`);
    } else {
      newDownloaded.add(episode.id);
      Alert.alert('Downloaded', `${episode.title} downloaded for offline listening`);
    }
    setDownloadedEpisodes(newDownloaded);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this podcast: ${podcast.title} by ${podcast.host || podcast.subtitle}`,
        title: podcast.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />);
    }
    return stars;
  };

  const renderEpisodeItem = ({ item }) => {
    if (!item) return null;
    
    return (
      <View style={styles.episodeItem}>
        <View style={styles.episodeHeader}>
          <View style={styles.episodeInfo}>
            {item.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
            <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.episodeDate}>{item.publishedDate} • {item.duration}</Text>
          </View>
          <View style={styles.episodeActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDownloadEpisode(item)}
            >
              <Ionicons 
                name={downloadedEpisodes.has(item.id) ? "checkmark-circle" : "download-outline"} 
                size={24} 
                color={downloadedEpisodes.has(item.id) ? "#34C759" : "#9C3141"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => handlePlayEpisode(item)}
            >
              <Ionicons 
                name={item.isPlayed ? "play-circle" : "play-circle-outline"} 
                size={32} 
                color="#9C3141" 
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.episodeDescription} numberOfLines={3}>{item.description}</Text>
        {item.isPlayed && (
          <View style={styles.playedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.playedText}>Played</Text>
          </View>
        )}
      </View>
    );
  };

  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.publishedTimestamp - b.publishedTimestamp;
        case 'played':
          return (b.isPlayed ? 1 : 0) - (a.isPlayed ? 1 : 0);
        case 'unplayed':
          return (a.isPlayed ? 1 : 0) - (b.isPlayed ? 1 : 0);
        default:
          return b.publishedTimestamp - a.publishedTimestamp;
      }
    });
  }, [episodes, sortBy]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleSortPress = () => {
    Alert.alert(
      'Sort Episodes',
      'Choose how to sort episodes',
      [
        { text: 'Newest First', onPress: () => setSortBy('newest') },
        { text: 'Oldest First', onPress: () => setSortBy('oldest') },
        { text: 'Played', onPress: () => setSortBy('played') },
        { text: 'Unplayed', onPress: () => setSortBy('unplayed') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Floating Header */}
      <Animated.View style={[styles.floatingHeader, { opacity: titleOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <View style={styles.floatingHeaderContent}>
            <TouchableOpacity onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.floatingTitle} numberOfLines={1}>{podcast.title}</Text>
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
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              transform: [
                { scale: headerScale },
                { translateY: headerTranslateY }
              ]
            }
          ]}
        >
          <Image source={podcast.image} style={styles.backgroundImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroHeader}>
              <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Ionicons name="share-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.heroContent}>
              <Image source={podcast.image} style={styles.podcastImage} />
              <Text style={styles.podcastTitle}>{podcast.title}</Text>
              <Text style={styles.podcastHost}>by {podcast.host || podcast.subtitle}</Text>
              
              {podcast.rating && (
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(podcast.rating)}
                  </View>
                  <Text style={styles.ratingText}>{podcast.rating} • {podcast.totalEpisodes || episodes.length} episodes</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Floating Action Buttons */}
        <Animated.View 
          style={[
            styles.floatingActionButtons,
            { transform: [{ translateY: actionButtonsTranslateY }] }
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
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playButtonHero}
            onPress={() => handlePlayEpisode(episodes[0])}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={20} color="#9C3141" />
            <Text style={styles.playButtonText}>Play Latest</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          
          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text 
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {podcast.description || `${podcast.title} is a captivating podcast that brings you the best content in ${podcast.category || 'entertainment'}. Join ${podcast.host || podcast.subtitle} for engaging discussions and insights that will keep you coming back for more.`}
            </Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.showMoreText}>
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Episodes Section */}
          <View style={styles.episodesSection}>
            <View style={styles.episodesHeader}>
              <Text style={styles.sectionTitle}>Episodes ({episodes.length})</Text>
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={handleSortPress}
              >
                <Ionicons name="funnel-outline" size={20} color="#9C3141" />
                <Text style={styles.sortText}>Sort</Text>
              </TouchableOpacity>
            </View>
            
            {sortedEpisodes.map((item, index) => (
              <View key={item.id} style={styles.episodeItem}>
                <View style={styles.episodeHeader}>
                  <View style={styles.episodeInfo}>
                    {item.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                    <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.episodeDate}>{item.publishedDate} • {item.duration}</Text>
                  </View>
                  <View style={styles.episodeActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDownloadEpisode(item)}
                    >
                      <Ionicons 
                        name={downloadedEpisodes.has(item.id) ? "checkmark-circle" : "download-outline"} 
                        size={24} 
                        color={downloadedEpisodes.has(item.id) ? "#34C759" : "#9C3141"} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={() => handlePlayEpisode(item)}
                    >
                      <Ionicons 
                        name={item.isPlayed ? "play-circle" : "play-circle-outline"} 
                        size={32} 
                        color="#9C3141" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.episodeDescription} numberOfLines={3}>{item.description}</Text>
                {item.isPlayed && (
                  <View style={styles.playedIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.playedText}>Played</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: Platform.OS === 'ios' ? 90 : 70,
  },
  headerBlur: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  floatingHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  floatingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  heroSection: {
    height: HEADER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  podcastImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  podcastTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  podcastHost: {
    fontSize: 16,
    color: '#E5E5E7',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#E5E5E7',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  floatingActionButtons: {
    position: 'absolute',
    top: HEADER_HEIGHT - 30, // Position to overlap with content section
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 100,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C3141',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 140,
    minHeight: 56,
  },
  subscribeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playButtonHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#9C3141',
    fontSize: 16,
    fontWeight: '600',
  },
  contentSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    paddingTop: 50, // Increased padding to accommodate floating buttons
    paddingHorizontal: 20,
    minHeight: 400,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#48484A',
    marginBottom: 12,
  },
  showMoreText: {
    fontSize: 16,
    color: '#9C3141',
    fontWeight: '500',
  },
  episodesSection: {
    marginBottom: 20,
  },
  episodesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  sortText: {
    fontSize: 16,
    color: '#9C3141',
    fontWeight: '500',
  },
  episodeItem: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  episodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  newBadge: {
    backgroundColor: '#9C3141',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  episodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 49, 65, 0.1)',
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#48484A',
    marginBottom: 8,
  },
  playedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});