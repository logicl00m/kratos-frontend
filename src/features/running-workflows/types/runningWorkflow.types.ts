// src/features/running-workflows/types/runningWorkflow.types.ts

export interface WorkflowInstance {
  id: string;
  workflowName: string;
  currentState: string;
  status: "active" | "completed" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
  owner: string;
  data: Record<string, any>;
  history: WorkflowHistoryItem[];
}

export interface WorkflowHistoryItem {
  state: string;
  action?: string;
  timestamp: string;
  performedBy: string;
  comments?: string;
  data?: Record<string, any>;
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