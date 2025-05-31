import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function WaveformPlayer({ 
  position, 
  duration, 
  onSeek 
}) {
  const waveformRef = useRef(null);

  const handleWaveformSeek = (event) => {
    if (!waveformRef.current) return;

    const { locationX } = event.nativeEvent;
    const waveformWidth = SCREEN_WIDTH - 40;
    const seekPercentage = locationX / waveformWidth;
    const newPosition = Math.floor(seekPercentage * duration);

    onSeek(newPosition);
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

  return generateWaveform();
}

const styles = StyleSheet.create({
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
});