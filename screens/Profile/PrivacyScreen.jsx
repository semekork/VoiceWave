import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showListeningActivity: true,
    allowFriendRequests: true,
    sharePlaylistsPublicly: false,
    dataCollection: true,
    analytics: false,
    marketingEmails: true,
    twoFactorAuth: false,
  });

  const handleToggle = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => navigation.navigate('DeleteAccountScreen'),
        },
      ],
      { cancelable: false }
    );
  };

  const MenuItem = ({ title, subtitle, value, onValueChange, showToggle = true, onPress, dangerous = false }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      disabled={showToggle}
    >
      <View style={styles.menuLeft}>
        <Text style={[styles.menuTitle, dangerous && styles.dangerousText]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showToggle && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E5EA', true: '#9C3141' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E5E5EA"
        />
      )}
      {!showToggle && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuContainer}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#9C3141" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Section title="Profile Privacy">
          <MenuItem
            title="Public Profile"
            subtitle="Allow others to find and view your profile"
            value={settings.profileVisibility}
            onValueChange={(value) => handleToggle('profileVisibility', value)}
          />
          <MenuItem
            title="Show Listening Activity"
            subtitle="Display your recent listening activity to friends"
            value={settings.showListeningActivity}
            onValueChange={(value) => handleToggle('showListeningActivity', value)}
          />
          <MenuItem
            title="Allow Friend Requests"
            subtitle="Let other users send you friend requests"
            value={settings.allowFriendRequests}
            onValueChange={(value) => handleToggle('allowFriendRequests', value)}
          />
          <MenuItem
            title="Public Playlists"
            subtitle="Make your playlists discoverable by others"
            value={settings.sharePlaylistsPublicly}
            onValueChange={(value) => handleToggle('sharePlaylistsPublicly', value)}
          />
        </Section>

        <Section title="Data & Analytics">
          <MenuItem
            title="Data Collection"
            subtitle="Allow collection of usage data to improve the app"
            value={settings.dataCollection}
            onValueChange={(value) => handleToggle('dataCollection', value)}
          />
          <MenuItem
            title="Analytics"
            subtitle="Share anonymous analytics data"
            value={settings.analytics}
            onValueChange={(value) => handleToggle('analytics', value)}
          />
          <MenuItem
            title="Marketing Communications"
            subtitle="Receive emails about new features and content"
            value={settings.marketingEmails}
            onValueChange={(value) => handleToggle('marketingEmails', value)}
          />
        </Section>

        <Section title="Security">
          <MenuItem
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onValueChange={(value) => handleToggle('twoFactorAuth', value)}
          />
          <MenuItem
            title="Login Activity"
            subtitle="Review recent login attempts"
            showToggle={false}
            onPress={() => navigation.navigate('LoginActivity')}
          />
          <MenuItem
            title="Connected Apps"
            subtitle="Manage third-party app connections"
            showToggle={false}
            onPress={() => navigation.navigate('ConnectedApps')}
          />
        </Section>

        <Section title="Data Management">
          <MenuItem
            title="Download My Data"
            subtitle="Get a copy of your data"
            showToggle={false}
            onPress={() => {
              Alert.alert(
                'Download Data',
                'We\'ll prepare your data and send you a download link via email within 24 hours.',
                [{ text: 'OK' }]
              );
            }}
          />
          <MenuItem
            title="Delete Account"
            subtitle="Permanently delete your account and all data"
            showToggle={false}
            onPress={handleDeleteAccount}
            dangerous={true}
          />
        </Section>

        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#34C759" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Your Privacy Matters</Text>
              <Text style={styles.infoText}>
                We're committed to protecting your privacy. Learn more about how we handle your data in our Privacy Policy.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => navigation.navigate('Terms')}
          >
            <Text style={styles.linkText}>Read Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#9C3141" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuLeft: {
    flex: 1,
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  dangerousText: {
    color: '#D70015',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 18,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    color: '#9C3141',
    fontWeight: '500',
    marginRight: 6,
  },
});

export default PrivacyScreen;