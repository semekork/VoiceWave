import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useGlobalAudioPlayer } from "../context/AudioPlayerContext";
import { isSameAudioSource } from '../utils/audioHelpers';
import podcastList from "../constants/podcastList"; // 👈 Import podcast list

const MiniPlayer = () => {
  const navigation = useNavigation();
  const {
    loadAudio,
    audioSource,
    playPause,
    isPlaying,
    setCurrentPodcast,
    skipForward,
    sound,
    isLoading,
    error,
  } = useGlobalAudioPlayer();

  // Get your default podcast (first one, or change logic if needed)
  const podcastDetails = podcastList[0];

  const handlePress = async () => {
    if (!isSameAudioSource(audioSource, podcastDetails.audioSource)) {
      await loadAudio(podcastDetails.audioSource);
    }
    setCurrentPodcast(podcastDetails);

    navigation.navigate("MainStack", {
      screen: "PlayerScreen",
      params: podcastDetails,
    });
  };

  const handlePlayPause = async () => {
    if (!sound) {
      console.log("⚠️ Sound is not loaded yet. Loading audio...");
      await loadAudio(podcastDetails.audioSource);
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
          source={podcastDetails.podcastImage}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {podcastDetails.podcastTitle}
          </Text>
          <Text style={styles.subtitle}>{podcastDetails.podcastSubtitle}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity onPress={handlePlayPause}>
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
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 16,
    padding: 12,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    zIndex: 10,
    width: "95%",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MiniPlayer;
