import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      await this.registerForPushNotificationsAsync();
      this.setupNotificationListeners();
      await this.syncNotificationSettings();
      await this.setupRealtimeSubscriptions();
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9C3141',
      });

      // Create podcast-specific channels
      await Notifications.setNotificationChannelAsync('podcast_updates', {
        name: 'Podcast Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'New episodes and podcast updates',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('downloads', {
        name: 'Downloads',
        importance: Notifications.AndroidImportance.LOW,
        description: 'Download progress and completion',
        sound: false,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Failed to get push token for push notification!');
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      // Store token in Supabase
      await this.storePushToken(token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  async handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Update badge count
    if (data.type === 'podcast_update') {
      await this.updateBadgeCount();
    }

    // Mark notification as delivered in database
    if (data.notificationId) {
      await this.markNotificationDelivered(data.notificationId);
    }
  }

  // Handle notification response (user tapped notification)
  async handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Mark notification as read
    if (data.notificationId) {
      await this.markNotificationRead(data.notificationId);
    }
    
    // Navigate based on notification type
    switch (data.type) {
      case 'podcast_update':
        // Navigate to specific podcast
        if (data.podcastId) {
          // Your navigation logic here
          console.log('Navigate to podcast:', data.podcastId);
        }
        break;
      case 'download_complete':
        // Navigate to downloads
        console.log('Navigate to downloads');
        break;
      case 'subscription_reminder':
        // Navigate to subscription screen
        console.log('Navigate to subscription');
        break;
      default:
        break;
    }
  }

  // Store push token in Supabase
  async storePushToken(token) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_devices')
          .upsert({
            user_id: user.id,
            push_token: token,
            platform: Platform.OS,
            device_name: Device.deviceName || `${Platform.OS} Device`,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  }

  // Sync notification settings with server
  async syncNotificationSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          await this.updateLocalNotificationSettings(data);
        }
      }
    } catch (error) {
      console.error('Error syncing notification settings:', error);
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('notification_settings')
          .upsert({
            user_id: user.id,
            ...settings,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        
        // Update local settings
        await this.updateLocalNotificationSettings(settings);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Update local notification settings
  async updateLocalNotificationSettings(settings) {
    const notificationBehavior = {
      shouldShowAlert: settings.show_alerts,
      shouldPlaySound: settings.play_sound,
      shouldSetBadge: settings.show_badge,
    };

    Notifications.setNotificationHandler({
      handleNotification: async () => notificationBehavior,
    });
  }

  // Setup realtime subscriptions for new notifications
  setupRealtimeSubscriptions() {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Subscribe to new notifications
        const notificationSubscription = supabase
          .channel('notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          }, (payload) => {
            console.log('New notification received:', payload);
            this.handleRealtimeNotification(payload.new);
          })
          .subscribe();

        // Subscribe to notification settings changes
        const settingsSubscription = supabase
          .channel('notification_settings')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'notification_settings',
            filter: `user_id=eq.${user.id}`,
          }, (payload) => {
            console.log('Notification settings updated:', payload);
            this.updateLocalNotificationSettings(payload.new);
          })
          .subscribe();
      }
    });
  }

  // Handle realtime notification
  async handleRealtimeNotification(notification) {
    // Show local notification if app is in background/foreground
    await this.scheduleNotification({
      title: notification.title,
      body: notification.body,
      data: {
        ...notification.data,
        notificationId: notification.id,
        type: notification.type,
      },
    });
  }

  // Schedule local notification
  async scheduleNotification(options) {
    const {
      title,
      body,
      data = {},
      trigger = null,
      categoryIdentifier = 'default',
    } = options;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          categoryIdentifier,
          sound: 'default',
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Send push notification to specific users
  async sendPushNotification(userIds, notificationData) {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds,
          notification: notificationData,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Mark notification as delivered
  async markNotificationDelivered(notificationId) {
    try {
      await supabase
        .from('notifications')
        .update({ status: 'delivered' })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as delivered:', error);
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId) {
    try {
      await supabase
        .from('notifications')
        .update({ 
          read_at: new Date().toISOString(),
          status: 'delivered'
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Get user's notification history
  async getNotificationHistory(limit = 50, offset = 0) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('read_at', null);

        if (error) throw error;
        return count;
      }
      return 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  // Subscribe to podcast notifications
  async subscribeToPodcastNotifications(podcastId, podcastTitle) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('podcast_subscriptions')
          .upsert({
            user_id: user.id,
            podcast_id: podcastId,
            podcast_title: podcastTitle,
            notifications_enabled: true,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error subscribing to podcast notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from podcast notifications
  async unsubscribeFromPodcastNotifications(podcastId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('podcast_subscriptions')
          .update({ notifications_enabled: false })
          .eq('user_id', user.id)
          .eq('podcast_id', podcastId);
      }
    } catch (error) {
      console.error('Error unsubscribing from podcast notifications:', error);
      throw error;
    }
  }

  // Cancel notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Update badge count
  async updateBadgeCount(count = null) {
    try {
      if (count === null) {
        count = await this.getUnreadNotificationCount();
      }
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  // Cleanup listeners and subscriptions
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    
    // Cleanup Supabase subscriptions
    supabase.removeAllChannels();
  }

  // Deactivate device (when user logs out)
  async deactivateDevice() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && this.expoPushToken) {
        await supabase
          .from('user_devices')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('push_token', this.expoPushToken);
      }
    } catch (error) {
      console.error('Error deactivating device:', error);
    }
  }
}

export default new NotificationService();