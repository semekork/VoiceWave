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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; 
import { useDataExport } from '../../utils/useDataExport';

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

  const {
    exportRequests,
    loading: exportLoading,
    requestDataExport,
    canRequestExport,
    latestCompletedExport,
  } = useDataExport();

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

  const handleDownloadData = async () => {
    if (!canRequestExport) {
      Alert.alert(
        'Request Pending',
        'You already have a pending data export request. Please wait for it to complete before requesting another one.'
      );
      return;
    }

    try {
      await requestDataExport();
      Alert.alert(
        'Data Export Initiated',
        'We\'re preparing your data export. You\'ll receive an email with a download link within 24 hours. The link will be valid for 7 days.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', error.message);
    }
  };

  const openDownloadUrl = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open download link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open download link');
    }
  };

  const renderExportStatus = () => {
    if (exportRequests.length === 0) return null;

    const latestRequest = exportRequests[0];
    
    return (
      <View style={styles.exportStatusContainer}>
        <Text style={styles.exportStatusTitle}>Recent Data Export</Text>
        <View style={styles.exportStatusItem}>
          <View style={styles.exportStatusLeft}>
            <Text style={styles.exportStatusDate}>
              {new Date(latestRequest.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.exportStatusText}>
              Status: {latestRequest.status.charAt(0).toUpperCase() + latestRequest.status.slice(1)}
            </Text>
            {latestRequest.status === 'completed' && latestRequest.expires_at && (
              <Text style={styles.exportStatusExpiry}>
                Expires: {new Date(latestRequest.expires_at).toLocaleDateString()}
              </Text>
            )}
          </View>
          {latestRequest.status === 'completed' && latestRequest.download_url && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => openDownloadUrl(latestRequest.download_url)}
            >
              <Ionicons name="download-outline" size={16} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          )}
          {latestRequest.status === 'processing' && (
            <View style={styles.processingIndicator}>
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const MenuItem = ({ title, subtitle, value, onValueChange, showToggle = true, onPress, dangerous = false, loading = false }) => (
    <TouchableOpacity 
      style={[styles.menuItem, loading && styles.menuItemDisabled]} 
      onPress={onPress}
      disabled={showToggle || loading}
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
      {!showToggle && !loading && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
      {loading && (
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
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
        </Section>

        <Section title="Data Management">
          <MenuItem
            title="Download My Data"
            subtitle={canRequestExport ? "Get a copy of your data in JSON format" : "Export request pending"}
            showToggle={false}
            loading={exportLoading}
            onPress={handleDownloadData}
          />
          
          {/* Show export status if there are any requests */}
          {renderExportStatus()}
          
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
  menuItemDisabled: {
    opacity: 0.6,
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
  loadingSpinner: {
    paddingHorizontal: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#9C3141',
    fontWeight: '500',
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
  exportStatusContainer: {
    backgroundColor: '#F8F9FA',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  exportStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  exportStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportStatusLeft: {
    flex: 1,
  },
  exportStatusDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  exportStatusText: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },
  exportStatusExpiry: {
    fontSize: 12,
    color: '#868E96',
    fontStyle: 'italic',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C3141',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  processingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#9C3141',
    fontStyle: 'italic',
  },
});

export default PrivacyScreen;