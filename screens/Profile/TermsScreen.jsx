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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const TermsScreen = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Profile');
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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

  const ExpandableSection = ({ 
    id, 
    title, 
    children, 
    icon = "document-text-outline" 
  }) => {
    const isExpanded = expandedSections[id];
    
    return (
      <View style={styles.sectionContainer}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(id)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionIcon}>
              <Ionicons name={icon} size={20} color="#9C3141" />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#8E8E93" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {children}
          </View>
        )}
      </View>
    );
  };

  const ContentText = ({ children, style = {} }) => (
    <Text style={[styles.contentText, style]}>{children}</Text>
  );

  const BulletPoint = ({ children }) => (
    <View style={styles.bulletContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );

  const ContactInfo = () => (
    <View style={styles.contactContainer}>
      <Text style={styles.contactTitle}>Contact Us</Text>
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => handleExternalLink('mailto:trickvybe@gmail.com')}
      >
        <Ionicons name="mail-outline" size={18} color="#9C3141" />
        <Text style={styles.contactText}>Send a Mail</Text>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Terms & Privacy</Text>
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
        {/* Header Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Terms & Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: May 15, 2025</Text>
          <Text style={styles.description}>
            Please read these terms and conditions carefully before using our podcast application and services.
          </Text>
        </View>

        {/* Terms of Service */}
        <ExpandableSection 
          id="terms" 
          title="Terms of Service" 
          icon="document-text-outline"
        >
          <ContentText style={styles.sectionIntro}>
            By using our podcast application, you agree to comply with and be bound by the following terms and conditions.
          </ContentText>
          
          <Text style={styles.subheading}>Acceptance of Terms</Text>
          <ContentText>
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
          </ContentText>

          <Text style={styles.subheading}>User Responsibilities</Text>
          <BulletPoint>Provide accurate and complete information when creating an account</BulletPoint>
          <BulletPoint>Maintain the security of your account credentials</BulletPoint>
          <BulletPoint>Use the service in compliance with applicable laws and regulations</BulletPoint>
          <BulletPoint>Respect intellectual property rights of content creators</BulletPoint>

          <Text style={styles.subheading}>Prohibited Activities</Text>
          <ContentText>You may not:</ContentText>
          <BulletPoint>Share your account with others</BulletPoint>
          <BulletPoint>Distribute or redistribute podcast content without permission</BulletPoint>
          <BulletPoint>Use the service for any illegal or unauthorized purpose</BulletPoint>
          <BulletPoint>Attempt to reverse engineer or hack the application</BulletPoint>
        </ExpandableSection>

        {/* Privacy Policy */}
        <ExpandableSection 
          id="privacy" 
          title="Privacy Policy" 
          icon="shield-checkmark-outline"
        >
          <ContentText style={styles.sectionIntro}>
            We are committed to protecting your privacy and ensuring the security of your personal information.
          </ContentText>

          <Text style={styles.subheading}>Information We Collect</Text>
          <BulletPoint>Account information (name, email address)</BulletPoint>
          <BulletPoint>Listening preferences and history</BulletPoint>
          <BulletPoint>Device information and app usage data</BulletPoint>
          <BulletPoint>Location data (if enabled) for content recommendations</BulletPoint>

          <Text style={styles.subheading}>How We Use Your Information</Text>
          <BulletPoint>Provide and improve our services</BulletPoint>
          <BulletPoint>Personalize content recommendations</BulletPoint>
          <BulletPoint>Send important service notifications</BulletPoint>
          <BulletPoint>Analyze usage patterns to enhance user experience</BulletPoint>

          <Text style={styles.subheading}>Data Security</Text>
          <ContentText>
            We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </ContentText>
        </ExpandableSection>

        {/* Content License */}
        <ExpandableSection 
          id="content" 
          title="Content & Intellectual Property" 
          icon="headset-outline"
        >
          <Text style={styles.subheading}>Podcast Content</Text>
          <ContentText>
            All podcast content available through our platform is owned by the respective creators and is protected by copyright and other intellectual property laws.
          </ContentText>

          <Text style={styles.subheading}>Your Rights</Text>
          <BulletPoint>Stream and download content for personal, non-commercial use</BulletPoint>
          <BulletPoint>Create playlists and organize your library</BulletPoint>
          <BulletPoint>Share recommendations with friends and family</BulletPoint>

          <Text style={styles.subheading}>Restrictions</Text>
          <BulletPoint>Content may not be redistributed or shared publicly</BulletPoint>
          <BulletPoint>Commercial use of content is prohibited without permission</BulletPoint>
          <BulletPoint>Reverse engineering or extracting audio files is not allowed</BulletPoint>
        </ExpandableSection>

        {/* Subscription Terms */}
        <ExpandableSection 
          id="subscription" 
          title="Subscription & Billing" 
          icon="card-outline"
        >
          <Text style={styles.subheading}>Premium Subscription</Text>
          <ContentText>
            Our premium subscription provides additional features including ad-free listening, offline downloads, and exclusive content.
          </ContentText>

          <Text style={styles.subheading}>Billing</Text>
          <BulletPoint>Subscriptions are billed monthly or annually</BulletPoint>
          <BulletPoint>Payments are processed automatically unless cancelled</BulletPoint>
          <BulletPoint>Refunds are available within 14 days of purchase</BulletPoint>
          <BulletPoint>You can cancel your subscription at any time</BulletPoint>

          <Text style={styles.subheading}>Free Trial</Text>
          <ContentText>
            New users may be eligible for a free trial period. After the trial ends, your subscription will automatically renew unless cancelled.
          </ContentText>
        </ExpandableSection>

        {/* Disclaimers */}
        <ExpandableSection 
          id="disclaimers" 
          title="Disclaimers & Limitations" 
          icon="warning-outline"
        >
          <Text style={styles.subheading}>Service Availability</Text>
          <ContentText>
            While we strive to provide uninterrupted service, we cannot guarantee 100% uptime. Service may be temporarily unavailable due to maintenance or technical issues.
          </ContentText>

          <Text style={styles.subheading}>Content Accuracy</Text>
          <ContentText>
            We are not responsible for the accuracy, completeness, or reliability of podcast content. Views expressed in podcasts are those of the creators, not our company.
          </ContentText>

          <Text style={styles.subheading}>Limitation of Liability</Text>
          <ContentText>
            In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </ContentText>
        </ExpandableSection>

        {/* Changes to Terms */}
        <ExpandableSection 
          id="changes" 
          title="Changes to Terms" 
          icon="refresh-outline"
        >
          <ContentText>
            We reserve the right to modify these terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the service after changes constitutes acceptance of the new terms.
          </ContentText>

          <Text style={styles.subheading}>Notification Methods</Text>
          <BulletPoint>Email notification to registered address</BulletPoint>
          <BulletPoint>In-app banner or notification</BulletPoint>
          <BulletPoint>Updated terms posted on our website</BulletPoint>
        </ExpandableSection>

        {/* Contact Information */}
        <ContactInfo />

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
  titleContainer: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionIntro: {
    fontWeight: '500',
    marginBottom: 16,
    backgroundColor: '#F8F9FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9C3141',
  },
  contentText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#9C3141',
    marginRight: 8,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    flex: 1,
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#9C3141',
    marginLeft: 12,
    textDecorationLine: 'underline',
  },
});

export default TermsScreen;