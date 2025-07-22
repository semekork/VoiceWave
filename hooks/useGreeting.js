import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchHolidaysWithValidation } from './fetchHolidays';

const defaultGreetings = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
};

const defaultEmojis = {
  morning: '☀️',
  afternoon: '🌤️',
  evening: '🌇',
  night: '🌙',
};

const useGreeting = ({
  greetings = {},
  emojis = {},
  locale = undefined,
  timezone = undefined,
  manualHour = null,
  countryCode = 'GH', // Default to Ghana
} = {}) => {
  const getCurrentHour = useCallback(() => {
    if (manualHour !== null) return manualHour;
    const now = timezone
      ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
      : new Date();
    return now.getHours();
  }, [manualHour, timezone]);

  const [currentHour, setCurrentHour] = useState(getCurrentHour);
  const [holiday, setHoliday] = useState(null);

  const timeOfDay = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) return 'morning';
    if (currentHour >= 12 && currentHour < 18) return 'afternoon';
    if (currentHour >= 18 && currentHour < 22) return 'evening';
    return 'night';
  }, [currentHour]);

  const greeting = useMemo(() => {
    if (holiday) return `Happy ${holiday.localName}!`;
    return greetings[timeOfDay] || defaultGreetings[timeOfDay];
  }, [holiday, greetings, timeOfDay]);

  const emoji = useMemo(() => {
    return emojis[timeOfDay] || defaultEmojis[timeOfDay];
  }, [emojis, timeOfDay]);

  const updateCurrentHour = useCallback(() => {
    const newHour = getCurrentHour();
    setCurrentHour((prev) => (prev !== newHour ? newHour : prev));
  }, [getCurrentHour]);

  useEffect(() => {
    if (manualHour !== null) return;

    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const msUntilNextHour = nextHour - now;

    let intervalId;

    const timeoutId = setTimeout(() => {
      updateCurrentHour();
      intervalId = setInterval(updateCurrentHour, 60 * 60 * 1000);
    }, msUntilNextHour);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateCurrentHour, manualHour]);

  useEffect(() => {
    const fetchTodayHoliday = async () => {
      const year = new Date().getFullYear();
      const holidays = await fetchHolidaysWithValidation(year, countryCode);
      const today = timezone
        ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
        : new Date();
      const todayStr = today.toISOString().split('T')[0];
      const match = holidays.find(h => h.date === todayStr);
      setHoliday(match || null);
    };

    fetchTodayHoliday();
  }, [currentHour, countryCode, timezone]);

  const refreshGreeting = useCallback(() => {
    updateCurrentHour();
  }, [updateCurrentHour]);

  return {
    greeting,
    timeOfDay,
    emoji,
    currentHour,
    holiday,
    refreshGreeting,
  };
};

export default useGreeting;