import { api } from '../client';
import type { 
  ApiResponse, 
  LoginCredentials,
  AuthToken,
  User,
  WorkflowTemplate
} from '../types';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Login with credentials
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthToken & { user: User }>> => {
    return api.post('/api/v1/auth/login', credentials);
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<ApiResponse<void>> => {
    return api.post('/api/v1/auth/logout');
  },

  /**
   * Refresh authentication token
   */
  refresh: async (refreshToken: string): Promise<ApiResponse<AuthToken>> => {
    return api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
  },

  /**
   * Verify current token
   */
  verify: async (): Promise<ApiResponse<{ valid: boolean; user?: User }>> => {
    return api.get('/api/v1/auth/verify');
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return api.post('/api/v1/auth/change-password', data);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
    return api.post('/api/v1/auth/request-password-reset', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> => {
    return api.post('/api/v1/auth/reset-password', data);
  }
};

/**
 * User management API endpoints
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    return api.get('/api/v1/user/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    return api.put('/api/v1/user/profile', data);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    return api.post('/api/v1/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return api.get('/api/v1/user/preferences');
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences: Record<string, unknown>): Promise<ApiResponse<void>> => {
    return api.put('/api/v1/user/preferences', preferences);
  },

  /**
   * List all users (admin only)
   */
  list: async (): Promise<ApiResponse<User[]>> => {
    return api.get('/api/v1/user');
  },

  /**
   * Get user by ID (admin only)
   */
  get: async (userId: string): Promise<ApiResponse<User>> => {
    return api.get(`/api/v1/user/${userId}`);
  },

  /**
   * Create new user (admin only)
   */
  create: async (userData: Omit<User, 'id'>): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/user', userData);
  },

  /**
   * Update user (admin only)
   */
  update: async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return api.put(`/api/v1/user/${userId}`, data);
  },

  /**
   * Delete user (admin only)
   */
  delete: async (userId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/user/${userId}`);
  }
};

/**
 * Workflow templates API endpoints
 */
export const templateApi = {
  /**
   * Get all workflow templates
   */
  list: async (): Promise<ApiResponse<WorkflowTemplate[]>> => {
    return api.get('/api/v1/client/private/templates');
  },

  /**
   * Get template by ID
   */
  get: async (templateId: string): Promise<ApiResponse<WorkflowTemplate>> => {
    return api.get(`/api/v1/client/private/templates/${templateId}`);
  },

  /**
   * Create workflow from template
   */
  createWorkflow: async (data: {
    templateId: string;
    name: string;
    description?: string;
    assignees?: Record<string, string[]>;
    customizations?: Record<string, unknown>;
  }): Promise<ApiResponse<{ workflowId: string }>> => {
    return api.post('/api/v1/client/private/templates/create-workflow', data);
  },

  /**
   * Create new template
   */
  create: async (template: Omit<WorkflowTemplate, 'id'>): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/client/private/templates', template);
  },

  /**
   * Update template
   */
  update: async (
    templateId: string, 
    data: Partial<WorkflowTemplate>
  ): Promise<ApiResponse<WorkflowTemplate>> => {
    return api.put(`/api/v1/client/private/templates/${templateId}`, data);
  },

  /**
   * Delete template
   */
  delete: async (templateId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/client/private/templates/${templateId}`);
  },

  /**
   * Search templates
   */
  search: async (query: {
    term?: string;
    category?: string;
    tags?: string[];
  }): Promise<ApiResponse<WorkflowTemplate[]>> => {
    return api.get('/api/v1/client/private/templates/search', { params: query });
  }
};

/**
 * System/Admin API endpoints
 */
export const systemApi = {
  /**
   * Get system health status
   */
  health: async (): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    checks: Record<string, boolean>;
  }>> => {
    return api.get('/api/v1/system/health');
  },

  /**
   * Get system metrics
   */
  metrics: async (): Promise<ApiResponse<{
    activeUsers: number;
    runningWorkflows: number;
    systemLoad: number;
    memoryUsage: number;
    diskUsage: number;
  }>> => {
    return api.get('/api/v1/system/metrics');
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (params?: {
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    details: Record<string, unknown>;
  }>>> => {
    return api.get('/api/v1/system/audit-logs', { params });
  },

  /**
   * Export system data
   */
  exportData: async (
    type: 'configurations' | 'workflows' | 'users' | 'audit-logs',
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> => {
    const response = await api.get(`/api/v1/system/export/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data as unknown as Blob;
  },

  /**
   * Import system data
   */
  importData: async (
    type: 'configurations' | 'workflows' | 'users',
    file: File
  ): Promise<ApiResponse<{ imported: number; errors: string[] }>> => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(`/api/v1/system/import/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};