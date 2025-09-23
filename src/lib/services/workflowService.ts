/**
 * Centralized Workflow Service
 * Uses the centralized API client with automatic token handling
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS, BACKEND_STATUS } from '@/lib/api/config';
import type { 
  PaginatedRequest, 
  PaginatedResponse, 
  ApplicationInstance,
  DashboardStats,
  FilterOptions
} from '@/lib/api/types';

// Backend response types
interface BackendWorkflowResponse {
  status: string;
  message?: string;
  data?: Record<string, unknown>[] | Record<string, unknown>;
}

interface BackendStatsResponse {
  status: string;
  message?: string;
  data?: DashboardStats;
}

class WorkflowService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(filters?: FilterOptions): Promise<DashboardStats> {
    try {
      const response = await api.post<BackendStatsResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.DASHBOARD.STATS,
        filters || {}
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to fetch dashboard stats');
      }

      return response.data?.data || {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        slaMetrics: {
          onTime: 0,
          due: 0,
          overdue: 0,
          completed: 0,
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get dashboard applications with pagination
   */
  async getDashboardApplications(params?: PaginatedRequest & FilterOptions): Promise<PaginatedResponse<ApplicationInstance>> {
    try {
      const response = await api.post<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.DASHBOARD.APPLICATIONS,
        params || {}
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to fetch dashboard applications');
      }

      const applications = response.data?.data || [];
      
      // Transform backend data to ApplicationInstance format
      const transformedApplications: ApplicationInstance[] = applications.map((item: any) => ({
        id: item.id || item.workflowId,
        workflowId: item.workflowId || item.id,
        currentState: item.currentState || item.state,
        status: item.status || 'pending',
        assignee: item.assignee,
        data: item.data || {},
        history: item.history || [],
        metadata: {
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          slaStatus: item.slaStatus || 'on-time',
          priority: item.priority || 'medium'
        }
      }));

      return {
        data: transformedApplications,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 50,
          total: transformedApplications.length,
          totalPages: Math.ceil(transformedApplications.length / (params?.limit || 50))
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard applications:', error);
      throw error;
    }
  }

  /**
   * Search applications
   */
  async searchApplications(query: { term: string; filters?: FilterOptions }): Promise<ApplicationInstance[]> {
    try {
      const response = await api.post<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.DASHBOARD.SEARCH,
        query
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to search applications');
      }

      const applications = response.data?.data || [];
      
      return applications.map((item: any) => ({
        id: item.id || item.workflowId,
        workflowId: item.workflowId || item.id,
        currentState: item.currentState || item.state,
        status: item.status || 'pending',
        assignee: item.assignee,
        data: item.data || {},
        history: item.history || [],
        metadata: {
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          slaStatus: item.slaStatus || 'on-time',
          priority: item.priority || 'medium'
        }
      }));
    } catch (error) {
      console.error('Error searching applications:', error);
      throw error;
    }
  }

  /**
   * Get running workflows
   */
  async getRunningWorkflows(filters?: { status?: string; workflowId?: string; assignee?: string }): Promise<any[]> {
    try {
      const response = await api.post<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.WORKFLOW.GET_ALL,
        filters || {}
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to fetch running workflows');
      }

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching running workflows:', error);
      throw error;
    }
  }

  /**
   * Get a specific workflow instance
   */
  async getWorkflowInstance(instanceId: string): Promise<ApplicationInstance> {
    try {
      const response = await api.get<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.WORKFLOW_INSTANCE.GET(instanceId)
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to fetch workflow instance');
      }

      const item = response.data?.data;
      if (!item) {
        throw new Error(`Workflow instance ${instanceId} not found`);
      }

      return {
        id: item.id || instanceId,
        workflowId: item.workflowId || instanceId,
        currentState: item.currentState || item.state,
        status: item.status || 'pending',
        assignee: item.assignee,
        data: item.data || {},
        history: item.history || [],
        metadata: {
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          slaStatus: item.slaStatus || 'on-time',
          priority: item.priority || 'medium'
        }
      };
    } catch (error) {
      console.error('Error fetching workflow instance:', error);
      throw error;
    }
  }

  /**
   * Start a new workflow instance
   */
  async startWorkflowInstance(data: { workflowId: string; initialData?: Record<string, unknown> }): Promise<ApplicationInstance> {
    try {
      const response = await api.post<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.WORKFLOW_INSTANCE.START,
        data
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to start workflow instance');
      }

      const item = response.data?.data;
      if (!item) {
        throw new Error('No instance data returned from workflow start');
      }

      return {
        id: item.id,
        workflowId: item.workflowId || data.workflowId,
        currentState: item.currentState || item.state,
        status: item.status || 'pending',
        assignee: item.assignee,
        data: item.data || data.initialData || {},
        history: item.history || [],
        metadata: {
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          slaStatus: 'on-time',
          priority: 'medium'
        }
      };
    } catch (error) {
      console.error('Error starting workflow instance:', error);
      throw error;
    }
  }

  /**
   * Advance a workflow instance to the next state
   */
  async advanceWorkflowInstance(instanceId: string, action: { targetState: string; data?: Record<string, unknown> }): Promise<ApplicationInstance> {
    try {
      const response = await api.post<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.WORKFLOW_INSTANCE.ADVANCE(instanceId),
        action
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to advance workflow instance');
      }

      const item = response.data?.data;
      if (!item) {
        throw new Error('No instance data returned from workflow advance');
      }

      return {
        id: item.id || instanceId,
        workflowId: item.workflowId,
        currentState: item.currentState || action.targetState,
        status: item.status || 'pending',
        assignee: item.assignee,
        data: item.data || {},
        history: item.history || [],
        metadata: {
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          slaStatus: item.slaStatus || 'on-time',
          priority: item.priority || 'medium'
        }
      };
    } catch (error) {
      console.error('Error advancing workflow instance:', error);
      throw error;
    }
  }

  /**
   * Assign a workflow instance to a user
   */
  async assignWorkflowInstance(instanceId: string, assignee: string): Promise<void> {
    try {
      const response = await api.post<BackendWorkflowResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.WORKFLOW_INSTANCE.ASSIGN(instanceId),
        { assignee }
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to assign workflow instance');
      }
    } catch (error) {
      console.error('Error assigning workflow instance:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();

export default workflowService;