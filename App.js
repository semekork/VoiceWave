import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View,StyleSheet, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingNavigator from './navigation/nav_routes'; // Now correctly importing

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack.Navigator 
          initialRouteName="OnboardingStack" 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#1E1E1E' }
          }}
        >
          <Stack.Screen 
            name="OnboardingStack" 
            component={OnboardingNavigator} 
            options={{ animationEnabled: false }}
          />
          {/* Add more navigation stacks here as your app grows */}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
});