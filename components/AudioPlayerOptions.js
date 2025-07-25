import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const AudioPlayerMenu = ({ 
  isVisible, 
  onClose, 
  navigation, 
  isShuffle,
  toggleShuffle,
  isQueueLooping,
  toggleQueueLooping,
  currentPodcast,
  addToQueue,
  equalizerSettings
}) => {
  const [animation] = useState(new Animated.Value(0));
  
  // Animate menu opening and closing
  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Handle adding current podcast to queue
  const handleAddToQueue = () => {
    if (currentPodcast) {
      addToQueue(currentPodcast);
      onClose();
    }
  };


  // Navigate to equalizer screen
  const navigateToEqualizer = () => {
    onClose();
    navigation.navigate('EqualizerScreen');
  };

  // Format playback speed for display
  const formatSpeed = (speed) => {
    return speed === 1 ? '1x' : `${speed}x`;
  };

  // Check if equalizer has custom settings (not flat)
  const hasCustomEqualizer = () => {
    if (!equalizerSettings?.enabled) return false;
    // Check if any bands are not zero or if preset is not 'Flat'
    const hasNonZeroBands = equalizerSettings.bands && equalizerSettings.bands.some(band => band !== 0);
    const hasActivePreset = equalizerSettings.preset && equalizerSettings.preset !== 'Flat';
    return hasNonZeroBands || hasActivePreset;
  };

  // Get equalizer status text
  const getEqualizerStatus = () => {
    if (!equalizerSettings?.enabled) return 'OFF';
    if (equalizerSettings.preset && equalizerSettings.preset !== 'Flat') {
      return equalizerSettings.preset;
    }
    return 'ON';
  };

  // Animation values
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.overlay, { opacity }]} onTouchStart={onClose} />
        
        <Animated.View style={[styles.menuContainer, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          
          <Text style={styles.menuTitle}>Audio Options</Text>
          

          {/* Enhanced Equalizer */}
          <TouchableOpacity style={styles.menuItem} onPress={navigateToEqualizer}>
            <View style={styles.menuItemContent}>
              <MaterialIcons 
                name="equalizer" 
                size={24} 
                color={hasCustomEqualizer() ? "#D32F2F" : "#333"} 
              />
              <View style={styles.equalizerTextContainer}>
                <Text style={[
                  styles.menuItemText,
                  hasCustomEqualizer() && styles.activeEqualizerText
                ]}>
                  Equalizer
                </Text>
              </View>
            </View>
            <View style={styles.badgeContainer}>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </View>
          </TouchableOpacity>
          
          {/* Queue Controls */}
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Queue</Text>
          </View>
          
          
          {/* Add to Queue */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleAddToQueue}
            disabled={!currentPodcast || queue.some(item => item.id === currentPodcast.id)}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="add-circle-outline" size={24} color="#333" />
              <Text style={[
                styles.menuItemText, 
                (!currentPodcast || queue.some(item => item.id === currentPodcast?.id)) && styles.disabledText
              ]}>
                Add to Queue
              </Text>
            </View>
            {currentPodcast && queue.some(item => item.id === currentPodcast.id) && (
              <Text style={styles.addedText}>Added</Text>
            )}
          </TouchableOpacity>
          
          {/* Shuffle */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={toggleShuffle}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="shuffle" size={24} color={isShuffle ? "#D32F2F" : "#333"} />
              <Text style={[styles.menuItemText, isShuffle && styles.activeText]}>Shuffle</Text>
            </View>
            <View style={styles.toggleContainer}>
              <View style={[styles.toggleTrack, isShuffle && styles.activeToggleTrack]}>
                <Animated.View style={[
                  styles.toggleThumb, 
                  isShuffle && styles.activeToggleThumb
                ]} />
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Loop */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={toggleQueueLooping}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="repeat" size={24} color={isQueueLooping ? "#D32F2F" : "#333"} />
              <Text style={[styles.menuItemText, isQueueLooping && styles.activeText]}>Loop Queue</Text>
            </View>
            <View style={styles.toggleContainer}>
              <View style={[styles.toggleTrack, isQueueLooping && styles.activeToggleTrack]}>
                <Animated.View style={[
                  styles.toggleThumb, 
                  isQueueLooping && styles.activeToggleThumb
                ]} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  menuItemValue: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  // New styles for enhanced equalizer display
  equalizerTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  activeEqualizerText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  activeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  activeIndicatorText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  activeBadgeText: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
    fontWeight: '600',
  },
  customBadgeText: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
    fontWeight: '600',
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  sectionTitleText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 14,
    marginRight: 5,
    color: '#666',
  },
  disabledText: {
    color: '#BBB',
  },
  addedText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  toggleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DDD',
    padding: 2,
  },
  activeToggleTrack: {
    backgroundColor: '#F8E7E7',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  activeToggleThumb: {
    backgroundColor: '#D32F2F',
    transform: [{ translateX: 22 }],
  },
  activeText: {
    color: '#D32F2F',
  },
  closeButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default AudioPlayerMenu;