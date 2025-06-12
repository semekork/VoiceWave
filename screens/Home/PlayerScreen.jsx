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


import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext';
import AudioPlayerMenu from '../../components/AudioPlayerOptions';
import SleepTimer from '../../components/SleepTimer';
import PlayerControls from '../../components/PlayerControls';
import VolumeControls from '../../components/VolumeControls';
import WaveformPlayer from '../../components/WaveformPlayer';
import { MenuButtonContainer } from '../../components/PlayerMenuButton'; 

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PlayerScreen({ navigation, route }) {
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

  const routeParams = route?.params || {};
  const podcastInfo = currentPodcast || {};
  
  const podcastTitle = routeParams.podcastTitle || 
                      podcastInfo.title || 
                      podcastInfo.podcastTitle || 
                      'Unknown Title';
                      
  const podcastSubtitle = routeParams.podcastSubtitle || 
                         podcastInfo.subtitle || 
                         podcastInfo.podcastSubtitle || 
                         podcastInfo.author || 
                         'Unknown Artist';
                         
  const podcastImage = routeParams.podcastImage || 
                      podcastInfo.image || 
                      podcastInfo.podcastImage || 
                      podcastInfo.artwork || 
                      require('../../assets/gratitude.jpeg'); 

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  
  const pulseAnimation = useRef(new Animated.Value(1)).current;

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

  // Podcast cover scale animation based on play/pause state
  useEffect(() => {
    if (isPlaying) {
      // Scale up when playing
      Animated.timing(pulseAnimation, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Scale back to default when paused
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

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

  // Handle image source properly
  const getImageSource = () => {
    if (typeof podcastImage === 'string') {
      return { uri: podcastImage };
    } else if (typeof podcastImage === 'number') {
      return podcastImage; 
    } else if (podcastImage && podcastImage.uri) {
      return podcastImage;
    } else {
      // Fallback to default image
      return require('../../assets/gratitude.jpeg');
    }
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

      {/* Animated Podcast Cover */}
      <View style={styles.podcastCover}>
        <Animated.View
          style={[
            styles.coverContainer,
            {
              transform: [
                { scale: pulseAnimation },
              ],
            },
          ]}
        >
          <Image 
            source={getImageSource()} 
            style={styles.podcast}
            defaultSource={require('../../assets/gratitude.jpeg')}
            onError={(error) => {
              console.log('Image load error:', error.nativeEvent.error);
            }}
          />
        </Animated.View>
      </View>

      {/* Podcast Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.subTitle} numberOfLines={2}>
          {podcastSubtitle}
        </Text>
        <Text style={styles.title} numberOfLines={3}>
          {podcastTitle}
        </Text>
      </View>

      {/* Waveform */}
      <WaveformPlayer
        position={position}
        duration={duration}
        onSeek={seekToPosition}
      />

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
  coverContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  podcast: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0', // Fallback background color
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#000',
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
    fontWeight: '500',
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