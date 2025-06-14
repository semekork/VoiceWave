import { supabase } from '../lib/supabase'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service class for handling account deletion operations with Supabase
 * Now uses Edge Function for secure server-side deletion
 */
class DeleteAccountService {
  /**
   * Complete account deletion process using Edge Function
   * @param {string} password - User's password for verification
   * @param {Array<string>} reasons - Deletion reasons
   * @param {string} customReason - Custom reason
   * @returns {Promise<{success: boolean, error?: string, details?: object}>}
   */
  async deleteAccount(password, reasons = [], customReason = '') {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: 'No active session found. Please log in again.',
        };
      }

      console.log('Calling delete-account Edge Function...');

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: {
          password: password,
          reasons: reasons,
          customReason: customReason,
        },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge Function error:', error);
        return {
          success: false,
          error: 'Failed to delete account: ' + error.message,
        };
      }

      if (!data.success) {
        console.error('Deletion failed:', data.error);
        return {
          success: false,
          error: data.error || 'Account deletion failed',
          details: data.details,
        };
      }

      // Clear local data after successful deletion
      console.log('Clearing local data...');
      await this.clearLocalData();

      console.log('Account deletion completed successfully');
      return {
        success: true,
        message: data.message || 'Account deleted successfully',
        details: data.details,
      };

    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: 'An error occurred during account deletion: ' + error.message,
      };
    }
  }

  /**
   * Alternative method using direct HTTP fetch (if supabase.functions.invoke doesn't work)
   * @param {string} password - User's password for verification
   * @param {Array<string>} reasons - Deletion reasons
   * @param {string} customReason - Custom reason
   * @returns {Promise<{success: boolean, error?: string, details?: object}>}
   */
  async deleteAccountDirect(password, reasons = [], customReason = '') {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: 'No active session found. Please log in again.',
        };
      }

      const supabaseUrl = supabase.supabaseUrl;
      const functionUrl = `${supabaseUrl}/functions/v1/delete-account`;

      console.log('Calling delete-account Edge Function directly...');

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          reasons: reasons,
          customReason: customReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('HTTP error:', response.status, result);
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: Request failed`,
          details: result.details,
        };
      }

      if (!result.success) {
        console.error('Deletion failed:', result.error);
        return {
          success: false,
          error: result.error || 'Account deletion failed',
          details: result.details,
        };
      }

      // Clear local data after successful deletion
      console.log('Clearing local data...');
      await this.clearLocalData();

      console.log('Account deletion completed successfully');
      return {
        success: true,
        message: result.message || 'Account deleted successfully',
        details: result.details,
      };

    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: 'An error occurred during account deletion: ' + error.message,
      };
    }
  }

  /**
   * Clear all local data stored in AsyncStorage
   * @returns {Promise<void>}
   */
  async clearLocalData() {
    try {
      const keys = [
        'user_preferences',
        'recently_played',
        'offline_data',
        'cached_playlists',
        'user_settings',
        '@supabase_session',
        // Add other keys you want to clear
      ];

      await AsyncStorage.multiRemove(keys);
      console.log('Local data cleared successfully');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  /**
   * Get current user information
   * @returns {Promise<{user: object|null, error?: string}>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return { user: null, error: error.message };
      }

      return { user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error: 'Failed to get user information: ' + error.message };
    }
  }

  /**
   * Deactivate account instead of deleting (soft delete alternative)
   * This doesn't require the Edge Function since it's just updating user data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deactivateAccount() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {
          success: false,
          error: 'Unable to verify user identity.',
        };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deactivating account:', error);
        return {
          success: false,
          error: 'Failed to deactivate account: ' + error.message,
        };
      }

      // Sign out user
      await supabase.auth.signOut();
      await this.clearLocalData();

      return { 
        success: true,
        message: 'Account has been deactivated successfully'
      };
    } catch (error) {
      console.error('Account deactivation error:', error);
      return {
        success: false,
        error: 'An error occurred during account deactivation: ' + error.message,
      };
    }
  }

  /**
   * Test Edge Function connectivity
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async testEdgeFunction() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: 'No active session found.',
        };
      }

      // Try to invoke the function with a test call
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { test: true },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        return {
          success: false,
          error: 'Edge Function not accessible: ' + error.message,
        };
      }

      return {
        success: true,
        message: 'Edge Function is accessible',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to test Edge Function: ' + error.message,
      };
    }
  }
}

// Export singleton instance
export default new DeleteAccountService();