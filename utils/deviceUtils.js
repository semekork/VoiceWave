// Enhanced device detection utilities
export const getDeviceIcon = (device) => {
  const deviceLower = device?.toLowerCase() || '';
  
  if (deviceLower.includes('iphone')) return 'phone-portrait';
  if (deviceLower.includes('ipad')) return 'tablet-portrait';
  if (deviceLower.includes('macbook') || deviceLower.includes('mac')) return 'laptop';
  if (deviceLower.includes('android') && deviceLower.includes('phone')) return 'phone-portrait';
  if (deviceLower.includes('android')) return 'tablet-portrait';
  if (deviceLower.includes('windows')) return 'desktop';
  if (deviceLower.includes('linux')) return 'desktop';
  if (deviceLower.includes('tablet')) return 'tablet-portrait';
  if (deviceLower.includes('mobile')) return 'phone-portrait';
  if (deviceLower.includes('desktop')) return 'desktop';
  
  return 'phone-portrait';
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

// Enhanced device detection from user agent
export const parseUserAgent = (userAgent) => {
  if (!userAgent) return getDefaultDeviceInfo();

  const ua = userAgent.toLowerCase();
  let deviceType = 'Unknown';
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceModel = 'Unknown';

  // Detect Operating System
  if (ua.includes('windows nt 10.0')) os = 'Windows 10';
  else if (ua.includes('windows nt 11.0')) os = 'Windows 11';
  else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
  else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
  else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os x')) {
    const macMatch = ua.match(/mac os x ([\d_]+)/);
    if (macMatch) {
      const version = macMatch[1].replace(/_/g, '.');
      os = `macOS ${version}`;
    } else {
      os = 'macOS';
    }
  }
  // Add simulator detection
  else if (ua.includes('simulator')) {
    if (ua.includes('iphone')) {
      os = 'iOS Simulator';
    } else if (ua.includes('ipad')) {
      os = 'iPadOS Simulator';
    } else if (ua.includes('android')) {
      os = 'Android Emulator';
    }
  }
  // Add Xamarin test detection
  else if (ua.includes('xamarin')) {
    if (ua.includes('ios')) {
      os = 'Xamarin iOS Test';
    } else if (ua.includes('android')) {
      os = 'Xamarin Android Test';
    }
  }
  else if (ua.includes('android')) {
    const androidMatch = ua.match(/android ([\d.]+)/);
    if (androidMatch) {
      os = `Android ${androidMatch[1]}`;
    } else {
      os = 'Android';
    }
  }
  else if (ua.includes('iphone os')) {
    const iosMatch = ua.match(/iphone os ([\d_]+)/);
    if (iosMatch) {
      const version = iosMatch[1].replace(/_/g, '.');
      os = `iOS ${version}`;
    } else {
      os = 'iOS';
    }
  }
  else if (ua.includes('ipad')) {
    const iosMatch = ua.match(/os ([\d_]+)/);
    if (iosMatch) {
      const version = iosMatch[1].replace(/_/g, '.');
      os = `iPadOS ${version}`;
    } else {
      os = 'iPadOS';
    }
  }
  else if (ua.includes('linux')) os = 'Linux';

  // Detect Browser
  if (ua.includes('edg/')) {
    const edgeMatch = ua.match(/edg\/([\d.]+)/);
    browser = edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';
  }
  else if (ua.includes('chrome/') && !ua.includes('edg')) {
    const chromeMatch = ua.match(/chrome\/([\d.]+)/);
    browser = chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';
  }
  else if (ua.includes('firefox/')) {
    const firefoxMatch = ua.match(/firefox\/([\d.]+)/);
    browser = firefoxMatch ? `Firefox ${firefoxMatch[1]}` : 'Firefox';
  }
  else if (ua.includes('safari/') && !ua.includes('chrome')) {
    const safariMatch = ua.match(/version\/([\d.]+)/);
    browser = safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';
  }
  else if (ua.includes('opera/') || ua.includes('opr/')) {
    const operaMatch = ua.match(/(?:opera|opr)\/([\d.]+)/);
    browser = operaMatch ? `Opera ${operaMatch[1]}` : 'Opera';
  }

  // Detect Device Type and Model
  if (ua.includes('iphone')) {
    deviceType = 'iPhone';
    const iphoneMatch = ua.match(/iphone(\d+,\d+)?/);
    if (iphoneMatch) {
      deviceModel = getIPhoneModel(iphoneMatch[1]) || 'iPhone';
    } else {
      deviceModel = 'iPhone';
    }
  }
  else if (ua.includes('ipad')) {
    deviceType = 'iPad';
    const ipadMatch = ua.match(/ipad(\d+,\d+)?/);
    if (ipadMatch) {
      deviceModel = getIPadModel(ipadMatch[1]) || 'iPad';
    } else {
      deviceModel = 'iPad';
    }
  }
  else if (ua.includes('macintosh')) {
    deviceType = 'Mac';
    if (ua.includes('intel')) deviceModel = 'Intel Mac';
    else if (ua.includes('ppc')) deviceModel = 'PowerPC Mac';
    else deviceModel = 'Mac';
  }
  else if (ua.includes('android')) {
    if (ua.includes('mobile')) {
      deviceType = 'Android Phone';
      // Try to extract device model
      const modelMatch = ua.match(/;\s*([^;)]+)\s*build/i);
      if (modelMatch) {
        deviceModel = modelMatch[1].trim();
      } else {
        deviceModel = 'Android Phone';
      }
    } else {
      deviceType = 'Android Tablet';
      const modelMatch = ua.match(/;\s*([^;)]+)\s*build/i);
      if (modelMatch) {
        deviceModel = modelMatch[1].trim();
      } else {
        deviceModel = 'Android Tablet';
      }
    }
  }
  else if (ua.includes('windows')) {
    if (ua.includes('touch') || ua.includes('tablet')) {
      deviceType = 'Windows Tablet';
      deviceModel = 'Windows Tablet';
    } else {
      deviceType = 'Windows PC';
      deviceModel = 'Windows PC';
    }
  }
  else if (ua.includes('linux')) {
    deviceType = 'Linux PC';
    deviceModel = 'Linux PC';
  }
  else if (ua.includes('mobile')) {
    deviceType = 'Mobile Device';
    deviceModel = 'Mobile Device';
  }
  else {
    deviceType = 'Desktop';
    deviceModel = 'Desktop Computer';
  }

  return {
    device_type: deviceModel,
    browser: browser,
    os: os,
    raw_user_agent: userAgent,
    detected_at: new Date().toISOString()
  };
};

