// src/features/running-workflows/types/runningWorkflow.types.ts

import type { FieldOverride } from "../../workflow/types/workflow.types";

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
    email?: string;
  };
  action: string;
  stateFrom: string | null;
  stateTo: string;
  changes?: Array<{
    fieldId: string;
    old: unknown;
    new: unknown;
  }>;
}

export interface WorkflowState {
  assignees: WorkflowAssignee[];
  forms: Array<{
    formName: string;
    visibility?: string;
    fieldOverrides?: Record<string, FieldOverride>;
  }>;
  actions: Record<
    string,
    {
      nextState: string;
      operation: string;
      allowedRoles?: string[];
    }
  >;
  history: WorkflowHistoryEntry[];
  assigneePolicy?: {
    requiredRoles: string[];
  };
}

export interface WorkflowField {
  id: string;
  name: string;
  type: string;
  data: unknown;
  fieldActions: Array<{
    operation: string;
  }>;
}

export interface WorkflowForm {
  fields: WorkflowField[];
}

export interface WorkflowData {
  id: string;
  version: number;
  initialState: string;
  currentState: string;
  currentStateEnteredAt: string;
  forms: Record<string, WorkflowForm>;
  states: Record<string, WorkflowState>;
  // Metadata from API transformation
  __workflowConfigId?: string;
  __workflowConfigName?: string;
  __isArchived?: boolean;
  __metadata?: Record<string, unknown>;
}

// Wrapper type for backward compatibility
export interface WorkflowDataWrapper {
  workflow: WorkflowData;
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
  oldValue: unknown;
  newValue: unknown;
  changeType: "CREATE" | "UPDATE" | "DELETE";
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings?: string[];
}

export type EventType =
  | "STATE_TRANSITION"
  | "FIELD_UPDATE"
  | "DOCUMENT_UPLOAD"
  | "VALIDATION_FAILURE"
  | "COMMENT_ADDED"
  | "ESCALATION"
  | "DELEGATION";

export interface WorkflowEvent {
  type: EventType;
  action?: string;
  from?: string;
  to?: string;
  details?: Record<string, unknown>;
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
    source?: "UI" | "API" | "SYSTEM";
  };
  notes?: string;
  attachments?: string[];
}

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  currentState: string;
  status: "active" | "completed" | "pending" | "rejected";
  priority?: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate?: string;
  owner: Actor;
  currentAssignee?: Actor;
  watchers?: Actor[];
  data: Record<string, unknown>;
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
  data?: Record<string, unknown>;
}
