import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import useAudioPlayer from '../hooks/useAudioPlayer';

const EqualizerScreen = ({ navigation }) => {
  // Use the global audio player hook
  const { equalizerSettings, updateEqualizerSettings } = useAudioPlayer();

  // Local state for animated sliders
  const [animatedValues] = useState(
    equalizerSettings.bands.map(value => new Animated.Value(value))
  );

  // Frequency band labels
  const bandLabels = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz'];

  // Preset configurations
  const presets = {
    'Flat': [0, 0, 0, 0, 0, 0, 0, 0],
    'Rock': [3, 2, -1, -1, 0, 2, 4, 5],
    'Pop': [-1, 2, 4, 4, 1, -1, -2, -2],
    'Jazz': [2, 1, 1, 2, -1, -1, 0, 1],
    'Classical': [3, 2, -1, -2, -1, 1, 2, 3],
    'Electronic': [3, 2, 0, -1, -1, 0, 3, 4],
    'Hip-Hop': [4, 3, 1, 2, -1, -1, 1, 2],
    'Vocal': [-2, -1, 1, 3, 3, 2, 1, 0],
    'Bass Boost': [5, 4, 2, 0, -1, -1, -1, -1],
    'Treble Boost': [-1, -1, -1, 0, 1, 3, 4, 5],
    'Custom': equalizerSettings.bands
  };

  // Update animated values when settings change
  useEffect(() => {
    equalizerSettings.bands.forEach((value, index) => {
      Animated.timing(animatedValues[index], {
        toValue: value,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [equalizerSettings.bands]);

  // Toggle equalizer on/off
  const toggleEqualizer = async () => {
    const newSettings = {
      ...equalizerSettings,
      enabled: !equalizerSettings.enabled
    };
    await updateEqualizerSettings(newSettings);
  };

  // Change preset
  const changePreset = async (presetName) => {
    const newSettings = {
      ...equalizerSettings,
      preset: presetName,
      bands: [...presets[presetName]]
    };
    await updateEqualizerSettings(newSettings);
  };

  // Update individual band with debouncing
  const updateBand = async (bandIndex, value) => {
    const clampedValue = Math.max(-10, Math.min(10, Math.round(value)));
    const newBands = [...equalizerSettings.bands];
    newBands[bandIndex] = clampedValue;
    
    const newSettings = {
      ...equalizerSettings,
      preset: 'Custom',
      bands: newBands
    };
    await updateEqualizerSettings(newSettings);
  };

  // Reset all bands to 0
  const resetBands = async () => {
    await changePreset('Flat');
  };

  // Handle slider touch
  const handleSliderTouch = (event, bandIndex) => {
    const { locationY } = event.nativeEvent;
    const sliderHeight = 200;
    
    // Convert touch position to value (-10 to +10)
    // locationY = 0 is top (+10), locationY = sliderHeight is bottom (-10)
    const normalizedPosition = locationY / sliderHeight; // 0 to 1
    const value = 10 - (normalizedPosition * 20); // Convert to +10 to -10 range
    
    updateBand(bandIndex, Math.max(-10, Math.min(10, value)));
  };

  // Render enhanced frequency band slider with gesture support
  const renderBandSlider = (bandIndex) => {
    const value = equalizerSettings.bands[bandIndex];
    const sliderHeight = 200;
    const thumbSize = 24;
    
    // Calculate thumb position (inverted because positive values should be at top)
    const thumbPosition = ((10 - value) / 20) * (sliderHeight - thumbSize);

    // Determine font weight based on value (using conditional logic instead of interpolation)
    const getFontWeight = () => {
      if (Math.abs(value) >= 5) return '700';
      if (Math.abs(value) >= 3) return '600';
      if (Math.abs(value) > 0) return '500';
      return 'normal';
    };

    return (
      <View key={bandIndex} style={styles.bandContainer}>
        <Text style={styles.bandLabel}>{bandLabels[bandIndex]}</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.valueText}>+10</Text>
          <TouchableOpacity
            onPress={(event) => handleSliderTouch(event, bandIndex)}
            activeOpacity={0.8}
            disabled={!equalizerSettings.enabled}
          >
            <View style={[styles.sliderTrack, { height: sliderHeight }]}>
              {/* Center line */}
              <View style={styles.centerLine} />
              {/* Grid lines */}
              {[...Array(9)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.gridLine,
                    { top: (i + 1) * (sliderHeight / 10) }
                  ]}
                />
              ))}
              {/* Animated slider thumb */}
              <Animated.View
                style={[
                  styles.sliderThumb,
                  {
                    top: thumbPosition,
                    backgroundColor: equalizerSettings.enabled ? '#D32F2F' : '#CCC',
                    transform: [{
                      scale: animatedValues[bandIndex].interpolate({
                        inputRange: [-10, 0, 10],
                        outputRange: [0.8, 1, 1.2],
                        extrapolate: 'clamp',
                      })
                    }]
                  }
                ]}
              />
              {/* Active area indicator with animation */}
              {value !== 0 && equalizerSettings.enabled && (
                <Animated.View
                  style={[
                    styles.activeArea,
                    {
                      top: value > 0 ? thumbPosition + thumbSize/2 : sliderHeight/2,
                      height: Math.abs(value) * (sliderHeight/20),
                      backgroundColor: value > 0 ? '#D32F2F' : '#2196F3',
                      opacity: animatedValues[bandIndex].interpolate({
                        inputRange: [-10, 0, 10],
                        outputRange: [0.7, 0, 0.7],
                        extrapolate: 'clamp',
                      })
                    }
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.valueText}>-10</Text>
        </View>
        <View style={styles.bandControls}>
          <TouchableOpacity
            style={[styles.bandButton, !equalizerSettings.enabled && styles.disabledButton]}
            onPress={() => updateBand(bandIndex, Math.min(10, value + 1))}
            disabled={!equalizerSettings.enabled}
          >
            <Ionicons name="add" size={20} color={equalizerSettings.enabled ? "#333" : "#CCC"} />
          </TouchableOpacity>
          <Text style={[
            styles.bandValue, 
            !equalizerSettings.enabled && styles.disabledText,
            {
              fontWeight: getFontWeight() // Use the function instead of interpolation
            }
          ]}>
            {value > 0 ? `+${value}` : value}
          </Text>
          <TouchableOpacity
            style={[styles.bandButton, !equalizerSettings.enabled && styles.disabledButton]}
            onPress={() => updateBand(bandIndex, Math.max(-10, value - 1))}
            disabled={!equalizerSettings.enabled}
          >
            <Ionicons name="remove" size={20} color={equalizerSettings.enabled ? "#333" : "#CCC"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render preset button with better visual feedback
  const renderPresetButton = (presetName) => {
    const isActive = equalizerSettings.preset === presetName;
    const isCustom = presetName === 'Custom';
    
    return (
      <TouchableOpacity
        key={presetName}
        style={[
          styles.presetButton,
          isActive && styles.activePresetButton,
          !equalizerSettings.enabled && styles.disabledButton,
          isCustom && isActive && styles.customPresetButton
        ]}
        onPress={() => changePreset(presetName)}
        disabled={!equalizerSettings.enabled}
      >
        <Text style={[
          styles.presetButtonText,
          isActive && styles.activePresetButtonText,
          !equalizerSettings.enabled && styles.disabledText,
          isCustom && isActive && styles.customPresetButtonText
        ]}>
          {presetName}
        </Text>
        {isActive && (
          <View style={styles.activeIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Audio Equalizer</Text>
        <TouchableOpacity
          style={[styles.toggleButton, equalizerSettings.enabled && styles.activeToggleButton]}
          onPress={toggleEqualizer}
        >
          <Text style={[styles.toggleButtonText, equalizerSettings.enabled && styles.activeToggleButtonText]}>
            {equalizerSettings.enabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Current Preset Display */}
        <View style={styles.currentPresetContainer}>
          <View style={styles.presetIconContainer}>
            <MaterialIcons 
              name="equalizer" 
              size={40} 
              color={equalizerSettings.enabled ? "#D32F2F" : "#CCC"} 
            />
            {equalizerSettings.enabled && (
              <View style={styles.pulseIndicator} />
            )}
          </View>
          <Text style={[styles.currentPresetText, !equalizerSettings.enabled && styles.disabledText]}>
            {equalizerSettings.preset}
          </Text>
          {equalizerSettings.enabled && (
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          )}
          {!equalizerSettings.enabled && (
            <Text style={styles.inactiveText}>Tap ON to enable equalizer</Text>
          )}
        </View>

        {/* Enhanced Preset Selector */}
        <View style={styles.presetContainer}>
          <Text style={styles.sectionTitle}>Audio Presets</Text>
          <Text style={styles.sectionSubtitle}>Choose a preset or create your custom sound</Text>
          <View style={styles.presetGrid}>
            {Object.keys(presets).map(renderPresetButton)}
          </View>
        </View>

        {/* Enhanced Frequency Bands */}
        <View style={styles.bandsSection}>
          <Text style={styles.sectionTitle}>Frequency Bands</Text>
          <Text style={styles.sectionSubtitle}>
            {equalizerSettings.enabled 
              ? "Drag sliders or use +/- buttons to adjust" 
              : "Enable equalizer to adjust frequencies"
            }
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.bandsScrollView}
            contentContainerStyle={styles.bandsContainer}
          >
            {equalizerSettings.bands.map((_, index) => renderBandSlider(index))}
          </ScrollView>
        </View>

        {/* Enhanced Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, !equalizerSettings.enabled && styles.disabledButton]}
            onPress={resetBands}
            disabled={!equalizerSettings.enabled}
          >
            <Ionicons name="refresh" size={24} color={equalizerSettings.enabled ? "#333" : "#CCC"} />
            <Text style={[styles.controlButtonText, !equalizerSettings.enabled && styles.disabledText]}>
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !equalizerSettings.enabled && styles.disabledButton]}
            onPress={() => changePreset('Bass Boost')}
            disabled={!equalizerSettings.enabled}
          >
            <MaterialIcons name="music-note" size={24} color={equalizerSettings.enabled ? "#D32F2F" : "#CCC"} />
            <Text style={[styles.controlButtonText, !equalizerSettings.enabled && styles.disabledText]}>
              Bass Boost
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !equalizerSettings.enabled && styles.disabledButton]}
            onPress={() => changePreset('Treble Boost')}
            disabled={!equalizerSettings.enabled}
          >
            <MaterialIcons name="graphic-eq" size={24} color={equalizerSettings.enabled ? "#2196F3" : "#CCC"} />
            <Text style={[styles.controlButtonText, !equalizerSettings.enabled && styles.disabledText]}>
              Treble Boost
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Changes are automatically saved and will persist across app sessions
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  toggleButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeToggleButton: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  activeToggleButtonText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  currentPresetContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  presetIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  pulseIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  currentPresetText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  inactiveText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  presetContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
    minWidth: '30%',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activePresetButton: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  customPresetButton: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activePresetButtonText: {
    color: 'white',
  },
  customPresetButtonText: {
    color: 'white',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  bandsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bandsScrollView: {
    flexGrow: 0,
  },
  bandsContainer: {
    paddingHorizontal: 10,
  },
  bandContainer: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 60,
  },
  bandLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  valueText: {
    fontSize: 10,
    color: '#AAA',
    marginVertical: 4,
    fontWeight: '500',
  },
  sliderTrack: {
    width: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    position: 'relative',
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: -6,
    right: -6,
    height: 2,
    backgroundColor: '#888',
    borderRadius: 1,
  },
  gridLine: {
    position: 'absolute',
    left: -3,
    right: -3,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    left: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'white',
  },
  activeArea: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 2,
  },
  bandControls: {
    alignItems: 'center',
  },
  bandButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bandValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: 'bold',
    marginVertical: 6,
    minWidth: 36,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  disabledButton: {
    backgroundColor: '#F8F8F8',
    borderColor: '#F0F0F0',
  },
  disabledText: {
    color: '#CCC',
  },
});

export default EqualizerScreen;