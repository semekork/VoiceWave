import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Switch,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useProfileImage } from '../../context/ProfileImageContext';
import { getAdaptiveGradientColors } from '../../utils/colorExtractor';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    bio: '',
    joinDate: 'March 2023',
    totalListeningTime: 0,
    subscriptions: 0,
    downloads: 0,
  });

  const [settings, setSettings] = useState({
    notifications: true,
    autoDownload: false,
    cellularData: true,
  });

  const [gradientColors, setGradientColors] = useState(['#9C3141', '#262726']);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    profileImage,
    loading: imageLoading,
    error: imageError,
    initialized: imageInitialized,
    pickImageFromGallery,
    takePhotoWithCamera,
    removeProfileImage,
    clearError: clearImageError,
    refreshProfileImage,
    getProfileScreenImage,
    getShareableImageUrl,
    hasCustomProfileImage,
  } = useProfileImage();


  const { signOut: authSignOut, user: authUser } = useAuth();

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const profileImageScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // Fetch user data from Supabase
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      
      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw authError;
      }

      if (authUser) {
        setCurrentUserId(authUser.id);
        
        // Get user profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        // Format join date
        const joinDate = authUser.created_at 
          ? new Date(authUser.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })
          : 'Recently';

        // Format listening time (convert minutes to hours)
        const listeningHours = profile?.total_listening_time 
          ? Math.round(profile.total_listening_time / 60) 
          : 0;

        // Update user state with Supabase data
        setUser(prevUser => ({
          ...prevUser,
          name: profile?.full_name || 
                authUser.user_metadata?.full_name || 
                authUser.email?.split('@')[0] || 
                'User',
          email: authUser.email || '',
          bio: profile?.bio || prevUser.bio,
          joinDate: joinDate,
          totalListeningTime: listeningHours,
          subscriptions: profile?.subscriptions_count || 0,
          downloads: profile?.downloads_count || 0,
          favoriteGenres: profile?.favorite_genres || prevUser.favoriteGenres,
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
    } finally {
      setUserLoading(false);
    }
  };

  // Real-time subscription for profile updates
  useEffect(() => {
    let subscription;

    const setupRealtimeSubscription = async () => {
      if (!currentUserId) return;

      try {
        console.log('Setting up real-time subscription for user:', currentUserId);
        
        // Set up real-time subscription for profile changes
        subscription = supabase
          .channel(`profile_changes_${currentUserId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${currentUserId}`,
            },
            (payload) => {
              console.log('Profile updated via real-time:', payload);
              
              // Update the local state with the new data
              const updatedProfile = payload.new;
              
              setUser(prevUser => ({
                ...prevUser,
                name: updatedProfile.display_name || 
                      updatedProfile.full_name || 
                      prevUser.name,
                bio: updatedProfile.bio || prevUser.bio,
                totalListeningTime: updatedProfile.total_listening_time 
                  ? Math.round(updatedProfile.total_listening_time / 60) 
                  : prevUser.totalListeningTime,
                subscriptions: updatedProfile.subscriptions_count || prevUser.subscriptions,
                downloads: updatedProfile.downloads_count || prevUser.downloads,
                favoriteGenres: updatedProfile.favorite_genres || prevUser.favoriteGenres,
              }));

              // Refresh profile image when profile updates
              refreshProfileImage();
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${currentUserId}`,
            },
            (payload) => {
              console.log('Profile created via real-time:', payload);
              // Handle new profile creation (in case profile was created after user registration)
              fetchUserData();
              refreshProfileImage();
            }
          )
          .subscribe((status) => {
            console.log('Real-time subscription status:', status);
          });

      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount or when currentUserId changes
    return () => {
      if (subscription) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(subscription);
      }
    };
  }, [currentUserId, refreshProfileImage]);

  // Enhanced error handling for profile image errors
  useEffect(() => {
    if (imageError) {
      Alert.alert('Profile Image Error', imageError, [
        { text: 'OK', onPress: clearImageError }
      ]);
    }
  }, [imageError, clearImageError]);

  // Enhanced refresh function that includes profile image refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserData(),
        refreshProfileImage()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfileImage]);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  // Enhanced gradient color update with better error handling
  useEffect(() => {
    const updateGradientColors = async () => {
      try {
        const displayImage = getProfileScreenImage();
        if (displayImage.uri && hasCustomProfileImage()) {
          const colors = await getAdaptiveGradientColors(displayImage.uri);
          setGradientColors(colors);
        } else {
          setGradientColors(['#9C3141', '#262726']);
        }
      } catch (error) {
        console.log('Failed to update gradient colors:', error);
        setGradientColors(['#9C3141', '#262726']); 
      }
    };
    if (imageInitialized) {
      updateGradientColors();
    }
  }, [profileImage, imageInitialized, getProfileScreenImage, hasCustomProfileImage]);

  
  const handleImagePicker = () => {
    if (imageLoading) return; 

    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { 
          text: 'Camera', 
          onPress: async () => {
            try {
              await takePhotoWithCamera();
            } catch (error) {
              console.error('Camera error:', error);
              Alert.alert('Camera Error', 'Failed to take photo. Please check camera permissions and try again.');
            }
          }
        },
        { 
          text: 'Gallery', 
          onPress: async () => {
            try {
              await pickImageFromGallery();
            } catch (error) {
              console.error('Gallery error:', error);
              Alert.alert('Gallery Error', 'Failed to pick image. Please check gallery permissions and try again.');
            }
          }
        },
        ...(hasCustomProfileImage() ? [{ 
          text: 'Remove Photo', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Remove Photo',
              'Are you sure you want to remove your profile photo?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Remove', 
                  style: 'destructive', 
                  onPress: async () => {
                    try {
                      await removeProfileImage();
                    } catch (error) {
                      console.error('Remove photo error:', error);
                      Alert.alert('Error', 'Failed to remove photo. Please try again.');
                    }
                  }
                },
              ]
            );
          }
        }] : []),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const hoursText = user.totalListeningTime === 1 ? 'hour' : 'hours';
      const shareMessage = `Check out my podcast listening stats! I've listened to ${user.totalListeningTime} ${hoursText} of amazing content and subscribed to ${user.subscriptions} podcasts.`;
      const shareableImageUrl = await getShareableImageUrl();
      const shareOptions = {
        message: shareMessage,
      };
      if (shareableImageUrl) {
        shareOptions.url = shareableImageUrl;
      }

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Error', 'Failed to share profile. Please try again.');
    }
  };

  // Enhanced sign-out function with dual options
  const handleSignOut = () => {
  Alert.alert(
    'Sign Out',
    'Are you sure you want to sign out?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive', 
        onPress: () => performSignOut()
      },
    ]
  );
};

  
  const performSignOut = async () => {
  try {
    setIsSigningOut(true);
    
    
    await clearLocalUserData();
    

    setUser({
      name: '',
      email: '',
      bio: '',
      joinDate: 'March 2023',
      totalListeningTime: 0,
      subscriptions: 0,
      downloads: 0,
    });
    setCurrentUserId(null);
    
    
    try {
      const result = await authSignOut({ 
        removeBiometric: true
      });
      
      if (result && !result.success) {
        console.warn('Server sign out had issues:', result.error);
        
      }
    } catch (serverError) {
      console.warn('Server sign out failed:', serverError);
    }
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthStack' }],
    });
    
    console.log('Sign out completed successfully');
    
  } catch (error) {
    console.error('Error during sign out:', error);
    
    // Even if there are errors, still try to navigate away for user experience
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (navError) {
      console.error('Navigation error during sign out:', navError);
      Alert.alert(
        'Sign Out Error', 
        'There was an issue signing out. Please restart the app.',
        [{ text: 'OK' }]
      );
    }
  } finally {
    setIsSigningOut(false);
  }
};

  // Helper function to clear local user data
  const clearLocalUserData = async () => {
    try {
      // Clear AsyncStorage data
      const keysToRemove = [
        '@user_data',
        '@user_preferences', 
        '@cached_profile',
        '@listening_history',
        '@downloaded_episodes',
        '@subscriptions',
        '@favorites',
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      
      console.log('Local user data cleared successfully');
    } catch (error) {
      console.error('Error clearing local user data:', error);
      throw error;
    }
  };

  const StatCard = ({ title, value, icon, color = '#007AFF' }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MenuItem = ({ icon, title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={22} color="#9C3141" />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuRight}>
        {rightElement}
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
      </View>
    </TouchableOpacity>
  );

  const SettingsToggle = ({ value, onValueChange }) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E5E5EA', true: '#9C3141' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E5E5EA"
    />
  );

  const displayImage = getProfileScreenImage();
  const isInitialLoading = userLoading && !imageInitialized;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color="#000000" />
      </TouchableOpacity>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <Text style={styles.headerTitle}>Profile</Text>
        </BlurView>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9C3141"
            colors={["#9C3141"]}
          />
        }
      >
        {/* Profile Header */}
        <LinearGradient
          colors={gradientColors}
          style={styles.profileHeader}
        >
          <Animated.View style={[styles.profileImageContainer, { transform: [{ scale: profileImageScale }] }]}>
            <TouchableOpacity 
              onPress={handleImagePicker} 
              disabled={imageLoading || isInitialLoading}
              style={[
                styles.profileImageTouchable,
                (imageLoading || isInitialLoading) && styles.profileImageDisabled
              ]}
            >
              <Image source={displayImage} style={styles.profileImage} />
              <View style={styles.cameraButton}>
                {imageLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
          
          {isInitialLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userBio}>{user.bio}</Text>
              <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.shareButton, isInitialLoading && styles.shareButtonDisabled]} 
            onPress={handleShare}
            disabled={isInitialLoading}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Hours"
            value={user.totalListeningTime.toString()}
            icon="headset-outline"
            color="#FF6B6B"
          />
          <StatCard
            title="Subscriptions"
            value={user.subscriptions.toString()}
            icon="radio-outline"
            color="#4ECDC4"
          />
          <StatCard
            title="Downloads"
            value={user.downloads.toString()}
            icon="download-outline"
            color="#45B7D1"
          />
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate('EditProfileScreen')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              subtitle="Manage your account security"
              onPress={() => navigation.navigate('PrivacyScreen')}
            />
            <MenuItem
              icon="card-outline"
              title="Subscription"
              subtitle="Manage your premium subscription"
              onPress={() => navigation.navigate('SubscriptionScreen')}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Push notifications and alerts"
              onPress={() => navigation.navigate('NotificationsScreen')}
            />
            <MenuItem
              icon="download-outline"
              title="Auto Download"
              subtitle="Automatically download new episodes"
              rightElement={
                <SettingsToggle
                  value={settings.autoDownload}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, autoDownload: value }))}
                />
              }
              showArrow={false}
            />
          </View>
        </View>

        {/* More Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => navigation.navigate('SupportScreen')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => navigation.navigate('TermsScreen')}
            />
            <MenuItem
              icon="information-circle-outline"
              title="About"
              subtitle={`Version 2.1.0 (Build 42)`}
              onPress={() => navigation.navigate('AboutScreen')}
            />
          </View>
        </View>

        {/* Enhanced Sign Out Button with dual options */}
        <TouchableOpacity 
          style={[styles.signOutButton, (isSigningOut || isInitialLoading) && styles.signOutButtonDisabled]} 
          onPress={handleSignOut}
          disabled={isSigningOut || isInitialLoading}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 88,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageTouchable: {
    position: 'relative',
  },
  profileImageDisabled: {
    opacity: 0.7,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#9C3141',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    textAlign: 'center',
  },
  joinDate: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#9C3141',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#9C3141',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;