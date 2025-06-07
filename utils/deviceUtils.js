export const getDeviceIcon = (device) => {
  const deviceLower = device.toLowerCase();
  
  if (deviceLower.includes('iphone')) return 'phone-portrait';
  if (deviceLower.includes('ipad')) return 'tablet-portrait';
  if (deviceLower.includes('macbook') || deviceLower.includes('mac')) return 'laptop';
  if (deviceLower.includes('android') && deviceLower.includes('phone')) return 'phone-portrait';
  if (deviceLower.includes('android')) return 'tablet-portrait';
  if (deviceLower.includes('windows')) return 'desktop';
  if (deviceLower.includes('linux')) return 'desktop';
  
  return 'device-desktop';
};

export const formatTimeAgo = (timeString) => {
  const now = new Date();
  const time = new Date(timeString);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};

// Enhanced suspicious activity detection
export const detectSuspiciousPatterns = (activities) => {
  const suspiciousActivities = [];
  
  activities.forEach((activity, index) => {
    let suspiciousScore = 0;
    let reasons = [];
    
    // Check for rapid location changes
    if (index > 0) {
      const prevActivity = activities[index - 1];
      const timeDiff = new Date(prevActivity.loginTime) - new Date(activity.loginTime);
      const locationDiff = activity.location !== prevActivity.location;
      
      if (locationDiff && timeDiff < 3600000) { // Less than 1 hour
        suspiciousScore += 3;
        reasons.push('Rapid location change');
      }
    }
    
    // Check for unusual times (e.g., 2-5 AM local time)
    const loginHour = new Date(activity.loginTime).getHours();
    if (loginHour >= 2 && loginHour <= 5) {
      suspiciousScore += 1;
      reasons.push('Unusual login time');
    }
    
    // Check for unknown or suspicious user agents
    if (activity.browser === 'Unknown' || activity.device === 'Unknown Device') {
      suspiciousScore += 2;
      reasons.push('Unknown device/browser');
    }
    
    // Mark as suspicious if score is high enough
    if (suspiciousScore >= 3) {
      suspiciousActivities.push({
        ...activity,
        suspicious: true,
        suspiciousReasons: reasons,
        suspiciousScore
      });
    }
  });
  
  return suspiciousActivities;
};