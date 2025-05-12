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
import Slider from '@react-native-community/slider';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

import { useGlobalAudioPlayer } from '../../context/AudioPlayerContext'; // ← NEW
import AudioPlayerMenu from '../../components/AudioPlayerMenu';
import SleepTimer from '../../components/SleepTimer';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PlayerScreen({ navigation, route }) {
  const {
    podcastTitle = 'Financial Freedom Mindset',
    podcastSubtitle = 'Sounds of Accra',
    podcastImage = require('../../assets/image 15.png')
  } = route.params || currentPodcast || {};

  // Use shared player context
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
    currentPodcast
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(!isMenuVisible)}>
          <Feather name="more-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image source={podcastImage} style={styles.logo} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.subTitle}>{podcastSubtitle}</Text>
        <Text style={styles.title}>{podcastTitle}</Text>
      </View>

      {generateWaveform()}

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>-{formatTime(duration - position)}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.speedButton} onPress={changePlaybackSpeed}>
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => skipBackward()}>
          <Text style={styles.skipButtonText}>15</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={playPause}>
          {position >= duration ? (
            <Ionicons name="reload" size={36} color="#000" />
          ) : isPlaying ? (
            <Ionicons name="pause" size={36} color="#000" />
          ) : (
            <Ionicons name="play" size={36} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => skipForward()}>
          <Text style={styles.skipButtonText}>30</Text>
        </TouchableOpacity>

        {sleepTimer.sleepTimerButton}
      </View>

      <View style={styles.volumeContainer}>
        <Ionicons name="volume-mute-outline" size={20} style={styles.volumeIcon} />
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#DDDDDD"
          thumbTintColor="transparent"
          thumbStyle={{ width: 0, height: 0 }}
        />
        <Ionicons name="volume-high-outline" size={20} style={styles.volumeIcon} />
      </View>

      {sleepTimer.sleepTimerDisplay}
      {sleepTimer.sleepTimerModal}

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

      <AudioPlayerMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onDownloadPodcast={handleDownloadPodcast}
        onSharePodcast={handleSharePodcast}
        onSleepTimer={() => sleepTimer.sleepTimerButton.props.onPress()}
        onPlaybackSettings={handlePlaybackSettings}
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
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  speedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    marginHorizontal: 10,
  },
  volumeIcon: {
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