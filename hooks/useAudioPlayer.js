import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';

const useAudioPlayer = ({
  autoPlay = false,
  defaultVolume = 1.0,
  persistPosition = true,
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

  // Queue management
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isQueueLooping, setIsQueueLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledQueue, setShuffledQueue] = useState([]);
  const [currentPodcast, setCurrentPodcast] = useState(null);

  // Equalizer state
  const [equalizerSettings, setEqualizerSettings] = useState({
    enabled: false,
    preset: 'Custom',
    bands: [0, 0, 0, 0, 0, 0, 0, 0] // 8 frequency bands
  });

  const soundRef = useRef(null);
  const positionRef = useRef(0);
  const durationRef = useRef(0);
  const audioSourceRef = useRef(null);
  const isUnmountedRef = useRef(false);

  const debugLog = (message, ...args) => {
    console.log(`[AudioPlayer Debug] ${message}`, ...args);
  };

  // Helper function to normalize audio source
  const normalizeAudioSource = async (source) => {
    if (!source) {
      throw new Error('No audio source provided');
    }

    // If it's already a string URI, return as is
    if (typeof source === 'string') {
      return { uri: source };
    }

    // If it's an object with uri property, return as is
    if (source && typeof source === 'object' && source.uri) {
      return source;
    }

    // If it's a require() result (number), convert to Asset
    if (typeof source === 'number') {
      try {
        const asset = Asset.fromModule(source);
        await asset.downloadAsync();
        return { uri: asset.localUri || asset.uri };
      } catch (err) {
        debugLog('Error loading asset:', err);
        throw new Error(`Failed to load audio asset: ${err.message}`);
      }
    }

    // Try to extract URI from metadata or other nested structures
    if (source && typeof source === 'object') {
      if (source.audioSource) {
        return normalizeAudioSource(source.audioSource);
      }
      if (source.metadata && source.metadata.audioSource) {
        return normalizeAudioSource(source.metadata.audioSource);
      }
    }

    throw new Error('Invalid audio source format');
  };

  const getSourceKey = (src) => {
    if (typeof src === 'string') return src;
    if (src?.uri) return src.uri;
    if (typeof src === 'number') return `asset_${src}`;
    return 'local';
  };

  // Load equalizer settings from storage
  const loadEqualizerSettings = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('@equalizer_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setEqualizerSettings(settings);
        debugLog('Loaded equalizer settings:', settings);
      }
    } catch (err) {
      debugLog('Error loading equalizer settings:', err);
    }
  }, []);

  // Save equalizer settings to storage
  const saveEqualizerSettings = useCallback(async (settings) => {
    try {
      await AsyncStorage.setItem('@equalizer_settings', JSON.stringify(settings));
      debugLog('Saved equalizer settings:', settings);
    } catch (err) {
      debugLog('Error saving equalizer settings:', err);
    }
  }, []);

  // Apply equalizer settings to sound object
  const applyEqualizerToSound = useCallback(async (soundObject, settings) => {
    if (!soundObject || !settings.enabled) return;

    try {
      debugLog('Applying equalizer settings:', settings);
      
      // Simulate equalizer application by adjusting volume based on preset
      const volumeMultiplier = getVolumeMultiplierForPreset(settings.preset);
      await soundObject.setVolumeAsync(volume * volumeMultiplier);
      
    } catch (err) {
      debugLog('Error applying equalizer:', err);
    }
  }, [volume]);

  // Update equalizer settings
  const updateEqualizerSettings = useCallback(async (newSettings) => {
    setEqualizerSettings(newSettings);
    await saveEqualizerSettings(newSettings);
    
    // Apply equalizer to current sound if available
    if (soundRef.current && newSettings.enabled) {
      await applyEqualizerToSound(soundRef.current, newSettings);
    }
  }, [saveEqualizerSettings, applyEqualizerToSound]);

  // Get volume multiplier based on preset (simplified simulation)
  const getVolumeMultiplierForPreset = (preset) => {
    const multipliers = {
      'Flat': 1.0,
      'Rock': 1.1,
      'Pop': 1.0,
      'Jazz': 0.95,
      'Classical': 0.9,
      'Electronic': 1.15,
      'Hip-Hop': 1.1,
      'Vocal': 0.95,
      'Bass Boost': 1.2,
      'Treble Boost': 1.05,
      'Custom': 1.0
    };
    return multipliers[preset] || 1.0;
  };

  // Get active queue based on shuffle state
  const getActiveQueue = useCallback(() => {
    return isShuffle ? shuffledQueue : queue;
  }, [isShuffle, shuffledQueue, queue]);

  // Get current item from queue
  const getCurrentQueueItem = useCallback(() => {
    const activeQueue = getActiveQueue();
    return activeQueue[queueIndex] || null;
  }, [getActiveQueue, queueIndex]);

  // Generate shuffled queue whenever original queue or shuffle status changes
  useEffect(() => {
    if (queue.length > 0 && isShuffle) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      // Make sure the current item stays at the current index
      if (queueIndex < queue.length) {
        const currentItem = queue[queueIndex];
        const shuffledIndex = shuffled.findIndex(item => item.id === currentItem?.id);
        if (shuffledIndex !== -1) {
          [shuffled[queueIndex], shuffled[shuffledIndex]] = [shuffled[shuffledIndex], shuffled[queueIndex]];
        }
      }
      setShuffledQueue(shuffled);
    } else {
      setShuffledQueue([]);
    }
  }, [queue, isShuffle, queueIndex]);

  // Forward declarations for functions that reference each other
  const skipToNext = useCallback(async () => {
    const activeQueue = getActiveQueue();
    if (queueIndex < activeQueue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      await AsyncStorage.setItem('@queue_index', nextIndex.toString());
      await loadQueueItemAtIndex(nextIndex);
    } else if (isQueueLooping && activeQueue.length > 0) {
      // Loop to the beginning of the queue
      setQueueIndex(0);
      await AsyncStorage.setItem('@queue_index', '0');
      await loadQueueItemAtIndex(0);
    }
  }, [getActiveQueue, queueIndex, isQueueLooping]);

  const onPlaybackStatusUpdate = useCallback(async (status) => {
    if (isUnmountedRef.current) return;

    if (!status.isLoaded) {
      debugLog('Playback error:', status.error);
      if (status.error) setError(`Playback error: ${status.error}`);
      return;
    }

    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    
    if (status.positionMillis !== undefined) {
      setPosition(status.positionMillis);
      positionRef.current = status.positionMillis;
    }

    if (status.didJustFinish) {
      setPosition(0);
      positionRef.current = 0;
      
      // Handle queue playback
      const activeQueue = getActiveQueue();
      if (queueIndex < activeQueue.length - 1) {
        // Play next track in queue
        await skipToNext();
      } else if (isQueueLooping && activeQueue.length > 0) {
        // Loop queue
        setQueueIndex(0);
        await loadQueueItemAtIndex(0);
      } else {
        // End of queue, no looping
        setIsPlaying(false);
      }

      if (persistPosition && audioSourceRef.current) {
        try {
          const key = `@position_${getSourceKey(audioSourceRef.current)}`;
          await AsyncStorage.removeItem(key);
        } catch (err) {
          debugLog('Error removing position from storage:', err);
        }
      }
    } else if (persistPosition && audioSourceRef.current && status.positionMillis !== undefined) {
      try {
        const key = `@position_${getSourceKey(audioSourceRef.current)}`;
        await AsyncStorage.setItem(key, JSON.stringify(status.positionMillis));
      } catch (err) {
        debugLog('Error saving position to storage:', err);
      }
    }
  }, [getActiveQueue, queueIndex, isQueueLooping, skipToNext, persistPosition]);

  const loadAudio = useCallback(async (newSource, podcastInfo = null) => {
    if (isUnmountedRef.current) return;
    
    if (!newSource) {
      setError('No audio source provided');
      return;
    }

    setIsLoading(true);
    setError(null);
    audioSourceRef.current = newSource;

    try {
      // Unload existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
      }

      // Normalize the audio source
      const sourceObject = await normalizeAudioSource(newSource);
      debugLog('Loading audio from:', sourceObject);

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        sourceObject,
        {
          shouldPlay: autoPlay,
          volume,
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );

      if (isUnmountedRef.current) {
        // Component unmounted during loading, cleanup
        await newSound.unloadAsync();
        return;
      }

      if (!status.isLoaded) {
        throw new Error(status.error || 'Failed to load audio');
      }

      setSound(newSound);
      soundRef.current = newSound;
      setDuration(status.durationMillis || 0);
      durationRef.current = status.durationMillis || 0;
      setPosition(status.positionMillis || 0);
      positionRef.current = status.positionMillis || 0;
      setIsPlaying(status.isPlaying);

      if (podcastInfo) {
        setCurrentPodcast(podcastInfo);
      }

      // Apply equalizer settings to the new sound
      if (equalizerSettings.enabled) {
        await applyEqualizerToSound(newSound, equalizerSettings);
      }

      // Save state
      try {
        await AsyncStorage.setItem('@last_audio_source', JSON.stringify(newSource));
        if (podcastInfo) {
          await AsyncStorage.setItem('@last_podcast_info', JSON.stringify(podcastInfo));
        }
      } catch (err) {
        debugLog('Error saving audio state to storage:', err);
      }

      // Restore position if persistence is enabled
      if (persistPosition) {
        try {
          const key = `@position_${getSourceKey(newSource)}`;
          const saved = await AsyncStorage.getItem(key);
          if (saved) {
            const millis = JSON.parse(saved);
            if (millis > 0 && millis < (status.durationMillis || 0)) {
              await newSound.setPositionAsync(millis);
              setPosition(millis);
              positionRef.current = millis;
            }
          }
        } catch (err) {
          debugLog('Error restoring position from storage:', err);
        }
      }

      debugLog('Audio loaded successfully');
      
    } catch (err) {
      debugLog('Audio load error:', err);
      setError(`Load failed: ${err.message}`);
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [autoPlay, volume, playbackSpeed, persistPosition, equalizerSettings, applyEqualizerToSound, onPlaybackStatusUpdate]);

  // Load queue item at specific index
  const loadQueueItemAtIndex = useCallback(async (index) => {
    const activeQueue = getActiveQueue();
    if (index >= 0 && index < activeQueue.length) {
      const item = activeQueue[index];
      if (item && item.audioSource) {
        await loadAudio(item.audioSource, item);
        setQueueIndex(index);
        return true;
      }
    }
    return false;
  }, [getActiveQueue, loadAudio]);

  const loadLastAudioSource = useCallback(async () => {
    try {
      const savedSource = await AsyncStorage.getItem('@last_audio_source');
      const savedPodcastInfo = await AsyncStorage.getItem('@last_podcast_info');
      
      if (savedSource) {
        const source = JSON.parse(savedSource);
        const podcastInfo = savedPodcastInfo ? JSON.parse(savedPodcastInfo) : null;
        await loadAudio(source, podcastInfo);
      }
      
      // Load the last queue if available
      const savedQueue = await AsyncStorage.getItem('@audio_queue');
      const savedQueueIndex = await AsyncStorage.getItem('@queue_index');
      
      if (savedQueue) {
        const parsedQueue = JSON.parse(savedQueue);
        setQueue(parsedQueue);
        
        if (savedQueueIndex) {
          const index = parseInt(savedQueueIndex, 10);
          if (!isNaN(index) && index >= 0 && index < parsedQueue.length) {
            setQueueIndex(index);
          }
        }
      }
    } catch (err) {
      debugLog('Load last audio error:', err);
    }
  }, [loadAudio]);

  // Initialize audio system
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
        
        // Load equalizer settings
        await loadEqualizerSettings();
        
        debugLog('Audio system initialized');
      } catch (err) {
        debugLog('Audio init error:', err);
        setError(`Audio init failed: ${err.message}`);
      }
    };

    initializeAudio();

    return () => {
      isUnmountedRef.current = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((err) => {
          debugLog('Error unloading sound on cleanup:', err);
        });
      }
    };
  }, [loadEqualizerSettings]);

  // Queue management functions
  const setQueueAndPlay = useCallback(async (newQueue, startIndex = 0) => {
    if (!newQueue || newQueue.length === 0) return;
    
    const validIndex = Math.max(0, Math.min(startIndex, newQueue.length - 1));
    
    setQueue(newQueue);
    setQueueIndex(validIndex);
    
    try {
      await AsyncStorage.setItem('@audio_queue', JSON.stringify(newQueue));
      await AsyncStorage.setItem('@queue_index', validIndex.toString());
    } catch (err) {
      debugLog('Error saving queue to storage:', err);
    }
    
    // Load and play the item at startIndex
    const success = await loadQueueItemAtIndex(validIndex);
    if (success && soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, [loadQueueItemAtIndex]);

  const addToQueue = useCallback(async (item) => {
    if (!item || !item.audioSource) return;
    
    const newQueue = [...queue, item];
    setQueue(newQueue);
    
    try {
      await AsyncStorage.setItem('@audio_queue', JSON.stringify(newQueue));
    } catch (err) {
      debugLog('Error saving queue to storage:', err);
    }
    
    // If this is the first item in the queue, load it
    if (queue.length === 0) {
      setQueueIndex(0);
      await loadQueueItemAtIndex(0);
    }
  }, [queue, loadQueueItemAtIndex]);

  const addMultipleToQueue = useCallback(async (items) => {
    if (!items || items.length === 0) return;
    
    const validItems = items.filter(item => item && item.audioSource);
    if (validItems.length === 0) return;
    
    const newQueue = [...queue, ...validItems];
    setQueue(newQueue);
    
    try {
      await AsyncStorage.setItem('@audio_queue', JSON.stringify(newQueue));
    } catch (err) {
      debugLog('Error saving queue to storage:', err);
    }
    
    // If queue was empty before, load the first item
    if (queue.length === 0) {
      setQueueIndex(0);
      await loadQueueItemAtIndex(0);
    }
  }, [queue, loadQueueItemAtIndex]);

  const removeFromQueue = useCallback(async (index) => {
    if (index < 0 || index >= queue.length) return;
    
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
    
    try {
      await AsyncStorage.setItem('@audio_queue', JSON.stringify(newQueue));
    } catch (err) {
      debugLog('Error saving queue to storage:', err);
    }
    
    // Adjust current index if necessary
    if (queueIndex > index || queueIndex >= newQueue.length) {
      const newIndex = Math.max(0, queueIndex > index ? queueIndex - 1 : newQueue.length - 1);
      setQueueIndex(newIndex);
      
      try {
        await AsyncStorage.setItem('@queue_index', newIndex.toString());
      } catch (err) {
        debugLog('Error saving queue index to storage:', err);
      }
      
      // If we're currently playing the removed item, play the new item at the adjusted index
      if (queueIndex === index && newQueue.length > 0) {
        await loadQueueItemAtIndex(newIndex);
      }
    }
  }, [queue, queueIndex, loadQueueItemAtIndex]);

  const clearQueue = useCallback(async () => {
    setQueue([]);
    setQueueIndex(0);
    
    try {
      await AsyncStorage.removeItem('@audio_queue');
      await AsyncStorage.removeItem('@queue_index');
    } catch (err) {
      debugLog('Error clearing queue from storage:', err);
    }
    
    // If currently playing, stop playback
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (err) {
        debugLog('Error stopping audio:', err);
      }
    }
  }, []);

  const skipToPrevious = useCallback(async () => {
    // If we're more than 3 seconds into the track, go back to the start
    if (position > 3000) {
      await seekToPosition(0);
      return;
    }
    
    const activeQueue = getActiveQueue();
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      try {
        await AsyncStorage.setItem('@queue_index', prevIndex.toString());
      } catch (err) {
        debugLog('Error saving queue index to storage:', err);
      }
      await loadQueueItemAtIndex(prevIndex);
    } else if (isQueueLooping && activeQueue.length > 0) {
      // Loop to the end of the queue
      const lastIndex = activeQueue.length - 1;
      setQueueIndex(lastIndex);
      try {
        await AsyncStorage.setItem('@queue_index', lastIndex.toString());
      } catch (err) {
        debugLog('Error saving queue index to storage:', err);
      }
      await loadQueueItemAtIndex(lastIndex);
    }
  }, [position, getActiveQueue, queueIndex, isQueueLooping, loadQueueItemAtIndex]);

  const seekToPosition = useCallback(async (newPosition) => {
    if (!soundRef.current) return;
    const clamped = Math.max(0, Math.min(newPosition, durationRef.current));
    try {
      await soundRef.current.setPositionAsync(clamped);
      setPosition(clamped);
      positionRef.current = clamped;
    } catch (err) {
      debugLog('Error seeking to position:', err);
    }
  }, []);

  const skipForward = useCallback(async (seconds = 30) => {
    await seekToPosition(positionRef.current + seconds * 1000);
  }, [seekToPosition]);

  const skipBackward = useCallback(async (seconds = 15) => {
    await seekToPosition(positionRef.current - seconds * 1000);
  }, [seekToPosition]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(!isShuffle);
  }, [isShuffle]);

  const toggleQueueLooping = useCallback(() => {
    setIsQueueLooping(!isQueueLooping);
  }, [isQueueLooping]);

  const playPause = useCallback(async () => {
    if (!soundRef.current) {
      // If no sound is loaded but we have a queue, try to load the current item
      const activeQueue = getActiveQueue();
      if (activeQueue.length > 0) {
        await loadQueueItemAtIndex(queueIndex);
        if (soundRef.current) {
          await soundRef.current.playAsync();
        }
      }
      return;
    }
    
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        debugLog("Sound not loaded in playPause");
        return;
      }

      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        if (positionRef.current >= durationRef.current && durationRef.current > 0) {
          await soundRef.current.setPositionAsync(0);
          setPosition(0);
          positionRef.current = 0;
        }
        await soundRef.current.playAsync();
      }
    } catch (err) {
      debugLog('Error in playPause:', err);
      setError(`Playback error: ${err.message}`);
    }
  }, [getActiveQueue, queueIndex, loadQueueItemAtIndex, isPlaying]);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      }
    } catch (err) {
      debugLog('Error pausing audio:', err);
    }
  }, [isPlaying]);

  const changePlaybackSpeed = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      const speeds = [0.5, 1.0, 1.5, 2.0];
      const currentIndex = speeds.indexOf(playbackSpeed);
      const newSpeed = speeds[(currentIndex + 1) % speeds.length];
      await soundRef.current.setRateAsync(newSpeed, true);
      setPlaybackSpeed(newSpeed);
    } catch (err) {
      debugLog('Error changing playback speed:', err);
    }
  }, [playbackSpeed]);

  const setVolumeHandler = useCallback(async (v) => {
    const clampedVolume = Math.max(0, Math.min(1, v));
    setVolume(clampedVolume);
    
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(clampedVolume);
      } catch (err) {
        debugLog('Error setting volume:', err);
      }
    }
  }, []);

  const formatTime = useCallback((millis) => {
    if (isNaN(millis) || millis === null || millis === undefined) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

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
    pause,
    seekToPosition,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
    setVolume: setVolumeHandler,
    formatTime,
    loadAudio,
    loadLastAudioSource,
    progress: duration > 0 ? (position / duration) * 100 : 0,
    audioSource: audioSourceRef.current,
    
    // Queue-related functions and state
    queue,
    queueIndex,
    isQueueLooping,
    isShuffle,
    setQueueAndPlay,
    addToQueue,
    addMultipleToQueue,
    removeFromQueue,
    clearQueue,
    skipToNext,
    skipToPrevious,
    toggleShuffle,
    toggleQueueLooping,
    getCurrentQueueItem,
    equalizerSettings,
    updateEqualizerSettings,
  };
};

export default useAudioPlayer;