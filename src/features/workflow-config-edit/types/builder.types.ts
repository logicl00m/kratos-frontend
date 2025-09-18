// src/features/workflow/types/builder.types.ts

export interface Person {
  id: string;
  name: string;
  type: 'user' | 'role';
}

export interface ProcessNodeData {
  label: string;
  internalId?: string;
  assignees: Person[];
  actions: {
    left: { label: string; operation?: string };
    center: { label: string; operation?: string };
    right: { label: string; operation?: string };
  };
  forms?: string[];
}

export interface DecisionNodeData {
  label: string;
  internalId?: string;
  assignees: Person[];
  transitions: Array<{
    id: string;
    label: string;
    operation?: string;
  }>;
  forms?: string[];
}

export type BuilderNodeData = ProcessNodeData | DecisionNodeData;

export interface BuilderNode {
  id: string;
  type: 'process' | 'decision';
  position: { x: number; y: number };
  data: BuilderNodeData;
}

export interface BuilderEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label: string;
  operation?: string;
}

export interface WorkflowBuilderConfig {
  workflow: {
    forms: Record<string, any>;
    states: Record<string, {
      forms?: Array<{
        formName: string;
        visibility?: 'visible' | 'hidden';
        fieldOverrides?: Record<string, any>;
      }>;
      actions?: Record<string, {
        nextState: string;
        operation?: string;
      }>;
    }>;
    startState?: string;
  };
}