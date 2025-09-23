import { ApiClient } from '../base/ApiClientNew';

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

  /**
   * Get all applications with filtering
   * Returns: PaginatedResponse<Application> (extracted data)
   */
  async getApplications(
    filters?: ApplicationFilters
  ): Promise<PaginatedResponse<Application>> {
    return this.apiClient.get<PaginatedResponse<Application>>(
      '/applications',
      { params: filters }
    );
  }

  /**
   * Get single application by ID
   * Returns: Application (extracted data)
   */
  async getApplication(id: string): Promise<Application> {
    return this.apiClient.get<Application>(`/applications/${id}`);
  }

  /**
   * Create new application
   * Returns: Application (extracted data)
   */
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

    return this.apiClient.post<Application>(
      '/applications',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Update existing application
   * Returns: Application (extracted data)
   */
  async updateApplication(
    id: string,
    data: UpdateApplicationData
  ): Promise<Application> {
    return this.apiClient.patch<Application>(`/applications/${id}`, data);
  }

  /**
   * Delete application
   * Returns: void (empty data)
   */
  async deleteApplication(id: string): Promise<void> {
    return this.apiClient.delete(`/applications/${id}`);
  }

  /**
   * Approve application
   * Returns: Application (extracted data)
   */
  async approveApplication(id: string, comments?: string): Promise<Application> {
    return this.apiClient.post<Application>(
      `/applications/${id}/approve`,
      { comments }
    );
  }

  /**
   * Reject application
   * Returns: Application (extracted data)
   */
  async rejectApplication(
    id: string,
    reason: string,
    comments?: string
  ): Promise<Application> {
    return this.apiClient.post<Application>(
      `/applications/${id}/reject`,
      { reason, comments }
    );
  }

  /**
   * Assign application to user
   * Returns: Application (extracted data)
   */
  async assignApplication(id: string, userId: string): Promise<Application> {
    return this.apiClient.post<Application>(
      `/applications/${id}/assign`,
      { userId }
    );
  }

  /**
   * Get application statistics
   * Returns: ApplicationStatistics (extracted data)
   */
  async getApplicationStatistics(
    filters?: ApplicationFilters
  ): Promise<ApplicationStatistics> {
    return this.apiClient.get<ApplicationStatistics>(
      '/applications/statistics',
      { params: filters }
    );
  }

  /**
   * Get application documents
   * Returns: Document[] (extracted data)
   */
  async getApplicationDocuments(id: string): Promise<Document[]> {
    return this.apiClient.get<Document[]>(`/applications/${id}/documents`);
  }

  /**
   * Upload document to application
   * Returns: Document (extracted data)
   */
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

    return this.apiClient.upload<Document>(
      `/applications/${applicationId}/documents`,
      formData
    );
  }

  /**
   * Delete document from application
   * Returns: void (empty data)
   */
  async deleteDocument(applicationId: string, documentId: string): Promise<void> {
    return this.apiClient.delete(
      `/applications/${applicationId}/documents/${documentId}`
    );
  }

  /**
   * Export applications
   * Returns: void (triggers file download)
   */
  async exportApplications(
    filters?: ApplicationFilters,
    format: 'csv' | 'excel' | 'pdf' = 'excel'
  ): Promise<void> {
    await this.apiClient.download(
      `/applications/export?format=${format}`,
      `applications-export.${format}`
    );
  }

  /**
   * Get application history/audit trail
   * Returns: AuditLog[] (extracted data)
   */
  async getApplicationHistory(id: string): Promise<AuditLog[]> {
    return this.apiClient.get<AuditLog[]>(`/applications/${id}/history`);
  }

  /**
   * Bulk update multiple applications
   * Returns: Application[] (extracted data)
   */
  async bulkUpdateApplications(
    ids: string[],
    data: UpdateApplicationData
  ): Promise<Application[]> {
    return this.apiClient.post<Application[]>(
      '/applications/bulk-update',
      { ids, data }
    );
  }

  /**
   * Search applications
   * Returns: Application[] (extracted data)
   */
  async searchApplications(query: string): Promise<Application[]> {
    return this.apiClient.get<Application[]>(
      '/applications/search',
      { params: { q: query } }
    );
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