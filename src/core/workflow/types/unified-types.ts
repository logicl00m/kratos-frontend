/**
 * Unified Workflow Types
 *
 * This file contains the unified type definitions for all workflow parsers
 * to ensure consistency across the application.
 */

import type { Node, Edge } from 'reactflow';

// ============================================================================
// Core Field and Form Types
// ============================================================================

export interface FieldAction {
  operation: string;
  params?: Record<string, unknown>;
}

export interface WorkflowField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file' | 'date' | 'checkbox';
  data?: unknown;
  defaultValue?: unknown;
  fieldActions?: FieldAction[];
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface WorkflowForm {
  id?: string;
  name?: string;
  fields: WorkflowField[];
  version?: number;
}

// ============================================================================
// State Configuration Types
// ============================================================================

export type FieldStatus = 'hidden' | 'readonly' | 'editable' | 'actionable';

export interface FieldOverride {
  status?: FieldStatus;
  required?: boolean;
  defaultValue?: unknown;
}

export interface StateFormReference {
  formName: string;
  formId?: string;
  visibility?: 'hidden' | 'visible';
  fieldOverrides?: Record<string, FieldOverride>;
}

export interface StateAction {
  nextState: string;
  operation?: string;
  allowedRoles?: string[];
  conditions?: Record<string, unknown>;
}

export interface WorkflowState {
  id?: string;
  name?: string;
  forms?: StateFormReference[];
  actions?: Record<string, StateAction>;
  metadata?: {
    description?: string;
    sla?: number;
    escalation?: {
      threshold: number;
      target: string;
    };
  };
}

// ============================================================================
// Runtime Types (for running workflows)
// ============================================================================

export interface WorkflowActor {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
}

export interface WorkflowAssignee extends WorkflowActor {
  primary?: boolean;
  since?: string;
  delegatedFrom?: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: string;
  actor: WorkflowActor;
  action: string;
  stateFrom: string | null;
  stateTo: string | null;
  changes?: Array<{
    fieldId: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  metadata?: Record<string, unknown>;
}

export interface RuntimeWorkflowState extends WorkflowState {
  assignees?: WorkflowAssignee[];
  history?: WorkflowHistoryEntry[];
  enteredAt?: string;
  exitedAt?: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Workflow Configuration Types
// ============================================================================

export interface WorkflowMetadata {
  id: string;
  name: string;
  version: number;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface WorkflowConfiguration {
  metadata?: WorkflowMetadata;
  forms: Record<string, WorkflowForm>;
  states: Record<string, WorkflowState>;
  startState?: string;
  endStates?: string[];
  globalSettings?: {
    defaultTimeout?: number;
    allowedRoles?: string[];
    notifications?: boolean;
  };
}

export interface RuntimeWorkflowConfiguration extends WorkflowConfiguration {
  currentState: string;
  currentStateEnteredAt: string;
  states: Record<string, RuntimeWorkflowState>;
  instanceId: string;
  status: WorkflowStatus;
  priority?: WorkflowPriority;
}

// ============================================================================
// Status and Priority Types
// ============================================================================

export type WorkflowStatus = 'draft' | 'active' | 'completed' | 'rejected' | 'cancelled' | 'pending';
export type WorkflowPriority = 'low' | 'medium' | 'high' | 'critical';

export interface WorkflowStatusInfo {
  status: WorkflowStatus;
  label: string;
  color: string;
  icon?: string;
}

// ============================================================================
// Node Data Types (for visualization)
// ============================================================================

export interface BaseNodeData {
  label: string;
  internalId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface StateNodeData extends BaseNodeData {
  hasForm: boolean;
  fields: WorkflowField[];
  formCount?: number;
  actions?: string[];
}

export interface ProcessNodeData extends BaseNodeData {
  assignees: WorkflowAssignee[];
  forms: string[];
  actions: {
    left?: { label: string; operation?: string };
    center?: { label: string; operation?: string };
    right?: { label: string; operation?: string };
  };
}

export interface DecisionNodeData extends BaseNodeData {
  assignees: WorkflowAssignee[];
  transitions: Array<{
    id: string;
    label: string;
    condition?: string;
    operation?: string;
  }>;
}

export interface RuntimeNodeData extends BaseNodeData {
  status: 'visited' | 'current' | 'pending' | 'skipped';
  visitedAt?: string;
  performedBy?: string;
  duration?: number;
  data?: Record<string, unknown>;
}

export type WorkflowNodeData =
  | StateNodeData
  | ProcessNodeData
  | DecisionNodeData
  | RuntimeNodeData;

// ============================================================================
// Parser Configuration Types
// ============================================================================

export interface ParserOptions {
  // Node styling options
  nodeStyle?: 'simple' | 'detailed' | 'process' | 'runtime';

