import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Onboarding Screens
import SplashScreen from "../screens/Onboarding/SplashScreen";
import Onboarding from "../screens/Onboarding/Onboarding";
import GetStarted from "../screens/Onboarding/GetStarted";

const Stack = createNativeStackNavigator();


export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="SplashScreen"
      screenOptions={{ 
        headerShown: false,
        animation: "none"
      }}
    >
      <Stack.Screen 
        name="SplashScreen" 
        component={SplashScreen} 
        options={{ animation: 'fade' }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={Onboarding}
        options={{ animation: 'none' }}
      />
      <Stack.Screen 
        name="GetStarted" 
        component={GetStarted} 
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;