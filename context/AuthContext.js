// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../services/loginService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const authData = useAuth();
  const [loginActivities, setLoginActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fetch login activities when user is authenticated
  useEffect(() => {
    if (authData.user && authData.loginService) {
      fetchLoginActivities();
    }
  }, [authData.user]);

  const fetchLoginActivities = async () => {
    if (!authData.loginService) return;
    
    setLoadingActivities(true);
    try {
      const { data, error } = await authData.loginService.getLoginActivities(20);
      if (!error && data) {
        setLoginActivities(data);
      }
    } catch (error) {
      console.error('Error fetching login activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const endSession = async (sessionId) => {
    if (!authData.loginService) return { error: 'Login service not available' };
    
    const result = await authData.loginService.endSession(sessionId);
    if (!result.error) {
      // Refresh activities after ending a session
      await fetchLoginActivities();
    }
    return result;
  };

  const endAllOtherSessions = async () => {
    if (!authData.loginService) return { error: 'Login service not available' };
    
    const result = await authData.loginService.endAllOtherSessions();
    if (!result.error) {
      // Refresh activities after ending sessions
      await fetchLoginActivities();
    }
    return result;
  };

  const reportSuspiciousActivity = async (activityId, reason) => {
    if (!authData.loginService) return { error: 'Login service not available' };
    
    return await authData.loginService.reportSuspiciousActivity(activityId, reason);
  };

  const validateCurrentSession = async () => {
    if (!authData.loginService) return false;
    
    return await authData.loginService.validateCurrentSession();
  };

  const contextValue = {
    // Auth state
    ...authData,
    
    // Login activities
    loginActivities,
    loadingActivities,
    refreshLoginActivities: fetchLoginActivities,
    
    // Session management
    endSession,
    endAllOtherSessions,
    validateCurrentSession,
    
    // Security
    reportSuspiciousActivity,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Hook for components that need auth state
export const useAuthState = () => {
  const { user, session, loading } = useAuthContext();
  return { user, session, loading };
};

// Hook for authentication actions
export const useAuthActions = () => {
  const { signIn, signUp, signOut } = useAuthContext();
  return { signIn, signUp, signOut };
};

// Hook for session management
export const useSessionManagement = () => {
  const {
    loginActivities,
    loadingActivities,
    refreshLoginActivities,
    endSession,
    endAllOtherSessions,
    validateCurrentSession,
    reportSuspiciousActivity,
  } = useAuthContext();

  return {
    loginActivities,
    loadingActivities,
    refreshLoginActivities,
    endSession,
    endAllOtherSessions,
    validateCurrentSession,
    reportSuspiciousActivity,
  };
};