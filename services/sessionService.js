
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { STORAGE_KEYS } from '../constants/appContants';

class SessionService {
  constructor() {
    this.sessionCache = new Map();
    this.sessionTimers = new Map();
    this.isInitialized = false;
  }

  // Initialize session service
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load saved sessions from storage
      await this.loadSavedSessions();
      
      // Set up session cleanup timers
      this.setupSessionCleanup();
      
      this.isInitialized = true;
      console.log('Session service initialized');
    } catch (error) {
      console.error('Error initializing session service:', error);
    }
  }

  // Save current session
  async saveCurrentSession(sessionData = null) {
    try {
      let session = sessionData;
      
      if (!session) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        session = currentSession;
      }
      
      if (!session) {
        throw new Error('No active session to save');
      }

      const sessionInfo = {
        sessionId: session.access_token,
        userId: session.user.id,
        userEmail: session.user.email,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        savedAt: Date.now(),
        deviceInfo: await this.getDeviceInfo(),
        isActive: true
      };

      // Save to cache
      this.sessionCache.set(sessionInfo.sessionId, sessionInfo);
      
      // Save to AsyncStorage
      await this.saveSessionToStorage(sessionInfo);
      
      // Update session list
      await this.updateSessionsList(sessionInfo);
      
      console.log('Session saved successfully:', sessionInfo.sessionId);
      return { success: true, sessionId: sessionInfo.sessionId };
      
    } catch (error) {
      console.error('Error saving session:', error);
      return { success: false, error: error.message };
    }
  }

  // Load all saved sessions
  async loadSavedSessions() {
    try {
      const sessionsListJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_SESSIONS_LIST);
      
      if (!sessionsListJson) {
        return [];
      }
      
      const sessionsList = JSON.parse(sessionsListJson);
      const validSessions = [];
      
      // Load each session and validate
      for (const sessionId of sessionsList) {
        try {
          const sessionData = await this.loadSessionFromStorage(sessionId);
          
          if (sessionData && this.isSessionValid(sessionData)) {
            this.sessionCache.set(sessionId, sessionData);
            validSessions.push(sessionData);
          } else {
            // Remove invalid session
            await this.removeSessionFromStorage(sessionId);
          }
        } catch (error) {
          console.warn('Error loading session:', sessionId, error);
          await this.removeSessionFromStorage(sessionId);
        }
      }
      
      // Update sessions list with only valid sessions
      await this.updateSessionsListArray(validSessions.map(s => s.sessionId));
      
      return validSessions;
    } catch (error) {
      console.error('Error loading saved sessions:', error);
      return [];
    }
  }

  // Get all saved sessions
  async getSavedSessions() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const sessions = Array.from(this.sessionCache.values());
      
      // Filter out expired sessions
      const validSessions = sessions.filter(session => this.isSessionValid(session));
      
      // Sort by most recently used
      return validSessions.sort((a, b) => (b.lastUsed || b.savedAt) - (a.lastUsed || a.savedAt));
      
    } catch (error) {
      console.error('Error getting saved sessions:', error);
      return [];
    }
  }

  // Switch to a saved session
  async switchToSession(sessionId) {
    try {
      const sessionData = this.sessionCache.get(sessionId) || 
                          await this.loadSessionFromStorage(sessionId);
      
      if (!sessionData) {
        throw new Error('Session not found');
      }
      
      if (!this.isSessionValid(sessionData)) {
        await this.removeSession(sessionId);
        throw new Error('Session has expired');
      }
      
      // Set the session in Supabase
      const { error } = await supabase.auth.setSession({
        access_token: sessionData.sessionId,
        refresh_token: sessionData.refreshToken
      });
      
      if (error) {
        throw error;
      }
      
      // Update last used timestamp
      sessionData.lastUsed = Date.now();
      await this.saveSessionToStorage(sessionData);
      this.sessionCache.set(sessionId, sessionData);
      
      console.log('Switched to session successfully:', sessionId);
      return { success: true, sessionData };
      
    } catch (error) {
      console.error('Error switching to session:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove a saved session
  async removeSession(sessionId) {
    try {
      // Remove from cache
      this.sessionCache.delete(sessionId);
      
      // Remove from storage
      await this.removeSessionFromStorage(sessionId);
      
      // Update sessions list
      const currentList = await this.getSessionsList();
      const updatedList = currentList.filter(id => id !== sessionId);
      await this.updateSessionsListArray(updatedList);
      
      // Clear any timers
      if (this.sessionTimers.has(sessionId)) {
        clearTimeout(this.sessionTimers.get(sessionId));
        this.sessionTimers.delete(sessionId);
      }
      
      console.log('Session removed successfully:', sessionId);
      return { success: true };
      
    } catch (error) {
      console.error('Error removing session:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all saved sessions
  async clearAllSessions() {
    try {
      const sessionsList = await this.getSessionsList();
      
      // Remove all session data
      for (const sessionId of sessionsList) {
        await this.removeSessionFromStorage(sessionId);
        this.sessionCache.delete(sessionId);
        
        if (this.sessionTimers.has(sessionId)) {
          clearTimeout(this.sessionTimers.get(sessionId));
          this.sessionTimers.delete(sessionId);
        }
      }
      
      // Clear sessions list
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_SESSIONS_LIST);
      
      console.log('All sessions cleared');
      return { success: true };
      
    } catch (error) {
      console.error('Error clearing all sessions:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current active session info
  async getCurrentSessionInfo() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      return {
        sessionId: session.access_token,
        userId: session.user.id,
        userEmail: session.user.email,
        expiresAt: session.expires_at,
        isActive: true
      };
    } catch (error) {
      console.error('Error getting current session info:', error);
      return null;
    }
  }

  // Private helper methods
  async saveSessionToStorage(sessionData) {
    const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionData.sessionId}`;
    await AsyncStorage.setItem(key, JSON.stringify(sessionData));
  }

  async loadSessionFromStorage(sessionId) {
    try {
      const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
      const sessionJson = await AsyncStorage.getItem(key);
      return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (error) {
      console.error('Error loading session from storage:');
      return null;
    }
  }

  async removeSessionFromStorage(sessionId) {
    const key = `${STORAGE_KEYS.SESSION_PREFIX}${sessionId}`;
    await AsyncStorage.removeItem(key);
  }

  async updateSessionsList(sessionInfo) {
    try {
      const currentList = await this.getSessionsList();
      
      // Add new session if not already in list
      if (!currentList.includes(sessionInfo.sessionId)) {
        currentList.push(sessionInfo.sessionId);
        await this.updateSessionsListArray(currentList);
      }
    } catch (error) {
      console.error('Error updating sessions list:', error);
    }
  }

  async updateSessionsListArray(sessionsList) {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_SESSIONS_LIST, JSON.stringify(sessionsList));
  }

  async getSessionsList() {
    try {
      const sessionsListJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_SESSIONS_LIST);
      return sessionsListJson ? JSON.parse(sessionsListJson) : [];
    } catch (error) {
      console.error('Error getting sessions list:', error);
      return [];
    }
  }

  isSessionValid(sessionData) {
    if (!sessionData || !sessionData.expiresAt) {
      return false;
    }
    
    // Check if session has expired
    const expirationTime = sessionData.expiresAt * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutesBuffer = 5 * 60 * 1000; // 5 minutes buffer
    
    return currentTime < (expirationTime - fiveMinutesBuffer);
  }

  async getDeviceInfo() {
    try {
      // Basic device info for session identification
      return {
        platform: Platform.OS,
        version: Platform.Version,
        userAgent: navigator?.userAgent || 'Unknown',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return { platform: 'unknown', timestamp: Date.now() };
    }
  }

  setupSessionCleanup() {
    // Clean up expired sessions every hour
    setInterval(async () => {
      try {
        const sessions = Array.from(this.sessionCache.values());
        const expiredSessions = sessions.filter(session => !this.isSessionValid(session));
        
        for (const session of expiredSessions) {
          await this.removeSession(session.sessionId);
        }
        
        if (expiredSessions.length > 0) {
          console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
        }
      } catch (error) {
        console.error('Error during session cleanup:', error);
      }
    }, 60 * 60 * 1000); // Every hour
  }

  // Export session data (for backup/sync purposes)
  async exportSessionData() {
    try {
      const sessions = await this.getSavedSessions();
      
      // Remove sensitive data before export
      const exportData = sessions.map(session => ({
        sessionId: session.sessionId,
        userId: session.userId,
        userEmail: session.userEmail,
        savedAt: session.savedAt,
        lastUsed: session.lastUsed,
        deviceInfo: session.deviceInfo,
        // Note: We don't export refresh tokens for security
      }));
      
      return {
        exportedAt: Date.now(),
        sessionsCount: exportData.length,
        sessions: exportData
      };
    } catch (error) {
      console.error('Error exporting session data:', error);
      return null;
    }
  }

  // Get session statistics
  async getSessionStats() {
    try {
      const sessions = await this.getSavedSessions();
      
      return {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.isActive).length,
        oldestSession: sessions.reduce((oldest, session) => 
          (!oldest || session.savedAt < oldest.savedAt) ? session : oldest, null
        ),
        newestSession: sessions.reduce((newest, session) => 
          (!newest || session.savedAt > newest.savedAt) ? session : newest, null
        ),
        totalUsers: new Set(sessions.map(s => s.userId)).size
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }
}

// Create singleton instance
export const sessionService = new SessionService();

// Export additional utility functions
export const SessionUtils = {
  formatSessionAge: (savedAt) => {
    const ageMs = Date.now() - savedAt;
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ageMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  },
  
  getSessionDisplayName: (sessionData) => {
    const deviceInfo = sessionData.deviceInfo;
    const email = sessionData.userEmail;
    const platform = deviceInfo?.platform || 'Unknown';
    
    return `${email} (${platform})`;
  },
  
  isSessionExpiringSoon: (sessionData, hoursThreshold = 2) => {
    if (!sessionData.expiresAt) return false;
    
    const expirationTime = sessionData.expiresAt * 1000;
    const currentTime = Date.now();
    const thresholdMs = hoursThreshold * 60 * 60 * 1000;
    
    return (expirationTime - currentTime) < thresholdMs;
  }
};