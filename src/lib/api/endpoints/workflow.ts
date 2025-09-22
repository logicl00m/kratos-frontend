import { api } from '../client';
import type { 
  ApiResponse, 
  ApplicationInstance,
  RunningWorkflow,
  DashboardStats,
  FilterOptions,
  PaginatedRequest,
  PaginatedResponse,
  ApplicationEvent
} from '../types';

/**
 * Workflow instance/application API endpoints
 */
export const workflowInstanceApi = {
  /**
   * Start a new workflow instance
   */
  start: async (data: {
    workflowId: string;
    initialData?: Record<string, unknown>;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ApiResponse<{ instanceId: string }>> => {
    return api.post('/api/v1/client/private/workflow-instance/start', data);
  },

  /**
   * Get workflow instance by ID
   */
  get: async (instanceId: string): Promise<ApiResponse<ApplicationInstance>> => {
    return api.get(`/api/v1/client/private/workflow-instance/${instanceId}`);
  },

  /**
   * Update workflow instance data
   */
  update: async (
    instanceId: string,
    data: Partial<ApplicationInstance>
  ): Promise<ApiResponse<ApplicationInstance>> => {
    return api.put(`/api/v1/client/private/workflow-instance/${instanceId}`, data);
  },

  /**
   * List workflow instances with filtering
   */
  list: async (params?: PaginatedRequest & {
    workflowId?: string;
    status?: string[];
    assignee?: string[];
  }): Promise<ApiResponse<PaginatedResponse<ApplicationInstance>>> => {
    return api.get('/api/v1/client/private/workflow-instance', { params });
  },

  /**
   * Advance workflow to next state
   */
  advance: async (
    instanceId: string,
    action: {
      targetState: string;
      data?: Record<string, unknown>;
      comment?: string;
    }
  ): Promise<ApiResponse<ApplicationInstance>> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/advance`, action);
  },

  /**
   * Assign workflow instance to user
   */
  assign: async (
    instanceId: string,
    assignee: string,
    comment?: string
  ): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/assign`, {
      assignee,
      comment
    });
  },

  /**
   * Add comment to workflow instance
   */
  addComment: async (
    instanceId: string,
    comment: string
  ): Promise<ApiResponse<ApplicationEvent>> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/comment`, {
      comment
    });
  },

  /**
   * Upload document to workflow instance
   */
  uploadDocument: async (
    instanceId: string,
    file: File,
    documentType?: string
  ): Promise<ApiResponse<{ documentId: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) {
      formData.append('documentType', documentType);
    }

    return api.post(
      `/api/v1/client/private/workflow-instance/${instanceId}/document`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * Get workflow instance history
   */
  getHistory: async (instanceId: string): Promise<ApiResponse<ApplicationEvent[]>> => {
    return api.get(`/api/v1/client/private/workflow-instance/${instanceId}/history`);
  },

  /**
   * Cancel workflow instance
   */
  cancel: async (
    instanceId: string,
    reason?: string
  ): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/cancel`, {
      reason
    });
  },

  /**
   * Restart workflow instance
   */
  restart: async (
    instanceId: string,
    fromState?: string
  ): Promise<ApiResponse<ApplicationInstance>> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/restart`, {
      fromState
    });
  },

  /**
   * Escalate workflow instance
   */
  escalate: async (
    instanceId: string,
    escalationReason: string,
    targetAssignee?: string
  ): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/escalate`, {
      escalationReason,
      targetAssignee
    });
  },

  /**
   * Get workflow instance documents
   */
  getDocuments: async (instanceId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
  }>>> => {
    return api.get(`/api/v1/client/private/workflow-instance/${instanceId}/documents`);
  },

  /**
   * Download workflow instance document
   */
  downloadDocument: async (
    instanceId: string,
    documentId: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/api/v1/client/private/workflow-instance/${instanceId}/document/${documentId}/download`,
      { responseType: 'blob' }
    );
    return response.data as unknown as Blob;
  }
};

/**
 * Running workflows monitoring API
 */
export const runningWorkflowApi = {
  /**
   * Get all running workflow instances
   */
  list: async (params?: {
    status?: 'running' | 'paused' | 'completed' | 'failed';
    workflowId?: string;
    assignee?: string;
  }): Promise<ApiResponse<RunningWorkflow[]>> => {
    return api.get('/api/v1/client/private/running-workflows', { params });
  },

  /**
   * Get running workflow by instance ID
   */
  get: async (instanceId: string): Promise<ApiResponse<RunningWorkflow>> => {
    return api.get(`/api/v1/client/private/running-workflows/${instanceId}`);
  },

  /**
   * Pause running workflow
   */
  pause: async (instanceId: string): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/running-workflows/${instanceId}/pause`);
  },

  /**
   * Resume paused workflow
   */
  resume: async (instanceId: string): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/running-workflows/${instanceId}/resume`);
  },

  /**
   * Stop running workflow
   */
  stop: async (
    instanceId: string,
    reason?: string
  ): Promise<ApiResponse<void>> => {
    return api.post(`/api/v1/client/private/running-workflows/${instanceId}/stop`, {
      reason
    });
  },

  /**
   * Get workflow execution metrics
   */
  getMetrics: async (instanceId: string): Promise<ApiResponse<{
    executionTime: number;
    currentState: string;
    stateHistory: Array<{
      state: string;
      enteredAt: string;
      duration: number;
    }>;
    performance: {
      averageStateTime: number;
      bottlenecks: string[];
    };
  }>> => {
    return api.get(`/api/v1/client/private/running-workflows/${instanceId}/metrics`);
  }
};

/**
 * Dashboard and analytics API
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (filters?: FilterOptions): Promise<ApiResponse<DashboardStats>> => {
    return api.get('/api/v1/client/private/dashboard/stats', { params: filters });
  },

  /**
   * Get applications for dashboard table
   */
  getApplications: async (params?: PaginatedRequest & FilterOptions): Promise<ApiResponse<PaginatedResponse<ApplicationInstance>>> => {
    return api.get('/api/v1/client/private/dashboard/applications', { params });
  },

  /**
   * Search applications
   */
  searchApplications: async (query: {
    term: string;
    filters?: FilterOptions;
  }): Promise<ApiResponse<ApplicationInstance[]>> => {
    return api.get('/api/v1/client/private/dashboard/search', { params: query });
  },

  /**
   * Get workflow performance analytics
   */
  getWorkflowAnalytics: async (workflowId?: string): Promise<ApiResponse<{
    throughput: Array<{ date: string; count: number }>;
    averageCompletionTime: Array<{ date: string; time: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
    bottlenecks: Array<{ state: string; averageTime: number; count: number }>;
  }>> => {
    return api.get('/api/v1/client/private/dashboard/analytics', {
      params: workflowId ? { workflowId } : undefined
    });
  },

  /**
   * Export dashboard data
   */
  exportData: async (
    format: 'csv' | 'excel' | 'pdf',
    filters?: FilterOptions
  ): Promise<Blob> => {
    const response = await api.get('/api/v1/client/private/dashboard/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data as unknown as Blob;
  },

  /**
   * Get user workload
   */
  getUserWorkload: async (userId?: string): Promise<ApiResponse<{
    assignedApplications: number;
    overdueApplications: number;
    completedToday: number;
    averageCompletionTime: number;
    workload: Array<{
      workflowName: string;
      count: number;
      averageTime: number;
    }>;
  }>> => {
    return api.get('/api/v1/client/private/dashboard/workload', {
      params: userId ? { userId } : undefined
    });
  }
};