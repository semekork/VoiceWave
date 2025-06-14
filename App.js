import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

// Context Providers
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { ProfileImageProvider } from './context/ProfileImageContext';

// Main App Content
import AppContent from './navigation/appContent';

// React Native Gesture Handler import
import 'react-native-gesture-handler';

// Root App Component
export default function App() {
  return (
    <AudioPlayerProvider>
      <ProfileImageProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppContent />
        </NavigationContainer>
      </ProfileImageProvider>
    </AudioPlayerProvider>
  );
}