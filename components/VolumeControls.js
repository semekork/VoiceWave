import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export default function VolumeControls({ volume, onVolumeChange }) {
  return (
    <View style={styles.volumeContainer}>
      <Ionicons name="volume-mute-outline" size={20} style={styles.volumeIcon} />
      <Slider
        style={styles.volumeSlider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={onVolumeChange}
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