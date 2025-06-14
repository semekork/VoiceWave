import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerControls({
  isPlaying,
  position,
  duration,
  playbackSpeed,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  onChangePlaybackSpeed,
  sleepTimerButton
}) {
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const skipBackwardScale = useRef(new Animated.Value(1)).current;
  const skipForwardScale = useRef(new Animated.Value(1)).current;
  const speedButtonScale = useRef(new Animated.Value(1)).current;
  const playButtonRotation = useRef(new Animated.Value(0)).current;

  // Animation for play/pause state changes
  useEffect(() => {
    Animated.spring(playButtonRotation, {
      toValue: isPlaying ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isPlaying]);

  const animateButton = (scaleValue, callback) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (callback) callback();
  };

  const handlePlayPause = () => {
    animateButton(playButtonScale, onPlayPause);
  };

  const handleSkipBackward = () => {
    animateButton(skipBackwardScale, onSkipBackward);
  };

  const handleSkipForward = () => {
    animateButton(skipForwardScale, onSkipForward);
  };

  const handleSpeedChange = () => {
    animateButton(speedButtonScale, onChangePlaybackSpeed);
  };

  const getPlaybackSpeedColor = () => {
    switch (playbackSpeed) {
      case 0.5: return '#4CAF50';
      case 0.75: return '#2196F3';
      case 1: return '#666';
      case 1.25: return '#FF9800';
      case 1.5: return '#F44336';
      case 2: return '#9C27B0';
      default: return '#666';
    }
  };

  const isAtEnd = position >= duration && duration > 0;

  return (
    <View style={styles.controlsContainer}>
      {/* Speed Control */}
      <Animated.View style={{ transform: [{ scale: speedButtonScale }] }}>
        <TouchableOpacity 
          style={[
            styles.speedButton,
            { borderColor: getPlaybackSpeedColor(), borderWidth: 2 }
          ]} 
          onPress={handleSpeedChange}
          activeOpacity={0.7}
        >
          <Text style={[styles.speedText, { color: getPlaybackSpeedColor() }]}>
            {playbackSpeed}×
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Skip Backward */}
      <Animated.View style={{ transform: [{ scale: skipBackwardScale }] }}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleSkipBackward}
          activeOpacity={0.7}
        >
          <View style={styles.skipButtonContent}>
            <Ionicons name="play-back" size={18} color="#333" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Play/Pause Button */}
      <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
        <TouchableOpacity 
          style={[
            styles.playButton,
            isPlaying && styles.playButtonActive,
            isAtEnd && styles.playButtonReplay
          ]} 
          onPress={handlePlayPause}
          activeOpacity={0.8}
        >
          <View style={styles.playButtonInner}>
            {isAtEnd ? (
              <Ionicons name="reload" size={32} color={isAtEnd ? "#FFF" : "#333"} />
            ) : isPlaying ? (
              <Ionicons name="pause" size={32} color={isPlaying ? "#FFF" : "#333"} />
            ) : (
              <Ionicons name="play" size={32} color="#333" style={{ marginLeft: 2 }} />
            )}
          </View>
          
          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View 
              style={[
                styles.progressFill,
                { 
                  transform: [{ 
                    rotate: `${(position / duration) * 360 || 0}deg` 
                  }] 
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Skip Forward */}
      <Animated.View style={{ transform: [{ scale: skipForwardScale }] }}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleSkipForward}
          activeOpacity={0.7}
        >
          <View style={styles.skipButtonContent}>
            <Ionicons name="play-forward" size={18} color="#333" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Sleep Timer */}
      <View style={styles.sleepTimerContainer}>
        {sleepTimerButton}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  speedButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '700',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  skipButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  skipButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
    position: 'absolute',
    bottom: -2,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  playButtonActive: {
    backgroundColor: '#D32F2F',
    transform: [{ scale: 1.05 }],
  },
  playButtonReplay: {
    backgroundColor: '#4CAF50',
  },
  playButtonInner: {
    zIndex: 2,
  },
  progressRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'transparent',
    zIndex: 1,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#D32F2F',
    borderRightColor: '#D32F2F',
    transform: [{ rotate: '-90deg' }],
  },
  sleepTimerContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});