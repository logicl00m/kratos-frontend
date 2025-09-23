// Core API client exports
import {
  apiClient as _apiClient,
  api as _api,
  apiRequest as _apiRequest,
  uploadFile as _uploadFile,
  downloadFile as _downloadFile,
  retryRequest as _retryRequest,
  healthCheck as _healthCheck,
  createCustomApiClient as _createCustomApiClient,
  getApiConfig as _getApiConfig,
  updateApiBaseUrl as _updateApiBaseUrl
} from './client';

export {
  _apiClient as apiClient,
  _api as api,
  _apiRequest as apiRequest,
  _uploadFile as uploadFile,
  _downloadFile as downloadFile,
  _retryRequest as retryRequest,
  _healthCheck as healthCheck,
  _createCustomApiClient as createCustomApiClient,
  _getApiConfig as getApiConfig,
  _updateApiBaseUrl as updateApiBaseUrl
};

// Authentication and token management
export {
  setAuthToken,
  getAuthToken,
  getRefreshToken,
  clearAuthToken,
  setUser,
  getUser,
  clearUser,
  isAuthenticated,
  isTokenExpired,
  willTokenExpireSoon,
  getTokenExpiryTime,
  logout,
  initializeAuth,
  setSubject,
  getSubject,
  clearSubject
} from './auth';

// Error handling
export {
  ApiError,
  handleAxiosError,
  handleApiError,
  logApiError,
  getErrorMessage,
  isRetryableError,
  createErrorResponse,
  extractValidationErrors
} from './errors';

// Configuration
export {
  DEFAULT_API_CONFIG,
  API_ENDPOINTS,
  DEFAULT_HEADERS,
  HTTP_STATUS,
  BACKEND_STATUS,
  getApiConfig as getConfig,
  isDevelopment,
  isProduction
} from './config';

// Services
export { formsService } from '../services/formsService';

// API endpoint modules (if they still exist and work)
export type {
  // Configuration API (if available)
  configurationApi,
  workflowApi
} from './endpoints/configuration';

export type {
  // Workflow API (if available) 
  workflowInstanceApi,
  runningWorkflowApi,
  dashboardApi
} from './endpoints/workflow';

export type {
  // Form API (if available)
  formApi,
  formSubmissionApi
} from './endpoints/form';

export type {
  // Auth API (if available)
  authApi,
  userApi,
  templateApi,
  systemApi
} from './endpoints/auth';

// Type exports
export type {
  // Core types
  ApiResponse,
  ApiConfig,
  ApiError as ApiErrorType,
  PaginatedRequest,
  PaginatedResponse,

  // Auth types
  AuthToken,
  LoginCredentials,
  User,

  // Workflow types
  WorkflowNode,
  WorkflowEdge,
  WorkflowAction,
  WorkflowDefinition,
  WorkflowTemplate,
  RunningWorkflow,

  // Configuration types
  ConfigurationPayload,

  // Form types
  FormField,
  FormDefinition,

  // Application/Instance types
  ApplicationInstance,
  ApplicationEvent,

  // Dashboard types
  DashboardStats,
  FilterOptions
} from './types';

