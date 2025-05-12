import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const AudioPlayerMenu = ({
  isVisible, 
  onClose,
  onDownloadPodcast,
  onSharePodcast,
  onSleepTimer,
  onPlaybackSettings
}) => {
  if (!isVisible) return null;

  const menuItems = [
    {
      icon: 'download',
      title: 'Download Podcast',
      onPress: () => {
        if (onDownloadPodcast) onDownloadPodcast();
        onClose();
      }
    },
    {
      icon: 'share-2',
      title: 'Share Podcast',
      onPress: () => {
        if (onSharePodcast) onSharePodcast();
        onClose();
      }
    },
    {
      icon: 'settings',
      title: 'Playback Settings',
      onPress: () => {
        if (onPlaybackSettings) onPlaybackSettings();
        onClose();
      }
    },
    {
      icon: 'moon',
      title: 'Sleep Timer',
      onPress: () => {
        if (onSleepTimer) onSleepTimer();
        onClose();
      }
    }
  ];

  return (
    <View style={styles.deviceOptionsContainer}>
      {/* Close Button */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Close Menu"
      >
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>

      {/* Modal Title */}
      <Text style={styles.modalTitle}>Podcast Options</Text>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.menuItem}
          onPress={item.onPress}
          accessible={true}
          accessibilityLabel={item.title}
        >
          <View style={styles.menuItemContent}>
            <Feather name={item.icon} size={20} color="#000" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  deviceOptionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default AudioPlayerMenu;