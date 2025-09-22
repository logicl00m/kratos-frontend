import { Node, Edge, Connection, ReactFlowInstance } from '@xyflow/react';

/**
 * Workflow-specific type definitions
 */

// Workflow status types
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// Workflow node types
export interface BaseNodeData {
  label: string;
  description?: string;
  status?: NodeStatus;
  metadata?: Record<string, unknown>;
}

export interface ProcessNodeData extends BaseNodeData {
  type: 'process';
  assignee?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  actions?: NodeAction[];
}

export interface DecisionNodeData extends BaseNodeData {
  type: 'decision';
  conditions?: DecisionCondition[];
  defaultPath?: string;
}

export interface StartNodeData extends BaseNodeData {
  type: 'start';
  triggers?: Trigger[];
}

export interface EndNodeData extends BaseNodeData {
  type: 'end';
  outcome?: 'success' | 'failure' | 'cancelled';
}

export type WorkflowNodeData =
  | ProcessNodeData
  | DecisionNodeData
  | StartNodeData
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData>;

// Edge types
export interface WorkflowEdgeData {
  label?: string;
  condition?: EdgeCondition;
  probability?: number;
  animated?: boolean;
  style?: React.CSSProperties;
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

// Action types
export interface NodeAction {
  id: string;
  type: 'approve' | 'reject' | 'review' | 'custom';
  label: string;
  icon?: string;
  handler?: (nodeId: string, data: unknown) => void | Promise<void>;
  requiresComment?: boolean;
  permissions?: string[];
}

// Condition types
export interface DecisionCondition {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
  targetNodeId: string;
  label?: string;
}

export interface EdgeCondition {
  expression: string;
  variables?: Record<string, unknown>;
}

// Trigger types
export interface Trigger {
  id: string;
  type: 'manual' | 'scheduled' | 'event' | 'api';
  config?: TriggerConfig;
}

export interface TriggerConfig {
  schedule?: string; // Cron expression
  event?: string;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

// Workflow definition
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: WorkflowVariable[];
  settings?: WorkflowSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  defaultValue?: unknown;
  required?: boolean;
  description?: string;
}

export interface WorkflowSettings {
  autoSave?: boolean;
  notifications?: NotificationSettings;
  sla?: SLASettings;
  permissions?: WorkflowPermissions;
  layout?: LayoutSettings;
}

export interface NotificationSettings {
  onStart?: boolean;
  onComplete?: boolean;
  onError?: boolean;
  recipients?: string[];
}

export interface SLASettings {
  duration?: number; // in minutes
  warningThreshold?: number; // percentage
  escalationPolicy?: string;
}

export interface WorkflowPermissions {
  view?: string[];
  edit?: string[];
  execute?: string[];
  delete?: string[];
}

export interface LayoutSettings {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  spacing?: { x: number; y: number };
  animated?: boolean;
}

// Workflow instance (runtime)
export interface WorkflowInstance {
  id: string;
  definitionId: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentNodeId?: string;
  startedAt: Date;
  completedAt?: Date;
  context: WorkflowContext;
  history: WorkflowHistoryItem[];
  metrics?: WorkflowMetrics;
}

export interface WorkflowContext {
  variables: Record<string, unknown>;
  user?: {
    id: string;
    name: string;
    roles: string[];
  };
  application?: {
    id: string;
    type: string;
    data: Record<string, unknown>;
  };
}

export interface WorkflowHistoryItem {
  nodeId: string;
  action: string;
  timestamp: Date;
  userId: string;
  data?: Record<string, unknown>;
  duration?: number;
}

export interface WorkflowMetrics {
  totalDuration?: number;
  nodeMetrics?: Record<string, NodeMetrics>;
  slaStatus?: 'on-track' | 'at-risk' | 'breached';
  completionRate?: number;
}

export interface NodeMetrics {
  executionTime: number;
  waitTime?: number;
  retryCount?: number;
  errorCount?: number;
}

// Workflow template
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnail?: string;
  definition: Partial<WorkflowDefinition>;
  variables?: WorkflowVariable[];
  tags?: string[];
  popularity?: number;
  isPublic?: boolean;
}

// Workflow events
export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: string;
  nodeId?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export type WorkflowEventType =
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.paused'
  | 'workflow.resumed'
  | 'node.entered'
  | 'node.executed'
  | 'node.completed'
  | 'node.failed'
  | 'node.skipped';

// ReactFlow helpers
export interface FlowHelpers {
  instance: ReactFlowInstance;
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  exportImage: () => Promise<string>;
  exportJSON: () => string;
  importJSON: (json: string) => void;
}

// Connection validation
export interface ConnectionValidation {
  isValid: boolean;
  message?: string;
  suggestion?: string;
}

export type ConnectionValidator = (
  connection: Connection,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
) => ConnectionValidation;

// Node position calculation
export interface NodePosition {
  x: number;
  y: number;
}

export interface LayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  spacing: { x: number; y: number };
  nodeWidth: number;
  nodeHeight: number;
}

export type LayoutCalculator = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: LayoutOptions
) => Record<string, NodePosition>;

// Export types
export type WorkflowExportFormat = 'json' | 'bpmn' | 'image' | 'pdf';

export interface WorkflowExportOptions {
  format: WorkflowExportFormat;
  includeMetadata?: boolean;
  quality?: number; // For image exports
  scale?: number; // For image exports
}