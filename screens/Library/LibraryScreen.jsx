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
import { BlurView } from 'expo-blur';
import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import { librarySections, recentEpisodes, downloadedEpisodes, subscribedShows } from '../../data/podcastData';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Updated color palette
const colors = {
  primary: '#9C3141',     // Deep red/burgundy
  secondary: '#262726',   // Dark charcoal
  background: '#F5F5F5',  // Light background
  cardBackground: '#FFFFFF',
  textPrimary: '#262726', // Using secondary color for primary text
  textSecondary: '#666666',
  textMuted: '#999999',
  success: '#34C759',
  progressBackground: '#E5E5EA',
  separator: '#E0E0E0',
};



export default function LibraryScreen({ navigation }) {
  const [selectedSection, setSelectedSection] = useState('recently_played');
  const scrollY = useRef(new Animated.Value(0)).current;
  const { currentPodcast, playPodcast, pausePodcast } = useGlobalAudioPlayer();

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleSectionPress = (section) => {
    setSelectedSection(section.id);
  };

  const handleEpisodePress = (episode) => {
    navigation.navigate('EpisodeDetail', { episode });
  };

  const handleShowPress = (show) => {
    navigation.navigate('ShowDetail', { show });
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

  const renderLibrarySection = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.sectionItem,
        selectedSection === item.id && styles.sectionItemActive
      ]}
      onPress={() => handleSectionPress(item)}
      activeOpacity={0.6}
    >
      <View style={styles.sectionLeft}>
        <Ionicons 
          name={item.icon} 
          size={22} 
          color={selectedSection === item.id ? colors.primary : colors.textSecondary} 
        />
        <Text style={[
          styles.sectionTitle,
          selectedSection === item.id && styles.sectionTitleActive
        ]}>
          {item.title}
        </Text>
      </View>
      {item.showCount && item.count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const renderRecentEpisode = ({ item }) => (
    <TouchableOpacity 
      style={styles.episodeCard}
      onPress={() => handleEpisodePress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.artwork} style={styles.episodeArtwork} />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.showTitle} numberOfLines={1}>
          {item.showTitle}
        </Text>
        <View style={styles.episodeMeta}>
          <Text style={styles.metaText}>{item.publishDate}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.duration}</Text>
          {item.progress > 0 && item.progress < 1 && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.progressText}>
                {formatProgress(item.progress)}% played
              </Text>
            </>
          )}
          {item.isCompleted && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.completedText}>Played</Text>
            </>
          )}
        </View>
        {item.progress > 0 && item.progress < 1 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
          </View>
        )}
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => handlePlayPause(item)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={item.isPlaying ? 'pause-circle' : 'play-circle'} 
          size={32} 
          color={colors.primary} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDownloadedEpisode = ({ item }) => (
    <TouchableOpacity 
      style={styles.episodeCard}
      onPress={() => handleEpisodePress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.artwork} style={styles.episodeArtwork} />
      <View style={styles.episodeContent}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.showTitle} numberOfLines={1}>
          {item.showTitle}
        </Text>
        <View style={styles.episodeMeta}>
          <Ionicons name="arrow-down-circle" size={14} color={colors.success} />
          <Text style={styles.downloadText}>Downloaded {item.downloadDate}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.duration}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.fileSize}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.moreButton}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderShow = ({ item }) => (
    <TouchableOpacity 
      style={styles.showCard}
      onPress={() => handleShowPress(item)}
      activeOpacity={0.8}
    >
      <Image source={item.artwork} style={styles.showArtwork} />
      <View style={styles.showContent}>
        <Text style={styles.showName} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.showAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.showMeta}>
          <Text style={styles.episodeCount}>
            {item.episodeCount} episodes
          </Text>
          {item.newEpisodes > 0 && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>
                  {item.newEpisodes} new
                </Text>
              </View>
            </>
          )}
        </View>
        <Text style={styles.lastUpdated}>
          Updated {item.lastUpdated}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.moreButton}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'recently_played':
        return (
          <FlatList
            data={recentEpisodes}
            renderItem={renderRecentEpisode}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        );
      case 'downloaded':
        return (
          <FlatList
            data={downloadedEpisodes}
            renderItem={renderDownloadedEpisode}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        );
      case 'shows':
        return (
          <FlatList
            data={subscribedShows}
            renderItem={renderShow}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        );
      default:
        return (
          <View style={styles.emptyState}>
            <Ionicons name="radio-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No content available</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Library</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="search" size={22} color={colors.primary} />
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
        {/* Main Header */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Library</Text>
        </View>

        {/* Library Sections */}
        <View style={styles.sectionsContainer}>
          <FlatList
            data={librarySections}
            renderItem={renderLibrarySection}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
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
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionsContainer: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
  },
  sectionItemActive: {
    backgroundColor: colors.background,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
    fontWeight: '400',
  },
  sectionTitleActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    color: colors.cardBackground,
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 50,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  episodeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  episodeArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 20,
  },
  showTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  completedText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 2,
  },
  downloadText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.progressBackground,
    borderRadius: 1,
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  playButton: {
    marginLeft: 12,
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  showCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  showArtwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  showContent: {
    flex: 1,
  },
  showName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  showAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  showMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  episodeCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  newBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  newBadgeText: {
    color: colors.cardBackground,
    fontSize: 10,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  bottomSpacing: {
    height: 100,
  },
});