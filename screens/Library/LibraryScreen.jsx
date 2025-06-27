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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: Platform.OS === 'ios' ? 88 : 68,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    marginRight: 16,
    padding: 4,
  },
  searchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 24,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  sectionSelector: {
    paddingBottom: 20,
  },
  sectionScrollContent: {
    paddingHorizontal: 20,
  },
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.White,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionChipActive: {
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: 12,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionChipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionChipTitleActive: {
    color: colors.primary,
  },
  sectionChipCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionChipCountActive: {
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  episodeCard: {
    marginBottom: 12,
  },
  episodeCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  episodeImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  episodeArtwork: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  progressOverlay: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
  },
  progressRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  showTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  episodeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 6,
  },
  timeLeftBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timeLeftText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.progressBackground,
    borderRadius: 1.5,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  progressPercentage: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    minWidth: 32,
  },
  playButtonContainer: {
    marginLeft: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadCard: {
    marginBottom: 12,
  },
  downloadCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  downloadImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  downloadArtwork: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  downloadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  downloadShow: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  downloadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  downloadMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  qualityText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  showListCard: {
    marginBottom: 12,
  },
  showGridCard: {
    flex: 1,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  showCardContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  showListImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  showGridImageContainer: {
    position: 'relative',
    marginBottom: 12,
    alignSelf: 'center',
  },
  showListArtwork: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  showGridArtwork: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  newEpisodesBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  newEpisodesText: {
    fontSize: 10,
    color: colors.cardBackground,
    fontWeight: '700',
  },
  notificationIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  showInfo: {
    flex: 1,
  },
  showListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  showGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  showListAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  showGridAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  showMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeCountText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
  gridContainer: {
    paddingHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: colors.cardBackground,
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 120,
  },
});