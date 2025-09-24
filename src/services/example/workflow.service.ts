/**
 * Example Workflow Service
 * Shows how to use the simplified API client
 */

import { api } from '@/lib/api';

export interface Workflow {
  id: string;
  name: string;
  currentState: string;
  status: 'active' | 'completed' | 'pending' | 'rejected';
  data: Record<string, any>;
}

export interface WorkflowListResponse {
  data: Workflow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class WorkflowService {
  private readonly baseUrl = '/api/v1/client/private/workflows';

  /**
   * Get all workflows
   */
  async getAll(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<WorkflowListResponse> {
    return api.get<WorkflowListResponse>(this.baseUrl, {
      params: filters,
    });
  }

  /**
   * Get single workflow
   */
  async getById(id: string): Promise<Workflow> {
    return api.get<Workflow>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new workflow
   */
  async create(data: Partial<Workflow>): Promise<Workflow> {
    return api.post<Workflow>(this.baseUrl, data);
  }

  /**
   * Update workflow
   */
  async update(id: string, data: Partial<Workflow>): Promise<Workflow> {
    return api.put<Workflow>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete workflow
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Execute workflow action
   */
  async executeAction(
    id: string,
    action: string,
    data?: Record<string, any>
  ): Promise<Workflow> {
    return api.post<Workflow>(`${this.baseUrl}/${id}/actions/${action}`, data);
  }

  /**
   * Get workflow history
   */
  async getHistory(id: string): Promise<any[]> {
    return api.get<any[]>(`${this.baseUrl}/${id}/history`);
  }

  /**
   * Upload attachment
   */
  async uploadAttachment(
    workflowId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ fileId: string; url: string }> {
    return api.uploadFile(
      `${this.baseUrl}/${workflowId}/attachments`,
      file,
      onProgress
    );
  }

  /**
   * Download report
   */
  async downloadReport(workflowId: string): Promise<void> {
    return api.downloadFile(
      `${this.baseUrl}/${workflowId}/report`,
      `workflow-${workflowId}-report.pdf`
    );
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();