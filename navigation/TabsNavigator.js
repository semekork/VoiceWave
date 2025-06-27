// navigation/TabsNavigator.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { 
  View, 
  StyleSheet, 
  Animated, 
  Platform, 
  BackHandler
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { SCREEN_NAMES, TAB_CONFIG } from "./types";
import { useTabAnalytics } from "../hooks/useTabAnalytics";
import CustomTabBarButton from "../components/CustomTabBarButton";
import colors from "../constants/colors";

// Screen imports
import HomeScreen from "../screens/Home/HomeScreen";
import BrowseScreen from "../screens/Browse/BrowseScreen";
import LibraryScreen from "../screens/Library/LibraryScreen";
import SearchScreen from "../screens/Search/SearchScreen";
import MiniPlayer from "../components/MiniPlayer";

const Tab = createBottomTabNavigator();

// Component mapping
const SCREEN_COMPONENTS = {
  [SCREEN_NAMES.HOME]: HomeScreen,
  [SCREEN_NAMES.BROWSE]: BrowseScreen,
  [SCREEN_NAMES.LIBRARY]: LibraryScreen,
  [SCREEN_NAMES.SEARCH]: SearchScreen,
};

// Main Tabs Navigator Component
function TabsNavigator({ navigation }) {
  const [currentTab, setCurrentTab] = useState(SCREEN_NAMES.HOME);
  const [tabHistory, setTabHistory] = useState([SCREEN_NAMES.HOME]);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const tabBarOpacity = useRef(new Animated.Value(1)).current;
  const { logTabVisit } = useTabAnalytics();

  // Tab bar visibility controls
  const hideTabBar = useCallback(() => {
    setIsTabBarVisible(false);
    Animated.timing(tabBarOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [tabBarOpacity]);

  const showTabBar = useCallback(() => {
    setIsTabBarVisible(true);
    Animated.timing(tabBarOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [tabBarOpacity]);

  // Double tap to go to top functionality
  const lastTapTime = useRef(0);
  const handleDoubleTap = useCallback((tabName, navigation) => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (tabName === currentTab) {
        navigation.emit({
          type: 'scrollToTop',
          target: navigation.getState().key,
        });
      }
    }
    lastTapTime.current = now;
  }, [currentTab]);

  // Enhanced tab press handler
  const handleTabPress = useCallback(async (tabName, navigation) => {
    // Haptic feedback
    if (tabName === currentTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Log analytics
    await logTabVisit(tabName);
    
    // Update tab history
    setTabHistory(prev => {
      const newHistory = prev.filter(tab => tab !== tabName);
      return [tabName, ...newHistory].slice(0, 5);
    });
    
    setCurrentTab(tabName);
    handleDoubleTap(tabName, navigation);
  }, [currentTab, logTabVisit, handleDoubleTap]);

  // Long press functionality
  const handleLongPress = useCallback((tabName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    console.log(`Long pressed on ${tabName}`);
    // Add custom long press actions here
  }, []);

  // Back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tabHistory.length > 1) {
        const previousTab = tabHistory[1];
        // You can implement custom back navigation logic here
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [tabHistory]);

  // Render tab icon
  const renderTabIcon = useCallback(({ focused, color, size }, tabConfig) => (
    <View style={styles.customTabButton}>
      <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
        <Ionicons 
          name={focused ? tabConfig.icon : tabConfig.iconOutline} 
          color={focused ? colors.White : "#807F7F"} 
          size={26} 
        />
      </View>
    </View>
  ), []);

  return (
    <>
      <Tab.Navigator
        initialRouteName={SCREEN_NAMES.HOME}
        screenOptions={({ route, navigation }) => ({
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            { opacity: tabBarOpacity }
          ],
          tabBarBackground: () => (
            <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
          ),
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#807F7F",
          tabBarLabelStyle: styles.tabLabel,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: Platform.OS === 'ios',
        })}
      >
        {TAB_CONFIG.map((tabConfig) => (
          <Tab.Screen
            key={tabConfig.name}
            name={tabConfig.name}
            component={SCREEN_COMPONENTS[tabConfig.name]}
            options={{
              tabBarLabel: tabConfig.label,
              tabBarIcon: (props) => renderTabIcon(props, tabConfig),
              tabBarButton: (props) => (
                <CustomTabBarButton
                  {...props}
                  longPressEnabled={true}
                  onLongPress={() => handleLongPress(tabConfig.name)}
                />
              ),
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                handleTabPress(tabConfig.name, navigation);
              }
            })}
          />
        ))}
      </Tab.Navigator>

      {/* MiniPlayer */}
      <Animated.View 
        style={[
          styles.miniPlayerContainer,
          { opacity: tabBarOpacity }
        ]}
      >
        <MiniPlayer />
      </Animated.View>
    </>
  );
}

export default TabsNavigator;

const styles = StyleSheet.create({
  miniPlayerContainer: {
    position: "absolute",
    bottom: 100,
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
    paddingBottom: 0,
    shadowColor: colors.shadow,
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
    backgroundColor: colors.tabBackground,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.tabborderColor,
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
    backgroundColor: colors.iconContainer,
  },
  activeIconContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  customTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});