// Helper function for iPhone model detection
const getIPhoneModel = (identifier) => {
  const models = {
    '10,1': 'iPhone 8',
    '10,2': 'iPhone 8 Plus',
    '10,3': 'iPhone X',
    '10,4': 'iPhone 8',
    '10,5': 'iPhone 8 Plus',
    '10,6': 'iPhone X',
    '16,1': 'iPhone 15',
    '16,2': 'iPhone 15 Plus',
    '16,3': 'iPhone 15 Pro',
    '16,4': 'iPhone 15 Pro Max',
    '14,4': 'iPhone 14',
    '14,5': 'iPhone 14 Plus',
    '14,7': 'iPhone 14 Pro',
    '14,8': 'iPhone 14 Pro Max',
    '14,2': 'iPhone 13 Pro',
    '14,3': 'iPhone 13 Pro Max',
    '14,5': 'iPhone 13',
    '14,6': 'iPhone 13 mini',
    '13,1': 'iPhone 12 mini',
    '13,2': 'iPhone 12',
    '13,3': 'iPhone 12 Pro',
    '13,4': 'iPhone 12 Pro Max',
    '12,1': 'iPhone 11',
    '12,3': 'iPhone 11 Pro',
    '12,5': 'iPhone 11 Pro Max',
    '11,2': 'iPhone XS',
    '11,4': 'iPhone XS Max',
    '11,6': 'iPhone XS Max Global',
    '11,8': 'iPhone XR',
  };
  return models[identifier] || 'iPhone';
};

