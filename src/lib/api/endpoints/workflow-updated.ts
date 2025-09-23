import { api } from '../client';
import type { 
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
 * All endpoints now return extracted data directly from the server response
 */
export const workflowInstanceApi = {
  /**
   * Start a new workflow instance
   * Returns: { instanceId: string }
   */
  start: async (data: {
    workflowId: string;
    initialData?: Record<string, unknown>;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ instanceId: string }> => {
    return api.post('/api/v1/client/private/workflow-instance/start', data);
  },

  /**
   * Get workflow instance by ID
   * Returns: ApplicationInstance
   */
  get: async (instanceId: string): Promise<ApplicationInstance> => {
    return api.get(`/api/v1/client/private/workflow-instance/${instanceId}`);
  },

  /**
   * Update workflow instance data
   * Returns: ApplicationInstance
   */
  update: async (
    instanceId: string,
    data: Partial<ApplicationInstance>
  ): Promise<ApplicationInstance> => {
    return api.put(`/api/v1/client/private/workflow-instance/${instanceId}`, data);
  },

  /**
   * List workflow instances with filtering
   * Returns: PaginatedResponse<ApplicationInstance>
   */
  list: async (params?: PaginatedRequest & {
    workflowId?: string;
    status?: string[];
    assignee?: string[];
  }): Promise<PaginatedResponse<ApplicationInstance>> => {
    return api.get('/api/v1/client/private/workflow-instance', { params });
  },

  /**
   * Advance workflow to next state
   * Returns: ApplicationInstance
   */
  advance: async (
    instanceId: string,
    action: {
      targetState: string;
      data?: Record<string, unknown>;
      comment?: string;
    }
  ): Promise<ApplicationInstance> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/advance`, action);
  },

  /**
   * Assign workflow instance to user
   * Returns: void (empty data)
   */
  assign: async (
    instanceId: string,
    assignee: string,
    comment?: string
  ): Promise<void> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/assign`, {
      assignee,
      comment
    });
  },

  /**
   * Add comment to workflow instance
   * Returns: ApplicationEvent
   */
  addComment: async (
    instanceId: string,
    comment: string
  ): Promise<ApplicationEvent> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/comment`, {
      comment
    });
  },

  /**
   * Upload document to workflow instance
   * Returns: { documentId: string }
   */
  uploadDocument: async (
    instanceId: string,
    file: File,
    documentType?: string
  ): Promise<{ documentId: string }> => {
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
   * Returns: ApplicationEvent[]
   */
  getHistory: async (instanceId: string): Promise<ApplicationEvent[]> => {
    return api.get(`/api/v1/client/private/workflow-instance/${instanceId}/history`);
  },

  /**
   * Cancel workflow instance
   * Returns: void (empty data)
   */
  cancel: async (
    instanceId: string,
    reason?: string
  ): Promise<void> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/cancel`, {
      reason
    });
  },

  /**
   * Restart workflow instance
   * Returns: ApplicationInstance
   */
  restart: async (
    instanceId: string,
    fromState?: string
  ): Promise<ApplicationInstance> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/restart`, {
      fromState
    });
  },

  /**
   * Escalate workflow instance
   * Returns: void (empty data)
   */
  escalate: async (
    instanceId: string,
    escalationReason: string,
    targetAssignee?: string
  ): Promise<void> => {
    return api.post(`/api/v1/client/private/workflow-instance/${instanceId}/escalate`, {
      escalationReason,
      targetAssignee
    });
  },

  /**
   * Get workflow instance documents
   * Returns: Array of document objects
   */
  getDocuments: async (instanceId: string): Promise<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
  }>> => {
    return api.get(`/api/v1/client/private/workflow-instance/${instanceId}/documents`);
  },

  /**
   * Download workflow instance document
   * Returns: Blob (special case for binary data)
   */
  downloadDocument: async (
    instanceId: string,
    documentId: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/api/v1/client/private/workflow-instance/${instanceId}/document/${documentId}/download`,
      { responseType: 'blob' }
    );
    return response as Blob;
  }
};

