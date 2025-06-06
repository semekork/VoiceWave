
import './firebase/firebase'; 

import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationService } from './navigation/navigationHelpers';
import { SCREEN_NAMES } from './navigation/types';

// Navigators
import OnboardingNavigator from './navigation/OnboardingNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';

// Context Providers
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { ProfileImageProvider } from './context/ProfileImageContext';

import 'react-native-gesture-handler';

const RootStack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef();
  const [initialRoute, setInitialRoute] = useState(SCREEN_NAMES.AUTH_STACK);

  return (
    <AudioPlayerProvider>
      <ProfileImageProvider>
        <NavigationContainer
          ref={(ref) => {
            NavigationService.setTopLevelNavigator(ref);
          }}
        >
          <StatusBar style="light" />
          <RootStack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#1E1E1E' },
              animation: 'fade',
            }}
          >
            <RootStack.Screen
              name={SCREEN_NAMES.ONBOARDING_STACK}
              component={OnboardingNavigator}
              options={{ animationEnabled: false, gestureEnabled: false }}
            />
            <RootStack.Screen
              name={SCREEN_NAMES.AUTH_STACK}
              component={AuthNavigator}
              options={{ animationEnabled: true, animation: 'slide_from_right' }}
            />
            <RootStack.Screen
              name={SCREEN_NAMES.MAIN_STACK}
              component={MainNavigator}
              options={{ animationEnabled: false, gestureEnabled: false }}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      </ProfileImageProvider>
    </AudioPlayerProvider>
  );
}
