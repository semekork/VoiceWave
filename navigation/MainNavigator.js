// navigation/MainNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES, NAVIGATION_CONFIG } from "./types";

// Import navigators and screens
import TabsNavigator from "./TabsNavigator";
import PlayerScreen from "../screens/Home/PlayerScreen";
import QueueScreen from "../screens/Home/QueueScreen";
import Profile from "../screens/Profile/Profile";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import PrivacyScreen from "../screens/Settings/PrivacyScreen";
import SubscriptionScreen from "../screens/Settings/SubScriptionScreen";
import SupportScreen from "../screens/Settings/SupportScreen";
import TermsScreen from "../screens/Settings/TermsScreen";
import AboutScreen from "../screens/Settings/AboutScreen";
import ReleaseNotes from "../screens/Settings/ReleaseNotes";
import PodcastDetailScreen from "../screens/Home/PodcastDetailsScreen";
import EpisodeDetailScreen from "../screens/Home/EpisodeDetailsScreen";
import EqualizerScreen from "../components/Equalizer";
import DeleteAccountScreen from "../screens/Auth/DeleteAccount";
import GoodbyeScreen from "../screens/Profile/GoodbyeScreen";
import LoginActivity from "../screens/Auth/LoginActivity";
import liveChat from "../screens/Chat/liveChat";
import NotificationSettingsScreen from "../screens/Settings/NotificationSettingsScreen";

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="TabsRoot"
      screenOptions={NAVIGATION_CONFIG.defaultScreenOptions}
    >
      
      <Stack.Screen 
        name="TabsRoot" 
        component={TabsNavigator}
        options={{ 
          gestureEnabled: false,
          animation: 'none' 
        }}
      />
      
      {/* Modal/Overlay Screens */}
      <Stack.Group screenOptions={{ 
        gestureEnabled: true,
        gestureDirection: 'vertical'
      }}>
        <Stack.Screen 
          name={SCREEN_NAMES.PROFILE} 
          component={Profile}
          options={{
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.EDIT_PROFILE} 
          component={EditProfileScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.PRIVACY} 
          component={PrivacyScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.SUBSCRIPTION} 
          component={SubscriptionScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.SUPPORT} 
          component={SupportScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name={SCREEN_NAMES.ABOUT} 
          component={AboutScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.TERMS} 
          component={TermsScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name={SCREEN_NAMES.DETAILS} 
          component={PodcastDetailScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name={SCREEN_NAMES.EDETAILS}
          component={EpisodeDetailScreen}
          options={{
            presentation: 'modal'
          }}
          />
        <Stack.Screen
          name={SCREEN_NAMES.DELETE_ACCOUNT} 
          component={DeleteAccountScreen}
          options={{
            presentation: 'modal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name={SCREEN_NAMES.GOODBYE} 
          component={GoodbyeScreen}
          options={{
            presentation: 'fullScreenModal',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name={SCREEN_NAMES.NOTES}
          component={ReleaseNotes}
          options={{}}
        />
      </Stack.Group>
      
      {/* Full Screen Overlays */}
      <Stack.Group screenOptions={{ 
        presentation: 'fullScreenModal',
        gestureEnabled: true 
      }}>
        <Stack.Screen 
          name={SCREEN_NAMES.PLAYER} 
          component={PlayerScreen}
          options={{
            animation: 'default',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.QUEUE} 
          component={QueueScreen}
          options={{
            animation: 'slide_from_right',
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.EQUALIZER} 
          component={EqualizerScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.LOGIN_ACTIVITY} 
          component={LoginActivity}
          options={{
            animation: 'slide_from_right',
            gestureDirection: 'horizontal',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.LIVE_CHAT} 
          component={liveChat}
          options={{
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen 
          name={SCREEN_NAMES.NOTIFICATIONS} 
          component={NotificationSettingsScreen}
          options={{
            animation: 'slide_from_right',
            gestureDirection: 'vertical',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainNavigator;