// hooks/useLoginActivity.js - Optimized version
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getDeviceInfo, getClientIP, getLocationFromIP, formatTimeAgo, isValidIP } from '../utils/deviceUtils';

export const useLoginActivity = () => {
  const [loginActivities, setLoginActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs to prevent duplicate operations
  const isRecordingRef = useRef(false);
  const recordedSessionsRef = useRef(new Set());
  const abortControllerRef = useRef(null);

  // Memoized fetch function
  const fetchLoginActivities = useCallback(async () => {
    try {
      // Cancel any ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_user_login_activities', {
        limit_count: 50
      });

      if (error) throw error;
      
      // Transform the data efficiently
      const transformedData = data?.map(activity => ({
        id: activity.id,
        device_info: activity.device_info,
        location: activity.location,
        time_ago: activity.time_ago || formatTimeAgo(activity.login_time),
        is_current: activity.is_current,
        ip_address: activity.ip_address || 'Unknown',
        session_id: activity.session_id,
        login_time: activity.login_time,
        user_agent: activity.user_agent,
        suspicious: checkSuspiciousActivity(activity),
        raw_data: activity
      })) || [];

      setLoginActivities(transformedData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching login activities:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized record function with deduplication
  const recordLoginActivity = useCallback(async (sessionId = null, force = false) => {
    // Prevent concurrent recording unless forced
    if (isRecordingRef.current && !force) {
      console.log('Login activity recording already in progress');
      return null;
    }

    // Check if session was already recorded (prevents duplicates)
    const finalSessionId = sessionId || generateSessionId();
    if (recordedSessionsRef.current.has(finalSessionId) && !force) {
      console.log('Session already recorded:', finalSessionId);
      return null;
    }

    try {
      isRecordingRef.current = true;
      
      // Mark session as being recorded
      recordedSessionsRef.current.add(finalSessionId);
      
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Check if activity already exists in database
      if (!force) {
        const { data: existingActivity } = await supabase
          .from('login_activities')
          .select('id')
          .eq('session_id', finalSessionId)
          .eq('user_id', user.id)
          .single();
        
        if (existingActivity) {
          console.log('Login activity already exists for session:', finalSessionId);
          return { success: true, existing: true, sessionId: finalSessionId };
        }
      }
      
      // Get device information in parallel
      const [deviceInfo, ipAddress] = await Promise.all([
        getDeviceInfo(),
        getClientIP()
      ]);
      
      // Get location information
      let locationData = null;
      if (ipAddress && isValidIP(ipAddress)) {
        try {
          locationData = await getLocationFromIP(ipAddress);
        } catch (e) {
          console.warn('Could not get location data:', e);
        }
      }
      
      // Record the login activity
      const { data, error } = await supabase.rpc('record_login_activity', {
        p_user_id: user.id,
        p_ip_address: ipAddress || 'Unknown',
        p_user_agent: navigator.userAgent,
        p_location: locationData,
        p_device_info: deviceInfo,
        p_session_id: finalSessionId
      });

      if (error) throw error;
      
      // Refresh the activities list only if successful
      await fetchLoginActivities();
      
      return {
        success: true,
        sessionId: finalSessionId,
        ipAddress,
        deviceInfo,
        locationData,
        data
      };
    } catch (err) {
      console.error('Error recording login activity:', err);
      // Remove from recorded sessions on error
      recordedSessionsRef.current.delete(finalSessionId);
      throw err;
    } finally {
      isRecordingRef.current = false;
    }
  }, [fetchLoginActivities]);

  const endSession = useCallback(async (sessionId) => {
    try {
      const { data, error } = await supabase.rpc('end_login_session', {
        p_session_id: sessionId
      });

      if (error) throw error;
      
      // Remove from recorded sessions
      recordedSessionsRef.current.delete(sessionId);
      
      // Refresh the activities list
      await fetchLoginActivities();
      
      return data;
    } catch (err) {
      console.error('Error ending session:', err);
      throw err;
    }
  }, [fetchLoginActivities]);

  const endAllOtherSessions = useCallback(async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      const currentSessionId = session?.access_token;
      
      if (!currentSessionId) {
        throw new Error('No current session found');
      }
      
      // End all other sessions
      const { data, error } = await supabase.rpc('end_all_other_sessions', {
        p_current_session_id: currentSessionId
      });
      
      if (error) throw error;
      
      // Clear recorded sessions except current
      const newRecorded = new Set([currentSessionId]);
      recordedSessionsRef.current = newRecorded;
      
      // Refresh the activities list
      await fetchLoginActivities();
      
      return data;
    } catch (err) {
      console.error('Error ending all other sessions:', err);
      throw err;
    }
  }, [fetchLoginActivities]);

  const reportSuspiciousActivity = useCallback(async (activityId, reason = 'User reported') => {
    try {
      const { error } = await supabase
        .from('login_activities')
        .update({ 
          device_info: supabase.raw(`
            COALESCE(device_info, '{}'::jsonb) || jsonb_build_object(
              'suspicious', true,
              'reported_at', '${new Date().toISOString()}',
              'report_reason', '${reason.replace(/'/g, "''")}'
            )
          `)
        })
        .eq('id', activityId);

      if (error) throw error;
      
      // Refresh the activities
      await fetchLoginActivities();
      
      return true;
    } catch (err) {
      console.error('Error reporting suspicious activity:', err);
      throw err;
    }
  }, [fetchLoginActivities]);

  const getSessionInfo = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const [deviceInfo, ipAddress] = await Promise.all([
        getDeviceInfo(),
        getClientIP()
      ]);
      
      return {
        sessionId: session?.access_token,
        deviceInfo,
        ipAddress,
        userAgent: navigator.userAgent
      };
    } catch (err) {
      console.error('Error getting session info:', err);
      return null;
    }
  }, []);

  // Initialize login tracking on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeLoginTracking = async () => {
      try {
        // Check if we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !isMounted) return;
        
        const sessionId = session.access_token;
        
        // Check if this session is already recorded in database
        const { data: existingActivity } = await supabase
          .from('login_activities')
          .select('id, session_id')
          .eq('session_id', sessionId)
          .eq('is_current', true)
          .maybeSingle(); // Use maybeSingle to avoid errors when no record exists
        
        if (!existingActivity && isMounted) {
          // Record this login activity only if not already recorded
          await recordLoginActivity(sessionId);
        } else if (existingActivity) {
          // Mark as recorded to prevent duplicates
          recordedSessionsRef.current.add(sessionId);
        }
      } catch (err) {
        console.warn('Could not initialize login tracking:', err);
      }
      
      // Fetch existing activities regardless
      if (isMounted) {
        await fetchLoginActivities();
      }
    };
    
    initializeLoginTracking();
    
    return () => {
      isMounted = false;
    };
  }, [recordLoginActivity, fetchLoginActivities]);

  // Listen for auth state changes with deduplication
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const sessionId = session.access_token;
          
          // Only record if not already recorded and not currently recording
          if (!recordedSessionsRef.current.has(sessionId) && !isRecordingRef.current) {
            try {
              await recordLoginActivity(sessionId);
            } catch (err) {
              console.warn('Could not record login activity on auth change:', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setLoginActivities([]);
          recordedSessionsRef.current.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [recordLoginActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    loginActivities,
    loading,
    error,
    fetchLoginActivities,
    recordLoginActivity,
    endSession,
    endAllOtherSessions,
    reportSuspiciousActivity,
    getSessionInfo,
    refresh: fetchLoginActivities
  };
};

// Utility functions
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

const checkSuspiciousActivity = (activity) => {
  if (!activity) return false;
  
  try {
    // Check if already marked as suspicious
    if (activity.device_info?.suspicious) return true;
    
    let suspiciousScore = 0;
    
    // Check for unknown device info
    if (!activity.device_info || activity.device_info.device_type === 'Unknown Device') {
      suspiciousScore += 1;
    }
    
    // Check for unknown location
    if (!activity.location || activity.location === 'Unknown Location') {
      suspiciousScore += 1;
    }
    
    // Check for unusual login times (2-5 AM)
    const loginTime = new Date(activity.login_time);
    const hour = loginTime.getHours();
    if (hour >= 2 && hour <= 5) {
      suspiciousScore += 1;
    }
    
    // Check for private IP addresses that might indicate VPN/proxy
    if (activity.ip_address) {
      const ip = activity.ip_address;
      // This is a simple check - you might want more sophisticated detection
      if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
        // Private IPs might be normal for corporate networks
        suspiciousScore += 0.5;
      }
    }
    
    return suspiciousScore >= 2;
  } catch (e) {
    console.warn('Error checking suspicious activity:', e);
    return false;
  }
};

// Export additional utility functions
export const deviceUtils = {
  generateSessionId,
  checkSuspiciousActivity,
  getDeviceInfo,
  getClientIP,
  getLocationFromIP
};