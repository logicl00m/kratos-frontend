// Core API types - standardized server response format
export interface ServerResponse<T = unknown> extends Record<string, unknown> {
  status: string; // e.g., "S2000" for success
  message: string;
  data: T; // This is what we extract and return to features
}

// Legacy API response interface - for backward compatibility  
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Response parsing and validation types
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ParsedApiResponse<T = unknown> {
  data: T;
  isSuccess: boolean;
  message: string;
  httpStatus: number;
  customStatus: string;
}

// Auth types
export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Workflow types
export interface WorkflowNode {
  id: string;
  type: 'process' | 'decision' | 'start' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    formId?: string;
    assignees?: string[];
    actions?: WorkflowAction[];
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    label?: string;
    condition?: string;
  };
}

export interface WorkflowAction {
  type: 'approve' | 'reject' | 'escalate' | 'custom';
  label: string;
  targetState?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    tags?: string[];
  };
}

// Configuration types
export interface ConfigurationPayload {
  name: string;
  description?: string;
  workflow: WorkflowDefinition;
  forms?: FormDefinition[];
  settings?: Record<string, string | number | boolean | object>;
}

// Form types
export interface FormField {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string | number | boolean | string[];
}

export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

// Application/Instance types
export interface ApplicationInstance {
  id: string;
  workflowId: string;
  currentState: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'completed';
  assignee?: string;
  data: Record<string, string | number | boolean | object>;
  history: ApplicationEvent[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    slaStatus: 'on-time' | 'due' | 'overdue' | 'completed';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface ApplicationEvent {
  id: string;
  type: 'state_change' | 'assignment' | 'comment' | 'document_upload' | 'approval' | 'rejection';
  timestamp: string;
  user: string;
  details: {
    fromState?: string;
    toState?: string;
    comment?: string;
    document?: {
      name: string;
      type: string;
      size: number;
    };
  };
}

// Dashboard/Analytics types
export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  slaMetrics: {
    onTime: number;
    due: number;
    overdue: number;
    completed: number;
  };
}

export interface FilterOptions {
  status?: string[];
  assignee?: string[];
  product?: string[];
  stage?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Template types
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'New Application' | 'Review' | 'Assessment' | 'Custom';
  workflow: WorkflowDefinition;
  defaultForms?: FormDefinition[];
  tags?: string[];
}

// Running workflow types
export interface RunningWorkflow {
  id: string;
  instanceId: string;
  workflowName: string;
  currentNode: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  assignee?: string;
  lastUpdated: string;
  metadata?: Record<string, string | number | boolean>;
}

// Error types
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Request/Response wrapper types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: FilterOptions;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User/Auth types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  department?: string;
  avatar?: string;
}

// Environment config types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  defaultSubject: string;
}