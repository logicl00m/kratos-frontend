/**
 * Application Configuration
 * Centralized configuration management for the entire application
 */

export interface AppConfig {
  api: ApiConfig;
  auth: AuthConfig;
  features: FeaturesConfig;
  ui: UIConfig;
  performance: PerformanceConfig;
  logging: LoggingConfig;
  storage: StorageConfig;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers: Record<string, string>;
  withCredentials: boolean;
  mockMode: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface AuthConfig {
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  expiryKey: string;
  subjectKey: string;
  tokenRefreshThreshold: number; // minutes before expiry to refresh
  rememberMeDuration: number; // days
  sessionTimeout: number; // minutes
  biometricEnabled: boolean;
  ssoEnabled: boolean;
  // Toggle to completely disable auth in local/dev mode
  enabled?: boolean;
  // When enabled, optional paths for redirects may be provided by apps that need them
  loginPath?: string;
  logoutPath?: string;
  unauthorizedRedirectPath?: string;
}

export interface FeaturesConfig {
  dashboard: {
    itemsPerPage: number;
    refreshInterval: number; // milliseconds
    enableRealTimeUpdates: boolean;
    enableExport: boolean;
    maxExportRows: number;
  };
  workflow: {
    autosaveInterval: number; // milliseconds
    maxUndoSteps: number;
    enableTemplates: boolean;
    enableVersioning: boolean;
    enableCollaboration: boolean;
  };
  forms: {
    validationDelay: number; // milliseconds
    autosaveEnabled: boolean;
    maxFileSize: number; // bytes
    allowedFileTypes: string[];
  };
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  animations: boolean;
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
  };
}

export interface PerformanceConfig {
  lazyLoading: boolean;
  virtualScrolling: boolean;
  debounceDelay: number; // milliseconds
  throttleDelay: number; // milliseconds
  imageOptimization: boolean;
  preloadCriticalAssets: boolean;
  serviceWorker: boolean;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  remoteLogging: boolean;
  remoteEndpoint?: string;
  includeStackTrace: boolean;
  maxLogSize: number; // bytes
  persistence: boolean;
}

export interface StorageConfig {
  type: 'localStorage' | 'sessionStorage' | 'indexedDB';
  prefix: string;
  encryption: boolean;
  compression: boolean;
  maxSize: number; // bytes
  gcInterval: number; // milliseconds
}

/**
 * Environment-specific configurations
 */
const developmentConfig: Partial<AppConfig> = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    mockMode: true,
    cacheEnabled: false,
  },
  logging: {
    enabled: true,
    level: 'debug',
    remoteLogging: false,
    includeStackTrace: true,
  },
  performance: {
    serviceWorker: false,
  },
};

const stagingConfig: Partial<AppConfig> = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'https://staging-api.kratos.com',
    mockMode: false,
    cacheEnabled: true,
  },
  logging: {
    enabled: true,
    level: 'info',
    remoteLogging: true,
    remoteEndpoint: 'https://staging-logs.kratos.com',
  },
  performance: {
    serviceWorker: false,
  },
};

const productionConfig: Partial<AppConfig> = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'https://api.kratos.com',
    mockMode: false,
    cacheEnabled: true,
  },
  logging: {
    enabled: true,
    level: 'error',
    remoteLogging: true,
    remoteEndpoint: 'https://logs.kratos.com',
    includeStackTrace: false,
  },
  performance: {
    serviceWorker: true,
  },
};

/**
 * Default configuration
 */
const defaultConfig: AppConfig = {
  api: {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
    mockMode: false,
    cacheEnabled: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  },
  auth: {
    tokenKey: 'kratos_auth_token',
    refreshTokenKey: 'kratos_refresh_token',
    userKey: 'kratos_user',
    expiryKey: 'kratos_token_expiry',
    subjectKey: 'kratos_subject',
    tokenRefreshThreshold: 5, // minutes
    rememberMeDuration: 30, // days
    sessionTimeout: 30, // minutes
    biometricEnabled: false,
    ssoEnabled: false,
    enabled: false,
  },
  features: {
    dashboard: {
      itemsPerPage: 20,
      refreshInterval: 30000, // 30 seconds
      enableRealTimeUpdates: true,
      enableExport: true,
      maxExportRows: 10000,
    },
    workflow: {
      autosaveInterval: 60000, // 1 minute
      maxUndoSteps: 50,
      enableTemplates: true,
      enableVersioning: false,
      enableCollaboration: false,
    },
    forms: {
      validationDelay: 300, // milliseconds
      autosaveEnabled: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
    },
  },
  ui: {
    theme: 'auto',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: 'en-US',
    animations: true,
    accessibility: {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
    },
  },
  performance: {
    lazyLoading: true,
    virtualScrolling: true,
    debounceDelay: 300,
    throttleDelay: 100,
    imageOptimization: true,
    preloadCriticalAssets: true,
    serviceWorker: false,
  },
  logging: {
    enabled: true,
    level: 'info',
    remoteLogging: false,
    includeStackTrace: true,
    maxLogSize: 1024 * 1024, // 1MB
    persistence: true,
  },
  storage: {
    type: 'localStorage',
    prefix: 'kratos_',
    encryption: false,
    compression: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    gcInterval: 3600000, // 1 hour
  },
};

