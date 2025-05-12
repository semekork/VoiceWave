import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A custom hook for podcast playback management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoPlay - Whether to play automatically when episode changes
 * @param {number} options.defaultVolume - Default volume (0.0 to 1.0)
 * @param {number} options.defaultPlaybackSpeed - Default playback speed (0.5 to 2.0)
 * @returns {Object} Podcast player state and control functions
 */
const usePlayer = ({ 
  autoPlay = false, 
  defaultVolume = 1.0,
  defaultPlaybackSpeed = 1.0
} = {}) => {
  // Player state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(defaultVolume);
  const [playbackSpeed, setPlaybackSpeed] = useState(defaultPlaybackSpeed);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  
  // Episode info
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [queue, setQueue] = useState([]);
  
  // References for use in callbacks
  const soundRef = useRef(null);
  const positionRef = useRef(0);
  const durationRef = useRef(0);
  const currentEpisodeRef = useRef(null);
  const positionUpdateIntervalRef = useRef(null);
  
  // Set up audio mode for playback when background 
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false
        });
      } catch (err) {
        console.error("Failed to set audio mode:", err);
      }
    };
    
    setupAudio();
    loadPlaybackState();
    
    // Clean up on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
      
      // Save playback state on unmount
      savePlaybackState();
    };
  }, []);
  
  // Load previous playback state from storage
  const loadPlaybackState = async () => {
    try {
      const savedStateJSON = await AsyncStorage.getItem('podcastPlaybackState');
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        
        // Restore previous settings
        setVolume(savedState.volume || defaultVolume);
        setPlaybackSpeed(savedState.playbackSpeed || defaultPlaybackSpeed);
        
        // If there was a previous episode, restore it
        if (savedState.currentEpisode) {
          setCurrentEpisode(savedState.currentEpisode);
          currentEpisodeRef.current = savedState.currentEpisode;
          
          // Don't autoplay when restoring from storage
          loadEpisode(savedState.currentEpisode, savedState.position || 0, false);
        }
        
        // Restore queue
        if (savedState.queue) {
          setQueue(savedState.queue);
        }
      }
    } catch (err) {
      console.error("Failed to load playback state:", err);
    }
  };
  
  // Save playback state to storage
  const savePlaybackState = async () => {
    try {
      const currentState = {
        currentEpisode: currentEpisodeRef.current,
        position: positionRef.current,
        volume,
        playbackSpeed,
        queue
      };
      
      await AsyncStorage.setItem('podcastPlaybackState', JSON.stringify(currentState));
    } catch (err) {
      console.error("Failed to save playback state:", err);
    }
  };
  
  // Update position at regular intervals while playing
  useEffect(() => {
    if (isPlaying && soundRef.current) {
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
      
      positionUpdateIntervalRef.current = setInterval(async () => {
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
              setPosition(status.positionMillis);
              positionRef.current = status.positionMillis;
              
              // Save position every 5 seconds
              if (Math.floor(status.positionMillis / 5000) !== Math.floor(positionRef.current / 5000)) {
                savePlaybackState();
              }
              
              // Auto-play next episode when current one ends
              if (status.positionMillis >= status.durationMillis - 50 && queue.length > 0) {
                playNextEpisode();
              }
            }
          } catch (err) {
            console.error("Error getting player status:", err);
          }
        }
      }, 1000);
    } else if (positionUpdateIntervalRef.current) {
      clearInterval(positionUpdateIntervalRef.current);
    }
    
    return () => {
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, queue]);
  
  /**
   * Load and prepare a podcast episode
   * @param {Object} episode - Episode object with at least id and url properties
   * @param {number} startPosition - Position to start playback from (in milliseconds)
   * @param {boolean} shouldPlay - Whether to start playing after loading
   */
  const loadEpisode = async (episode, startPosition = 0, shouldPlay = autoPlay) => {
    if (!episode || !episode.url) {
      setError("Invalid episode data");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Unload previous sound if exists
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: episode.url },
        { 
          shouldPlay: shouldPlay,
          volume: volume,
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 1000,
          positionMillis: startPosition
        },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = newSound;
      setSound(newSound);
      setCurrentEpisode(episode);
      currentEpisodeRef.current = episode;
      setPosition(startPosition);
      positionRef.current = startPosition;
      
      // Get initial status to set duration
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis);
        durationRef.current = status.durationMillis;
        setIsPlaying(status.isPlaying);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load episode:", err);
      setIsLoading(false);
      setError(`Failed to load episode: ${err.message}`);
    }
  };
  
  /**
   * Handle playback status updates
   */
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError(`Error: ${status.error}`);
      }
      return;
    }
    
    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);
    
    if (status.didJustFinish && queue.length > 0) {
      playNextEpisode();
    }
  };
  
  /**
   * Toggle play/pause
   */
  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        savePlaybackState();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.error("Error toggling play/pause:", err);
      setError(`Error toggling play/pause: ${err.message}`);
    }
  };
  
  /**
   * Seek to a specific position
   * @param {number} millis - Position in milliseconds
   */
  const seekTo = async (millis) => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.setPositionAsync(millis);
      setPosition(millis);
      positionRef.current = millis;
      savePlaybackState();
    } catch (err) {
      console.error("Error seeking:", err);
      setError(`Error seeking: ${err.message}`);
    }
  };
  
  /**
   * Skip forward by specified seconds
   * @param {number} seconds - Seconds to skip forward
   */
  const skipForward = async (seconds = 30) => {
    if (!soundRef.current) return;
    
    try {
      const newPosition = Math.min(positionRef.current + (seconds * 1000), durationRef.current);
      await seekTo(newPosition);
    } catch (err) {
      console.error("Error skipping forward:", err);
      setError(`Error skipping forward: ${err.message}`);
    }
  };
  
  /**
   * Skip backward by specified seconds
   * @param {number} seconds - Seconds to skip backward
   */
  const skipBackward = async (seconds = 15) => {
    if (!soundRef.current) return;
    
    try {
      const newPosition = Math.max(positionRef.current - (seconds * 1000), 0);
      await seekTo(newPosition);
    } catch (err) {
      console.error("Error skipping backward:", err);
      setError(`Error skipping backward: ${err.message}`);
    }
  };
  
  /**
   * Set the playback speed
   * @param {number} speed - Playback speed (0.5 to 2.0)
   */
  const setSpeed = async (speed) => {
    if (!soundRef.current) return;
    
    try {
      // Clamp speed between 0.5 and 2.0
      const newSpeed = Math.max(0.5, Math.min(2.0, speed));
      await soundRef.current.setRateAsync(newSpeed, true);
      setPlaybackSpeed(newSpeed);
      savePlaybackState();
    } catch (err) {
      console.error("Error setting playback speed:", err);
      setError(`Error setting playback speed: ${err.message}`);
    }
  };
  
  /**
   * Set the volume
   * @param {number} level - Volume level (0.0 to 1.0)
   */
  const setVolumeLevel = async (level) => {
    if (!soundRef.current) return;
    
    try {
      // Clamp volume between 0.0 and 1.0
      const newVolume = Math.max(0, Math.min(1, level));
      await soundRef.current.setVolumeAsync(newVolume);
      setVolume(newVolume);
      savePlaybackState();
    } catch (err) {
      console.error("Error setting volume:", err);
      setError(`Error setting volume: ${err.message}`);
    }
  };
  
  /**
   * Add episode to queue
   * @param {Object} episode - Episode object
   */
  const addToQueue = (episode) => {
    if (!episode || !episode.url) return;
    
    setQueue(prev => {
      const newQueue = [...prev, episode];
      savePlaybackState();
      return newQueue;
    });
  };
  
  /**
   * Remove episode from queue
   * @param {string} episodeId - ID of episode to remove
   */
  const removeFromQueue = (episodeId) => {
    setQueue(prev => {
      const newQueue = prev.filter(ep => ep.id !== episodeId);
      savePlaybackState();
      return newQueue;
    });
  };
  
  /**
   * Play next episode in queue
   */
  const playNextEpisode = () => {
    if (queue.length === 0) return;
    
    const nextEpisode = queue[0];
    setQueue(prev => prev.slice(1));
    
    loadEpisode(nextEpisode, 0, true);
  };
  
  /**
   * Clear the queue
   */
  const clearQueue = () => {
    setQueue([]);
    savePlaybackState();
  };
  
  /**
   * Format milliseconds to time string (mm:ss or hh:mm:ss)
   * @param {number} millis - Time in milliseconds
   * @returns {string} Formatted time string
   */
  const formatTime = (millis) => {
    if (!millis) return '00:00';
    
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };
  
  return {
    // State
    currentEpisode,
    isPlaying,
    isLoading,
    isBuffering,
    duration,
    position,
    volume,
    playbackSpeed,
    error,
    queue,
    
    // Playback controls
    loadEpisode,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setSpeed,
    setVolumeLevel,
    
    // Queue management
    addToQueue,
    removeFromQueue,
    playNextEpisode,
    clearQueue,
    
    // Utilities
    formatTime
  };
};

export default usePlayer;