// Convenience API object for clean imports
export const kratoApi = {
  // Core
  client: _apiClient,
  request: _apiRequest,
  health: _healthCheck,

  // Auth
  auth: {
    login: async (credentials: import('./types').LoginCredentials) => {
      const { authApi } = await import('./endpoints/auth');
      return authApi.login(credentials);
    },
    logout: async () => {
      const { authApi } = await import('./endpoints/auth');
      return authApi.logout();
    },
    refresh: async (token: string) => {
      const { authApi } = await import('./endpoints/auth');
      return authApi.refresh(token);
    },
    verify: async () => {
      const { authApi } = await import('./endpoints/auth');
      return authApi.verify();
    }
  },

  // Configuration
  configuration: {
    create: async (data: import('./types').ConfigurationPayload) => {
      const { configurationApi } = await import('./endpoints/configuration');
      return configurationApi.create(data);
    },
    get: async (id: string) => {
      const { configurationApi } = await import('./endpoints/configuration');
      return configurationApi.get(id);
    },
    update: async (id: string, data: Partial<import('./types').ConfigurationPayload>) => {
      const { configurationApi } = await import('./endpoints/configuration');
      return configurationApi.update(id, data);
    },
    delete: async (id: string) => {
      const { configurationApi } = await import('./endpoints/configuration');
      return configurationApi.delete(id);
    },
    list: async (params?: import('./types').PaginatedRequest) => {
      const { configurationApi } = await import('./endpoints/configuration');
      return configurationApi.list(params);
    }
  },

  // Workflows
  workflow: {
    create: async (data: import('./types').WorkflowDefinition) => {
      const { workflowApi } = await import('./endpoints/configuration');
      return workflowApi.create(data);
    },
    get: async (id: string) => {
      const { workflowApi } = await import('./endpoints/configuration');
      return workflowApi.get(id);
    },
    update: async (id: string, data: Partial<import('./types').WorkflowDefinition>) => {
      const { workflowApi } = await import('./endpoints/configuration');
      return workflowApi.update(id, data);
    },
    delete: async (id: string) => {
      const { workflowApi } = await import('./endpoints/configuration');
      return workflowApi.delete(id);
    },
    list: async (params?: import('./types').PaginatedRequest) => {
      const { workflowApi } = await import('./endpoints/configuration');
      return workflowApi.list(params);
    }
  },

  // Workflow Instances
  instance: {
    start: async (data: { workflowId: string; initialData?: Record<string, unknown> }) => {
      const { workflowInstanceApi } = await import('./endpoints/workflow');
      return workflowInstanceApi.start(data);
    },
    get: async (id: string) => {
      const { workflowInstanceApi } = await import('./endpoints/workflow');
      return workflowInstanceApi.get(id);
    },
    advance: async (id: string, action: { targetState: string; data?: Record<string, unknown> }) => {
      const { workflowInstanceApi } = await import('./endpoints/workflow');
      return workflowInstanceApi.advance(id, action);
    },
    assign: async (id: string, assignee: string) => {
      const { workflowInstanceApi } = await import('./endpoints/workflow');
      return workflowInstanceApi.assign(id, assignee);
    }
  },

  // Forms
  form: {
    create: async (data: import('./types').FormDefinition) => {
      const { formApi } = await import('./endpoints/form');
      return formApi.create(data);
    },
    get: async (id: string) => {
      const { formApi } = await import('./endpoints/form');
      return formApi.get(id);
    },
    update: async (id: string, data: Partial<import('./types').FormDefinition>) => {
      const { formApi } = await import('./endpoints/form');
      return formApi.update(id, data);
    },
    delete: async (id: string) => {
      const { formApi } = await import('./endpoints/form');
      return formApi.delete(id);
    },
    list: async (params?: import('./types').PaginatedRequest) => {
      const { formApi } = await import('./endpoints/form');
      return formApi.list(params);
    }
  },

  // Dashboard
  dashboard: {
    getStats: async (filters?: import('./types').FilterOptions) => {
      const { dashboardApi } = await import('./endpoints/workflow');
      return dashboardApi.getStats(filters);
    },
    getApplications: async (params?: import('./types').PaginatedRequest & import('./types').FilterOptions) => {
      const { dashboardApi } = await import('./endpoints/workflow');
      return dashboardApi.getApplications(params);
    },
    search: async (query: { term: string; filters?: import('./types').FilterOptions }) => {
      const { dashboardApi } = await import('./endpoints/workflow');
      return dashboardApi.searchApplications(query);
    }
  },

  // Templates
  template: {
    list: async () => {
      const { templateApi } = await import('./endpoints/auth');
      return templateApi.list();
    },
    get: async (id: string) => {
      const { templateApi } = await import('./endpoints/auth');
      return templateApi.get(id);
    },
    createWorkflow: async (data: { templateId: string; name: string; description?: string }) => {
      const { templateApi } = await import('./endpoints/auth');
      return templateApi.createWorkflow(data);
    }
  },

  // User
  user: {
    getProfile: async () => {
      const { userApi } = await import('./endpoints/auth');
      return userApi.getProfile();
    },
    updateProfile: async (data: Partial<import('./types').User>) => {
      const { userApi } = await import('./endpoints/auth');
      return userApi.updateProfile(data);
    },
    getPreferences: async () => {
      const { userApi } = await import('./endpoints/auth');
      return userApi.getPreferences();
    },
    updatePreferences: async (preferences: Record<string, unknown>) => {
      const { userApi } = await import('./endpoints/auth');
      return userApi.updatePreferences(preferences);
    }
  }
};

// Default export for convenience
export default kratoApi;