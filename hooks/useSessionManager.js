// hooks/useSessionManager.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionService, SessionUtils } from '../services/sessionService';
import { useAuth } from './useAuth';
import { AppState } from 'react-native';

export const useSessionManager = () => {
  const [savedSessions, setSavedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { user, session } = useAuth();
  const initializationRef = useRef(false);
  const autoSaveTimerRef = useRef(null);

  // Initialize session manager
  const initialize = useCallback(async () => {
    if (initializationRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await sessionService.initialize();
      
      const sessions = await sessionService.getSavedSessions();
      setSavedSessions(sessions);
      
      initializationRef.current = true;
      setIsInitialized(true);
      
      console.log('Session manager initialized with', sessions.length, 'sessions');
    } catch (err) {
      console.error('Error initializing session manager:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-save current session
  const autoSaveCurrentSession = useCallback(async () => {
    if (!session || !user) return;
    
    try {
      const result = await sessionService.saveCurrentSession(session);
      
      if (result.success) {
        // Refresh saved sessions list
        const sessions = await sessionService.getSavedSessions();
        setSavedSessions(sessions);
      }
    } catch (err) {
      console.warn('Auto-save session failed:', err);
    }
  }, [session, user]);

  // Save current session manually
  const saveCurrentSession = useCallback(async () => {
    if (!session) {
      setError('No active session to save');
      return { success: false, error: 'No active session to save' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await sessionService.saveCurrentSession(session);
      
      if (result.success) {
        // Refresh saved sessions list
        const sessions = await sessionService.getSavedSessions();
        setSavedSessions(sessions);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Error saving session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Switch to a saved session
  const switchToSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await sessionService.switchToSession(sessionId);
      
      if (result.success) {
        // Refresh saved sessions list to update last used timestamps
        const sessions = await sessionService.getSavedSessions();
        setSavedSessions(sessions);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Error switching session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove a saved session
  const removeSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await sessionService.removeSession(sessionId);
      
      if (result.success) {
        // Refresh saved sessions list
        const sessions = await sessionService.getSavedSessions();
        setSavedSessions(sessions);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Error removing session:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear all saved sessions
  const clearAllSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await sessionService.clearAllSessions();
      
      if (result.success) {
        setSavedSessions([]);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error('Error clearing all sessions:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh saved sessions list
  const refreshSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessions = await sessionService.getSavedSessions();
      setSavedSessions(sessions);
    } catch (err) {
      console.error('Error refreshing sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async () => {
    try {
      return await sessionService.getSessionStats();
    } catch (err) {
      console.error('Error getting session stats:', err);
      return null;
    }
  }, []);

  // Export session data
  const exportSessionData = useCallback(async () => {
    try {
      return await sessionService.exportSessionData();
    } catch (err) {
      console.error('Error exporting session data:', err);
      return null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auto-save session when user logs in
  useEffect(() => {
    if (isInitialized && session && user) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Auto-save after a short delay to avoid conflicts
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveCurrentSession();
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isInitialized, session, user, autoSaveCurrentSession]);

  // Handle app state changes for auto-save
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' && session) {
        // Auto-save when app goes to background
        autoSaveCurrentSession();
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [session, autoSaveCurrentSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Helper functions
  const getCurrentSession = useCallback(() => {
    return sessionService.getCurrentSessionInfo();
  }, []);

  const isSessionValid = useCallback((sessionData) => {
    return sessionService.isSessionValid(sessionData);
  }, []);

  const getSessionDisplayName = useCallback((sessionData) => {
    return SessionUtils.getSessionDisplayName(sessionData);
  }, []);

  const formatSessionAge = useCallback((savedAt) => {
    return SessionUtils.formatSessionAge(savedAt);
  }, []);

  const isSessionExpiringSoon = useCallback((sessionData, hoursThreshold = 2) => {
    return SessionUtils.isSessionExpiringSoon(sessionData, hoursThreshold);
  }, []);

  // Get sessions grouped by user
  const getSessionsByUser = useCallback(() => {
    const grouped = {};
    
    savedSessions.forEach(session => {
      const userId = session.userId;
      if (!grouped[userId]) {
        grouped[userId] = {
          userEmail: session.userEmail,
          sessions: []
        };
      }
      grouped[userId].sessions.push(session);
    });
    
    return grouped;
  }, [savedSessions]);

  // Get active sessions count
  const getActiveSessionsCount = useCallback(() => {
    return savedSessions.filter(session => session.isActive).length;
  }, [savedSessions]);

  // Check if current session is saved
  const isCurrentSessionSaved = useCallback(() => {
    if (!session) return false;
    
    return savedSessions.some(savedSession => 
      savedSession.sessionId === session.access_token
    );
  }, [session, savedSessions]);

  return {
    // State
    savedSessions,
    loading,
    error,
    isInitialized,
    
    // Core session management
    saveCurrentSession,
    switchToSession,
    removeSession,
    clearAllSessions,
    refreshSessions,
    
    // Utility functions
    getCurrentSession,
    isSessionValid,
    getSessionDisplayName,
    formatSessionAge,
    isSessionExpiringSoon,
    getSessionsByUser,
    getActiveSessionsCount,
    isCurrentSessionSaved,
    
    // Statistics and export
    getSessionStats,
    exportSessionData,
    
    // Auto-save control
    autoSaveCurrentSession
  };
};