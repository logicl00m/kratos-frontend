// Global workflow parser types
import type { Node, Edge } from "reactflow";

// Field and Form Types
export interface FieldAction {
  operation: string;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  data?: string;
  fieldActions?: FieldAction[];
}

export interface Form {
  fields: Field[];
}

export interface FieldOverride {
  status?: "hidden" | "editable" | "actionable" | "readonly";
  required?: boolean;
}

export interface StateForm {
  formName: string;
  visibility?: "hidden" | "visible";
  fieldOverrides?: Record<string, FieldOverride>;
}

// State and Action Types
export interface StateAction {
  nextState: string;
  operation?: string;
}

export interface State {
  forms?: StateForm[];
  actions?: Record<string, StateAction>;
}

// Workflow Configuration
export interface WorkflowConfig {
  workflow: {
    forms?: Record<string, Form>;
    states: Record<string, State>;
    startState?: string;
    metadata?: {
      name?: string;
      description?: string;
      version?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

// Node Data Types (for visual representation)
export interface Person {
  id: string;
  name: string;
  type: 'user' | 'role';
}

export interface FormRef {
  id: string;
  name: string;
  version: number;
  binding: 'pinned' | 'latest';
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
  forms?: string[]; // Legacy support
  form?: FormRef;
  requireFormToTransition?: boolean;
  onOpenFormConfig?: (nodeId: string) => void;
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

export interface StateNodeData {
  label: string;
  hasForm: boolean;
  fields: StateFormField[];
  internalId?: string;
  assignees?: Person[];
}

export type BuilderNodeData = ProcessNodeData | DecisionNodeData | StateNodeData;

export interface StateFormField extends Field {
  stateConfig?: FieldOverride;
  formName?: string;
}

// Parser Configuration
export interface ParserOptions {
  nodeStyle?: 'builder' | 'viewer' | 'simple';
  layoutDirection?: 'horizontal' | 'vertical';
  spacing?: {
    horizontal: number;
    vertical: number;
  };
  includeFormData?: boolean;
  includeAssignees?: boolean;
}

export interface ParsedWorkflow {
  nodes: Node<BuilderNodeData>[];
  edges: Edge[];
  metadata?: WorkflowConfig['workflow']['metadata'];
}