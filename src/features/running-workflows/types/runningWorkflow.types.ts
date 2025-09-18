// src/features/running-workflows/types/runningWorkflow.types.ts

// New JSON structure types
export interface WorkflowAssignee {
  subjectId: string;
  employeeName: string;
  role: string;
  email: string;
  primary?: boolean;
  since?: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  at: string;
  byUser: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  stateFrom: string | null;
  stateTo: string;
  changes?: Array<{
    fieldId: string;
    old: any;
    new: any;
  }>;
}

export interface WorkflowState {
  assignees: WorkflowAssignee[];
  forms: Array<{
    formName: string;
    visibility?: string;
    fieldOverrides?: Record<string, any>;
  }>;
  actions: Record<string, {
    nextState: string;
    operation: string;
    allowedRoles?: string[];
  }>;
  history: WorkflowHistoryEntry[];
  assigneePolicy?: {
    requiredRoles: string[];
  };
}

export interface WorkflowField {
  id: string;
  name: string;
  type: string;
  data: any;
  fieldActions: Array<{
    operation: string;
  }>;
}

export interface WorkflowForm {
  fields: WorkflowField[];
}

export interface WorkflowData {
  workflow: {
    id: string;
    version: number;
    initialState: string;
    currentState: string;
    currentStateEnteredAt: string;
    forms: Record<string, WorkflowForm>;
    states: Record<string, WorkflowState>;
  };
}

// Types for UI components (keeping existing interface for compatibility)
export interface Actor {
  id: string;
  name: string;
  role: string;
  email?: string;
  department?: string;
}

export interface FieldChange {
  fieldId: string;
  fieldName?: string;
  oldValue: any;
  newValue: any;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings?: string[];
}

export type EventType = 
  | 'STATE_TRANSITION' 
  | 'FIELD_UPDATE' 
  | 'DOCUMENT_UPLOAD' 
  | 'VALIDATION_FAILURE'
  | 'COMMENT_ADDED'
  | 'ESCALATION'
  | 'DELEGATION';

export interface WorkflowEvent {
  type: EventType;
  action?: string;
  from?: string;
  to?: string;
  details?: Record<string, any>;
}

export interface WorkflowHistoryItem {
  id: string;
  timestamp: string;
  actor: Actor;
  event: WorkflowEvent;
  changes?: FieldChange[];
  validation?: ValidationResult;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    source?: 'UI' | 'API' | 'SYSTEM';
  };
  notes?: string;
  attachments?: string[];
}

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  currentState: string;
  status: 'active' | 'completed' | 'pending' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate?: string;
  owner: Actor;
  currentAssignee?: Actor;
  watchers?: Actor[];
  data: Record<string, any>;
  history: WorkflowHistoryItem[];
  metrics?: {
    totalDuration?: number;
    statesDuration?: Record<string, number>;
    revisitCount?: Record<string, number>;
  };
  context?: {
    businessUnit?: string;
    category?: string;
    tags?: string[];
    externalReferences?: Record<string, string>;
  };
}

export interface RunningWorkflowsData {
  instances: WorkflowInstance[];
  lastUpdated: string;
}

export interface RunningWorkflowNodeData {
  label: string;
  status: "visited" | "current" | "pending";
  visitedAt?: string;
  performedBy?: string;
  data?: Record<string, any>;
}