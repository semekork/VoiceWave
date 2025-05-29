import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import AudioPlayerMenu from '../../components/AudioPlayerMenu';
import SleepTimer from '../../components/SleepTimer';
import PlayerControls from '../../components/PlayerControls';
import VolumeControls from '../../components/VolumeControls';
import { MenuButtonContainer, FloatingMenuButton } from '../../components/MenuButton'; 

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PlayerScreen({ navigation, route }) {
  const {
    podcastTitle,
    podcastSubtitle,
    podcastImage,
  } = route.params || currentPodcast || {};

  const {
    isPlaying,
    position,
    duration,
    playbackSpeed,
    volume,
    playPause,
    seekToPosition,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
    setVolume,
    formatTime,
    pause,
    currentPodcast,
    queue,
    isShuffle,
    toggleShuffle,
    isQueueLooping,
    toggleQueueLooping,
    addToQueue
  } = useGlobalAudioPlayer();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const waveformRef = useRef(null);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const sleepTimer = SleepTimer({
    onPauseAudio: () => pause()
  });

  useEffect(() => {
    Animated.timing(menuAnimation, {
      toValue: isMenuVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuVisible]);

  // Menu toggle handler
  const handleMenuToggle = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  // Navigation handlers
  const handleNavigateToQueue = () => {
    navigation.navigate("QueueScreen");
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Utility handlers
  const handleDownloadPodcast = async () => {
    Alert.alert('Download', 'Podcast download started');
  };

  const handleSharePodcast = async () => {
    try {
      await Sharing.shareAsync('', {
        dialogTitle: 'Share Podcast',
        mimeType: 'audio/mp3',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share podcast');
    }
  };

  const handlePlaybackSettings = () => {
    Alert.alert('Playback Settings', 'Customize your listening experience', [
      { text: 'Audio Quality', onPress: () => {} },
      { text: 'Equalizer', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  // Waveform handlers
  const handleWaveformSeek = (event) => {
    if (!waveformRef.current) return;

    const { locationX } = event.nativeEvent;
    const waveformWidth = SCREEN_WIDTH - 40;
    const seekPercentage = locationX / waveformWidth;
    const newPosition = Math.floor(seekPercentage * duration);

    seekToPosition(newPosition);
  };

  const generateWaveform = () => {
    const barCount = 40;
    const isAtEnd = position >= duration || (duration > 0 && Math.abs(position - duration) < 1000);
    const played = isAtEnd ? barCount : Math.floor((position / duration) * barCount);

    return (
      <TouchableOpacity
        ref={waveformRef}
        style={styles.waveformContainer}
        onPress={handleWaveformSeek}
        activeOpacity={1}
      >
        {Array.from({ length: barCount }).map((_, index) => {
          const opacityFactor = 1 - (Math.abs(index - played) / barCount);
          const backgroundColor = index < played ? '#D32F2F' : '#AAAAAA';
          const opacity = index < played ? Math.max(0.3, opacityFactor) : 0.6;

          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: 30,
                  backgroundColor,
                  opacity,
                }
              ]}
            />
          );
        })}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with menu button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        
        <MenuButtonContainer
          isMenuVisible={isMenuVisible}
          onMenuToggle={handleMenuToggle}
          showQueueButton={true}
          queueCount={queue.length}
          onQueuePress={handleNavigateToQueue}
        />
      </View>

      {/* Podcast Cover */}
      <View style={styles.podcastCover}>
        <Image source={podcastImage} style={styles.podcast} />
      </View>

      {/* Podcast Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.subTitle}>{podcastSubtitle}</Text>
        <Text style={styles.title}>{podcastTitle}</Text>
      </View>

      {/* Waveform */}
      {generateWaveform()}

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>-{formatTime(duration - position)}</Text>
      </View>

      {/* Player Controls */}
      <PlayerControls
        isPlaying={isPlaying}
        position={position}
        duration={duration}
        playbackSpeed={playbackSpeed}
        onPlayPause={playPause}
        onSkipBackward={() => skipBackward()}
        onSkipForward={() => skipForward()}
        onChangePlaybackSpeed={changePlaybackSpeed}
        sleepTimerButton={sleepTimer.sleepTimerButton}
      />

      {/* Volume Controls */}
      <VolumeControls
        volume={volume}
        onVolumeChange={setVolume}
      />

      {/* Sleep Timer Components */}
      {sleepTimer.sleepTimerDisplay}
      {sleepTimer.sleepTimerModal}

      {/* Overlay Background */}
      <Animated.View
        style={[
          styles.overlayBackground,
          {
            opacity: menuAnimation,
            display: isMenuVisible ? 'flex' : 'none'
          }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={() => setIsMenuVisible(false)}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Audio Player Menu */}
      <AudioPlayerMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
        playbackSpeed={playbackSpeed}
        changePlaybackSpeed={changePlaybackSpeed}
        isShuffle={isShuffle}
        toggleShuffle={toggleShuffle}
        isQueueLooping={isQueueLooping}
        toggleQueueLooping={toggleQueueLooping}
        currentPodcast={currentPodcast}
        addToQueue={addToQueue}
        queue={queue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  podcastCover: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  podcast: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  waveformContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#AAA',
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
});