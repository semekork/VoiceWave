import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import navigators and screens
import TabsNavigator from "./TabsNavigator";
import PlayerScreen from "../screens/Home/PlayerScreen";

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PlayerScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabsNavigator} />
      <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