/**
 * Running workflows monitoring API
 * All endpoints now return extracted data directly from the server response
 */
export const runningWorkflowApi = {
  /**
   * Get all running workflow instances
   * Returns: RunningWorkflow[]
   */
  list: async (params?: {
    status?: 'running' | 'paused' | 'completed' | 'failed';
    workflowId?: string;
    assignee?: string;
  }): Promise<RunningWorkflow[]> => {
    // The backend expects a POST to /api/v1/client/private/workflow/get/all with filters in the body
    // Keep backwards compatibility by supporting undefined params (send empty object)
    const body = params ?? {};
    return api.post('/api/v1/client/private/workflow/get/all', body);
  },

  /**
   * Get running workflow by instance ID
   * Returns: RunningWorkflow
   */
  get: async (instanceId: string): Promise<RunningWorkflow> => {
    return api.get(`/api/v1/client/private/running-workflows/${instanceId}`);
  },

  /**
   * Pause running workflow
   * Returns: void (empty data)
   */
  pause: async (instanceId: string): Promise<void> => {
    return api.post(`/api/v1/client/private/running-workflows/${instanceId}/pause`);
  },

  /**
   * Resume paused workflow
   * Returns: void (empty data)
   */
  resume: async (instanceId: string): Promise<void> => {
    return api.post(`/api/v1/client/private/running-workflows/${instanceId}/resume`);
  },

  /**
   * Stop running workflow
   * Returns: void (empty data)
   */
  stop: async (
    instanceId: string,
    reason?: string
  ): Promise<void> => {
    return api.post(`/api/v1/client/private/running-workflows/${instanceId}/stop`, {
      reason
    });
  },

  /**
   * Get workflow execution metrics
   * Returns: workflow metrics object
   */
  getMetrics: async (instanceId: string): Promise<{
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
  }> => {
    return api.get(`/api/v1/client/private/running-workflows/${instanceId}/metrics`);
  }
};

/**
 * Dashboard and analytics API
 * All endpoints now return extracted data directly from the server response
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * Returns: DashboardStats
   */
  getStats: async (filters?: FilterOptions): Promise<DashboardStats> => {
    return api.get('/api/v1/client/private/dashboard/stats', { params: filters });
  },

  /**
   * Get applications for dashboard table
   * Returns: PaginatedResponse<ApplicationInstance>
   */
  getApplications: async (params?: PaginatedRequest & FilterOptions): Promise<PaginatedResponse<ApplicationInstance>> => {
    return api.get('/api/v1/client/private/dashboard/applications', { params });
  },

  /**
   * Search applications
   * Returns: ApplicationInstance[]
   */
  searchApplications: async (query: {
    term: string;
    filters?: FilterOptions;
  }): Promise<ApplicationInstance[]> => {
    return api.get('/api/v1/client/private/dashboard/search', { params: query });
  },

  /**
   * Get workflow performance analytics
   * Returns: analytics data object
   */
  getWorkflowAnalytics: async (workflowId?: string): Promise<{
    throughput: Array<{ date: string; count: number }>;
    averageCompletionTime: Array<{ date: string; time: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
    bottlenecks: Array<{ state: string; averageTime: number; count: number }>;
  }> => {
    return api.get('/api/v1/client/private/dashboard/analytics', {
      params: workflowId ? { workflowId } : undefined
    });
  },

  /**
   * Export dashboard data
   * Returns: Blob (special case for binary data)
   */
  exportData: async (
    format: 'csv' | 'excel' | 'pdf',
    filters?: FilterOptions
  ): Promise<Blob> => {
    const response = await api.get('/api/v1/client/private/dashboard/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response as Blob;
  },

  /**
   * Get user workload
   * Returns: user workload data object
   */
  getUserWorkload: async (userId?: string): Promise<{
    assignedApplications: number;
    overdueApplications: number;
    completedToday: number;
    averageCompletionTime: number;
    workload: Array<{
      workflowName: string;
      count: number;
      averageTime: number;
    }>;
  }> => {
    return api.get('/api/v1/client/private/dashboard/workload', {
      params: userId ? { userId } : undefined
    });
  }
};