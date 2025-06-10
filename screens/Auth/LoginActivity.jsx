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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLoginActivity } from '../../hooks/useLoginActivity';
import { getDeviceIcon } from '../../utils/deviceUtils';
import { supabase } from '../../lib/supabase';

const LoginActivityScreen = ({ navigation }) => {
  const {
    loginActivities,
    loading,
    error,
    refresh,
  } = useLoginActivity();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      // Delete the session from login_activities table
      const { data, error } = await supabase
        .from('login_activities')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }

      // Refresh the login activities list after deleting session
      await refresh();

      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  };

  const handleLogoutDevice = (sessionId, deviceName) => {
    Alert.alert(
      'End Session',
      `Are you sure you want to end the session on ${deviceName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await handleEndSession(sessionId);
              Alert.alert('Success', 'Session ended successfully');
            } catch (err) {
              console.error('Error:', err.message);
              Alert.alert('Error', 'Failed to end session. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEndAllSessions = async () => {
    Alert.alert(
      'End All Other Sessions',
      'Are you sure you want to end all other active sessions?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get current session ID
              const { data: { session } } = await supabase.auth.getSession();
              const currentSessionId = session?.access_token;

              // Update all other sessions to not current
              const { data, error } = await supabase
                .from('login_activities')
                .update({ is_current: false })
                .eq('is_current', true)
                .neq('session_id', currentSessionId);

              if (error) throw error;

              // Refresh the login activities list
              await refresh();

              Alert.alert('Success', 'All other sessions have been ended');
            } catch (err) {
              console.error('Error:', err.message);
              Alert.alert('Error', 'Failed to end sessions. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReportSuspicious = (activityId, deviceName) => {
    Alert.alert(
      'Report Suspicious Activity',
      `Report the login from ${deviceName} as suspicious? We'll help secure your account.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update the activity to mark as suspicious
              const { error } = await supabase
                .from('login_activities')
                .update({ 
                  device_info: supabase.raw(`
                    COALESCE(device_info, '{}'::jsonb) || '{"suspicious": true, "reported_at": "${new Date().toISOString()}"}'::jsonb
                  `)
                })
                .eq('id', activityId);

              if (error) throw error;

              // Refresh the activities
              await refresh();

              Alert.alert('Reported', 'Thank you for reporting. We\'ll investigate this activity.');
            } catch (err) {
              console.error('Error reporting activity:', err);
              Alert.alert('Error', 'Failed to report activity. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown Location';
    
    try {
      if (typeof location === 'string') {
        return location;
      }
      
      if (location.city && location.country) {
        return `${location.city}, ${location.country}`;
      }
      
      if (location.country) {
        return location.country;
      }
      
      return 'Unknown Location';
    } catch (e) {
      return 'Unknown Location';
    }
  };

  const getDeviceDisplayName = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown Device';
    
    try {
      const info = typeof deviceInfo === 'string' ? JSON.parse(deviceInfo) : deviceInfo;
      return info.device_type || 'Unknown Device';
    } catch (e) {
      return 'Unknown Device';
    }
  };

  const getBrowserName = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown Browser';
    
    try {
      const info = typeof deviceInfo === 'string' ? JSON.parse(deviceInfo) : deviceInfo;
      return info.browser || 'Unknown Browser';
    } catch (e) {
      return 'Unknown Browser';
    }
  };

  const isSuspicious = (deviceInfo) => {
    if (!deviceInfo) return false;
    
    try {
      const info = typeof deviceInfo === 'string' ? JSON.parse(deviceInfo) : deviceInfo;
      return info.suspicious === true;
    } catch (e) {
      return false;
    }
  };

  const LoginItem = ({ activity }) => {
    const deviceName = getDeviceDisplayName(activity.device_info);
    const browserName = getBrowserName(activity.device_info);
    const suspicious = isSuspicious(activity.device_info);
    const location = formatLocation(activity.location);

    return (
      <View style={[styles.loginItem, suspicious && styles.suspiciousItem]}>
        <View style={styles.loginHeader}>
          <View style={styles.deviceInfo}>
            <View style={[styles.deviceIconContainer, activity.is_current && styles.currentDevice]}>
              <Ionicons 
                name={getDeviceIcon(deviceName)} 
                size={20} 
                color={activity.is_current ? '#FFFFFF' : '#9C3141'} 
              />
            </View>
            <View style={styles.deviceDetails}>
              <View style={styles.deviceNameRow}>
                <Text style={styles.deviceName}>{deviceName}</Text>
                {activity.is_current && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
                {suspicious && (
                  <View style={styles.suspiciousBadge}>
                    <Ionicons name="warning" size={12} color="#D70015" />
                    <Text style={styles.suspiciousBadgeText}>Suspicious</Text>
                  </View>
                )}
              </View>
              <Text style={styles.deviceLocation}>{location}</Text>
              <Text style={styles.deviceTime}>{activity.time_ago}</Text>
            </View>
          </View>
          
          {!activity.is_current && activity.session_id && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLogoutDevice(activity.session_id, deviceName)}
            >
              <Ionicons name="log-out-outline" size={18} color="#D70015" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.loginDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IP Address:</Text>
            <Text style={styles.detailValue}>{activity.ip_address || 'Unknown'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Browser:</Text>
            <Text style={styles.detailValue}>{browserName}</Text>
          </View>
          {activity.session_id && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Session ID:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {activity.session_id.substring(0, 20)}...
              </Text>
            </View>
          )}
        </View>

        {!suspicious && !activity.is_current && (
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => handleReportSuspicious(activity.id, deviceName)}
          >
            <Ionicons name="flag-outline" size={16} color="#D70015" />
            <Text style={styles.reportButtonText}>Report as Suspicious</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#9C3141" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login Activity</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C3141" />
          <Text style={styles.loadingText}>Loading login activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#9C3141" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login Activity</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#D70015" />
          <Text style={styles.errorTitle}>Unable to load activities</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <Text style={styles.headerTitle}>Login Activity</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleEndAllSessions}
        >
          <Ionicons name="shield-outline" size={20} color="#9C3141" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Recent Login Activity</Text>
              <Text style={styles.infoText}>
                Here are the recent logins to your account. If you see anything suspicious, you can end those sessions or report them.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.activitiesContainer}>
          {loginActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateTitle}>No Recent Activity</Text>
              <Text style={styles.emptyStateText}>
                Your login activities will appear here when you sign in from different devices.
              </Text>
            </View>
          ) : (
            loginActivities.map((activity) => (
              <LoginItem key={activity.id} activity={activity} />
            ))
          )}
        </View>

        <View style={styles.securityTips}>
          <Text style={styles.securityTipsTitle}>Security Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.tipText}>Enable two-factor authentication for extra security</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.tipText}>Use a strong, unique password</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.tipText}>Log out of shared or public devices</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.tipText}>Review login activity regularly</Text>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D70015',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#9C3141',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D9FF',
    marginBottom: 20,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#0066CC',
    lineHeight: 18,
  },
  activitiesContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  loginItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suspiciousItem: {
    borderWidth: 1,
    borderColor: '#FFE6E6',
    backgroundColor: '#FFFAFA',
  },
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentDevice: {
    backgroundColor: '#9C3141',
  },
  deviceDetails: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  currentBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suspiciousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  suspiciousBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D70015',
    marginLeft: 2,
  },
  deviceLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  deviceTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionButton: {
    padding: 8,
  },
  loginDetails: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: '#D70015',
    fontWeight: '500',
    marginLeft: 4,
  },
  securityTips: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  securityTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
});

export default LoginActivityScreen;