/**
 * Get environment-specific configuration overrides
 */
function getEnvironmentConfig(): Partial<AppConfig> {
  const env = import.meta.env.MODE || 'development';

  switch (env) {
    case 'development':
      return developmentConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      return {};
  }
}

/**
 * Load configuration from various sources
 */
function loadConfiguration(): AppConfig {
  // Start with default config
  let config = { ...defaultConfig };

  // Apply environment-specific overrides
  const envConfig = getEnvironmentConfig();
  config = mergeConfig(config, envConfig);

  // Apply environment variables
  const envVars = loadEnvironmentVariables();
  config = mergeConfig(config, envVars);

  // Apply local storage overrides (for runtime configuration)
  const localConfig = loadLocalConfiguration();
  config = mergeConfig(config, localConfig);

  return config;
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(target: AppConfig, source: Partial<AppConfig>): AppConfig {
  const result = { ...target };

  for (const key in source) {
    if (source[key as keyof AppConfig] !== undefined) {
      if (typeof source[key as keyof AppConfig] === 'object' && !Array.isArray(source[key as keyof AppConfig])) {
        result[key as keyof AppConfig] = {
          ...result[key as keyof AppConfig] as any,
          ...source[key as keyof AppConfig] as any,
        };
      } else {
        result[key as keyof AppConfig] = source[key as keyof AppConfig] as any;
      }
    }
  }

  return result;
}

/**
 * Load configuration from environment variables
 */
function loadEnvironmentVariables(): Partial<AppConfig> {
  const config: Partial<AppConfig> = {};

  // API configuration
  if (import.meta.env.VITE_API_URL) {
    config.api = config.api || {};
    config.api.baseURL = import.meta.env.VITE_API_URL;
  }

  if (import.meta.env.VITE_API_TIMEOUT) {
    config.api = config.api || {};
    config.api.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT);
  }

  // Add more environment variable mappings as needed

  return config;
}

/**
 * Load configuration from local storage
 */
function loadLocalConfiguration(): Partial<AppConfig> {
  try {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load local configuration', error);
  }
  return {};
}

/**
 * Current application configuration
 */
export let appConfig: AppConfig = loadConfiguration();

/**
 * Get current configuration
 */
export function getConfig(): AppConfig {
  return { ...appConfig };
}

/**
 * Update configuration at runtime
 */
export function updateConfig(updates: Partial<AppConfig>, persist = false): void {
  appConfig = mergeConfig(appConfig, updates);

  if (persist) {
    try {
      localStorage.setItem('app_config', JSON.stringify(appConfig));
    } catch (error) {
      console.error('Failed to persist configuration', error);
    }
  }
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  appConfig = loadConfiguration();
  try {
    localStorage.removeItem('app_config');
  } catch (error) {
    console.error('Failed to clear local configuration', error);
  }
}

/**
 * Get configuration value by path
 */
export function getConfigValue<T = any>(path: string): T | undefined {
  const keys = path.split('.');
  let value: any = appConfig;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value as T;
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate API configuration
  if (!appConfig.api.baseURL) {
    errors.push('API base URL is required');
  }

  if (appConfig.api.timeout <= 0) {
    errors.push('API timeout must be positive');
  }

  // Validate auth configuration
  // If auth is enabled, require token configuration; otherwise skip
  if (appConfig.auth.enabled !== false) {
    if (!appConfig.auth.tokenKey) {
      errors.push('Auth token key is required');
    }
  }

  // Add more validation as needed

  return {
    valid: errors.length === 0,
    errors,
  };
}