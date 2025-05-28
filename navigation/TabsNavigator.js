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
          tabBarBackground: () => (
            <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
          ),
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#807F7F",
          tabBarLabelStyle: styles.tabLabel,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Ionicons 
                  name="home" 
                  color={focused ? "#FFFFFF" : "#807F7F"} 
                  size={26} 
                />
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
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Ionicons 
                  name="grid" 
                  color={focused ? "#FFFFFF" : "#807F7F"} 
                  size={26} 
                />
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
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Ionicons 
                  name="library" 
                  color={focused ? "#FFFFFF" : "#807F7F"} 
                  size={26} 
                />
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
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Ionicons 
                  name="search" 
                  color={focused ? "#FFFFFF" : "#807F7F"} 
                  size={26} 
                />
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
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    height: 64,
    borderTopWidth: 0,
    elevation: 0,
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackground: {
    flex: 1,
    backgroundColor: "rgba(31, 31, 31, 0.95)",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2A2A",
  },
  activeIconContainer: {
    backgroundColor: "#9C3141",
  },
});