  // Layout options
  layout?: {
    algorithm?: 'grid' | 'dagre' | 'elk' | 'force';
    direction?: 'horizontal' | 'vertical' | 'radial';
    spacing?: {
      horizontal: number;
      vertical: number;
    };
  };

  // Feature flags
  features?: {
    includeFormData?: boolean;
    includeAssignees?: boolean;
    includeHistory?: boolean;
    includeMetrics?: boolean;
    includeValidation?: boolean;
  };

  // Visual options
  visual?: {
    edgeStyle?: 'straight' | 'smooth' | 'step' | 'bezier';
    animateTransitions?: boolean;
    showLabels?: boolean;
    colorScheme?: 'default' | 'status' | 'custom';
  };
}

export interface ParserContext {
  options: ParserOptions;
  errors: string[];
  warnings: string[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// Parser Output Types
// ============================================================================

export interface ParsedWorkflow {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  metadata?: WorkflowMetadata;
  validation?: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  metrics?: {
    nodeCount: number;
    edgeCount: number;
    maxDepth: number;
    cycleDetected: boolean;
  };
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// ============================================================================
// Transformer Types
// ============================================================================

export interface WorkflowTransformOptions {
  format: 'graph' | 'json' | 'dashboard' | 'instance';
  includeDefaults?: boolean;
  validate?: boolean;
}

export interface WorkflowTransformer<TInput, TOutput> {
  transform(input: TInput, options?: WorkflowTransformOptions): TOutput;
  validate(input: TInput): WorkflowValidationResult;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WorkflowInput =
  | WorkflowConfiguration
  | RuntimeWorkflowConfiguration
  | DeepPartial<WorkflowConfiguration>;

// ============================================================================
// Type Guards
// ============================================================================

export function isRuntimeWorkflow(
  workflow: WorkflowConfiguration | RuntimeWorkflowConfiguration
): workflow is RuntimeWorkflowConfiguration {
  return 'currentState' in workflow && 'instanceId' in workflow;
}

export function isProcessNode(node: Node): node is Node<ProcessNodeData> {
  return node.type === 'process';
}

export function isDecisionNode(node: Node): node is Node<DecisionNodeData> {
  return node.type === 'decision';
}

export function isRuntimeNode(node: Node): node is Node<RuntimeNodeData> {
  return node.type === 'runtime' ||
    (node.data && 'status' in node.data &&
     ['visited', 'current', 'pending', 'skipped'].includes((node.data as any).status));
}

export function hasFormData(state: WorkflowState): boolean {
  return Boolean(state.forms && state.forms.length > 0);
}

export function hasHistory(state: RuntimeWorkflowState): boolean {
  return Boolean(state.history && state.history.length > 0);
}

// ============================================================================
// Constants
// ============================================================================

export const WORKFLOW_STATUS_CONFIG: Record<WorkflowStatus, WorkflowStatusInfo> = {
  draft: { status: 'draft', label: 'Draft', color: '#6b7280' },
  active: { status: 'active', label: 'Active', color: '#3b82f6' },
  completed: { status: 'completed', label: 'Completed', color: '#10b981' },
  rejected: { status: 'rejected', label: 'Rejected', color: '#ef4444' },
  cancelled: { status: 'cancelled', label: 'Cancelled', color: '#f59e0b' },
  pending: { status: 'pending', label: 'Pending', color: '#8b5cf6' }
};

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  nodeStyle: 'detailed',
  layout: {
    algorithm: 'grid',
    direction: 'horizontal',
    spacing: {
      horizontal: 300,
      vertical: 200
    }
  },
  features: {
    includeFormData: true,
    includeAssignees: false,
    includeHistory: false,
    includeMetrics: false,
    includeValidation: false
  },
  visual: {
    edgeStyle: 'smooth',
    animateTransitions: false,
    showLabels: true,
    colorScheme: 'default'
  }
};