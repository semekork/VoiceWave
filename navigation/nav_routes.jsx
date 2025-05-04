import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import SplashScreen from "../screens/Onboarding/SplashScreen";
import Onboarding from "../screens/Onboarding/Onboarding";
import GetStarted from "../screens/Onboarding/GetStarted";

const OnboardingStack = createNativeStackNavigator();

export const OnboardingScreen = () => {
  return (
    <OnboardingStack.Navigator 
      initialRouteName="SplashScreen"
      screenOptions={{ 
        headerShown: false,
        animation: "none"
      }}
    >
      <OnboardingStack.Screen 
        name="SplashScreen" 
        component={SplashScreen} 
        options={{ animation: 'fade' }}
      />
      <OnboardingStack.Screen 
        name="Onboarding" 
        component={Onboarding}
        options={{ animation: 'none' }}
      />
       
      <OnboardingStack.Screen 
        name="GetStarted" 
        component={GetStarted} 
        options={{ animation: 'fade' }}
      />
    
    </OnboardingStack.Navigator>
  );
};