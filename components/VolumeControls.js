import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

export default function VolumeControls({ volume, onVolumeChange }) {
  const [systemVolume, setSystemVolume] = useState(volume);

  useEffect(() => {
    let volumeListener;

    const setupVolumeListener = async () => {
      try {
        // Request permissions
        await Audio.requestPermissionsAsync();
        
        // Set audio mode to allow volume control
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
          playThroughEarpieceAndroid: false,
        });

        // Listen for system volume changes
        volumeListener = Audio.addListener('volumeChanged', (event) => {
          const newVolume = event.volume;
          setSystemVolume(newVolume);
          onVolumeChange(newVolume);
        });

      } catch (error) {
        console.error('Error setting up volume listener:', error);
      }
    };

    setupVolumeListener();

    return () => {
      if (volumeListener) {
        volumeListener.remove();
      }
    };
  }, [onVolumeChange]);

  const handleSliderChange = async (value) => {
    try {
      // Update system volume when slider changes
      await Audio.setSystemVolumeAsync(value);
      setSystemVolume(value);
      onVolumeChange(value);
    } catch (error) {
      console.error('Error setting system volume:', error);
      // Fallback to just updating app volume
      onVolumeChange(value);
    }
  };

  return (
    <View style={styles.volumeContainer}>
      <Ionicons name="volume-mute-outline" size={20} style={styles.volumeIcon} />
      <Slider
        style={styles.volumeSlider}
        minimumValue={0}
        maximumValue={1}
        value={systemVolume}
        onValueChange={handleSliderChange}
        minimumTrackTintColor="#000"
        maximumTrackTintColor="#DDDDDD"
        thumbTintColor="transparent"
        thumbStyle={{ width: 0, height: 0 }}
      />
      <Ionicons name="volume-high-outline" size={20} style={styles.volumeIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 10,
    marginHorizontal: 10,
  },
  volumeIcon: {
    color: '#666',
  },
});