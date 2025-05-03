import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import SplashScreen from "../screens/Onboarding/SplashScreen";
import Onboarding1 from "../screens/Onboarding/Onboarding1";
import Onboarding2 from "../screens/Onboarding/Onboarding2";
import Onboarding3 from "../screens/Onboarding/Onboarding3";

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
        name="Onboarding1" 
        component={Onboarding1}
        options={{ animation: 'none' }}
      />
       
      <OnboardingStack.Screen 
        name="Onboarding2" 
        component={Onboarding2} 
      />
      <OnboardingStack.Screen 
        name="Onboarding3" 
        component={Onboarding3} 
      />
    
    </OnboardingStack.Navigator>
  );
};