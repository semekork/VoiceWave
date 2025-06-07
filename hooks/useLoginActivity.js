// hooks/useLoginActivity.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useLoginActivity = () => {
  const [loginActivities, setLoginActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLoginActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_user_login_activities', {
        limit_count: 20
      });

      if (error) throw error;
      
      // Transform the data to match your component's expected format
      const transformedData = data.map(activity => ({
        id: activity.id,
        device: activity.device_info?.device_type || 'Unknown Device',
        location: activity.location?.city && activity.location?.country 
          ? `${activity.location.city}, ${activity.location.country}`
          : activity.location?.country || 'Unknown Location',
        time: activity.time_ago,
        current: activity.is_current,
        ip: activity.ip_address || 'Unknown',
        browser: activity.device_info?.browser || 'Unknown',
        sessionId: activity.session_id,
        loginTime: activity.login_time,
        suspicious: checkSuspiciousActivity(activity),
        rawData: activity
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
      // Get user's IP and location (you might want to use a service like ipapi.co)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const locationResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
      const locationData = await locationResponse.json();

      const { data, error } = await supabase.rpc('record_login_activity', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_ip_address: ipData.ip,
        p_user_agent: navigator.userAgent,
        p_location: {
          city: locationData.city,
          region: locationData.region,
          country: locationData.country_name,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        p_session_id: sessionId || generateSessionId()
      });

      if (error) throw error;
      
      // Refresh the activities list
      await fetchLoginActivities();
      
      return data;
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
      const currentSession = loginActivities.find(activity => activity.current);
      const otherSessions = loginActivities.filter(activity => !activity.current && activity.sessionId);
      
      const promises = otherSessions.map(session => 
        supabase.rpc('end_login_session', { p_session_id: session.sessionId })
      );
      
      await Promise.all(promises);
      
      // Refresh the activities list
      await fetchLoginActivities();
      
      return true;
    } catch (err) {
      console.error('Error ending all sessions:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLoginActivities();
  }, []);

  return {
    loginActivities,
    loading,
    error,
    fetchLoginActivities,
    recordLoginActivity,
    endSession,
    endAllOtherSessions,
    refresh: fetchLoginActivities
  };
};

// Utility functions
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

const checkSuspiciousActivity = (activity) => {
  if (!activity.location || !activity.device_info) return false;
  
  // Simple suspicious activity detection
  // You can enhance this with more sophisticated logic
  const now = new Date();
  const loginTime = new Date(activity.login_time);
  const timeDiff = now - loginTime;
  
  // Flag as suspicious if:
  // 1. Login from a country that's very different from usual
  // 2. Multiple logins from different locations within a short time
  // 3. Unusual user agent patterns
  
  // For now, we'll use a simple heuristic
  const unusualLocations = ['Unknown Location'];
  const isUnusualLocation = unusualLocations.includes(
    activity.location?.city && activity.location?.country 
      ? `${activity.location.city}, ${activity.location.country}`
      : activity.location?.country || 'Unknown Location'
  );
  
  return isUnusualLocation;
};
