export const SCREEN_NAMES = {
  // Onboarding
  SPLASH: 'SplashScreen',
  ONBOARDING: 'OnboardingScreen',
  GET_STARTED: 'GetStartedScreen',
  
  // Auth
  LOGIN: 'LoginScreen',
  REGISTER: 'RegisterScreen',
  FORGOT_PASSWORD: 'ForgotPasswordScreen',
  OTP: 'OTPScreen',
  SUCCESS: 'SuccessScreen',
  DELETE_ACCOUNT: 'DeleteAccountScreen',
  LOGIN_ACTIVITY: 'LoginActivity',
  
  // Main Tabs
  HOME: 'HomeScreen',
  BROWSE: 'BrowseScreen',
  LIBRARY: 'LibraryScreen',
  SEARCH: 'SearchScreen',
  
  // Modal/Overlay Screens
  PROFILE: 'ProfileScreen',
  PLAYER: 'PlayerScreen',
  QUEUE: 'QueueScreen',
  SETTINGS: 'SettingsScreen',
  EQUALIZER: 'EqualizerScreen',

  //Profile Screens
    EDIT_PROFILE: 'EditProfileScreen',
    PRIVACY: 'PrivacyScreen',
    SUBSCRIPTION: 'SubscriptionScreen',
    SUPPORT: 'SupportScreen',
    TERMS: 'TermsScreen',
    ABOUT: 'AboutScreen',
    NOTES: 'ReleaseNotes',
    GOODBYE: 'GoodbyeScreen',

    //  Details Screens
    DETAILS: 'PodcastDetailsScreen',

    // Live Chat
    LIVE_CHAT: 'LiveChatScreen',
  
  // Stack Names
  ONBOARDING_STACK: 'OnboardingStack',
  AUTH_STACK: 'AuthStack',
  MAIN_STACK: 'MainStack',
  TABS_STACK: 'TabsStack',
};

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
  }
};

export const TAB_CONFIG = [
  {
    name: SCREEN_NAMES.HOME,
    label: "Home",
    icon: "home",
    iconOutline: "home-outline",
  },
  {
    name: SCREEN_NAMES.BROWSE,
    label: "Browse",
    icon: "grid",
    iconOutline: "grid-outline",
  },
  {
    name: SCREEN_NAMES.LIBRARY,
    label: "Library",
    icon: "library",
    iconOutline: "library-outline",
  },
  {
    name: SCREEN_NAMES.SEARCH,
    label: "Search",
    icon: "search",
    iconOutline: "search-outline",
  },
];