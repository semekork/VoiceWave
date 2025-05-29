import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useProfileImage } from '../../context/ProfileImageContext';
import { getAdaptiveGradientColors } from '../../utils/colorExtractor';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    bio: 'Podcast enthusiast • Coffee lover • Tech geek',
    joinDate: 'March 2023',
    totalListeningTime: '124',
    favoriteGenres: ['Technology', 'Business', 'Science'],
    subscriptions: 47,
    downloads: 156,
  });

  const [settings, setSettings] = useState({
    notifications: true,
    autoDownload: false,
    cellularData: true,
    darkMode: false,
  });

  const [gradientColors, setGradientColors] = useState(['#9C3141', '#262726']);

  // Use the profile image context
  const {
    profileImage,
    loading,
    error,
    pickImageFromGallery,
    takePhotoWithCamera,
    removeProfileImage,
    clearError,
    getProfileScreenImage,
    hasCustomProfileImage,
  } = useProfileImage();

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

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback navigation if no previous screen
      navigation.navigate('Home'); // or whatever your main screen is called
    }
  };

  // Update gradient colors when profile image changes
  React.useEffect(() => {
    const updateGradientColors = async () => {
      try {
        const displayImage = getProfileScreenImage();
        // Only extract colors if it's a custom image (has uri property)
        if (displayImage.uri) {
          const colors = await getAdaptiveGradientColors(displayImage.uri);
          setGradientColors(colors);
        } else {
          // Use default gradient for default images
          setGradientColors(['#9C3141', '#262726']);
        }
      } catch (error) {
        console.log('Failed to update gradient colors:', error);
        setGradientColors(['#9C3141', '#262726']); // Fallback
      }
    };

    updateGradientColors();
  }, [profileImage]);

  const handleImagePicker = () => {
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
              Alert.alert('Error', 'Failed to take photo. Please try again.');
            }
          }
        },
        { 
          text: 'Gallery', 
          onPress: async () => {
            try {
              await pickImageFromGallery();
            } catch (error) {
              Alert.alert('Error', 'Failed to pick image. Please try again.');
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
      await Share.share({
        message: `Check out my podcast listening stats! I've listened to ${user.totalListeningTime} hours of amazing content.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: () => navigation.navigate('AuthStack')
        },
      ]
    );
  };

  // Clear error when component mounts or when error changes
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

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

  // Get the display image using the context helper
  const displayImage = getProfileScreenImage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Back Button - Always visible */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color="#000000" />
      </TouchableOpacity>
      
      {/* Animated Header */}
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
      >
        {/* Profile Header */}
        <LinearGradient
          colors={gradientColors}
          style={styles.profileHeader}
        >
          <Animated.View style={[styles.profileImageContainer, { transform: [{ scale: profileImageScale }] }]}>
            <TouchableOpacity onPress={handleImagePicker} disabled={loading}>
              <Image source={displayImage} style={styles.profileImage} />
              <View style={styles.cameraButton}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userBio}>{user.bio}</Text>
          <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Listening Time"
            value={user.totalListeningTime}
            icon="headset-outline"
            color="#FF6B6B"
          />
          <StatCard
            title="Subscriptions"
            value={user.subscriptions}
            icon="radio-outline"
            color="#4ECDC4"
          />
          <StatCard
            title="Downloads"
            value={user.downloads}
            icon="download-outline"
            color="#45B7D1"
          />
        </View>

        {/* Favorite Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Genres</Text>
          <View style={styles.genresContainer}>
            {user.favoriteGenres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
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
              rightElement={
                <SettingsToggle
                  value={settings.notifications}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
                />
              }
              showArrow={false}
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

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
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
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  genreTag: {
    backgroundColor: '#9C3141',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 8,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  signOutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;