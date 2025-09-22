import { ApiClient } from '../base/ApiClient';

export interface Application {
  id: string;
  applicantName: string;
  loanAmount: number;
  product: string;
  stage: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  assignedTo: string;
  initiatedBy: string;
  lastUpdated: Date;
  slaStatus: 'on-time' | 'due' | 'overdue' | 'completed';
  documents: number;
  workflowId?: string;
  metadata?: Record<string, unknown>;
}

export interface ApplicationFilters {
  status?: string;
  stage?: string;
  product?: string;
  assignedTo?: string;
  slaStatus?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgProcessingTime: number;
  slaCompliance: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateApplicationData {
  applicantName: string;
  loanAmount: number;
  product: string;
  documents?: File[];
  metadata?: Record<string, unknown>;
}

export interface UpdateApplicationData {
  stage?: string;
  status?: string;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}

class ApplicationService {
  private static instance: ApplicationService;
  private apiClient: ApiClient;

  private constructor() {
    this.apiClient = new ApiClient({
      baseURL: import.meta.env.VITE_API_URL || '/api',
    });
  }

  public static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  async getApplications(
    filters?: ApplicationFilters
  ): Promise<PaginatedResponse<Application>> {
    const response = await this.apiClient.get<PaginatedResponse<Application>>(
      '/applications',
      { params: filters }
    );
    return response.data;
  }

  async getApplication(id: string): Promise<Application> {
    const response = await this.apiClient.get<Application>(`/applications/${id}`);
    return response.data;
  }

  async createApplication(data: CreateApplicationData): Promise<Application> {
    const formData = new FormData();

    // Add application data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'documents' && Array.isArray(value)) {
        value.forEach(file => formData.append('documents', file));
      } else if (key === 'metadata') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await this.apiClient.post<Application>(
      '/applications',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async updateApplication(
    id: string,
    data: UpdateApplicationData
  ): Promise<Application> {
    const response = await this.apiClient.patch<Application>(
      `/applications/${id}`,
      data
    );
    return response.data;
  }

  async deleteApplication(id: string): Promise<void> {
    await this.apiClient.delete(`/applications/${id}`);
  }

  async approveApplication(id: string, comments?: string): Promise<Application> {
    const response = await this.apiClient.post<Application>(
      `/applications/${id}/approve`,
      { comments }
    );
    return response.data;
  }

  async rejectApplication(
    id: string,
    reason: string,
    comments?: string
  ): Promise<Application> {
    const response = await this.apiClient.post<Application>(
      `/applications/${id}/reject`,
      { reason, comments }
    );
    return response.data;
  }

  async assignApplication(id: string, userId: string): Promise<Application> {
    const response = await this.apiClient.post<Application>(
      `/applications/${id}/assign`,
      { userId }
    );
    return response.data;
  }

  async getApplicationStatistics(
    filters?: ApplicationFilters
  ): Promise<ApplicationStatistics> {
    const response = await this.apiClient.get<ApplicationStatistics>(
      '/applications/statistics',
      { params: filters }
    );
    return response.data;
  }

  async getApplicationDocuments(id: string): Promise<Document[]> {
    const response = await this.apiClient.get<Document[]>(
      `/applications/${id}/documents`
    );
    return response.data;
  }

  async uploadDocument(
    applicationId: string,
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.apiClient.upload<Document>(
      `/applications/${applicationId}/documents`,
      formData
    );
    return response.data;
  }

  async deleteDocument(applicationId: string, documentId: string): Promise<void> {
    await this.apiClient.delete(
      `/applications/${applicationId}/documents/${documentId}`
    );
  }

  async exportApplications(
    filters?: ApplicationFilters,
    format: 'csv' | 'excel' | 'pdf' = 'excel'
  ): Promise<void> {
    await this.apiClient.download(
      `/applications/export?format=${format}`,
      `applications-export.${format}`
    );
  }

  async getApplicationHistory(id: string): Promise<AuditLog[]> {
    const response = await this.apiClient.get<AuditLog[]>(
      `/applications/${id}/history`
    );
    return response.data;
  }

  async bulkUpdateApplications(
    ids: string[],
    data: UpdateApplicationData
  ): Promise<Application[]> {
    const response = await this.apiClient.post<Application[]>(
      '/applications/bulk-update',
      { ids, data }
    );
    return response.data;
  }

  async searchApplications(query: string): Promise<Application[]> {
    const response = await this.apiClient.get<Application[]>(
      '/applications/search',
      { params: { q: query } }
    );
    return response.data;
  }
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export default ApplicationService;