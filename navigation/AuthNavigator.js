// navigation/AuthNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAMES, NAVIGATION_CONFIG } from "./types";

// Auth Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import SuccessScreen from "../screens/Auth/SuccessScreen";


const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName={SCREEN_NAMES.LOGIN}
      screenOptions={{
        ...NAVIGATION_CONFIG.defaultScreenOptions,
        animation: "slide_from_right"
      }}
    >
      <Stack.Screen 
        name={SCREEN_NAMES.LOGIN} 
        component={LoginScreen} 
        options={{ 
          animation: 'none',
          gestureEnabled: false 
        }}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.REGISTER} 
        component={RegisterScreen} 
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true 
        }}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.FORGOT_PASSWORD} 
        component={ForgotPasswordScreen} 
        options={{ 
          animation: 'slide_from_right',
          gestureEnabled: true 
        }}
      />
      <Stack.Screen 
        name={SCREEN_NAMES.SUCCESS} 
        component={SuccessScreen} 
        options={{ 
          animation: 'fade',
          gestureEnabled: false 
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;