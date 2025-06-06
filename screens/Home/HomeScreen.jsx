import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import useGreeting from '../../hooks/useGreeting';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useProfileImage } from '../../context/ProfileImageContext';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import { SCREEN_NAMES } from '../../navigation/types'; 
import { 
  podcasts, 
  episodes, 
  collections,
  getTrendingEpisodes,
  getNewEpisodes,
  getRecentEpisodes,
  getInProgressEpisodes,
  getSubscribedPodcasts,
  getCategoryRecommendations,
  toggleSubscription as togglePodcastSubscription,
  setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate
} from '../../constants/podcastData';

export default function HomeScreen() {
  const [subscribedPodcasts, setSubscribedPodcasts] = useState(new Set());
  
  const { greeting } = useGreeting('');
  const navigation = useNavigation();
  const { getAvatarImage, profileImage } = useProfileImage();
  
  // Add audio player context
  const {
    loadAudio,
    setCurrentPodcast,
    playPause,
    isPlaying,
    audioSource,
    sound
  } = useGlobalAudioPlayer();

  useEffect(() => {
    // Initialize subscribed podcasts from data
    const initialSubscriptions = new Set(
      getSubscribedPodcasts().map(podcast => podcast.id)
    );
    setSubscribedPodcasts(initialSubscriptions);
  }, []);

  const toggleSubscription = (podcastId) => {
    const isCurrentlySubscribed = subscribedPodcasts.has(podcastId);
    const newSubscribed = new Set(subscribedPodcasts);
    
    if (isCurrentlySubscribed) {
      newSubscribed.delete(podcastId);
      Alert.alert('Unsubscribed', 'You have unsubscribed from this podcast');
    } else {
      newSubscribed.add(podcastId);
      Alert.alert('Subscribed!', 'You are now subscribed to this podcast');
    }
    
    setSubscribedPodcasts(newSubscribed);
    // Update the main data
    togglePodcastSubscription(podcastId);
  };

  // Fixed navigation function with proper screen name
  const navigateToPodcastDetails = (podcast) => {
    try {
      // Ensure we have a valid podcast object
      if (!podcast || !podcast.id) {
        Alert.alert('Error', 'Unable to load podcast details');
        return;
      }

      // Navigate using the correct screen name from SCREEN_NAMES
      navigation.navigate(SCREEN_NAMES.DETAILS, { 
        podcast: {
          ...podcast,
          // Ensure we have all required fields for the detail screen
          host: podcast.author || podcast.host,
          subtitle: podcast.subtitle || podcast.author,
          description: podcast.description || `${podcast.title} is a great podcast`,
          category: podcast.category || 'Entertainment',
          rating: podcast.rating || 4.5,
          totalEpisodes: podcast.episodeCount || 10
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to navigate to podcast details');
    }
  };

  const playPodcast = (podcast) => {
    Alert.alert('Playing', `Now playing: ${podcast.title}`);
  };

  // Updated playEpisode function to integrate with MiniPlayer
  const playEpisode = async (episode) => {
    try {
      // Create a podcast object from the episode data for the audio player
      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author,
        image: episode.image,
        audioSource: episode.audioSource || episode.audio || `https://example.com/audio/${episode.id}.mp3`, // Fallback audio URL
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate
      };

      // Load the audio and set current podcast
      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      
      // Update the currently playing episode ID in your data
      setCurrentlyPlaying(episode.id);
      
      // Start playing
      if (sound) {
        playPause();
      }
      
      console.log('Now playing episode:', episode.title);
    } catch (error) {
      console.error('Error playing episode:', error);
      Alert.alert('Error', 'Unable to play episode');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#FFD700" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#FFD700" />);
    }
    return stars;
  };

  const renderTopEpisodeItem = (episode) => (
    <TouchableOpacity 
      key={episode.id} 
      style={styles.episodeItem}
      onPress={() => playEpisode(episode)}
    >
      <Image source={episode.image} style={styles.episodeImage} />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>{episode.title}</Text>
        <Text style={styles.episodePodcast} numberOfLines={1}>{episode.author}</Text>
        <View style={styles.episodeMeta}>
          <Text style={styles.episodeDuration}>{formatDuration(episode.duration)}</Text>
          <Text style={styles.episodePlays}>{episode.metadata?.plays || '0'} plays</Text>
          <Text style={styles.episodeDate}>{formatPublishedDate(episode.publishedDate)}</Text>
        </View>
      </View>
      {episode.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => playEpisode(episode)}>
        <Ionicons name="play-circle-outline" size={32} color="#9C3141" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderNewNoteworthyCard = (podcast) => (
    <TouchableOpacity 
      key={podcast.id} 
      style={styles.newNoteworthyCard}
      onPress={() => navigateToPodcastDetails(podcast)}
    >
      <View style={[styles.cardGradient, { backgroundColor: '#9C3141' }]}>
        {podcast.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <Image source={podcast.image} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{podcast.title}</Text>
          <Text style={styles.cardSubtitle}>{podcast.subtitle || podcast.description}</Text>
          <Text style={styles.cardHost}>{podcast.author}</Text>
          <View style={styles.cardRating}>
            {podcast.rating && renderStars(podcast.rating)}
            <Text style={styles.cardRatingText}>{podcast.rating || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCollectionCard = (collection) => (
    <TouchableOpacity 
      key={collection.id} 
      style={[styles.collectionCard, { backgroundColor: collection.color }]}
      onPress={() => Alert.alert('Collection', `Browse ${collection.title}`)}
    >
      <Image source={collection.image} style={styles.collectionImage} />
      <View style={styles.collectionContent}>
        <Text style={styles.collectionTitle}>{collection.title}</Text>
        <Text style={styles.collectionDescription}>{collection.description}</Text>
        <Text style={styles.collectionCount}>{collection.showCount} shows</Text>
      </View>
    </TouchableOpacity>
  );

  const renderYouMightLikeItem = (podcast) => (
    <TouchableOpacity 
      key={podcast.id} 
      style={styles.suggestionItem}
      onPress={() => navigateToPodcastDetails(podcast)}
    >
      <Image source={podcast.image} style={styles.suggestionImage} />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{podcast.title}</Text>
        <Text style={styles.suggestionHost}>{podcast.author}</Text>
        <Text style={styles.suggestionReason}>Based on your interests</Text>
        <View style={styles.suggestionRating}>
          {podcast.rating && renderStars(podcast.rating)}
          <Text style={styles.suggestionRatingText}>{podcast.rating || 'N/A'}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => playPodcast(podcast)}>
        <Ionicons name="play-circle-outline" size={32} color="#9C3141" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRecentlyPlayedItem = (episode) => (
    <TouchableOpacity 
      key={episode.id} 
      style={styles.recentItem}
      onPress={() => playEpisode(episode)}
    >
      <Image source={episode.image} style={styles.recentImage} />
      <View style={styles.recentContent}>
        <Text style={styles.recentTitle}>{episode.title}</Text>
        <Text style={styles.recentPodcast}>{episode.author}</Text>
        <Text style={styles.recentTime}>Last played {formatPublishedDate(episode.publishedDate)}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(episode.metadata?.progress || 0) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round((episode.metadata?.progress || 0) * 100)}%</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => playEpisode(episode)}>
        <Ionicons name="play-circle" size={32} color="#9C3141" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFollowedShowItem = (podcast) => (
    <TouchableOpacity 
      key={podcast.id} 
      style={styles.followedItem}
      onPress={() => navigateToPodcastDetails(podcast)}
    >
      <Image source={podcast.image} style={styles.followedImage} />
      <View style={styles.followedContent}>
        <Text style={styles.followedTitle}>{podcast.title}</Text>
        <Text style={styles.followedHost}>{podcast.author}</Text>
        <Text style={styles.followedUpdate}>Episodes: {podcast.episodeCount || 0}</Text>
      </View>
      {podcast.isNew && (
        <View style={styles.episodeBadge}>
          <Text style={styles.episodeBadgeText}>NEW</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderNewEpisodeItem = (episode) => (
    <TouchableOpacity 
      key={episode.id} 
      style={styles.newEpisodeItem}
      onPress={() => playEpisode(episode)}
    >
      <Image source={episode.image} style={styles.newEpisodeImage} />
      <View style={styles.newEpisodeContent}>
        <Text style={styles.newEpisodeTitle}>{episode.title}</Text>
        <Text style={styles.newEpisodePodcast}>{episode.author}</Text>
        <View style={styles.newEpisodeMeta}>
          <Text style={styles.newEpisodeTime}>{formatPublishedDate(episode.publishedDate)}</Text>
          <Text style={styles.newEpisodeDuration}>{formatDuration(episode.duration)}</Text>
        </View>
      </View>
      {episode.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => playEpisode(episode)}>
        <Ionicons name="play-circle-outline" size={32} color="#9C3141" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Get data using utility functions
  const topEpisodes = getTrendingEpisodes(3);
  const newNoteworthy = podcasts.filter(p => p.isNew).slice(0, 10);
  const featuredCollections = collections.slice(0, 5);
  const youMightLike = getCategoryRecommendations('Health & Wellness', 5);
  const recentlyPlayed = getInProgressEpisodes().slice(0, 5);
  const showsYouFollow = getSubscribedPodcasts().slice(0, 5);
  const newEpisodes = getNewEpisodes(5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BlurView intensity={95} tint="extraLight" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.heading}>{greeting}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.PROFILE)}>
              <Image 
                source={profileImage ? { uri: profileImage } : getAvatarImage()}
                style={styles.avatar} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>

        {/* Top Episodes */}
        {topEpisodes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Episodes</Text>
              <TouchableOpacity onPress={() => Alert.alert('Top Episodes', 'View all top episodes')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {topEpisodes.map(renderTopEpisodeItem)}
          </View>
        )}

        {/* New & Noteworthy */}
        {newNoteworthy.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New & Noteworthy</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {newNoteworthy.map(renderNewNoteworthyCard)}
            </ScrollView>
          </View>
        )}

        {/* Featured Collections */}
        {featuredCollections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Collections</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {featuredCollections.map(renderCollectionCard)}
            </ScrollView>
          </View>
        )}

        {/* You Might Like */}
        {youMightLike.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>You Might Like</Text>
              <TouchableOpacity onPress={() => Alert.alert('Suggestions', 'View more suggestions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {youMightLike.map(renderYouMightLikeItem)}
          </View>
        )}

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Played</Text>
              <TouchableOpacity onPress={() => Alert.alert('Recently Played', 'View all recently played')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentlyPlayed.map(renderRecentlyPlayedItem)}
          </View>
        )}

        {/* Shows You Follow */}
        {showsYouFollow.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shows You Follow</Text>
              <TouchableOpacity onPress={() => Alert.alert('Following', 'View all shows you follow')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {showsYouFollow.map(renderFollowedShowItem)}
          </View>
        )}

        {/* New Episodes */}
        {newEpisodes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Episodes</Text>
              <TouchableOpacity onPress={() => Alert.alert('New Episodes', 'View all new episodes')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {newEpisodes.map(renderNewEpisodeItem)}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomPadding} />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAllText: {
    fontSize: 16,
    color: '#9C3141',
    fontWeight: '500',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  
  topShowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  showRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C3141',
    width: 30,
    textAlign: 'center',
    marginRight: 12,
  },
  showImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  showContent: {
    flex: 1,
  },
  showTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  showHost: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  showMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showCategory: {
    fontSize: 12,
    color: '#9C3141',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  showRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showRatingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  subscribeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  subscribeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#000',
    marginBottom: 4,
  },
  episodePodcast: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeDuration: {
    fontSize: 12,
    color: '#9C3141',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  episodePlays: {
    fontSize: 12,
    color: '#8E8E93',
  },
  episodeDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  newNoteworthyCard: {
    width: 200,
    marginRight: 16,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
    minHeight: 240,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  cardHost: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRatingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },

  collectionCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    minHeight: 200,
  },
  collectionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 12,
  },
  collectionContent: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  collectionCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Suggestion Styles
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  suggestionHost: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 12,
    color: '#9C3141',
    marginBottom: 8,
  },
  suggestionRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionRatingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  
  // Recently Played Styles
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recentPodcast: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9C3141',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    minWidth: 30,
  },

  followedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  followedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  followedContent: {
    flex: 1,
  },
  followedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  followedHost: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  followedUpdate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  episodeBadge: {
    backgroundColor: '#9C3141',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  episodeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newEpisodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  newEpisodeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  newEpisodeContent: {
    flex: 1,
  },
  newEpisodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  newEpisodePodcast: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  newEpisodeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  newEpisodeTime: {
    fontSize: 12,
    color: '#9C3141',
  },
  newEpisodeDuration: {
    fontSize: 12,
    color: '#8E8E93',
  },
  newBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
});