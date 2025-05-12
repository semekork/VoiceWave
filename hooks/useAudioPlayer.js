import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAudioPlayer = ({
  autoPlay = false,
  defaultVolume = 1.0,
  persistPosition = true,
  staysActiveInBackground = true
  
} = {}) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(defaultVolume);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);

  const soundRef = useRef(null);
  const positionRef = useRef(0);
  const durationRef = useRef(0);
  const audioSourceRef = useRef(null);
  const [currentPodcast, setCurrentPodcast] = useState(null);

  const debugLog = (message, ...args) => {
    console.log(`[AudioPlayer Debug] ${message}`, ...args);
  };

  const getSourceKey = (src) => {
    if (typeof src === 'string') return src;
    if (src?.uri) return src.uri;
    return 'local';
  };

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
        });
        await Audio.setIsEnabledAsync(true);
        debugLog('Audio system initialized');
      } catch (err) {
        debugLog('Audio init error:', err);
        setError(`Audio init failed: ${err.message}`);
      }
    };

    initializeAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = async (status) => {
    if (!status.isLoaded) {
      debugLog('Playback error:', status.error);
      if (status.error) setError(`Playback error: ${status.error}`);
      return;
    }

    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    positionRef.current = status.positionMillis;

    if (status.didJustFinish) {
      setPosition(0);
      positionRef.current = 0;
      setIsPlaying(false);

      if (persistPosition && audioSourceRef.current) {
        const key = `@position_${getSourceKey(audioSourceRef.current)}`;
        await AsyncStorage.removeItem(key);
      }
    } else if (persistPosition && audioSourceRef.current) {
      const key = `@position_${getSourceKey(audioSourceRef.current)}`;
      await AsyncStorage.setItem(key, JSON.stringify(status.positionMillis));
    }
  };

  const loadAudio = useCallback(async (newSource) => {
    if (!newSource) return;

    setIsLoading(true);
    setError(null);
    audioSourceRef.current = newSource;

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const sourceObject = typeof newSource === 'string' ? { uri: newSource } : newSource;
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        sourceObject,
        {
          shouldPlay: autoPlay,
          volume: defaultVolume,
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );

      if (!status.isLoaded) throw new Error(status.error);

      setSound(newSound);
      soundRef.current = newSound;
      setDuration(status.durationMillis || 0);
      durationRef.current = status.durationMillis || 0;
      setPosition(status.positionMillis || 0);
      positionRef.current = status.positionMillis || 0;
      setIsPlaying(status.isPlaying);

      await AsyncStorage.setItem('@last_audio_source', JSON.stringify(newSource));

      if (persistPosition) {
        const key = `@position_${getSourceKey(newSource)}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const millis = JSON.parse(saved);
          await newSound.setPositionAsync(millis);
          setPosition(millis);
          positionRef.current = millis;
        }
      }
    } catch (err) {
      debugLog('Audio load error:', err);
      setError(`Load failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [autoPlay, defaultVolume, playbackSpeed, persistPosition]);

  const loadLastAudioSource = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('@last_audio_source');
      if (saved) {
        const source = JSON.parse(saved);
        await loadAudio(source);
      }
    } catch (err) {
      debugLog('Load last audio error:', err);
    }
  }, [loadAudio]);

  const seekToPosition = async (newPosition) => {
    if (!soundRef.current) return;
    const clamped = Math.max(0, Math.min(newPosition, durationRef.current));
    await soundRef.current.setPositionAsync(clamped);
    setPosition(clamped);
    positionRef.current = clamped;
  };

  const skipForward = async (seconds = 30) => {
    await seekToPosition(positionRef.current + seconds * 1000);
  };

  const skipBackward = async (seconds = 15) => {
    await seekToPosition(positionRef.current - seconds * 1000);
  };

  const playPause = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      if (positionRef.current >= durationRef.current) {
        await soundRef.current.setPositionAsync(0);
        setPosition(0);
        positionRef.current = 0;
      }
      await soundRef.current.playAsync();
    }
  };

  const changePlaybackSpeed = async () => {
    if (!soundRef.current) return;
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const newSpeed = speeds[(currentIndex + 1) % speeds.length];
    await soundRef.current.setRateAsync(newSpeed, true);
    setPlaybackSpeed(newSpeed);
  };

  const formatTime = (millis) => {
    if (isNaN(millis) || millis === null) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    sound,
    isPlaying,
    isLoading,
    isBuffering,
    duration,
    position,
    volume,
    playbackSpeed,
    error,
    currentPodcast,
    setCurrentPodcast,
    playPause,
    seekToPosition,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
    setVolume: (v) => {
      if (soundRef.current) {
        soundRef.current.setVolumeAsync(v);
        setVolume(v);
      }
    },
    formatTime,
    loadAudio,
    loadLastAudioSource,
    progress: duration > 0 ? (position / duration) * 100 : 0,

    audioSource: audioSourceRef.current,
  };
};

export default useAudioPlayer;
