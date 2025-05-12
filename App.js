import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';  
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingNavigator from './navigation/OnboardingNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import TabsNavigator from './navigation/TabsNavigator';
import MainNavigator from './navigation/MainNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="TabsStack"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1E1E1E' },
        }}
      >
        <Stack.Screen
          name="OnboardingStack"
          component={OnboardingNavigator}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen
          name="AuthStack"
          component={AuthNavigator}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen
          name="TabsStack"
          component={TabsNavigator}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen
          name="MainStack"
          component={MainNavigator}
          options={{ animationEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
});
