import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const MiniPlayer = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("MainStack", { screen: "PlayerScreen" })
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.leftSection}>
        <Image
          source={require("../assets/image 15.png")}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Can you solve the honeybee riddle?
          </Text>
          <Text style={styles.subtitle}>February 15</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Ionicons name="play" size={24} color="#000" style={{ marginRight: 16 }} />
        <View style={styles.durationContainer}>
          <Ionicons name="refresh" size={20} color="#000" />
          <Text style={styles.durationText}>30</Text>
        </View>
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
