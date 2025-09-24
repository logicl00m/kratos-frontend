/**
 * Feature Flags Configuration
 * Centralized feature flag management for the application
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  environments?: string[];
  rolloutPercentage?: number;
  metadata?: Record<string, any>;
}

export interface FeatureFlagConfig {
  flags: Record<string, FeatureFlag>;
  defaultEnabled: boolean;
  environment: string;
}

/**
 * Feature flags definition
 */
export const FEATURE_FLAGS = {
  // API Features
  NEW_API_CLIENT: 'new_api_client',
  API_CACHING: 'api_caching',
  API_RETRY: 'api_retry',
  API_MOCK_MODE: 'api_mock_mode',

  // Authentication
  AUTH_REFRESH_TOKEN: 'auth_refresh_token',
  AUTH_BIOMETRIC: 'auth_biometric',
  AUTH_SSO: 'auth_sso',

  // Dashboard Features
  DASHBOARD_REAL_TIME: 'dashboard_real_time',
  DASHBOARD_ADVANCED_FILTERS: 'dashboard_advanced_filters',
  DASHBOARD_BULK_ACTIONS: 'dashboard_bulk_actions',
  DASHBOARD_EXPORT: 'dashboard_export',

  // Workflow Features
  WORKFLOW_TEMPLATES: 'workflow_templates',
  WORKFLOW_VERSION_CONTROL: 'workflow_version_control',
  WORKFLOW_COLLABORATION: 'workflow_collaboration',
  WORKFLOW_AI_SUGGESTIONS: 'workflow_ai_suggestions',

  // Performance
  LAZY_LOADING: 'lazy_loading',
  VIRTUAL_SCROLLING: 'virtual_scrolling',
  SERVICE_WORKER: 'service_worker',

  // Developer Tools
  DEBUG_MODE: 'debug_mode',
  PERFORMANCE_MONITORING: 'performance_monitoring',
  ERROR_TRACKING: 'error_tracking',
} as const;

export type FeatureFlagName = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

/**
 * Default feature flag configuration
 */
const defaultFeatureFlags: Record<FeatureFlagName, FeatureFlag> = {
  // API Features
  [FEATURE_FLAGS.NEW_API_CLIENT]: {
    name: FEATURE_FLAGS.NEW_API_CLIENT,
    enabled: true,
    description: 'Use the new modular API client',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.API_CACHING]: {
    name: FEATURE_FLAGS.API_CACHING,
    enabled: true,
    description: 'Enable API response caching',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.API_RETRY]: {
    name: FEATURE_FLAGS.API_RETRY,
    enabled: true,
    description: 'Enable automatic API retry on failure',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.API_MOCK_MODE]: {
    name: FEATURE_FLAGS.API_MOCK_MODE,
    enabled: import.meta.env.DEV,
    description: 'Use mock API responses for development',
    environments: ['development'],
  },

  // Authentication
  [FEATURE_FLAGS.AUTH_REFRESH_TOKEN]: {
    name: FEATURE_FLAGS.AUTH_REFRESH_TOKEN,
    enabled: true,
    description: 'Enable automatic token refresh',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.AUTH_BIOMETRIC]: {
    name: FEATURE_FLAGS.AUTH_BIOMETRIC,
    enabled: false,
    description: 'Enable biometric authentication',
    environments: ['production'],
    rolloutPercentage: 0,
  },
  [FEATURE_FLAGS.AUTH_SSO]: {
    name: FEATURE_FLAGS.AUTH_SSO,
    enabled: false,
    description: 'Enable Single Sign-On',
    environments: ['staging', 'production'],
    rolloutPercentage: 0,
  },

  // Dashboard Features
  [FEATURE_FLAGS.DASHBOARD_REAL_TIME]: {
    name: FEATURE_FLAGS.DASHBOARD_REAL_TIME,
    enabled: true,
    description: 'Enable real-time dashboard updates',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.DASHBOARD_ADVANCED_FILTERS]: {
    name: FEATURE_FLAGS.DASHBOARD_ADVANCED_FILTERS,
    enabled: true,
    description: 'Enable advanced filtering options',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.DASHBOARD_BULK_ACTIONS]: {
    name: FEATURE_FLAGS.DASHBOARD_BULK_ACTIONS,
    enabled: true,
    description: 'Enable bulk actions on dashboard',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.DASHBOARD_EXPORT]: {
    name: FEATURE_FLAGS.DASHBOARD_EXPORT,
    enabled: true,
    description: 'Enable data export functionality',
    environments: ['development', 'staging', 'production'],
  },

  // Workflow Features
  [FEATURE_FLAGS.WORKFLOW_TEMPLATES]: {
    name: FEATURE_FLAGS.WORKFLOW_TEMPLATES,
    enabled: true,
    description: 'Enable workflow templates',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.WORKFLOW_VERSION_CONTROL]: {
    name: FEATURE_FLAGS.WORKFLOW_VERSION_CONTROL,
    enabled: false,
    description: 'Enable workflow version control',
    environments: ['staging', 'production'],
    rolloutPercentage: 0,
  },
  [FEATURE_FLAGS.WORKFLOW_COLLABORATION]: {
    name: FEATURE_FLAGS.WORKFLOW_COLLABORATION,
    enabled: false,
    description: 'Enable real-time collaboration on workflows',
    environments: ['staging', 'production'],
    rolloutPercentage: 0,
  },
  [FEATURE_FLAGS.WORKFLOW_AI_SUGGESTIONS]: {
    name: FEATURE_FLAGS.WORKFLOW_AI_SUGGESTIONS,
    enabled: false,
    description: 'Enable AI-powered workflow suggestions',
    environments: ['production'],
    rolloutPercentage: 0,
  },

  // Performance
  [FEATURE_FLAGS.LAZY_LOADING]: {
    name: FEATURE_FLAGS.LAZY_LOADING,
    enabled: true,
    description: 'Enable lazy loading for components',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.VIRTUAL_SCROLLING]: {
    name: FEATURE_FLAGS.VIRTUAL_SCROLLING,
    enabled: true,
    description: 'Enable virtual scrolling for large lists',
    environments: ['development', 'staging', 'production'],
  },
  [FEATURE_FLAGS.SERVICE_WORKER]: {
    name: FEATURE_FLAGS.SERVICE_WORKER,
    enabled: false,
    description: 'Enable service worker for offline support',
    environments: ['production'],
  },

  // Developer Tools
  [FEATURE_FLAGS.DEBUG_MODE]: {
    name: FEATURE_FLAGS.DEBUG_MODE,
    enabled: import.meta.env.DEV,
    description: 'Enable debug mode with verbose logging',
    environments: ['development'],
  },
  [FEATURE_FLAGS.PERFORMANCE_MONITORING]: {
    name: FEATURE_FLAGS.PERFORMANCE_MONITORING,
    enabled: !import.meta.env.DEV,
    description: 'Enable performance monitoring',
    environments: ['staging', 'production'],
  },
  [FEATURE_FLAGS.ERROR_TRACKING]: {
    name: FEATURE_FLAGS.ERROR_TRACKING,
    enabled: !import.meta.env.DEV,
    description: 'Enable error tracking and reporting',
    environments: ['staging', 'production'],
  },
};

