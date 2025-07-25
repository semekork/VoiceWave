import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons} from '@expo/vector-icons';
import styles from './playerStyles';
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
    queueIndex,
    isShuffle,
    toggleShuffle,
    isQueueLooping,
    toggleQueueLooping,
    addToQueue,
    playNext,
    playPrevious,
    setQueueAndPlay
  } = useGlobalAudioPlayer();

  const routeParams = route?.params || {};
  const podcastInfo = currentPodcast || {};
  
  const podcastTitle = routeParams.podcastTitle || 
                      podcastInfo.title || 
                      podcastInfo.podcastTitle || 
                      'Unknown Title';
                      
  const podcastImage = routeParams.podcastImage || 
                      podcastInfo.image || 
                      podcastInfo.podcastImage || 
                      podcastInfo.artwork || 
                      require("../../assets/gratitude.jpeg"); 

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
      Animated.timing(pulseAnimation, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  // Handle skip forward with queue support
  const handleSkipForward = () => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      playNext();
    } else {
      skipForward();
    }
  };

  // Handle skip backward with queue support
  const handleSkipBackward = () => {
    if (queue.length > 0 && queueIndex > 0) {
      playPrevious();
    } else {
      skipBackward();
    }
  };

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

      {/* Queue Info */}
      {queue.length > 0 && (
        <View style={styles.queueInfo}>
          <Text style={styles.queueText}>
            {queueIndex + 1} of {queue.length} in queue
          </Text>
          {isShuffle && <Text style={styles.shuffleIndicator}>🔀 Shuffle</Text>}
          {isQueueLooping && <Text style={styles.loopIndicator}>🔁 Loop</Text>}
        </View>
      )}

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
        <Text style={styles.title} numberOfLines={1}>
          {podcastTitle}
        </Text>
        {podcastInfo.author && (
          <Text style={styles.author} numberOfLines={1}>
            by {podcastInfo.author}
          </Text>
        )}
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
        onSkipBackward={handleSkipBackward}
        onSkipForward={handleSkipForward}
        onChangePlaybackSpeed={changePlaybackSpeed}
        sleepTimerButton={sleepTimer.sleepTimerButton}
        // Queue-specific controls
        hasPrevious={queue.length > 0 && queueIndex > 0}
        hasNext={queue.length > 0 && queueIndex < queue.length - 1}
        showQueueControls={queue.length > 0}
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
        queueIndex={queueIndex}
      />
    </SafeAreaView>
  );
}