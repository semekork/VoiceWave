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
  Image, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';


const ReleaseNotes = ({navigation}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [releases] = useState([
    {
      version: '2.1.0',
      buildNumber: '42',
      releaseDate: 'September 15, 2025',
      isLatest: true,
      highlights: [
        'Enhanced AI-powered podcast recommendations',
        'New sleep timer with fade-out effects',
        'Improved offline download management',
      ],
      features: [
        {
          icon: 'sparkles-outline',
          title: 'Smart Recommendations',
          description: 'Our AI now learns from your listening habits to suggest podcasts you\'ll love',
          isNew: true
        },
        {
          icon: 'moon-outline',
          title: 'Advanced Sleep Timer',
          description: 'Set custom sleep timers with gentle fade-out and chapter-aware stopping',
          isNew: true
        },
        {
          icon: 'download-outline',
          title: 'Better Downloads',
          description: 'Faster downloads with smart storage management and queue priorities',
          isImproved: true
        },
        
      ],
      bugFixes: [
        'Fixed audio playback interruption issues',
        'Resolved sync problems across devices',
        'Improved app stability on older devices',
        'Fixed notification display bugs'
      ]
    },
    {
      version: '2.0.5',
      buildNumber: '38',
      releaseDate: 'August 28, 2025',
      highlights: [
        'Cross-platform sync improvements',
        'New podcast categories',
        'Enhanced search functionality'
      ],
      features: [
        {
          icon: 'sync-outline',
          title: 'Better Sync',
          description: 'Seamless synchronization of your progress across all devices',
          isImproved: true
        },
        {
          icon: 'library-outline',
          title: 'More Categories',
          description: 'Discover podcasts with expanded category filtering',
          isNew: true
        },
        {
          icon: 'search-outline',
          title: 'Smarter Search',
          description: 'Find exactly what you\'re looking for with improved search algorithms',
          isImproved: true
        }
      ],
      bugFixes: [
        'Fixed playlist creation issues',
        'Resolved audio quality problems',
        'Improved loading times'
      ]
    },
    {
      version: '2.0.0',
      buildNumber: '30',
      releaseDate: 'July 10, 2025',
      highlights: [
        'Complete UI redesign',
        'Premium subscription features',
        'Offline listening capabilities'
      ],
      features: [
        {
          icon: 'phone-portrait-outline',
          title: 'New Design',
          description: 'Fresh, modern interface with improved navigation',
          isNew: true
        },
        {
          icon: 'star-outline',
          title: 'Premium Features',
          description: 'Ad-free listening, exclusive content, and priority downloads',
          isNew: true
        },
        {
          icon: 'cloud-offline-outline',
          title: 'Offline Mode',
          description: 'Download episodes and listen without internet connection',
          isNew: true
        }
      ],
      bugFixes: [
        'Major performance improvements',
        'Fixed crash issues on startup',
        'Resolved audio streaming problems'
      ]
    }
  ]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('About');
    }
  };

  const FeatureItem = ({ icon, title, description, isNew, isImproved }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={24} color="#9C3141" />
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>{title}</Text>
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {isImproved && (
            <View style={styles.improvedBadge}>
              <Text style={styles.improvedBadgeText}>IMPROVED</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const ReleaseCard = ({ release, isFirst }) => (
    <View style={[styles.releaseCard, isFirst && styles.latestRelease]}>
      {release.isLatest && (
        <View style={styles.latestBadge}>
          <Ionicons name="star" size={16} color="#FFFFFF" />
          <Text style={styles.latestBadgeText}>Latest</Text>
        </View>
      )}
      
      <View style={styles.releaseHeader}>
        <View>
          <Text style={styles.versionNumber}>Version {release.version}</Text>
          <Text style={styles.releaseDate}>{release.releaseDate}</Text>
        </View>
        <Text style={styles.buildNumber}>Build {release.buildNumber}</Text>
      </View>

      {/* Highlights */}
      <View style={styles.highlightsSection}>
        <Text style={styles.subsectionTitle}>✨ What's New</Text>
        {release.highlights.map((highlight, index) => (
          <View key={index} style={styles.highlightItem}>
            <View style={styles.highlightDot} />
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.subsectionTitle}>🚀 Features & Improvements</Text>
        {release.features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            isNew={feature.isNew}
            isImproved={feature.isImproved}
          />
        ))}
      </View>

      {/* Bug Fixes */}
      <View style={styles.bugFixesSection}>
        <Text style={styles.subsectionTitle}>🐛 Bug Fixes</Text>
        {release.bugFixes.map((fix, index) => (
          <View key={index} style={styles.bugFixItem}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.bugFixText}>{fix}</Text>
          </View>
        ))}
      </View>
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
          <Text style={styles.headerTitle}>What's New</Text>
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
        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScale }] }]}>
          <LinearGradient
            colors={['#9C3141', '#B8485E']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIcon}>
                <Ionicons name="rocket" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>What's New in VoiceWave</Text>
              <Text style={styles.heroSubtitle}>
                Discover the latest features and improvements
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Release Notes */}
        <View style={styles.releasesContainer}>
          {releases.map((release, index) => (
            <ReleaseCard 
              key={`${release.version}-${release.buildNumber}`} 
              release={release} 
              isFirst={index === 0}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Stay tuned for more exciting updates!
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
  heroSection: {
    marginTop: 60,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  releasesContainer: {
    paddingHorizontal: 20,
  },
  releaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  latestRelease: {
    borderColor: '#9C3141',
    borderWidth: 2,
  },
  latestBadge: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: '#9C3141',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  latestBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  releaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  versionNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 16,
    color: '#666666',
  },
  buildNumber: {
    fontSize: 14,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highlightsSection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9C3141',
    marginTop: 6,
    marginRight: 12,
  },
  highlightText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  improvedBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  improvedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bugFixesSection: {
    marginBottom: 8,
  },
  bugFixItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bugFixText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ReleaseNotes;