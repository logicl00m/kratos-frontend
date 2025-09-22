import { api } from '../client';
import type { 
  ApiResponse, 
  ConfigurationPayload, 
  WorkflowDefinition, 
  PaginatedRequest,
  PaginatedResponse 
} from '../types';

/**
 * Configuration API endpoints
 */
export const configurationApi = {
  /**
   * Create a new configuration
   */
  create: async (data: ConfigurationPayload): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/client/private/configuration/create', data);
  },

  /**
   * Get configuration by ID
   */
  get: async (id: string): Promise<ApiResponse<ConfigurationPayload>> => {
    return api.get(`/api/v1/client/private/configuration/${id}`);
  },

  /**
   * Update configuration
   */
  update: async (
    id: string, 
    data: Partial<ConfigurationPayload>
  ): Promise<ApiResponse<ConfigurationPayload>> => {
    return api.put(`/api/v1/client/private/configuration/${id}`, data);
  },

  /**
   * Delete configuration
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/client/private/configuration/${id}`);
  },

  /**
   * List all configurations
   */
  list: async (params?: PaginatedRequest): Promise<ApiResponse<PaginatedResponse<ConfigurationPayload>>> => {
    return api.get('/api/v1/client/private/configuration', { params });
  },

  /**
   * Clone an existing configuration
   */
  clone: async (
    id: string, 
    name: string, 
    description?: string
  ): Promise<ApiResponse<{ id: string }>> => {
    return api.post(`/api/v1/client/private/configuration/${id}/clone`, {
      name,
      description
    });
  },

  /**
   * Validate configuration before saving
   */
  validate: async (data: ConfigurationPayload): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> => {
    return api.post('/api/v1/client/private/configuration/validate', data);
  },

  /**
   * Export configuration as JSON
   */
  export: async (id: string): Promise<ApiResponse<ConfigurationPayload>> => {
    return api.get(`/api/v1/client/private/configuration/${id}/export`);
  },

  /**
   * Import configuration from JSON
   */
  import: async (data: ConfigurationPayload): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/client/private/configuration/import', data);
  },

  /**
   * Get configuration versions/history
   */
  getVersions: async (id: string): Promise<ApiResponse<ConfigurationPayload[]>> => {
    return api.get(`/api/v1/client/private/configuration/${id}/versions`);
  },

  /**
   * Restore configuration to specific version
   */
  restoreVersion: async (
    id: string, 
    version: string
  ): Promise<ApiResponse<ConfigurationPayload>> => {
    return api.post(`/api/v1/client/private/configuration/${id}/restore/${version}`);
  },

  /**
   * Publish configuration (make it active)
   */
  publish: async (id: string): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/configuration/${id}/publish`);
  },

  /**
   * Unpublish configuration (make it inactive)
   */
  unpublish: async (id: string): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/configuration/${id}/unpublish`);
  },

  /**
   * Get configuration statistics
   */
  getStats: async (id: string): Promise<ApiResponse<{
    instances: number;
    completedInstances: number;
    averageCompletionTime: number;
    errorRate: number;
  }>> => {
    return api.get(`/api/v1/client/private/configuration/${id}/stats`);
  },

  /**
   * Search configurations
   */
  search: async (query: {
    term?: string;
    tags?: string[];
    category?: string;
    status?: 'active' | 'inactive' | 'draft';
  }): Promise<ApiResponse<ConfigurationPayload[]>> => {
    return api.get('/api/v1/client/private/configuration/search', { params: query });
  }
};

/**
 * Workflow definition API endpoints (separate from configurations)
 */
export const workflowApi = {
  /**
   * Create a new workflow definition
   */
  create: async (data: WorkflowDefinition): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/client/private/workflow', data);
  },

  /**
   * Get workflow definition by ID
   */
  get: async (id: string): Promise<ApiResponse<WorkflowDefinition>> => {
    return api.get(`/api/v1/client/private/workflow/${id}`);
  },

  /**
   * Update workflow definition
   */
  update: async (
    id: string, 
    data: Partial<WorkflowDefinition>
  ): Promise<ApiResponse<WorkflowDefinition>> => {
    return api.put(`/api/v1/client/private/workflow/${id}`, data);
  },

  /**
   * Delete workflow definition
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/client/private/workflow/${id}`);
  },

  /**
   * List all workflow definitions
   */
  list: async (params?: PaginatedRequest): Promise<ApiResponse<PaginatedResponse<WorkflowDefinition>>> => {
    return api.get('/api/v1/client/private/workflow', { params });
  },

  /**
   * Validate workflow definition
   */
  validate: async (data: WorkflowDefinition): Promise<ApiResponse<{ 
    valid: boolean; 
    errors?: string[];
    warnings?: string[];
  }>> => {
    return api.post('/api/v1/client/private/workflow/validate', data);
  },

  /**
   * Test workflow definition (dry run)
   */
  test: async (
    id: string, 
    testData?: Record<string, unknown>
  ): Promise<ApiResponse<{
    success: boolean;
    executionPath: string[];
    duration: number;
    errors?: string[];
  }>> => {
    return api.post(`/api/v1/client/private/workflow/${id}/test`, { testData });
  },

  /**
   * Get workflow execution statistics
   */
  getExecutionStats: async (id: string): Promise<ApiResponse<{
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    mostUsedPaths: Array<{ path: string[]; count: number }>;
    errorPatterns: Array<{ error: string; count: number }>;
  }>> => {
    return api.get(`/api/v1/client/private/workflow/${id}/stats`);
  },

  /**
   * Generate workflow diagram/visualization
   */
  generateDiagram: async (id: string, format: 'svg' | 'png' | 'pdf' = 'svg'): Promise<Blob> => {
    const response = await api.get(`/api/v1/client/private/workflow/${id}/diagram`, {
      params: { format },
      // Override response type for binary data
    });
    return response.data as unknown as Blob;
  },

  /**
   * Export workflow as various formats
   */
  export: async (
    id: string, 
    format: 'json' | 'bpmn' | 'yaml' = 'json'
  ): Promise<ApiResponse<string>> => {
    return api.get(`/api/v1/client/private/workflow/${id}/export`, {
      params: { format }
    });
  },

  /**
   * Import workflow from various formats
   */
  import: async (
    data: string, 
    format: 'json' | 'bpmn' | 'yaml' = 'json'
  ): Promise<ApiResponse<WorkflowDefinition>> => {
    return api.post('/api/v1/client/private/workflow/import', {
      data,
      format
    });
  }
};