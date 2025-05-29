// hooks/useTabAnalytics.js
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTabAnalytics = () => {
  const logTabVisit = useCallback(async (tabName) => {
    try {
      const visits = await AsyncStorage.getItem('tabVisits');
      const tabVisits = visits ? JSON.parse(visits) : {};
      tabVisits[tabName] = (tabVisits[tabName] || 0) + 1;
      tabVisits[`${tabName}_lastVisit`] = new Date().toISOString();
      await AsyncStorage.setItem('tabVisits', JSON.stringify(tabVisits));
    } catch (error) {
      console.log('Error logging tab visit:', error);
    }
  }, []);

  const getTabVisits = useCallback(async () => {
    try {
      const visits = await AsyncStorage.getItem('tabVisits');
      return visits ? JSON.parse(visits) : {};
    } catch (error) {
      console.log('Error getting tab visits:', error);
      return {};
    }
  }, []);

  const clearTabAnalytics = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('tabVisits');
    } catch (error) {
      console.log('Error clearing tab analytics:', error);
    }
  }, []);

  return { 
    logTabVisit, 
    getTabVisits, 
    clearTabAnalytics 
  };
};