/**
 * Get feature flags from environment or local storage
 */
function loadFeatureFlags(): Record<FeatureFlagName, FeatureFlag> {
  try {
    // Check for feature flags in localStorage (for runtime updates)
    const storedFlags = localStorage.getItem('feature_flags');
    if (storedFlags) {
      const parsedFlags = JSON.parse(storedFlags);
      return { ...defaultFeatureFlags, ...parsedFlags };
    }

    // Check for feature flags in environment variables
    const envFlags = import.meta.env.VITE_FEATURE_FLAGS;
    if (envFlags) {
      const parsedEnvFlags = JSON.parse(envFlags);
      return { ...defaultFeatureFlags, ...parsedEnvFlags };
    }
  } catch (error) {
    console.warn('Failed to load feature flags, using defaults', error);
  }

  return defaultFeatureFlags;
}

/**
 * Current feature flags state
 */
export let featureFlags = loadFeatureFlags();

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagName: FeatureFlagName): boolean {
  const flag = featureFlags[flagName];

  if (!flag) {
    console.warn(`Feature flag "${flagName}" not found`);
    return false;
  }

  // Check environment compatibility
  const currentEnv = import.meta.env.MODE || 'development';
  if (flag.environments && !flag.environments.includes(currentEnv)) {
    return false;
  }

  // Check rollout percentage if specified
  if (flag.rolloutPercentage !== undefined) {
    const random = Math.random() * 100;
    return flag.enabled && random < flag.rolloutPercentage;
  }

  return flag.enabled;
}

/**
 * Update feature flag at runtime
 */
export function setFeatureFlag(
  flagName: FeatureFlagName,
  enabled: boolean,
  persist = false
): void {
  if (!featureFlags[flagName]) {
    console.warn(`Feature flag "${flagName}" not found`);
    return;
  }

  featureFlags[flagName].enabled = enabled;

  if (persist) {
    try {
      localStorage.setItem('feature_flags', JSON.stringify(featureFlags));
    } catch (error) {
      console.error('Failed to persist feature flags', error);
    }
  }
}

/**
 * Reset feature flags to defaults
 */
export function resetFeatureFlags(): void {
  featureFlags = { ...defaultFeatureFlags };
  try {
    localStorage.removeItem('feature_flags');
  } catch (error) {
    console.error('Failed to clear feature flags from storage', error);
  }
}

/**
 * Get all feature flags
 */
export function getAllFeatureFlags(): Record<FeatureFlagName, FeatureFlag> {
  return { ...featureFlags };
}

/**
 * Feature flag React hook helper type
 */
export interface UseFeatureFlag {
  (flagName: FeatureFlagName): boolean;
}