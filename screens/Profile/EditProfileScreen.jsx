import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  const [originalEmail, setOriginalEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        setFormData({
          name: profile?.full_name || '',
          email: user.email || '',
          bio: profile?.bio || '',
        });
        
        setOriginalEmail(user.email || '');
        setPendingEmail(profile?.pending_email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Stable handlers that won't cause re-renders
  const handleNameChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleEmailChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, email: text }));
  }, []);

  const handleBioChange = useCallback((text) => {
    setFormData(prev => ({ ...prev, bio: text }));
  }, []);

  const handleCurrentPasswordChange = useCallback((text) => {
    setPasswordData(prev => ({ ...prev, currentPassword: text }));
  }, []);

  const handleNewPasswordChange = useCallback((text) => {
    setPasswordData(prev => ({ ...prev, newPassword: text }));
  }, []);

  const handleConfirmPasswordChange = useCallback((text) => {
    setPasswordData(prev => ({ ...prev, confirmPassword: text }));
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (formData.email !== originalEmail) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.name,
            bio: formData.bio,
            pending_email: formData.email,
          }, { onConflict: 'id' });

        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) {
          await supabase
            .from('profiles')
            .update({ pending_email: null })
            .eq('id', user.id);
          throw emailError;
        }

        Alert.alert(
          'Verification Required',
          'Please check your new email address for a verification link. Your email will be updated once verified.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.name,
            bio: formData.bio,
          }, { onConflict: 'id' });

        if (profileError) throw profileError;

        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (!validatePassword(passwordData.newPassword)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User email not found');

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize computed values to prevent unnecessary re-renders
  const showEmailWarning = useMemo(() => formData.email !== originalEmail, [formData.email, originalEmail]);
  const showPendingEmail = useMemo(() => pendingEmail && pendingEmail !== formData.email, [pendingEmail, formData.email]);
  const isPasswordFormValid = useMemo(() => 
    passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword,
    [passwordData.currentPassword, passwordData.newPassword, passwordData.confirmPassword]
  );

  if (isLoading && !formData.name && !formData.email) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
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
          disabled={isLoading}
        >
          <Ionicons name="chevron-back" size={24} color="#9C3141" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Profile</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={[styles.saveButton, isLoading && styles.disabledText]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={handleNameChange}
                placeholder="Enter your full name"
                placeholderTextColor="#C7C7CC"
                autoComplete="name"
                autoCapitalize="words"
                autoCorrect={true}
                returnKeyType="next"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                {showPendingEmail && (
                  <Text style={styles.pendingText}>
                    Pending: {pendingEmail}
                  </Text>
                )}
              </View>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                placeholderTextColor="#C7C7CC"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                returnKeyType="next"
              />
              {showEmailWarning && (
                <Text style={styles.warningText}>
                  ⚠️ Email change requires verification
                </Text>
              )}
            </View>

            {/* Bio Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.bio}
                onChangeText={handleBioChange}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#C7C7CC"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="sentences"
                autoCorrect={true}
                returnKeyType="default"
              />
            </View>

            {/* Password Section */}
            <View style={styles.passwordSection}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={handleCurrentPasswordChange}
                  placeholder="Enter current password"
                  placeholderTextColor="#C7C7CC"
                  secureTextEntry={true}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={handleNewPasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                  placeholderTextColor="#C7C7CC"
                  secureTextEntry={true}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Confirm new password"
                  placeholderTextColor="#C7C7CC"
                  secureTextEntry={true}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.passwordButton,
                  !isPasswordFormValid && styles.disabledButton
                ]}
                onPress={handlePasswordChange}
                disabled={isLoading || !isPasswordFormValid}
              >
                <Text style={[styles.passwordButtonText, isLoading && styles.disabledText]}>
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#9C3141" />
              <Text style={styles.infoText}>
                Your profile information helps other users discover and connect with you. Email changes require verification for security.
              </Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C3141',
  },
  disabledText: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  warningText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    lineHeight: 20,
  },
  passwordSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  passwordButton: {
    backgroundColor: '#9C3141',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  passwordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;