// Helper function for iPad model detection
const getIPadModel = (identifier) => {
  const models = {
    '14,3': 'iPad Pro 12.9-inch (6th gen)',
    '14,4': 'iPad Pro 11-inch (4th gen)',
    '14,5': 'iPad Pro 12.9-inch (6th gen)',
    '14,6': 'iPad Pro 11-inch (4th gen)',
    '13,16': 'iPad Air (5th gen)',
    '13,17': 'iPad Air (5th gen)',
    '13,18': 'iPad (10th gen)',
    '13,19': 'iPad (10th gen)',
    '14,1': 'iPad mini (6th gen)',
    '14,2': 'iPad mini (6th gen)',
  };
  return models[identifier] || 'iPad';
};

// Get device info from browser APIs
export const getDeviceInfo = async () => {
  try {
    const deviceInfo = parseUserAgent(navigator.userAgent);
    
    // Add additional browser info if available
    if (navigator.platform) {
      deviceInfo.platform = navigator.platform;
    }
    
    if (navigator.languages) {
      deviceInfo.languages = navigator.languages;
    }
    
    if (screen) {
      deviceInfo.screen = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      };
    }
    
    if (navigator.hardwareConcurrency) {
      deviceInfo.cpu_cores = navigator.hardwareConcurrency;
    }
    
    if (navigator.deviceMemory) {
      deviceInfo.memory_gb = navigator.deviceMemory;
    }
    
    // Add timezone
    deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return deviceInfo;
  } catch (error) {
    console.error('Error getting device info:', error);
    return getDefaultDeviceInfo();
  }
};

// Get IP address from multiple sources
export const getClientIP = async () => {
  const ipServices = [
    'https://api.ipify.org?format=json',
    'https://ipapi.co/json/',
    'https://ipinfo.io/json',
    'https://api.myip.com'
  ];
  
  for (const service of ipServices) {
    try {
      const response = await fetch(service);
      const data = await response.json();
      
      // Different services return IP in different formats
      if (data.ip) return data.ip;
      if (data.query) return data.query;
      if (data.ipAddress) return data.ipAddress;
      
    } catch (error) {
      console.warn(`Failed to get IP from ${service}:`, error);
      continue;
    }
  }
  
  return null;
};

// Get location info from IP
export const getLocationFromIP = async (ip) => {
  if (!ip) return null;
  
  const locationServices = [
    `https://ipapi.co/${ip}/json/`,
    `https://ipinfo.io/${ip}/json`,
    `https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_API_KEY&ip=${ip}` // You'll need to get a free API key
  ];
  
  for (const service of locationServices) {
    try {
      const response = await fetch(service);
      const data = await response.json();
      
      if (data.city && data.country) {
        return {
          city: data.city,
          region: data.region || data.region_name,
          country: data.country_name || data.country,
          country_code: data.country_code || data.country,
          latitude: data.latitude || data.lat,
          longitude: data.longitude || data.lon,
          timezone: data.timezone,
          isp: data.org || data.isp,
          postal: data.postal
        };
      }
    } catch (error) {
      console.warn(`Failed to get location from ${service}:`, error);
      continue;
    }
  }
  
  return null;
};

// Default device info fallback
const getDefaultDeviceInfo = () => ({
  device_type: 'Unknown Device',
  browser: 'Unknown Browser',
  os: 'Unknown OS',
  raw_user_agent: navigator?.userAgent || 'Unknown',
  detected_at: new Date().toISOString()
});

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
    
    // Check for multiple logins from different countries within 24 hours
    const recentActivities = activities.filter(a => {
      const timeDiff = new Date(activity.loginTime) - new Date(a.loginTime);
      return Math.abs(timeDiff) < 86400000; // 24 hours
    });
    
    const uniqueCountries = [...new Set(recentActivities.map(a => a.location?.country))].filter(Boolean);
    if (uniqueCountries.length > 2) {
      suspiciousScore += 2;
      reasons.push('Multiple countries in 24h');
    }
    
    // Check for suspicious IP ranges (you can expand this)
    if (activity.ip_address) {
      const ip = activity.ip_address;
      if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
        // Private IP ranges might be suspicious if they're not consistent
        suspiciousScore += 0.5;
      }
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

// Validate IP address format
export const isValidIP = (ip) => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};