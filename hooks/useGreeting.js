import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * A custom hook that provides greeting functionality based on time of day
 * @returns {object} An object containing greeting state and functions
 */
const useGreeting = () => {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  // Memoized time of day calculation
  const timeOfDay = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 18) return 'afternoon';
    return 'evening';
  }, [currentHour]);

  // Memoized greeting calculation
  const greeting = useMemo(() => {
    if (timeOfDay === 'morning') return 'Good morning';
    if (timeOfDay === 'afternoon') return 'Good afternoon';
    return 'Good evening';
  }, [timeOfDay]);

  // Memoized function to update current hour
  const updateCurrentHour = useCallback(() => {
    const newHour = new Date().getHours();
    setCurrentHour(prevHour => prevHour !== newHour ? newHour : prevHour);
  }, []);

  // Set up interval to update greeting based on time changes
  useEffect(() => {
    // Calculate milliseconds until next hour
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const msUntilNextHour = nextHour.getTime() - now.getTime();

    // Set initial timeout to sync with hour boundaries
    const initialTimeout = setTimeout(() => {
      updateCurrentHour();
      
      // Then set up hourly interval
      const intervalId = setInterval(updateCurrentHour, 60 * 60 * 1000); // Every hour
      
      // Store interval ID for cleanup
      return () => clearInterval(intervalId);
    }, msUntilNextHour);

    // Clean up timeout on unmount
    return () => clearTimeout(initialTimeout);
  }, [updateCurrentHour]);

  // Memoized function to force refresh
  const refreshGreeting = useCallback(() => {
    updateCurrentHour();
  }, [updateCurrentHour]);

  return { 
    greeting, 
    timeOfDay, 
    refreshGreeting
  };
};

export default useGreeting;