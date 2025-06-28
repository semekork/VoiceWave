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
  Platform
} from 'react-native';
import { Ionicons, } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import {
  episodes,
  podcasts,
  getRecentEpisodes,
  getEpisodesByPodcast,
  getSubscribedPodcasts
} from '../../constants/podcastData';
import colors from '../../constants/colors';
import { SCREEN_NAMES } from '../../navigation/types';
import styles from './librarystyles';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;


const librarySections = [
  {
    id: 'recently_played',
    title: 'Continue Listening',
    subtitle: 'Pick up where you left off',
    icon: 'play-circle-outline',
    color: colors.primary,
    count: 12
  },
  {
    id: 'downloaded',
    title: 'Downloads',
    subtitle: 'Available offline',
    icon: 'download-outline',
    color: colors.success,
    count: 8
  },
  {
    id: 'favorites',
    title: 'Favorites',
    subtitle: 'Episodes you loved',
    icon: 'heart-outline',
    color: '#FF3B30',
    count: 15
  },
  {
    id: 'playlists',
    title: 'Playlists',
    subtitle: 'Your custom collections',
    icon: 'list-outline',
    color: '#FF9500',
    count: 3
  }
];

// Create recent episodes with progress simulation
const createRecentEpisodes = () => {
  return getRecentEpisodes(10).map((episode, index) => ({
    ...episode,
    id: episode.id,
    title: episode.title,
    showTitle: episode.author,
    artwork: episode.image,
    publishDate: episode.publishedDate,
    duration: episode.duration,
    progress: index % 3 === 0 ? Math.random() * 0.8 + 0.1 : 0,
    isCompleted: index % 5 === 0,
    isPlaying: false,
    audioSource: episode.metadata?.audioSource,
    timeLeft: index % 3 === 0 ? `${Math.floor(Math.random() * 30 + 5)}m left` : null
  }));
};

// Create downloaded episodes
const createDownloadedEpisodes = () => {
  return episodes.slice(0, 8).map((episode, index) => ({
    ...episode,
    id: episode.id,
    title: episode.title,
    showTitle: episode.author,
    artwork: episode.image,
    duration: episode.duration,
    downloadDate: index < 3 ? 'today' : index < 6 ? 'yesterday' : '2 days ago',
    fileSize: `${Math.floor(Math.random() * 50 + 10)}MB`,
    audioSource: episode.metadata?.audioSource,
    quality: index % 2 === 0 ? 'High' : 'Standard'
  }));
};


export default function LibraryScreen({ navigation }) {
  const [selectedSection, setSelectedSection] = useState('recently_played');
  const [recentEpisodes, setRecentEpisodes] = useState([]);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { currentPodcast, playPodcast, pausePodcast } = useGlobalAudioPlayer();

  useEffect(() => {
    setRecentEpisodes(createRecentEpisodes());
    setDownloadedEpisodes(createDownloadedEpisodes());

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

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
    // Add haptic feedback here if available
  };

  const handleEpisodePress = (episode) => {
    navigation.navigate(SCREEN_NAMES.EDETAILS, { episode });
  };

  const handlePlayPause = (episode) => {
    if (episode.isPlaying) {
      pausePodcast();
    } else {
      playPodcast(episode);
    }
  };

  const formatProgress = (progress) => {
    return Math.round(progress * 100);
  };

  const getSectionData = () => {
    switch (selectedSection) {
      case 'recently_played':
        return recentEpisodes;
      case 'downloaded':
        return downloadedEpisodes;
      default:
        return [];
    }
  };

  const getSelectedSectionInfo = () => {
    return librarySections.find(section => section.id === selectedSection);
  };

  // Enhanced horizontal section selector
  const renderSectionSelector = () => (
    <View style={styles.sectionSelector}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionScrollContent}
      >
        {librarySections.map((section, index) => (
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
              {section.count > 0 && (
                <Text style={[
                  styles.sectionChipCount,
                  selectedSection === section.id && styles.sectionChipCountActive
                ]}>
                  {section.count} items
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
          <Image source={item.artwork} style={styles.episodeArtwork} />
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
            {item.showTitle}
          </Text>
          
          <View style={styles.episodeMetaRow}>
            <View style={styles.episodeMeta}>
              <Text style={styles.metaText}>{item.publishDate}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{item.duration}</Text>
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
          <Image source={item.artwork} style={styles.downloadArtwork} />
          <View style={styles.downloadBadge}>
            <Ionicons name="download" size={12} color={colors.cardBackground} />
          </View>
        </View>
        
        <View style={styles.downloadInfo}>
          <Text style={styles.downloadTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.downloadShow} numberOfLines={1}>
            {item.showTitle}
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

  // Enhanced show card with grid layout option
  const renderShow = ({ item, index }) => (
    <Animated.View
      style={[
        viewMode === 'grid' ? styles.showGridCard : styles.showListCard,
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
        style={styles.showCardContent}
        onPress={() => handleShowPress(item)}
        activeOpacity={0.8}
      >
        <View style={viewMode === 'grid' ? styles.showGridImageContainer : styles.showListImageContainer}>
          <Image 
            source={item.artwork} 
            style={viewMode === 'grid' ? styles.showGridArtwork : styles.showListArtwork} 
          />
          {item.newEpisodes > 0 && (
            <View style={styles.newEpisodesBadge}>
              <Text style={styles.newEpisodesText}>{item.newEpisodes}</Text>
            </View>
          )}
          {item.isNotificationEnabled && (
            <View style={styles.notificationIndicator}>
              <Ionicons name="notifications" size={10} color={colors.cardBackground} />
            </View>
          )}
        </View>
        
        <View style={styles.showInfo}>
          <Text 
            style={viewMode === 'grid' ? styles.showGridTitle : styles.showListTitle} 
            numberOfLines={viewMode === 'grid' ? 2 : 1}
          >
            {item.title}
          </Text>
          <Text 
            style={viewMode === 'grid' ? styles.showGridAuthor : styles.showListAuthor} 
            numberOfLines={1}
          >
            {item.author}
          </Text>
          
          <View style={styles.showMeta}>
            <Text style={styles.episodeCountText}>
              {item.episodeCount} episodes
            </Text>
            {viewMode === 'list' && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.lastUpdatedText}>
                  Updated {item.lastUpdated}
                </Text>
              </>
            )}
          </View>
        </View>
        
        {viewMode === 'list' && (
          <TouchableOpacity 
            style={styles.moreButton}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderContent = () => {
    const data = getSectionData();
    const sectionInfo = getSelectedSectionInfo();
    
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
             'Nothing Here Yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedSection === 'playlists' ? 'Create your first playlist to organize your episodes' : 
             selectedSection === 'favorites' ? 'Heart episodes you love to find them here' : 
             'Content will appear here as you use the app'}
          </Text>
          <TouchableOpacity style={styles.emptyAction}>
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
      >
        {/* Enhanced Title Section */}
        <Animated.View style={[styles.titleSection, { opacity: titleOpacity }]}>
          <Text style={styles.mainTitle}>Your Library</Text>
          <Text style={styles.subtitle}>All your content in one place</Text>
        </Animated.View>

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
