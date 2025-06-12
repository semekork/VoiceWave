import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useGlobalAudioPlayer } from "../context/AudioPlayerContext";
import { isSameAudioSource } from '../utils/audioHelpers';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const {
    loadAudio,
    audioSource,
    playPause,
    isPlaying,
    skipForward,
    sound,
    isLoading,
    error,
    currentPodcast,
  } = useGlobalAudioPlayer();

  if (!currentPodcast) {
    return null;
  }

  const handlePress = async () => {
    if (!isSameAudioSource(audioSource, currentPodcast.audioSource)) {
      await loadAudio(currentPodcast.audioSource);
    }

    navigation.navigate("MainStack", {
      screen: "PlayerScreen",
      params: currentPodcast,
    });
  };

  const handlePlayPause = async () => {
    if (!sound) {
      console.log("⚠️ Sound is not loaded yet. Loading audio...");
      await loadAudio(currentPodcast.audioSource);
    }
    console.log("🔊 playPause triggered, isPlaying:", isPlaying);
    playPause();
  };

  useEffect(() => {
    if (error) {
      console.log("🚨 Audio error:", error);
    }
  }, [error]);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.leftSection}>
        <Image
          source={currentPodcast.image}  
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentPodcast.title} 
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {currentPodcast.author}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity onPress={handlePlayPause} disabled={isLoading}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="#000"
            style={{ marginRight: 16 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => skipForward()}>
          <Ionicons name="refresh" size={20} color="#000" />
          <Text style={styles.durationText}>30</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '95%',
    borderRadius: 32,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 10,
    color: '#000',
    marginTop: -2,
    textAlign: 'center',
  },
});

export default MiniPlayer;