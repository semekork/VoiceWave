import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeleteAccountService from '../../services/DeleteAccountService';

const DeleteAccountScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const deletionReasons = [
    'I found a better alternative',
    'The app doesn\'t meet my needs',
    'Privacy concerns',
    'Too expensive',
    'Technical issues',
    'I don\'t use it anymore',
    'Other'
  ];

  // Get current user on component mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { user, error } = await DeleteAccountService.getCurrentUser();
      if (error) {
        Alert.alert('Error', 'Unable to load user information. Please try again.');
        navigation.goBack();
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Unable to load user information. Please try again.');
      navigation.goBack();
    }
  };

  const handleReasonToggle = (reason) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to continue.');
      return;
    }

    if (!currentUser?.email) {
      Alert.alert('Error', 'Unable to verify user email. Please try again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await DeleteAccountService.verifyPassword(currentUser.email, password);
      
      if (result.success) {
        setCurrentStep(2);
      } else {
        Alert.alert('Error', result.error || 'Password verification failed.');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      Alert.alert('Error', 'An error occurred during password verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeactivation = async () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'Unable to identify user. Please try again.');
      return;
    }

    Alert.alert(
      'Deactivate Account',
      'Your account will be deactivated and you will be signed out. You can reactivate it by signing in again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await DeleteAccountService.deactivateAccount(currentUser.id);
              
              if (result.success) {
                Alert.alert(
                  'Account Deactivated',
                  'Your account has been deactivated successfully.',
                  [{ 
                    text: 'OK', 
                    onPress: () => navigation.navigate('Login') // Navigate to your login screen
                  }]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to deactivate account.');
              }
            } catch (error) {
              console.error('Deactivation error:', error);
              Alert.alert('Error', 'An error occurred during account deactivation.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleFinalDeletion = async () => {
    if (confirmationText !== 'DELETE') {
      Alert.alert('Error', 'Please type "DELETE" exactly as shown to confirm.');
      return;
    }

    if (!currentUser?.email) {
      Alert.alert('Error', 'Unable to verify user information. Please try again.');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'Are you absolutely sure you want to delete your account? This action cannot be undone and your account will be permanently deleted within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              const result = await DeleteAccountService.deleteAccount(
                currentUser.email,
                password,
                selectedReasons,
                customReason
              );

              if (result.success) {
                Alert.alert(
                  'Account Deletion Scheduled',
                  'Your account has been scheduled for deletion and will be permanently removed within 24 hours. You have been signed out. Thank you for using our service.',
                  [{ 
                    text: 'OK', 
                    onPress: () => navigation.navigate('GoodbyeScreen')
                  }]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to delete account.');
              }
            } catch (error) {
              console.error('Account deletion error:', error);
              Alert.alert('Error', 'An error occurred during account deletion.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePrivacySettings = () => {
    // Navigate to privacy settings screen
    navigation.navigate('PrivacySettings'); // Replace with your actual privacy settings screen
  };

  const DataItem = ({ icon, title, description }) => (
    <View style={styles.dataItem}>
      <View style={styles.dataIcon}>
        <Ionicons name={icon} size={20} color="#D70015" />
      </View>
      <View style={styles.dataContent}>
        <Text style={styles.dataTitle}>{title}</Text>
        <Text style={styles.dataDescription}>{description}</Text>
      </View>
    </View>
  );

  const ReasonButton = ({ reason, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.reasonButton, selected && styles.reasonButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>
        {reason}
      </Text>
      {selected && (
        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.warningContainer}>
        <View style={styles.warningIcon}>
          <Ionicons name="warning" size={32} color="#FF9500" />
        </View>
        <Text style={styles.warningTitle}>Delete Your Account</Text>
        <Text style={styles.warningText}>
          Before you proceed, please understand that deleting your account is permanent and irreversible.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What will be deleted:</Text>
        <View style={styles.dataContainer}>
          <DataItem
            icon="person-outline"
            title="Profile Information"
            description="Your username, profile picture, and personal details"
          />
          <DataItem
            icon="musical-notes-outline"
            title="Music Library"
            description="All your saved songs, albums, and artists"
          />
          <DataItem
            icon="list-outline"
            title="Playlists"
            description="All created and followed playlists"
          />
          <DataItem
            icon="time-outline"
            title="Listening History"
            description="Your complete listening history and preferences"
          />
          <DataItem
            icon="people-outline"
            title="Social Connections"
            description="Friends, followers, and social interactions"
          />
          <DataItem
            icon="settings-outline"
            title="App Settings"
            description="All your customized preferences and settings"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why are you leaving?</Text>
        <Text style={styles.sectionSubtitle}>
          Help us improve by sharing your reason (optional)
        </Text>
        <View style={styles.reasonsContainer}>
          {deletionReasons.map((reason, index) => (
            <ReasonButton
              key={index}
              reason={reason}
              selected={selectedReasons.includes(reason)}
              onPress={() => handleReasonToggle(reason)}
            />
          ))}
        </View>
        
        {selectedReasons.includes('Other') && (
          <TextInput
            style={styles.customReasonInput}
            placeholder="Please specify..."
            value={customReason}
            onChangeText={setCustomReason}
            multiline
            maxLength={200}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verify Your Identity</Text>
        <Text style={styles.sectionSubtitle}>
          Enter your password to continue
        </Text>
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#8E8E93" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handlePasswordVerification}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.finalWarningContainer}>
        <View style={styles.finalWarningIcon}>
          <Ionicons name="trash-outline" size={48} color="#D70015" />
        </View>
        <Text style={styles.finalWarningTitle}>Final Step</Text>
        <Text style={styles.finalWarningText}>
          This is your last chance to change your mind. Once you confirm, your account and all associated data will be permanently deleted within 24 hours.
        </Text>
      </View>

      <View style={styles.confirmationContainer}>
        <Text style={styles.confirmationLabel}>
          Type <Text style={styles.confirmationKeyword}>DELETE</Text> to confirm:
        </Text>
        <TextInput
          style={styles.confirmationInput}
          value={confirmationText}
          onChangeText={setConfirmationText}
          placeholder="Type DELETE here"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.alternativesContainer}>
        <Text style={styles.alternativesTitle}>Consider these alternatives:</Text>
        
        <TouchableOpacity 
          style={styles.alternativeButton}
          onPress={handleAccountDeactivation}
          disabled={isLoading}
        >
          <Ionicons name="pause-circle-outline" size={20} color="#007AFF" />
          <View style={styles.alternativeContent}>
            <Text style={styles.alternativeTitle}>Deactivate Instead</Text>
            <Text style={styles.alternativeDescription}>
              Hide your profile temporarily without losing your data
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.alternativeButton}
          onPress={handlePrivacySettings}
        >
          <Ionicons name="shield-outline" size={20} color="#007AFF" />
          <View style={styles.alternativeContent}>
            <Text style={styles.alternativeTitle}>Adjust Privacy Settings</Text>
            <Text style={styles.alternativeDescription}>
              Make your account more private without deleting it
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            (confirmationText !== 'DELETE' || isLoading) && styles.deleteButtonDisabled
          ]}
          onPress={handleFinalDeletion}
          disabled={confirmationText !== 'DELETE' || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Account Forever</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Show loading screen while getting user info
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C3141" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <Text style={styles.headerTitle}>Delete Account</Text>
        
        <View style={styles.headerButton} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill, 
            { width: `${(currentStep / 2) * 100}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 2</Text>
      </View>

      {currentStep === 1 ? renderStep1() : renderStep2()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D70015',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  warningContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  dataContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  dataIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataContent: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  dataDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  reasonButtonSelected: {
    backgroundColor: '#9C3141',
    borderColor: '#9C3141',
  },
  reasonText: {
    fontSize: 14,
    color: '#000000',
  },
  reasonTextSelected: {
    color: '#FFFFFF',
    marginRight: 4,
  },
  customReasonInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 16,
  },
  finalWarningContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  finalWarningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  finalWarningTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D70015',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalWarningText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  confirmationKeyword: {
    fontWeight: '700',
    color: '#D70015',
  },
  confirmationInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  alternativesContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  alternativeContent: {
    flex: 1,
    marginLeft: 12,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 2,
  },
  alternativeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#9C3141',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9C3141',
  },
  deleteButton: {
    backgroundColor: '#D70015',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  deleteButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DeleteAccountScreen;