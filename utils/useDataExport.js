// hooks/useDataExport.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useDataExport = () => {
  const [exportRequests, setExportRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's export requests
  const fetchExportRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setExportRequests(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching export requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced create new data export request with better error handling
  const requestDataExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if there's already a processing request within the last 24 hours
      const { data: existingRequests } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'processing')
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (existingRequests && existingRequests.length > 0) {
        throw new Error('You already have a pending data export request. Please wait for it to complete.');
      }

      // First, record the export request in the database
      const { data: requestRecord, error: dbError } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          status: 'processing',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to create export request: ${dbError.message}`);
      }

      // Then call the Supabase Edge Function to initiate data export
      let functionData = null;
      let functionError = null;

      try {
        const { data, error } = await supabase.functions.invoke('export-user-data', {
          body: {
            userId: user.id,
            email: user.email,
            requestId: requestRecord.id,
            requestedAt: new Date().toISOString(),
          },
        });

        functionData = data;
        functionError = error;
      } catch (err) {
        functionError = err;
      }

      // If the edge function fails, update the request status to failed
      if (functionError) {
        console.error('Edge function error:', functionError);
        
        // Update the request status to failed
        await supabase
          .from('data_export_requests')
          .update({
            status: 'failed',
            error_message: functionError.message || 'Edge function failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestRecord.id);

        // Provide more detailed error information
        if (functionError.message) {
          throw new Error(`Export initialization failed: ${functionError.message}`);
        } else if (functionError.details) {
          throw new Error(`Export initialization failed: ${functionError.details}`);
        } else {
          throw new Error('Export initialization failed. The export service may be temporarily unavailable.');
        }
      }

      // Refresh the requests list to show the new request
      await fetchExportRequests();

      return { requestId: requestRecord.id, ...functionData };
    } catch (err) {
      setError(err.message);
      console.error('Error requesting data export:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced request with fallback mechanism
  const requestDataExportWithFallback = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check existing requests
      const { data: existingRequests } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'processing')
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (existingRequests && existingRequests.length > 0) {
        throw new Error('You already have a pending data export request. Please wait for it to complete.');
      }

      // Create request record
      const { data: requestRecord, error: dbError } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          status: 'processing',
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Failed to create export request: ${dbError.message}`);
      }

      // Try edge function with timeout
      const edgeFunctionPromise = supabase.functions.invoke('export-user-data', {
        body: {
          userId: user.id,
          email: user.email,
          requestId: requestRecord.id,
          requestedAt: new Date().toISOString(),
        },
      });

      // Add timeout to edge function call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
      });

      let functionResult;
      try {
        functionResult = await Promise.race([edgeFunctionPromise, timeoutPromise]);
      } catch (err) {
        console.error('Edge function failed:', err);
        
        // Update request status to failed
        await supabase
          .from('data_export_requests')
          .update({
            status: 'failed',
            error_message: err.message || 'Service timeout or unavailable',
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestRecord.id);

        // Provide user-friendly error message based on error type
        if (err.message === 'Request timeout') {
          throw new Error('Export request timed out. The service may be busy. Please try again later.');
        } else if (err.message?.includes('fetch')) {
          throw new Error('Unable to connect to export service. Please check your internet connection and try again.');
        } else {
          throw new Error('Export service is temporarily unavailable. Please try again later.');
        }
      }

      if (functionResult.error) {
        // Update request status to failed
        await supabase
          .from('data_export_requests')
          .update({
            status: 'failed',
            error_message: functionResult.error.message || 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestRecord.id);

        throw new Error(`Export failed: ${functionResult.error.message}`);
      }

      // Refresh the requests list
      await fetchExportRequests();

      return { requestId: requestRecord.id, ...functionResult.data };
    } catch (err) {
      setError(err.message);
      console.error('Error requesting data export:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check edge function availability
  const testEdgeFunctionAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Test edge function with a simple ping
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: {
          test: true,
          userId: user.id,
        },
      });

      return { available: !error, error: error?.message, data };
    } catch (err) {
      return { available: false, error: err.message };
    }
  };

  // Check if user can request a new export
  const canRequestExport = useCallback(() => {
    const recentRequests = exportRequests.filter(request => {
      const requestTime = new Date(request.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return requestTime > dayAgo && request.status === 'processing';
    });

    return recentRequests.length === 0;
  }, [exportRequests]);

  // Get the latest completed export that's still valid
  const getLatestCompletedExport = useCallback(() => {
    return exportRequests.find(request => 
      request.status === 'completed' && 
      request.download_url &&
      request.expires_at &&
      new Date(request.expires_at) > new Date()
    );
  }, [exportRequests]);

  // Get export statistics
  const getExportStats = useCallback(() => {
    const totalRequests = exportRequests.length;
    const completedRequests = exportRequests.filter(req => req.status === 'completed').length;
    const processingRequests = exportRequests.filter(req => req.status === 'processing').length;
    const failedRequests = exportRequests.filter(req => req.status === 'failed').length;

    return {
      total: totalRequests,
      completed: completedRequests,
      processing: processingRequests,
      failed: failedRequests,
    };
  }, [exportRequests]);

  // Cancel a pending export request
  const cancelExportRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Only allow cancellation of processing requests
      const request = exportRequests.find(req => req.id === requestId);
      if (!request || request.status !== 'processing') {
        throw new Error('Cannot cancel this export request');
      }

      const { error } = await supabase
        .from('data_export_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh the requests list
      await fetchExportRequests();

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error cancelling export request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an export request record (for completed/failed requests)
  const deleteExportRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('data_export_requests')
        .delete()
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh the requests list
      await fetchExportRequests();

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting export request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Retry a failed export request
  const retryExportRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const request = exportRequests.find(req => req.id === requestId);
      if (!request || request.status !== 'failed') {
        throw new Error('Can only retry failed export requests');
      }

      // Update status back to processing
      const { error: updateError } = await supabase
        .from('data_export_requests')
        .update({
          status: 'processing',
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Call the edge function again
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: {
          userId: user.id,
          email: user.email,
          requestId: requestId,
          requestedAt: new Date().toISOString(),
          retry: true,
        },
      });

      if (error) {
        // Update back to failed if edge function fails again
        await supabase
          .from('data_export_requests')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        throw new Error(`Retry failed: ${error.message}`);
      }

      // Refresh the requests list
      await fetchExportRequests();

      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error retrying export request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if a specific export is expired
  const isExportExpired = useCallback((exportRequest) => {
    if (!exportRequest.expires_at) return false;
    return new Date(exportRequest.expires_at) <= new Date();
  }, []);

  // Get time remaining until export expires
  const getTimeUntilExpiry = useCallback((exportRequest) => {
    if (!exportRequest.expires_at) return null;
    
    const expiryTime = new Date(exportRequest.expires_at);
    const now = new Date();
    const diffMs = expiryTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Less than 1 hour remaining';
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    let channel = null;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`data_export_requests:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'data_export_requests',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Export request updated:', payload);
            // Debounce the fetch to avoid too many calls
            setTimeout(() => {
              fetchExportRequests();
            }, 1000);
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchExportRequests]);

  // Initial fetch on mount
  useEffect(() => {
    fetchExportRequests();
  }, [fetchExportRequests]);

  // Auto-refresh every 30 seconds when there are processing requests
  useEffect(() => {
    const hasProcessingRequests = exportRequests.some(req => req.status === 'processing');
    
    if (!hasProcessingRequests) return;

    const interval = setInterval(() => {
      fetchExportRequests();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [exportRequests, fetchExportRequests]);

  return {
    // Data
    exportRequests,
    loading,
    error,
    
    // Computed values
    canRequestExport: canRequestExport(),
    latestCompletedExport: getLatestCompletedExport(),
    exportStats: getExportStats(),
    
    // Actions
    requestDataExport: requestDataExportWithFallback, // Use enhanced version by default
    requestDataExportBasic: requestDataExport, // Keep original for comparison
    fetchExportRequests,
    cancelExportRequest,
    deleteExportRequest,
    retryExportRequest,
    clearError,
    
    // Debug utilities
    testEdgeFunctionAvailability,
    
    // Utilities
    isExportExpired,
    getTimeUntilExpiry,
  };
};