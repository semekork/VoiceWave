import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Linking,
  Alert,
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const AboutScreen = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [appInfo] = useState({
    name: 'VoiceWave',
    version: '1.1.0',
    buildNumber: '42',
    releaseDate: 'September 2025',
    developer: 'VoiceWave Inc.',
    description: 'Your ultimate podcast companion for discovering, streaming, and organizing your favorite audio content.',
  });

  const circle1Animation = useRef(new Animated.Value(0)).current;
  const circle2Animation = useRef(new Animated.Value(0)).current;
  const circle3Animation = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ 
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    const createFloatingAnimation = (value) => {
      return Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        })
      ]);
    };

    Animated.parallel([
      Animated.loop(createFloatingAnimation(circle1Animation)),
      Animated.loop(createFloatingAnimation(circle2Animation), {
        delay: 500
      }),
      Animated.loop(createFloatingAnimation(circle3Animation), {
        delay: 1000
      })
    ]).start();
  }, []);

  const handleBackPress = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate('Profile');
    }
  };

  const handleExternalLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open this link');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${appInfo.name} - the best podcast app for discovering amazing audio content! Download it now.`,
        title: `${appInfo.name} Podcast App`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const InfoCard = ({ icon, title, value, onPress, showArrow = false }) => (
    <TouchableOpacity 
      style={[
        styles.infoCard,
        !onPress && styles.infoCardDisabled
      ]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={20} color="#9C3141" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  const SocialButton = ({ icon, label, url, color }) => (
    <TouchableOpacity 
      style={[styles.socialButton, { backgroundColor: color + '15' }]}
      onPress={() => handleExternalLink(url)}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.socialLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  const FeatureItem = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#9C3141" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const TeamMember = ({ name, role, avatar }) => (
    <View style={styles.teamMember}>
      <Image source={{ uri: avatar }} style={styles.teamAvatar} />
      <Text style={styles.teamName}>{name}</Text>
      <Text style={styles.teamRole}>{role}</Text>
    </View>
  );

  const handleNavigation = (screenName) => {
    if (navigation?.navigate) {
      navigation.navigate(screenName);
    } else {
      Alert.alert('Navigation Error', 'Navigation not available');
    }
  };

  const backgroundPattern = (
    <View style={styles.backgroundPattern}>
      <Animated.View
        style={[
          styles.floatingCircle1,
          {
            transform: [{
              translateY: circle1Animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -15]
              })
            }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.floatingCircle2,
          {
            transform: [{
              translateY: circle2Animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20]
              })
            }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.floatingCircle3,
          {
            transform: [{
              translateY: circle3Animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -25]
              })
            }]
          }
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Ionicons name="chevron-back" size={24} color="#000000" />
      </TouchableOpacity>
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <Text style={styles.headerTitle}>About</Text>
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
        {/* App Header */}
        <LinearGradient
          colors={['#9C3141', '#B8485E', '#C35370']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.appHeader}
        >
          {backgroundPattern}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoBackground}>
              <Image source={require('../../assets/Logo/Logo(1).png')} style={styles.logo} resizeMode='contain' />
            </View>
          </Animated.View>
          
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appTagline}>{appInfo.description}</Text>
          
          <TouchableOpacity style={styles.shareAppButton} onPress={handleShare}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.shareButtonGradient}
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareAppText}>Share App</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoContainer}>
            <InfoCard
              icon="information-circle-outline"
              title="Version"
              value={`${appInfo.version} (Build ${appInfo.buildNumber})`}
            />
            <InfoCard
              icon="calendar-outline"
              title="Release Date"
              value={appInfo.releaseDate}
            />
            <InfoCard
              icon="business-outline"
              title="Developer"
              value={appInfo.developer}
            />
            <InfoCard
              icon="document-text-outline"
              title="What's New"
              value="View latest updates and features"
              onPress={() => handleNavigation('ReleaseNotes')}
              showArrow={true}
            />
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresContainer}>
            <FeatureItem
              icon="play-circle-outline"
              title="Stream & Download"
              description="Listen online or download episodes for offline listening"
            />
            <FeatureItem
              icon="heart-outline"
              title="Personal Library"
              description="Create playlists and organize your favorite podcasts"
            />
            <FeatureItem
              icon="search-outline"
              title="Smart Discovery"
              description="AI-powered recommendations based on your preferences"
            />
            <FeatureItem
              icon="sync-outline"
              title="Cross-Platform Sync"
              description="Seamlessly sync your progress across all devices"
            />
            <FeatureItem
              icon="speedometer-outline"
              title="Playback Controls"
              description="Variable speed, sleep timer, and chapter navigation"
            />
            <FeatureItem
              icon="shield-checkmark-outline"
              title="Ad-Free Premium"
              description="Enjoy uninterrupted listening with premium subscription"
            />
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Podcasts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>App Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2M+</Text>
              <Text style={styles.statLabel}>Downloads</Text>
            </View>
          </View>
        </View>

        {/* Our Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet Our Team</Text>
          <View style={styles.teamContainer}>
            <TeamMember
              name="Caleb Dusssey"
              role="Founder"
              avatar="https://images.unsplash.com/photo-1494790108755-2616b9b5c6b7?w=150&h=150&fit=crop&crop=face"
            />
          </View>
        </View>

        {/* Connect With Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            <SocialButton
              icon="logo-twitter"
              label="Twitter"
              url="https://twitter.com/semekor_k"
              color="#1DA1F2"
            />
            <SocialButton
              icon="logo-instagram"
              label="Instagram"
              url="https://instagram.com/_.semekor"
              color="#E4405F"
            />
            <SocialButton
              icon="logo-linkedin"
              label="LinkedIn"
              url="https://www.linkedin.com/in/calebdussey"
              color="#0077B5" 
            />
            <SocialButton
              icon="globe-outline"
              label="Website"
              url="https://podcasthub.com"
              color="#9C3141"
            />
          </View>
        </View>

        {/* Support & Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Feedback</Text>
          <View style={styles.infoContainer}>
            <InfoCard
              icon="mail-outline"
              title="Contact Support"
              value="Get help with any issues or questions"
              onPress={() => handleExternalLink('mailto:trickvybe@gmail.com')}
              showArrow={true}
            />
            <InfoCard
              icon="star-outline"
              title="Rate Our App"
              value="Love the app? Leave us a review!"
              onPress={() => handleExternalLink('https://apps.apple.com/app/voicewave')} // Added placeholder URL
              showArrow={true}
            />
            <InfoCard
              icon="chatbubble-outline"
              title="Send Feedback"
              value="Help us improve with your suggestions"
              onPress={() => handleExternalLink('mailto:trickvybe@gmail.com')} // Fixed duplicate .com
              showArrow={true}
            />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.infoContainer}>
            <InfoCard
              icon="document-text-outline"
              title="Terms of Service"
              value="Read our terms and conditions"
              onPress={() => handleNavigation('TermsScreen')}
              showArrow={true}
            />
            <InfoCard
              icon="shield-outline"
              title="Privacy Policy"
              value="Learn how we protect your data"
              onPress={() => handleNavigation('PrivacyScreen')}
              showArrow={true}
            />
            <InfoCard
              icon="key-outline"
              title="Licenses"
              value="Open source libraries and credits"
              onPress={() => handleNavigation('Licenses')}
              showArrow={true}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by the {appInfo.developer} team
          </Text>
          <Text style={styles.copyright}>
            © 2025 {appInfo.developer}. All rights reserved.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
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
  appHeader: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: 20,
    right: 30,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 40,
    left: 40,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: 60,
    left: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  shareAppButton: {
    marginTop: 8,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shareAppText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1E',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: 'rgba(156, 49, 65, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(156, 49, 65, 0.08)',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F5',
  },
  infoCardDisabled: {
    opacity: 0.7,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 49, 65, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: 'rgba(156, 49, 65, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(156, 49, 65, 0.08)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(156, 49, 65, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: 'rgba(156, 49, 65, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    shadowColor: 'rgba(156, 49, 65, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(156, 49, 65, 0.08)',
    transform: [{ scale: 1 }],
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#9C3141',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  teamContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  teamMember: {
    alignItems: 'center',
    flex: 1,
  },
  teamAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#9C3141',
    shadowColor: 'rgba(156, 49, 65, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default AboutScreen;