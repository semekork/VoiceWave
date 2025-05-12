import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

const useAudioPlayer = ({
  audioSource = null,
  autoPlay = false,
  defaultVolume = 1.0,
  persistPosition = true,
  staysActiveInBackground = true
} = {}) => {
  // Audio state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(defaultVolume);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);

  // Refs for callback access
  const soundRef = useRef(null);
  const positionRef = useRef(0);
  const durationRef = useRef(0);

  // Comprehensive debug logging function
  const debugLog = (message, ...args) => {
    console.log(`[AudioPlayer Debug] ${message}`, ...args);
  };

  // Initialize audio system
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        debugLog('Initializing audio system');
        
        // Ensure the Audio module is imported correctly
        if (!Audio) {
          throw new Error('Expo Audio module not imported correctly');
        }

        // Request permissions
        const { status } = await Audio.requestPermissionsAsync();
        debugLog('Audio permissions status:', status);
        if (status !== 'granted') {
          setError('Audio permissions not granted');
          return;
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          allowsRecordingIOS: false,
        });

        // Enable audio
        await Audio.setIsEnabledAsync(true);
        debugLog('Audio system initialized successfully');
      } catch (err) {
        debugLog('Audio initialization error:', err);
        setError(`Audio initialization failed: ${err.message}`);
      }
    };
    
    initializeAudio();
    
    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Load audio when source is provided
  useEffect(() => {
    if (!audioSource) {
      debugLog('No audio source provided');
      return;
    }

    const loadAudio = async () => {
      debugLog('Attempting to load audio source', audioSource);
      
      setIsLoading(true);
      setError(null);

      try {
        // Unload any existing sound
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        // Determine source object
        const sourceObject = typeof audioSource === 'string' 
          ? { uri: audioSource } 
          : audioSource;

        debugLog('Processed source object:', sourceObject);

        // Validate source
        if (!sourceObject) {
          throw new Error('Invalid audio source');
        }

        // Create and load sound
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

        // Validate loaded sound
        if (!status.isLoaded) {
          debugLog('Sound failed to load', status.error);
          setError(`Failed to load audio: ${status.error}`);
          setIsLoading(false);
          return;
        }

        debugLog('Sound loaded successfully', {
          durationMillis: status.durationMillis,
          positionMillis: status.positionMillis,
          isPlaying: status.isPlaying
        });

        // Store references
        setSound(newSound);
        soundRef.current = newSound;

        // Set initial state
        setDuration(status.durationMillis || 0);
        durationRef.current = status.durationMillis || 0;
        setPosition(status.positionMillis || 0);
        positionRef.current = status.positionMillis || 0;
        setIsPlaying(status.isPlaying);

        setIsLoading(false);
      } catch (err) {
        debugLog('Comprehensive audio loading error:', err);
        setError(`Audio loading failed: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    loadAudio();
  }, [audioSource, autoPlay, defaultVolume, playbackSpeed]);

  // Handle audio playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      debugLog('Playback status error:', status.error);
      if (status.error) {
        setError(`Playback error: ${status.error}`);
      }
      return;
    }
    
    // Update state based on status
    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    positionRef.current = status.positionMillis;
    
    // Handle audio completion
    if (status.didJustFinish) {
      debugLog('Audio playback completed');
      // Reset position to 0 for completed tracks
      positionRef.current = 0;
      setPosition(0);
      setIsPlaying(false);
    }
  };

  // Seek to position
  const seekToPosition = async (newPosition) => {
    debugLog('Seeking to position', newPosition);
    if (!soundRef.current) {
      debugLog('No sound loaded to seek');
      setError('No sound loaded');
      return;
    }
    
    try {
      // Ensure the new position is within bounds
      const clampedPosition = Math.max(0, Math.min(newPosition, durationRef.current));
      
      // Set the new position in the audio
      await soundRef.current.setPositionAsync(clampedPosition);
      
      // Update the local position state
      setPosition(clampedPosition);
      positionRef.current = clampedPosition;
    } catch (err) {
      debugLog('Failed to seek:', err);
      setError(`Seek failed: ${err.message}`);
    }
  };

  // Skip forward
  const skipForward = async (seconds = 30) => {
    debugLog('Skipping forward', seconds);
    if (!soundRef.current) {
      debugLog('No sound loaded to skip forward');
      setError('No sound loaded');
      return;
    }
    
    try {
      const newPosition = Math.min(positionRef.current + (seconds * 1000), durationRef.current);
      await seekToPosition(newPosition);
    } catch (err) {
      debugLog('Failed to skip forward:', err);
      setError(`Skip forward failed: ${err.message}`);
    }
  };

  // Skip backward
  const skipBackward = async (seconds = 15) => {
    debugLog('Skipping backward', seconds);
    if (!soundRef.current) {
      debugLog('No sound loaded to skip backward');
      setError('No sound loaded');
      return;
    }
    
    try {
      const newPosition = Math.max(positionRef.current - (seconds * 1000), 0);
      await seekToPosition(newPosition);
    } catch (err) {
      debugLog('Failed to skip backward:', err);
      setError(`Skip backward failed: ${err.message}`);
    }
  };

  // Play/Pause toggle with comprehensive error handling
  const playPause = async () => {
    debugLog('Play/Pause called', { 
      soundRef: !!soundRef.current, 
      isPlaying 
    });

    if (!soundRef.current) {
      debugLog('No sound loaded to play/pause');
      setError('No sound loaded');
      return;
    }
    
    try {
      const status = await soundRef.current.getStatusAsync();
      
      if (!status.isLoaded) {
        debugLog('Sound is not loaded');
        setError('Sound is not loaded');
        return;
      }

      if (isPlaying) {
        debugLog('Attempting to pause');
        await soundRef.current.pauseAsync();
      } else {
        debugLog('Attempting to play');
        // If at the end of the track, reset to beginning
        if (positionRef.current >= durationRef.current) {
          await soundRef.current.setPositionAsync(0);
          setPosition(0);
          positionRef.current = 0;
        }
        await soundRef.current.playAsync();
      }
    } catch (err) {
      debugLog('Failed to toggle play/pause:', err);
      setError(`Play/Pause failed: ${err.message}`);
    }
  };

  // Change playback speed
  const changePlaybackSpeed = async () => {
    if (!soundRef.current) return;
    
    try {
      const speeds = [0.5, 1.0, 1.5, 2.0];
      const currentIndex = speeds.indexOf(playbackSpeed);
      const newSpeed = speeds[(currentIndex + 1) % speeds.length];
      
      await soundRef.current.setRateAsync(newSpeed, true);
      setPlaybackSpeed(newSpeed);
    } catch (err) {
      console.error('Failed to change playback speed:', err);
      setError(`Change playback speed failed: ${err.message}`);
    }
  };

  // Format time
  const formatTime = (millis) => {
    if (isNaN(millis) || millis === null) return '00:00';
    
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    // State
    sound,
    isPlaying,
    isLoading,
    isBuffering,
    duration,
    position,
    volume,
    playbackSpeed,
    error,

    // Methods
    playPause,
    seekToPosition,
    skipForward,
    skipBackward,
    changePlaybackSpeed,
    setVolume: (newVolume) => {
      if (soundRef.current) {
        soundRef.current.setVolumeAsync(newVolume);
        setVolume(newVolume);
      }
    },

    // Utility
    formatTime,

    // Progress
    progress: duration > 0 ? (position / duration) * 100 : 0
  };
};

export default useAudioPlayer;