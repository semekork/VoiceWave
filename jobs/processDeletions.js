// jobs/processDeletions.js
import { supabase } from '../config/supabase';

export const processScheduledDeletions = async () => {
  try {
    // Get pending deletions that are due
    const { data: pendingDeletions, error } = await supabase
      .from('scheduled_deletions')
      .select('*')
      .eq('status', 'pending')
      .lt('scheduled_for', new Date().toISOString());

    if (error) {
      console.error('Error fetching pending deletions:', error);
      return;
    }

    for (const deletion of pendingDeletions) {
      try {
        // Delete the user from auth.users
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          deletion.user_id
        );

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          continue;
        }

        // Mark as completed
        await supabase
          .from('scheduled_deletions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', deletion.id);

        console.log(`Successfully deleted user: ${deletion.user_id}`);
      } catch (error) {
        console.error('Error processing deletion:', error);
      }
    }
  } catch (error) {
    console.error('Error in processScheduledDeletions:', error);
  }
};