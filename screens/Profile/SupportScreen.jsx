import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const SupportScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: 'alex.johnson@email.com',
  });

  const supportCategories = [
    {
      id: 'account',
      title: 'Account Issues',
      icon: 'person-outline',
      description: 'Login problems, account settings, password reset',
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      icon: 'card-outline',
      description: 'Payment issues, subscription management, refunds',
    },
    {
      id: 'technical',
      title: 'Technical Problems',
      icon: 'construct-outline',
      description: 'App crashes, playback issues, download problems',
    },
    {
      id: 'content',
      title: 'Content & Features',
      icon: 'library-outline',
      description: 'Missing podcasts, feature requests, content issues',
    },
    {
      id: 'other',
      title: 'Other',
      icon: 'help-circle-outline',
      description: 'General questions and other topics',
    },
  ];

  const faqItems = [
    {
      question: 'How do I download episodes for offline listening?',
      answer: 'Tap the download icon next to any episode. You can manage downloads in Settings > Downloads.',
    },
    {
      question: 'Why are my downloads not working?',
      answer: 'Check your internet connection and available storage space. You can also try restarting the app.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'Go to Profile > Subscription > Cancel Subscription. Your access will continue until the end of your billing period.',
    },
    {
      question: 'Can I sync my data across devices?',
      answer: 'Yes! Your listening history, subscriptions, and playlists sync automatically when you\'re signed in.',
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'Use the report button on any podcast or episode, or contact us directly through this support page.',
    },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setContactForm(prev => ({ ...prev, subject: `${category.title}: ` }));
  };

  const handleSubmitTicket = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Ticket Submitted',
      'Thank you for contacting us! We\'ll respond to your inquiry within 24 hours.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleContactMethod = (method) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@podcastapp.com');
        break;
      case 'phone':
        Linking.openURL('tel:+233-2008-LEMAZ');
        break;
      case 'chat':
        navigation.navigate('LiveChatScreen');
        break;
    }
  };

  const CategoryCard = ({ category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory?.id === category.id && styles.selectedCategory
      ]}
      onPress={() => handleCategorySelect(category)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={category.icon} size={24} color="#9C3141" />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
      </View>
      <Ionicons 
        name={selectedCategory?.id === category.id ? "checkmark-circle" : "chevron-forward"} 
        size={20} 
        color={selectedCategory?.id === category.id ? "#9C3141" : "#C7C7CC"} 
      />
    </TouchableOpacity>
  );

  const FAQItem = ({ item, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#9C3141" 
          />
        </View>
        {expanded && (
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

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
        
        <Text style={styles.headerTitle}>Help & Support</Text>
        
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactRow}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => handleContactMethod('email')}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name="mail-outline" size={24} color="#9C3141" />
                </View>
                <Text style={styles.contactText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => handleContactMethod('phone')}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name="call-outline" size={24} color="#9C3141" />
                </View>
                <Text style={styles.contactText}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => handleContactMethod('chat')}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name="chatbubble-outline" size={24} color="#9C3141" />
                </View>
                <Text style={styles.contactText}>Live Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <View style={styles.faqContainer}>
              {faqItems.map((item, index) => (
                <FAQItem key={index} item={item} index={index} />
              ))}
            </View>
          </View>

          {/* Support Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What can we help you with?</Text>
            <View style={styles.categoriesContainer}>
              {supportCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>
          </View>

          {/* Contact Form */}
          {selectedCategory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Submit a Support Ticket</Text>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={contactForm.email}
                    onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
                    placeholder="your.email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Subject *</Text>
                  <TextInput
                    style={styles.input}
                    value={contactForm.subject}
                    onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                    placeholder="Brief description of your issue"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Message *</Text>
                  <TextInput
                    style={[styles.input, styles.messageInput]}
                    value={contactForm.message}
                    onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                    placeholder="Please describe your issue in detail..."
                    multiline={true}
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitTicket}>
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Additional Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>
            <View style={styles.resourcesContainer}>
              <TouchableOpacity 
                style={styles.resourceItem}
                onPress={() => Linking.openURL('https://podcastapp.com/help')}
              >
                <Ionicons name="book-outline" size={20} color="#9C3141" />
                <Text style={styles.resourceText}>User Guide</Text>
                <Ionicons name="open-outline" size={16} color="#C7C7CC" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resourceItem}
                onPress={() => Linking.openURL('https://status.podcastapp.com')}
              >
                <Ionicons name="pulse-outline" size={20} color="#9C3141" />
                <Text style={styles.resourceText}>Service Status</Text>
                <Ionicons name="open-outline" size={16} color="#C7C7CC" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resourceItem}
                onPress={() => Linking.openURL('https://community.podcastapp.com')}
              >
                <Ionicons name="people-outline" size={20} color="#9C3141" />
                <Text style={styles.resourceText}>Community Forum</Text>
                <Ionicons name="open-outline" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  flex: {
    flex: 1,
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
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  contactOption: {
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  contactText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
    lineHeight: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedCategory: {
    borderColor: '#9C3141',
    backgroundColor: '#FFF5F5',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666666',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#9C3141',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resourcesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  resourceText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    marginLeft: 12,
  },
});

export default SupportScreen;