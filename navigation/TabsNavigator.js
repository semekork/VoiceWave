import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import HomeScreen from "../screens/Home/HomeScreen";
import BrowseScreen from "../screens/Browse/BrowseScreen";
import LibraryScreen from "../screens/Library/LibraryScreen";
import SearchScreen from "../screens/Search/SearchScreen";
import MiniPlayer from "../components/MiniPlayer";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const handleTabPress = () => {
    Haptics.selectionAsync();
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <BlurView intensity={40} tint="light" style={styles.blurBackground} />,
          tabBarActiveTintColor: "#9C3141",
          tabBarInactiveTintColor: "#8391A1",
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="home" color={color} size={size} />
              </View>
            ),
          }}
          listeners={{ tabPress: () => handleTabPress() }}
        />
        <Tab.Screen
          name="BrowseScreen"
          component={BrowseScreen}
          options={{
            tabBarLabel: "Browse",
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="grid" color={color} size={size} />
              </View>
            ),
          }}
          listeners={{ tabPress: () => handleTabPress() }}
        />
        <Tab.Screen
          name="LibraryScreen"
          component={LibraryScreen}
          options={{
            tabBarLabel: "Library",
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="book" color={color} size={size} />
              </View>
            ),
          }}
          listeners={{ tabPress: () => handleTabPress() }}
        />
        <Tab.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{
            tabBarLabel: "Search",
            tabBarIcon: ({ color, size }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="search" color={color} size={size} />
              </View>
            ),
          }}
          listeners={{ tabPress: () => handleTabPress() }}
        />
      </Tab.Navigator>

      {/* MiniPlayer floating over tabs */}
      <View style={styles.miniPlayerContainer}>
        <MiniPlayer />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  miniPlayerContainer: {
    position: "absolute",
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  tabBar: {
    backgroundColor: "rgba(255,255,255,0.7)",
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    height: 70,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 0,
  },
  blurBackground: {
    flex: 1,
    overflow: "hidden",
    borderColor: "rgba(255,255,255,0.7)",
    borderTopWidth: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Platform.OS === "ios" ? 0 : 5,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 30,
  },
});
