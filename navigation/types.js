// =============================================================================
// NAVIGATION CONSTANTS
// =============================================================================

export const SCREEN_NAMES = {
  // =============================================================================
  // ONBOARDING FLOW
  // =============================================================================
  SPLASH: 'SplashScreen',
  ONBOARDING: 'OnboardingScreen',
  GET_STARTED: 'GetStartedScreen',
  
  // =============================================================================
  // AUTHENTICATION FLOW
  // =============================================================================
  LOGIN: 'LoginScreen',
  REGISTER: 'RegisterScreen',
  FORGOT_PASSWORD: 'ForgotPasswordScreen',
  OTP: 'OTPScreen',
  SUCCESS: 'SuccessScreen',
  DELETE_ACCOUNT: 'DeleteAccountScreen',
  LOGIN_ACTIVITY: 'LoginActivity',
  
  // =============================================================================
  // MAIN APPLICATION TABS
  // =============================================================================
  HOME: 'HomeScreen',
  BROWSE: 'BrowseScreen',
  LIBRARY: 'LibraryScreen',
  SEARCH: 'SearchScreen',
  
  // =============================================================================
  // CONTENT & DETAILS
  // =============================================================================
  DETAILS: 'PodcastDetailsScreen',
  EDETAILS: 'EposideDetailsScreen',
  
  // =============================================================================
  // MEDIA PLAYER & QUEUE
  // =============================================================================
  PLAYER: 'PlayerScreen',
  QUEUE: 'QueueScreen',
  EQUALIZER: 'EqualizerScreen',
  
  // =============================================================================
  // USER PROFILE
  // =============================================================================
  PROFILE: 'ProfileScreen',
  EDIT_PROFILE: 'EditProfileScreen',
  GOODBYE: 'GoodbyeScreen',
  
  // =============================================================================
  // SETTINGS & PREFERENCES
  // =============================================================================
  SETTINGS: 'SettingsScreen',
  NOTIFICATIONS: 'NotificationsScreen',
  PRIVACY: 'PrivacyScreen',
  SUBSCRIPTION: 'SubscriptionScreen',
  SUPPORT: 'SupportScreen',
  TERMS: 'TermsScreen',
  ABOUT: 'AboutScreen',
  NOTES: 'ReleaseNotes',
  
  // =============================================================================
  // SOCIAL FEATURES
  // =============================================================================
  LIVE_CHAT: 'LiveChatScreen',
  
  // =============================================================================
  // NAVIGATION STACKS
  // =============================================================================
  ONBOARDING_STACK: 'OnboardingStack',
  AUTH_STACK: 'AuthStack',
  MAIN_STACK: 'MainStack',
  TABS_STACK: 'TabsStack',
};

/**
 * Default navigation configuration
 * Common settings applied across the app
 */
export const NAVIGATION_CONFIG = {
  defaultScreenOptions: {
    headerShown: false,
    gestureEnabled: true,
    animation: 'slide_from_right',
  },
  
  tabBarConfig: {
    height: 64,
    borderRadius: 32,
    margin: 20,
    bottomOffset: 24,
  },
  
  // Additional animation presets
  animations: {
    modal: 'slide_from_bottom',
    fade: 'fade',
    none: 'none',
  },
};

export const TAB_CONFIG = [
  {
    name: SCREEN_NAMES.HOME,
    label: 'Home',
    icon: 'home',
    iconOutline: 'home-outline',
    badge: null, 
  },
  {
    name: SCREEN_NAMES.BROWSE,
    label: 'Browse',
    icon: 'grid',
    iconOutline: 'grid-outline',
    badge: null,
  },
  {
    name: SCREEN_NAMES.LIBRARY,
    label: 'Library',
    icon: 'library',
    iconOutline: 'library-outline',
    badge: null,
  },
  {
    name: SCREEN_NAMES.SEARCH,
    label: 'Search',
    icon: 'search',
    iconOutline: 'search-outline',
    badge: null,
  },
];


export const SCREEN_GROUPS = {
  ONBOARDING: [
    SCREEN_NAMES.SPLASH,
    SCREEN_NAMES.ONBOARDING,
    SCREEN_NAMES.GET_STARTED,
  ],
  
  AUTH: [
    SCREEN_NAMES.LOGIN,
    SCREEN_NAMES.REGISTER,
    SCREEN_NAMES.FORGOT_PASSWORD,
    SCREEN_NAMES.OTP,
    SCREEN_NAMES.SUCCESS,
    SCREEN_NAMES.DELETE_ACCOUNT,
    SCREEN_NAMES.LOGIN_ACTIVITY,
  ],
  
  MAIN_TABS: [
    SCREEN_NAMES.HOME,
    SCREEN_NAMES.BROWSE,
    SCREEN_NAMES.LIBRARY,
    SCREEN_NAMES.SEARCH,
  ],
  
  PROFILE: [
    SCREEN_NAMES.PROFILE,
    SCREEN_NAMES.EDIT_PROFILE,
    SCREEN_NAMES.GOODBYE,
  ],
  
  SETTINGS: [
    SCREEN_NAMES.SETTINGS,
    SCREEN_NAMES.NOTIFICATIONS,
    SCREEN_NAMES.PRIVACY,
    SCREEN_NAMES.SUBSCRIPTION,
    SCREEN_NAMES.SUPPORT,
    SCREEN_NAMES.TERMS,
    SCREEN_NAMES.ABOUT,
    SCREEN_NAMES.NOTES,
  ],
  
  MEDIA: [
    SCREEN_NAMES.PLAYER,
    SCREEN_NAMES.QUEUE,
    SCREEN_NAMES.EQUALIZER,
  ],
  
  MODAL: [
    SCREEN_NAMES.PLAYER,
    SCREEN_NAMES.QUEUE,
    SCREEN_NAMES.PROFILE,
    SCREEN_NAMES.SETTINGS,
    SCREEN_NAMES.EQUALIZER,
  ],
};

/**
 * Helper functions for navigation logic
 */
export const NavigationHelpers = {
  
  
  isScreenInGroup: (screenName, groupName) => {
    return SCREEN_GROUPS[groupName]?.includes(screenName) || false;
  },


  isTabScreen: (screenName) => {
    return SCREEN_GROUPS.MAIN_TABS.includes(screenName);
  },


  isModalScreen: (screenName) => {
    return SCREEN_GROUPS.MODAL.includes(screenName);
  },

  getTabConfig: (screenName) => {
    return TAB_CONFIG.find(tab => tab.name === screenName);
  },
};