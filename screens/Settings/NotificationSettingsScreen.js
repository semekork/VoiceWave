import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import NotificationService from '../../services/NotificationService';

const NotificationSettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    podcast_updates: true,
    download_notifications: true,
    subscription_reminders: true,
    daily_digest: false,
    show_alerts: true,
    play_sound: true,
    show_badge: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    }
  };

  const saveNotificationSettings = async (newSettings) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('notification_settings')
          .upsert({
            user_id: user.id,
            ...newSettings,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        // Sync with notification service
        await NotificationService.syncNotificationSettings();
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const testNotification = async () => {
    try {
      await NotificationService.scheduleNotification({
        title: 'Test Notification',
        body: 'This is a test notification from your podcast app!',
        data: { type: 'test' },
        trigger: { seconds: 1 },
      });
      
      Alert.alert('Test Sent', 'A test notification will appear shortly');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    icon, 
    color = '#9C3141' 
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: color }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E5EA"
        disabled={saving}
      />
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testNotification}
        >
          <Text style={styles.testButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Content Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Content Updates" />
          <View style={styles.settingsContainer}>
            <SettingItem
              title="New Episodes"
              subtitle="Get notified when new episodes are available"
              value={settings.podcast_updates}
              onValueChange={(value) => handleSettingChange('podcast_updates', value)}
              icon="radio-outline"
              color="#FF6B6B"
            />
            <SettingItem
              title="Download Complete"
              subtitle="Notifications when episodes finish downloading"
              value={settings.download_notifications}
              onValueChange={(value) => handleSettingChange('download_notifications', value)}
              icon="download-outline"
              color="#4ECDC4"
            />
            <SettingItem
              title="Daily Digest"
              subtitle="Summary of new content each morning"
              value={settings.daily_digest}
              onValueChange={(value) => handleSettingChange('daily_digest', value)}
              icon="newspaper-outline"
              color="#45B7D1"
            />
          </View>
        </View>

        {/* Account Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Account & Subscription" />
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Subscription Reminders"
              subtitle="Renewal and payment notifications"
              value={settings.subscription_reminders}
              onValueChange={(value) => handleSettingChange('subscription_reminders', value)}
              icon="card-outline"
              color="#9C3141"
            />
          </View>
        </View>

        {/* Notification Behavior */}
        <View style={styles.section}>
          <SectionHeader title="Notification Behavior" />
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Show Alerts"
              subtitle="Display notification banners"
              value={settings.show_alerts}
              onValueChange={(value) => handleSettingChange('show_alerts', value)}
              icon="notifications-outline"
              color="#FF9500"
            />
            <SettingItem
              title="Play Sound"
              subtitle="Play sound when notifications arrive"
              value={settings.play_sound}
              onValueChange={(value) => handleSettingChange('play_sound', value)}
              icon="volume-high-outline"
              color="#34C759"
            />
            <SettingItem
              title="Show Badge"
              subtitle="Display notification count on app icon"
              value={settings.show_badge}
              onValueChange={(value) => handleSettingChange('show_badge', value)}
              icon="radio-button-on-outline"
              color="#007AFF"
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <SectionHeader title="Quiet Hours" />
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Enable Quiet Hours"
              subtitle="Silence notifications during specified hours"
              value={settings.quiet_hours_enabled}
              onValueChange={(value) => handleSettingChange('quiet_hours_enabled', value)}
              icon="moon-outline"
              color="#5856D6"
            />
          </View>
          
          {settings.quiet_hours_enabled && (
            <View style={styles.quietHoursContainer}>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <Text style={styles.timeValue}>{settings.quiet_hours_start}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeLabel}>End Time</Text>
                <Text style={styles.timeValue}>{settings.quiet_hours_end}</Text>
              </TouchableOpacity>
            </View>
          )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#9C3141',
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  quietHoursContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 12,
  },
});

export default NotificationSettingsScreen;