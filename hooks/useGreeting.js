import { useState, useEffect } from 'react';

/**
 * A custom hook that provides greeting functionality based on time of day
 * @param {string} userName - Optional name to personalize the greeting
 * @returns {object} An object containing greeting state and functions
 */
const useGreeting = (userName = '') => {
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Generate appropriate greeting based on time of day
  useEffect(() => {
    const generateGreeting = () => {
      setIsLoading(true);
      
      const currentHour = new Date().getHours();
      let newGreeting = '';
      let newTimeOfDay = '';
      
      if (currentHour >= 5 && currentHour < 12) {
        newGreeting = 'Good morning';
        newTimeOfDay = 'morning';
      } else if (currentHour >= 12 && currentHour < 18) {
        newGreeting = 'Good afternoon';
        newTimeOfDay = 'afternoon';
      } else {
        newGreeting = 'Good evening';
        newTimeOfDay = 'evening';
      }
      
      if (userName) {
        newGreeting += `, ${userName}`;
      }
      
      setGreeting(newGreeting);
      setTimeOfDay(newTimeOfDay);
      setIsLoading(false);
    };
    
    // Generate greeting immediately
    generateGreeting();
    
    // Set up interval to update greeting every minute
    const intervalId = setInterval(generateGreeting, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [userName]);
  
  /**
   * Update the username in the greeting
   * @param {string} newName - New name to use in greeting
   */
  const updateUserName = (newName) => {
    // This will trigger the useEffect to run again with the new name
    userName = newName;
  };
  
  /**
   * Force refresh the greeting
   */
  const refreshGreeting = () => {
    const currentHour = new Date().getHours();
    let newGreeting = '';
    let newTimeOfDay = '';
    
    if (currentHour >= 5 && currentHour < 12) {
      newGreeting = 'Good morning';
      newTimeOfDay = 'morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      newGreeting = 'Good afternoon';
      newTimeOfDay = 'afternoon';
    } else {
      newGreeting = 'Good evening';
      newTimeOfDay = 'evening';
    }
    
    if (userName) {
      newGreeting += `, ${userName}`;
    }
    
    setGreeting(newGreeting);
    setTimeOfDay(newTimeOfDay);
  };
  
  return { 
    greeting, 
    timeOfDay, 
    isLoading, 
    updateUserName,
    refreshGreeting
  };
};

export default useGreeting;