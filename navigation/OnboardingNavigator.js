// navigation/OnboardingNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES, NAVIGATION_CONFIG } from "./types";

// Onboarding Screens
import SplashScreen from "../screens/Onboarding/SplashScreen";
import Onboarding from "../screens/Onboarding/Onboarding";
import GetStarted from "../screens/Onboarding/GetStarted";

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName={SCREEN_NAMES.SPLASH}
      screenOptions={{
        ...NAVIGATION_CONFIG.defaultScreenOptions,
        animation: "none"
      }}
    >
      <Stack.Screen 
        name={SCREEN_NAMES.SPLASH} 
        component={SplashScreen} 
        options={{ 
          animation: 'fade',
          gestureEnabled: false 
        }}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.ONBOARDING} 
        component={Onboarding}
        options={{ 
          animation: 'none',
          gestureEnabled: false 
        }}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.GET_STARTED} 
        component={GetStarted} 
        options={{ 
          animation: 'fade',
          gestureEnabled: false 
        }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;