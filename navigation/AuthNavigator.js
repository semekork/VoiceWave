import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//AuthScreens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import SuccessScreen from "../screens/Auth/SuccessScreen";

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false, animation: "none"}} >
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ animation: 'none' }}/>
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ animation: 'none' }}/>
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ animation: 'none' }}/>
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} options={{ animation: 'none' }}/>
    </Stack.Navigator>
  );
};

export default AuthNavigator;