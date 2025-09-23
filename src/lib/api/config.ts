/**
 * Centralized API configuration
 */

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  defaultSubject: string;
}

/**
 * Default API configuration values
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT as string) || 30000,
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS as string) || 3,
  retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY as string) || 1000,
  defaultSubject: import.meta.env.VITE_API_DEFAULT_SUBJECT || 'fsadf', // Replace with dynamic value if needed
};

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    VERIFY: '/api/v1/auth/verify',
    REGISTER: '/api/v1/auth/register',
  },

  // Client private endpoints (your backend structure)
  CLIENT_PRIVATE: {
    BASE: '/api/v1/client/private',
    
    // Forms
    FORM: {
      GET_ALL: '/api/v1/client/private/form/get/all',
      CREATE: '/api/v1/client/private/form/create',
      UPDATE: '/api/v1/client/private/form/update',
      DELETE: '/api/v1/client/private/form/delete',
    },

    // Workflows
    WORKFLOW: {
      GET_ALL: '/api/v1/client/private/workflow/get/all',
      CREATE: '/api/v1/client/private/workflow/create',
      UPDATE: '/api/v1/client/private/workflow/update',
      DELETE: '/api/v1/client/private/workflow/delete',
    },

    // Workflow Instances
    WORKFLOW_INSTANCE: {
      BASE: '/api/v1/client/private/workflow-instance',
      START: '/api/v1/client/private/workflow-instance/start',
      GET: (id: string) => `/api/v1/client/private/workflow-instance/${id}`,
      UPDATE: (id: string) => `/api/v1/client/private/workflow-instance/${id}`,
      ADVANCE: (id: string) => `/api/v1/client/private/workflow-instance/${id}/advance`,
      ASSIGN: (id: string) => `/api/v1/client/private/workflow-instance/${id}/assign`,
      COMMENT: (id: string) => `/api/v1/client/private/workflow-instance/${id}/comment`,
      UPLOAD_DOCUMENT: (id: string) => `/api/v1/client/private/workflow-instance/${id}/document`,
      HISTORY: (id: string) => `/api/v1/client/private/workflow-instance/${id}/history`,
      CANCEL: (id: string) => `/api/v1/client/private/workflow-instance/${id}/cancel`,
      RESTART: (id: string) => `/api/v1/client/private/workflow-instance/${id}/restart`,
      ESCALATE: (id: string) => `/api/v1/client/private/workflow-instance/${id}/escalate`,
      DOCUMENTS: (id: string) => `/api/v1/client/private/workflow-instance/${id}/documents`,
      DOWNLOAD_DOCUMENT: (id: string, docId: string) => `/api/v1/client/private/workflow-instance/${id}/document/${docId}/download`,
    },

    // Running Workflows
    RUNNING_WORKFLOWS: {
      BASE: '/api/v1/client/private/running-workflows',
      GET: (id: string) => `/api/v1/client/private/running-workflows/${id}`,
      PAUSE: (id: string) => `/api/v1/client/private/running-workflows/${id}/pause`,
      RESUME: (id: string) => `/api/v1/client/private/running-workflows/${id}/resume`,
      STOP: (id: string) => `/api/v1/client/private/running-workflows/${id}/stop`,
      METRICS: (id: string) => `/api/v1/client/private/running-workflows/${id}/metrics`,
    },

    // Dashboard
    DASHBOARD: {
      STATS: '/api/v1/client/private/dashboard/stats',
      APPLICATIONS: '/api/v1/client/private/dashboard/applications',
      SEARCH: '/api/v1/client/private/dashboard/search',
    },
  },

  // System endpoints
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
  },
} as const;

/**
 * Request headers configuration
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': '*/*',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Your backend API response status codes
 */
export const BACKEND_STATUS = {
  SUCCESS: 'S2000',
  ERROR: 'E4000',
  VALIDATION_ERROR: 'E4001',
  UNAUTHORIZED: 'E4010',
  FORBIDDEN: 'E4030',
  NOT_FOUND: 'E4040',
} as const;

/**
 * Get API configuration with environment overrides
 */
export const getApiConfig = (): ApiConfig => {
  return {
    ...DEFAULT_API_CONFIG,
    // Allow runtime overrides if needed
  };
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * Check if we're in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};