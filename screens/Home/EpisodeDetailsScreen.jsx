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
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import { 
  getEpisodeById, 
  getPodcastById,
  formatDuration, 
  formatPublishedDate,
  setCurrentlyPlaying
} from '../../constants/podcastData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HEADER_HEIGHT = 320;

export default function EpisodeDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const {
    loadAudio,
    setCurrentPodcast,
    playPause,
    sound,
    isPlaying,
    currentPodcast
  } = useGlobalAudioPlayer();
  
  // Get episode data from route params or data file
  const episodeId = route?.params?.episode?.id || route?.params?.episodeId;
  const podcastId = route?.params?.podcast?.id || route?.params?.podcastId;
  
  const episode = useMemo(() => {
    if (route?.params?.episode && !episodeId) {
      return route.params.episode;
    }
    return getEpisodeById(episodeId) || {
      id: 'default',
      title: 'Default Episode',
      description: 'A great episode for your listening pleasure.',
      publishedDate: new Date().toISOString(),
      duration: 3600,
      audioSource: 'https://example.com/audio.mp3'
    };
  }, [episodeId, route?.params?.episode]);

  const podcast = useMemo(() => {
    if (route?.params?.podcast) {
      return route.params.podcast;
    }
    return getPodcastById(podcastId || episode.podcastId) || {
      id: 'default',
      title: 'Default Podcast',
      author: 'Default Host',
      image: { uri: 'https://picsum.photos/400/400?random=1' },
      category: 'Entertainment'
    };
  }, [podcastId, episode.podcastId, route?.params?.podcast]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const isCurrentEpisode = currentPodcast?.id === episode.id;

  useEffect(() => {
    // Simulate loading states
    setIsBookmarked(Math.random() > 0.7);
    setIsDownloaded(Math.random() > 0.8);
  }, [episode.id]);

  // Helper function to normalize image format
  const normalizeImageSource = (imageSource) => {
    if (!imageSource) return null;
    
    if (typeof imageSource === 'object' && imageSource.uri) {
      return imageSource;
    }
    
    if (typeof imageSource === 'string') {
      return { uri: imageSource };
    }
    
    if (typeof imageSource === 'number') {
      return imageSource;
    }
    
    return null;
  };

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

  const actionButtonsTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    Alert.alert(
      newBookmarkState ? 'Bookmarked!' : 'Bookmark Removed',
      newBookmarkState 
        ? `${episode.title} added to bookmarks` 
        : `${episode.title} removed from bookmarks`
    );
  };

  const handleDownload = () => {
    const newDownloadState = !isDownloaded;
    setIsDownloaded(newDownloadState);
    Alert.alert(
      newDownloadState ? 'Downloaded!' : 'Download Removed',
      newDownloadState 
        ? `${episode.title} downloaded for offline listening` 
        : `${episode.title} removed from downloads`
    );
  };

  const playEpisode = async () => {
    if (!episode) return;
    
    try {
      const episodeImage = normalizeImageSource(episode.image);
      const podcastImage = normalizeImageSource(podcast.image);
      const primaryImage = episodeImage || podcastImage;

      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author || podcast.author,
        image: primaryImage,
        audioSource: episode.audioSource || `https://example.com/audio/${episode.id}.mp3`,
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate,
        podcastTitle: podcast.title,
        podcastAuthor: podcast.author,
        podcastImage: podcastImage
      };

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);
      
      if (sound) {
        playPause();
      }

      navigation.navigate('PlayerScreen', {
        podcast: podcastForPlayer,
        episode: episode
      });
      
    } catch (error) {
      console.error('Error playing episode:', error);
      Alert.alert('Error', 'Unable to play episode');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this episode: ${episode.title} from ${podcast.title}`,
        title: episode.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };


  const handleGoToPodcast = () => {
    navigation.navigate('PodcastDetailsScreen', {
      podcast: podcast,
      podcastId: podcast.id
    });
  };

  const primaryImage = normalizeImageSource(episode.image) || normalizeImageSource(podcast.image);

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
            <Text style={styles.floatingTitle} numberOfLines={1}>{episode.title}</Text>
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
          <Image source={primaryImage} style={styles.backgroundImage} />
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
              <Image source={primaryImage} style={styles.episodeImage} />
              <Text style={styles.episodeTitle}>{episode.title}</Text>
              <TouchableOpacity onPress={handleGoToPodcast}>
                <Text style={styles.podcastTitle}>{podcast.title}</Text>
              </TouchableOpacity>
              <Text style={styles.episodeAuthor}>by {episode.author || podcast.author}</Text>
              
              <View style={styles.episodeMetadata}>
                <Text style={styles.metadataText}>
                  {formatPublishedDate(episode.publishedDate)} • {formatDuration(episode.duration)}
                </Text>
                {episode.episodeNumber && (
                  <Text style={styles.metadataText}>
                    Episode {episode.episodeNumber}
                    {episode.season && ` • Season ${episode.season}`}
                  </Text>
                )}
              </View>
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
            style={[styles.playButton, isCurrentEpisode && isPlaying && styles.playButtonActive]}
            onPress={playEpisode}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isCurrentEpisode && isPlaying ? "pause" : "play"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.playButtonText}>
              {isCurrentEpisode && isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleBookmark}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color="#9C3141" 
            />
            <Text style={styles.secondaryButtonText}>
              {isBookmarked ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          
          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleDownload}
            >
              <Ionicons 
                name={isDownloaded ? "checkmark-circle" : "download-outline"} 
                size={24} 
                color={isDownloaded ? "#34C759" : "#9C3141"} 
              />
              <Text style={[styles.quickActionText, isDownloaded && styles.quickActionTextSuccess]}>
                {isDownloaded ? 'Downloaded' : 'Download'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setShowTranscript(!showTranscript)}
            >
              <Ionicons name="document-text-outline" size={24} color="#9C3141" />
              <Text style={styles.quickActionText}>Transcript</Text>
            </TouchableOpacity>
          </View>

          {/* Episode Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Episode Description</Text>
            <Text 
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {episode.description || 'No description available for this episode.'}
            </Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.showMoreText}>
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transcript Section */}
          {showTranscript && (
            <View style={styles.transcriptSection}>
              <Text style={styles.sectionTitle}>Transcript</Text>
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptText}>
                  {episode.transcript || 'Transcript not available for this episode.'}
                </Text>
              </View>
            </View>
          )}

          {/* Episode Tags */}
          {episode.tags && episode.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {episode.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Podcast Info */}
          <View style={styles.podcastInfoSection}>
            <Text style={styles.sectionTitle}>About {podcast.title}</Text>
            <TouchableOpacity 
              style={styles.podcastInfoCard}
              onPress={handleGoToPodcast}
              activeOpacity={0.7}
            >
              <Image source={normalizeImageSource(podcast.image)} style={styles.podcastInfoImage} />
              <View style={styles.podcastInfoContent}>
                <Text style={styles.podcastInfoTitle}>{podcast.title}</Text>
                <Text style={styles.podcastInfoAuthor}>by {podcast.author}</Text>
                {podcast.category && (
                  <Text style={styles.podcastInfoCategory}>{podcast.category}</Text>
                )}
                <Text style={styles.podcastInfoDescription} numberOfLines={2}>
                  {podcast.description || 'No description available.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
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
  episodeImage: {
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
  episodeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  podcastTitle: {
    fontSize: 16,
    color: '#E5E5E7',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textDecorationLine: 'underline',
  },
  episodeAuthor: {
    fontSize: 14,
    color: '#E5E5E7',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  episodeMetadata: {
    alignItems: 'center',
    marginBottom: 16,
  },
  metadataText: {
    fontSize: 14,
    color: '#E5E5E7',
    textAlign: 'center',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  floatingActionButtons: {
    position: 'absolute',
    top: HEADER_HEIGHT - 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 100,
  },
  playButton: {
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
  playButtonActive: {
    backgroundColor: '#7A2530',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: '#9C3141',
    fontSize: 16,
    fontWeight: '600',
  },
  contentSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    paddingTop: 50,
    paddingHorizontal: 20,
    minHeight: 400,
  },
  quickActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 49, 65, 0.05)',
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: '#9C3141',
    fontWeight: '500',
  },
  quickActionTextSuccess: {
    color: '#34C759',
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
  transcriptSection: {
    marginBottom: 32,
  },
  transcriptContainer: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C3141',
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#48484A',
  },
  tagsSection: {
    marginBottom: 32,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#48484A',
    fontWeight: '500',
  },
  podcastInfoSection: {
    marginBottom: 32,
  },
  podcastInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    gap: 12,
  },
  podcastInfoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  podcastInfoContent: {
    flex: 1,
  },
  podcastInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  podcastInfoAuthor: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  podcastInfoCategory: {
    fontSize: 12,
    color: '#9C3141',
    fontWeight: '500',
    marginBottom: 4,
  },
  podcastInfoDescription: {
    fontSize: 12,
    color: '#48484A',
    lineHeight: 16,
  },
  bottomPadding: {
    height: 100,
  },
});