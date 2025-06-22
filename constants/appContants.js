
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CURRENT_SESSION_ID: 'current_session_id',
  USER_DATA: '@app_user_data',
  AUTH_TOKEN: '@app_auth_token',
  LAST_LOGIN_TIME: '@app_last_login_time',
  SAVED_SESSIONS_LIST: '@app_saved_sessions_list',
  SESSION_PREFIX: '@app_session_',
  SESSION_SETTINGS: '@app_session_settings',
  AUTO_SAVE_ENABLED: '@app_auto_save_enabled',
  SESSION_CLEANUP_LAST_RUN: '@app_session_cleanup_last_run',
};

export const APP_STATES = {
  ONBOARDING: 'ONBOARDING',
  AUTHENTICATION: 'AUTHENTICATION',
  MAIN_APP: 'MAIN_APP',
  ERROR: 'ERROR',
  OFFLINE: 'OFFLINE',
};

export const SESSION_SETTINGS = {
  MAX_SAVED_SESSIONS: 10,
  AUTO_SAVE_DELAY: 2000, 
  SESSION_EXPIRY_BUFFER: 5 * 60 * 1000,
  CLEANUP_INTERVAL: 60 * 60 * 1000, 
  MAX_SESSION_AGE: 30 * 24 * 60 * 60 * 1000,
};


export const SESSION_TYPES = {
  MANUAL: 'manual',
  AUTO_SAVED: 'auto_saved',
  QUICK_SWITCH: 'quick_switch',
  BACKGROUND_SAVE: 'background_save'
};