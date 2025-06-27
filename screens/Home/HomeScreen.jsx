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
import colors from '../../constants/colors.js';

import { 
  getTrendingEpisodes,
  getNewEpisodes,
  getInProgressEpisodes,
  getSubscribedPodcasts,
  getCategoryRecommendations,
  setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate
} from '../../constants/podcastData'; 

export default function HomeScreen() {
  const { greeting } = useGreeting('');
  const navigation = useNavigation();
  const { getAvatarImage, profileImage } = useProfileImage();
  
  const {
    loadAudio,
    setCurrentPodcast,
    playPause,
    sound
  } = useGlobalAudioPlayer();

  const navigateToPodcastDetails = (podcast) => {
    if (!podcast?.id) {
      Alert.alert('Error', 'Unable to load podcast details');
      return;
    }

    navigation.navigate(SCREEN_NAMES.DETAILS, { 
      podcast: {
        ...podcast,
        host: podcast.author || podcast.host,
        subtitle: podcast.subtitle || podcast.author,
        description: podcast.description || `${podcast.title} is a great podcast`,
        category: podcast.category || 'Entertainment',
        rating: podcast.rating || 4.5,
        totalEpisodes: podcast.episodeCount || 10
      }
    });
  };

  const playEpisode = async (episode) => {
    try {
      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author,
        image: episode.image,
        audioSource: episode.audioSource || episode.metadata?.audioSource || `https://example.com/audio/${episode.id}.mp3`,
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate
      };

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);
      
      if (sound) {
        playPause();
      }
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
      stars.push(<Ionicons key={i} name="star" size={12} color={colors.warning} />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color={colors.warning} />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color={colors.warning} />);
    }
    return stars;
  };

  const renderEpisodeItem = (episode) => (
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
        <Ionicons name="play-circle-outline" size={32} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPodcastItem = (podcast) => (
    <TouchableOpacity 
      key={podcast.id} 
      style={styles.podcastItem}
      onPress={() => navigateToPodcastDetails(podcast)}
    >
      <Image source={podcast.image} style={styles.podcastImage} />
      <View style={styles.podcastContent}>
        <Text style={styles.podcastTitle}>{podcast.title}</Text>
        <Text style={styles.podcastHost}>{podcast.author}</Text>
        <View style={styles.podcastRating}>
          {podcast.rating && renderStars(podcast.rating)}
          <Text style={styles.podcastRatingText}>{podcast.rating || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Get data using the imported functions
  const topEpisodes = getTrendingEpisodes(3);
  const youMightLike = getCategoryRecommendations('Health & Wellness', 5);
  const showsYouFollow = getSubscribedPodcasts(5);
  const newEpisodes = getNewEpisodes(5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <BlurView intensity={95} tint="extraLight" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.heading}>{greeting}</Text>
          <TouchableOpacity onPress={() => navigation.navigate(SCREEN_NAMES.PROFILE)}>
            <Image 
              source={profileImage ? { uri: profileImage } : getAvatarImage()}
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Top Episodes */}
        {topEpisodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Episodes</Text>
            {topEpisodes.map(renderEpisodeItem)}
          </View>
        )}

        {/* You Might Like */}
        {youMightLike.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>You Might Like</Text>
            {youMightLike.map(renderPodcastItem)}
          </View>
        )}

        {/* Shows You Follow */}
        {showsYouFollow.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shows You Follow</Text>
            {showsYouFollow.map(renderPodcastItem)}
          </View>
        )}

        {/* New Episodes */}
        {newEpisodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Episodes</Text>
            {newEpisodes.map(renderEpisodeItem)}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBackground,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerBorder,
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
    color: colors.textBlack,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.avatarBackground,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textBlack,
    marginBottom: 16,
  },
  
  // Episode Item Styles
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadowBlack,
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
    color: colors.textBlack,
    marginBottom: 4,
  },
  episodePodcast: {
    fontSize: 14,
    color: colors.textEpisodeMeta,
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeDuration: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.durationBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  episodePlays: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
  },
  episodeDate: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
  },
  
  // Podcast Item Styles
  podcastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  podcastImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  podcastContent: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textBlack,
    marginBottom: 4,
  },
  podcastHost: {
    fontSize: 14,
    color: colors.textEpisodeMeta,
    marginBottom: 8,
  },
  podcastRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  podcastRatingText: {
    fontSize: 12,
    color: colors.textEpisodeMeta,
    marginLeft: 4,
  },
  
  newBadge: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  newBadgeText: {
    color: colors.White,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
});