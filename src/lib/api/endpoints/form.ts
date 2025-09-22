import { api } from '../client';
import type { 
  ApiResponse, 
  FormDefinition, 
  PaginatedRequest,
  PaginatedResponse 
} from '../types';

/**
 * Form definition API endpoints
 */
export const formApi = {
  /**
   * Create a new form definition
   */
  create: async (data: FormDefinition): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/client/private/form', data);
  },

  /**
   * Get form definition by ID
   */
  get: async (id: string): Promise<ApiResponse<FormDefinition>> => {
    return api.get(`/api/v1/client/private/form/${id}`);
  },

  /**
   * Update form definition
   */
  update: async (
    id: string, 
    data: Partial<FormDefinition>
  ): Promise<ApiResponse<FormDefinition>> => {
    return api.put(`/api/v1/client/private/form/${id}`, data);
  },

  /**
   * Delete form definition
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/client/private/form/${id}`);
  },

  /**
   * List all form definitions
   */
  list: async (params?: PaginatedRequest): Promise<ApiResponse<PaginatedResponse<FormDefinition>>> => {
    return api.get('/api/v1/client/private/form', { params });
  },

  /**
   * Clone an existing form
   */
  clone: async (
    id: string, 
    name: string, 
    description?: string
  ): Promise<ApiResponse<{ id: string }>> => {
    return api.post(`/api/v1/client/private/form/${id}/clone`, {
      name,
      description
    });
  },

  /**
   * Validate form definition
   */
  validate: async (data: FormDefinition): Promise<ApiResponse<{ 
    valid: boolean; 
    errors?: string[];
    warnings?: string[];
  }>> => {
    return api.post('/api/v1/client/private/form/validate', data);
  },

  /**
   * Generate form preview HTML
   */
  preview: async (data: FormDefinition): Promise<ApiResponse<{ html: string }>> => {
    return api.post('/api/v1/client/private/form/preview', data);
  },

  /**
   * Search forms
   */
  search: async (query: {
    term?: string;
    tags?: string[];
    category?: string;
  }): Promise<ApiResponse<FormDefinition[]>> => {
    return api.get('/api/v1/client/private/form/search', { params: query });
  },

  /**
   * Export form as JSON
   */
  export: async (id: string): Promise<ApiResponse<FormDefinition>> => {
    return api.get(`/api/v1/client/private/form/${id}/export`);
  },

  /**
   * Import form from JSON
   */
  import: async (data: FormDefinition): Promise<ApiResponse<{ id: string }>> => {
    return api.post('/api/v1/client/private/form/import', data);
  },

  /**
   * Get form usage statistics
   */
  getUsageStats: async (id: string): Promise<ApiResponse<{
    totalSubmissions: number;
    averageCompletionTime: number;
    fieldAnalytics: Array<{
      fieldId: string;
      fieldLabel: string;
      completionRate: number;
      averageTime: number;
      errorRate: number;
    }>;
    abandonmentRate: number;
    mostCommonErrors: Array<{
      field: string;
      error: string;
      count: number;
    }>;
  }>> => {
    return api.get(`/api/v1/client/private/form/${id}/stats`);
  }
};

/**
 * Form submission API endpoints
 */
export const formSubmissionApi = {
  /**
   * Submit form data
   */
  submit: async (
    formId: string,
    data: Record<string, unknown>,
    instanceId?: string
  ): Promise<ApiResponse<{ submissionId: string }>> => {
    return api.post(`/api/v1/client/private/form/${formId}/submit`, {
      data,
      instanceId
    });
  },

  /**
   * Get form submission by ID
   */
  get: async (submissionId: string): Promise<ApiResponse<{
    id: string;
    formId: string;
    data: Record<string, unknown>;
    submittedAt: string;
    submittedBy: string;
    instanceId?: string;
  }>> => {
    return api.get(`/api/v1/client/private/form-submission/${submissionId}`);
  },

  /**
   * List form submissions
   */
  list: async (params?: PaginatedRequest & {
    formId?: string;
    instanceId?: string;
    submittedBy?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string;
    formId: string;
    data: Record<string, unknown>;
    submittedAt: string;
    submittedBy: string;
    instanceId?: string;
  }>>> => {
    return api.get('/api/v1/client/private/form-submission', { params });
  },

  /**
   * Update form submission
   */
  update: async (
    submissionId: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse<void>> => {
    return api.put(`/api/v1/client/private/form-submission/${submissionId}`, {
      data
    });
  },

  /**
   * Delete form submission
   */
  delete: async (submissionId: string): Promise<ApiResponse<void>> => {
    return api.delete(`/api/v1/client/private/form-submission/${submissionId}`);
  },

  /**
   * Export form submissions
   */
  export: async (
    formId: string,
    format: 'csv' | 'excel' | 'json' = 'csv',
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      submittedBy?: string;
    }
  ): Promise<Blob> => {
    const response = await api.get(`/api/v1/client/private/form/${formId}/submissions/export`, {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data as unknown as Blob;
  },

  /**
   * Validate form submission data
   */
  validate: async (
    formId: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse<{
    valid: boolean;
    errors: Record<string, string[]>;
  }>> => {
    return api.post(`/api/v1/client/private/form/${formId}/validate-submission`, {
      data
    });
  }
};