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
  Platform,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import colors from '../../constants/colors';
import { SCREEN_NAMES } from '../../navigation/types';
import styles from './librarystyles';

import {
  getRecentEpisodesAPI,
  getPodcastsByCategoryAPI,
} from '../../constants/PodcastAPI/podcastApiService.js';

import {
  setCurrentlyPlaying,
  formatDuration,
  formatPublishedDate,
} from '../../constants/PodcastAPI/podcastUtils.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const librarySections = [
  {
    id: 'recently_played',
    title: 'Continue Listening',
    subtitle: 'Pick up where you left off',
    icon: 'play-circle-outline',
    color: colors.primary,
    count: 0
  },
  {
    id: 'downloaded',
    title: 'Downloads',
    subtitle: 'Available offline',
    icon: 'download-outline',
    color: colors.success,
    count: 0
  },
  {
    id: 'favorites',
    title: 'Favorites',
    subtitle: 'Episodes you loved',
    icon: 'heart-outline',
    color: '#FF3B30',
    count: 0
  },
  {
    id: 'playlists',
    title: 'Playlists',
    subtitle: 'Your custom collections',
    icon: 'list-outline',
    color: '#FF9500',
    count: 0
  }
];

export default function LibraryScreen({ navigation }) {
  const [selectedSection, setSelectedSection] = useState('recently_played');
  const [viewMode, setViewMode] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { 
    currentPodcast, 
    loadAudio, 
    setCurrentPodcast, 
    playPause, 
    sound 
  } = useGlobalAudioPlayer();

  const [libraryData, setLibraryData] = useState({
    recentEpisodes: [],
    downloadedEpisodes: [],
    favoriteEpisodes: [],
    playlists: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadLibraryData();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLibraryData((prev) => ({ ...prev, isLoading: true, error: null }));

      // Load data from API
      const [recentResult, categoryResult] = await Promise.allSettled([
        getRecentEpisodesAPI(10),
        getPodcastsByCategoryAPI("Technology", 8), // For downloaded simulation
      ]);

      // Process recent episodes with progress simulation
      const recentEpisodes = recentResult.status === "fulfilled" 
        ? recentResult.value.map((episode, index) => ({
            ...episode,
            progress: index % 3 === 0 ? Math.random() * 0.8 + 0.1 : 0,
            isCompleted: index % 5 === 0,
            isPlaying: false,
            timeLeft: index % 3 === 0 ? `${Math.floor(Math.random() * 30 + 5)}m left` : null,
            publishDate: formatPublishedDate(episode.publishedDate || episode.publishedTimestamp),
            showTitle: episode.author,
            artwork: episode.image,
          }))
        : [];

      // Simulate downloaded episodes from category results
      const downloadedEpisodes = categoryResult.status === "fulfilled"
        ? categoryResult.value.slice(0, 8).map((podcast, index) => ({
            id: `downloaded_${podcast.id}`,
            title: `Episode ${index + 1}: ${podcast.title.substring(0, 50)}...`,
            showTitle: podcast.author,
            artwork: podcast.image,
            duration: formatDuration(Math.floor(Math.random() * 3600 + 1800)), // 30-90 min
            downloadDate: index < 3 ? 'today' : index < 6 ? 'yesterday' : '2 days ago',
            fileSize: `${Math.floor(Math.random() * 50 + 10)}MB`,
            quality: index % 2 === 0 ? 'High' : 'Standard',
            audioSource: `https://example.com/audio/downloaded_${podcast.id}.mp3`,
            author: podcast.author,
            image: podcast.image,
            description: `Downloaded episode from ${podcast.title}`,
          }))
        : [];

      setLibraryData({
        recentEpisodes,
        downloadedEpisodes,
        favoriteEpisodes: [], // Could be populated from user preferences
        playlists: [], // Could be populated from user data
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error("Error loading library data:", error);
      setLibraryData((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load library content. Please check your connection and try again.",
      }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLibraryData();
    setRefreshing(false);
  };

  // Enhanced header animation
  const headerScale = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.95, 0.9],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const handleSectionPress = (section) => {
    setSelectedSection(section.id);
  };

  const handleEpisodePress = (episode) => {
    navigation.navigate(SCREEN_NAMES.EDETAILS, { episode });
  };

  const playEpisode = async (episode) => {
    try {
      const podcastForPlayer = {
        id: episode.id,
        title: episode.title,
        author: episode.author || episode.showTitle,
        image: episode.image || episode.artwork,
        audioSource: episode.audioSource || `https://example.com/audio/${episode.id}.mp3`,
        subtitle: episode.subtitle || episode.description,
        description: episode.description || `Episode: ${episode.title}`,
        duration: episode.duration,
        publishedDate: episode.publishedDate || episode.publishDate,
      };

      await loadAudio(podcastForPlayer.audioSource);
      setCurrentPodcast(podcastForPlayer);
      setCurrentlyPlaying(episode.id);

      if (sound) {
        playPause();
      }
    } catch (error) {
      console.error("Error playing episode:", error);
      Alert.alert("Error", "Unable to play episode. Please try again.");
    }
  };

  const handlePlayPause = (episode) => {
    playEpisode(episode);
  };

  const formatProgress = (progress) => {
    return Math.round(progress * 100);
  };

  const getSectionData = () => {
    switch (selectedSection) {
      case 'recently_played':
        return libraryData.recentEpisodes;
      case 'downloaded':
        return libraryData.downloadedEpisodes;
      case 'favorites':
        return libraryData.favoriteEpisodes;
      case 'playlists':
        return libraryData.playlists;
      default:
        return [];
    }
  };

  const getSelectedSectionInfo = () => {
    const section = librarySections.find(section => section.id === selectedSection);
    const sectionData = getSectionData();
    return {
      ...section,
      count: sectionData.length
    };
  };

  // Enhanced horizontal section selector
  const renderSectionSelector = () => (
    <View style={styles.sectionSelector}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionScrollContent}
      >
        {librarySections.map((section, index) => {
          const sectionData = getSectionData();
          const currentSection = {
            ...section,
            count: selectedSection === section.id ? getSectionData().length : 
                   section.id === 'recently_played' ? libraryData.recentEpisodes.length :
                   section.id === 'downloaded' ? libraryData.downloadedEpisodes.length :
                   section.id === 'favorites' ? libraryData.favoriteEpisodes.length :
                   libraryData.playlists.length
          };

          return (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionChip,
                selectedSection === section.id && styles.sectionChipActive
              ]}
              onPress={() => handleSectionPress(section)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.sectionIconContainer,
                selectedSection === section.id && { backgroundColor: section.color }
              ]}>
                <Ionicons 
                  name={section.icon} 
                  size={18} 
                  color={selectedSection === section.id ? colors.cardBackground : section.color} 
                />
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={[
                  styles.sectionChipTitle,
                  selectedSection === section.id && styles.sectionChipTitleActive
                ]}>
                  {section.title}
                </Text>
                {currentSection.count > 0 && (
                  <Text style={[
                    styles.sectionChipCount,
                    selectedSection === section.id && styles.sectionChipCountActive
                  ]}>
                    {currentSection.count} items
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRecentEpisode = ({ item, index }) => (
    <Animated.View
      style={[
        styles.episodeCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.episodeCardContent}
        onPress={() => handleEpisodePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.episodeImageContainer}>
          <Image 
            source={item.artwork || item.image} 
            style={styles.episodeArtwork}
            defaultSource={require("../../assets/Auth/google.png")}
          />
          {item.progress > 0 && item.progress < 1 && (
            <View style={styles.progressOverlay}>
              <View style={[styles.progressRing, { 
                transform: [{ 
                  rotate: `${item.progress * 360}deg` 
                }] 
              }]} />
            </View>
          )}
        </View>
        
        <View style={styles.episodeInfo}>
          <Text style={styles.episodeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.showTitle} numberOfLines={1}>
            {item.showTitle || item.author}
          </Text>
          
          <View style={styles.episodeMetaRow}>
            <View style={styles.episodeMeta}>
              <Text style={styles.metaText}>
                {item.publishDate || formatPublishedDate(item.publishedDate)}
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>
                {item.duration || formatDuration(item.duration)}
              </Text>
            </View>
            
            {item.timeLeft && (
              <View style={styles.timeLeftBadge}>
                <Text style={styles.timeLeftText}>{item.timeLeft}</Text>
              </View>
            )}
          </View>
          
          {item.progress > 0 && item.progress < 1 && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>
                {formatProgress(item.progress)}%
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.playButtonContainer}
          onPress={() => handlePlayPause(item)}
          activeOpacity={0.7}
        >
          <View style={styles.playButton}>
            <Ionicons 
              name={item.isPlaying ? 'pause' : 'play'} 
              size={20} 
              color={colors.cardBackground} 
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  // Enhanced downloaded episode card
  const renderDownloadedEpisode = ({ item, index }) => (
    <Animated.View
      style={[
        styles.downloadCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.downloadCardContent}
        onPress={() => handleEpisodePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.downloadImageContainer}>
          <Image 
            source={item.artwork || item.image} 
            style={styles.downloadArtwork}
            defaultSource={require("../../assets/Auth/google.png")}
          />
          <View style={styles.downloadBadge}>
            <Ionicons name="download" size={12} color={colors.cardBackground} />
          </View>
        </View>
        
        <View style={styles.downloadInfo}>
          <Text style={styles.downloadTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.downloadShow} numberOfLines={1}>
            {item.showTitle || item.author}
          </Text>
          
          <View style={styles.downloadMeta}>
            <Text style={styles.downloadMetaText}>
              Downloaded {item.downloadDate}
            </Text>
            <View style={styles.metaDot} />
            <Text style={styles.downloadMetaText}>{item.fileSize}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.qualityText}>{item.quality}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.moreButton}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderErrorMessage = () => {
    if (!libraryData.error) return null;

    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={20} color={colors.warning} />
        <Text style={styles.errorText}>{libraryData.error}</Text>
      </View>
    );
  };

  const renderContent = () => {
    const data = getSectionData();
    const sectionInfo = getSelectedSectionInfo();
    
    if (libraryData.isLoading) {
      return (
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      );
    }
    
    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconBackground, { backgroundColor: sectionInfo?.color + '20' }]}>
            <Ionicons 
              name={sectionInfo?.icon || 'radio-outline'} 
              size={48} 
              color={sectionInfo?.color || colors.textMuted} 
            />
          </View>
          <Text style={styles.emptyTitle}>
            {selectedSection === 'playlists' ? 'No Playlists Yet' : 
             selectedSection === 'favorites' ? 'No Favorites Yet' : 
             selectedSection === 'downloaded' ? 'No Downloads Yet' :
             'Nothing Here Yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedSection === 'playlists' ? 'Create your first playlist to organize your episodes' : 
             selectedSection === 'favorites' ? 'Heart episodes you love to find them here' : 
             selectedSection === 'downloaded' ? 'Download episodes to listen offline' :
             'Content will appear here as you use the app'}
          </Text>
          <TouchableOpacity 
            style={styles.emptyAction}
            onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}
          >
            <Text style={styles.emptyActionText}>
              {selectedSection === 'playlists' ? 'Create Playlist' : 'Explore Podcasts'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const renderItem = ({ item, index }) => {
      switch (selectedSection) {
        case 'recently_played':
          return renderRecentEpisode({ item, index });
        case 'downloaded':
          return renderDownloadedEpisode({ item, index });
        default:
          return null;
      }
    };

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        numColumns={viewMode === 'grid' && selectedSection === 'shows' ? 2 : 1}
        key={`${selectedSection}-${viewMode}`}
        contentContainerStyle={selectedSection === 'shows' && viewMode === 'grid' ? styles.gridContainer : null}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={80} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Animated.Text style={[styles.headerTitle, { transform: [{ scale: headerScale }] }]}>
              Library
            </Animated.Text>
            <View style={styles.headerActions}>
              {selectedSection === 'shows' && (
                <TouchableOpacity 
                  style={styles.viewToggle}
                  onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={viewMode === 'list' ? 'grid-outline' : 'list-outline'} 
                    size={20} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              )}
            </View>
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
        scrollEventThrottle={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Enhanced Title Section */}
        <Animated.View style={[styles.titleSection, { opacity: titleOpacity }]}>
          <Text style={styles.mainTitle}>Your Library</Text>
          <Text style={styles.subtitle}>All your content in one place</Text>
        </Animated.View>

        {/* Error Message */}
        {renderErrorMessage()}

        {/* Section Selector */}
        {renderSectionSelector()}

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>
              {getSelectedSectionInfo()?.title}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {getSelectedSectionInfo()?.subtitle}
            </Text>
          </View>
          <Text style={styles.sectionCount}>
            {getSectionData().length} items
          </Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}