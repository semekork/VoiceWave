// hooks/useLoginActivity.js - Enhanced version
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getDeviceInfo, getClientIP, getLocationFromIP, formatTimeAgo, isValidIP } from '../utils/deviceUtils';

export const useLoginActivity = () => {
  const [loginActivities, setLoginActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLoginActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_user_login_activities', {
        limit_count: 50
      });

      if (error) throw error;
      
      // Transform the data to match your component's expected format
      const transformedData = data.map(activity => ({
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
      }));

      setLoginActivities(transformedData);
    } catch (err) {
      console.error('Error fetching login activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recordLoginActivity = async (sessionId = null) => {
    try {
      // Get comprehensive device information
      const deviceInfo = await getDeviceInfo();
      
      // Get IP address from multiple sources
      let ipAddress = await getClientIP();
      
      // Fallback to detecting IP from request headers if available
      if (!ipAddress || !isValidIP(ipAddress)) {
        try {
          // This would typically be handled by your backend
          const response = await fetch('/api/get-client-ip');
          const data = await response.json();
          ipAddress = data.ip;
        } catch (e) {
          console.warn('Could not get IP from backend:', e);
        }
      }
      
      // Get location information
      let locationData = null;
      if (ipAddress) {
        locationData = await getLocationFromIP(ipAddress);
      }
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      // Generate session ID if not provided
      const finalSessionId = sessionId || generateSessionId();
      
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
      
      // Refresh the activities list
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
      throw err;
    }
  };

  const endSession = async (sessionId) => {
    try {
      const { data, error } = await supabase.rpc('end_login_session', {
        p_session_id: sessionId
      });

      if (error) throw error;
      
      // Refresh the activities list
      await fetchLoginActivities();
      
      return data;
    } catch (err) {
      console.error('Error ending session:', err);
      throw err;
    }
  };

  const endAllOtherSessions = async () => {
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
      
      // Refresh the activities list
      await fetchLoginActivities();
      
      return data;
    } catch (err) {
      console.error('Error ending all other sessions:', err);
      throw err;
    }
  };

  const reportSuspiciousActivity = async (activityId, reason = 'User reported') => {
    try {
      const { error } = await supabase
        .from('login_activities')
        .update({ 
          device_info: supabase.raw(`
            COALESCE(device_info, '{}'::jsonb) || jsonb_build_object(
              'suspicious', true,
              'reported_at', '${new Date().toISOString()}',
              'report_reason', '${reason}'
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
  };

  const getSessionInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const deviceInfo = await getDeviceInfo();
      const ipAddress = await getClientIP();
      
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
  };

  // Auto-record login activity when hook is first used
  useEffect(() => {
    const initializeLoginTracking = async () => {
      try {
        // Check if we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if this session is already recorded
          const { data: existingActivity } = await supabase
            .from('login_activities')
            .select('id')
            .eq('session_id', session.access_token)
            .eq('is_current', true)
            .single();
          
          if (!existingActivity) {
            // Record this login activity
            await recordLoginActivity(session.access_token);
          }
        }
      } catch (err) {
        console.warn('Could not initialize login tracking:', err);
      }
      
      // Fetch existing activities regardless
      await fetchLoginActivities();
    };
    
    initializeLoginTracking();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            await recordLoginActivity(session.access_token);
          } catch (err) {
            console.warn('Could not record login activity:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setLoginActivities([]);
        }
      }
    );

    return () => subscription.unsubscribe();
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