// src/features/workflow-templates/types/template.types.ts
import type { Person } from "@features/workflow-config-edit/types/builder.types";

export interface TemplateTransition {
  id: string;
  label: string;
  nextState: string;
  operation?: string;
}

export interface TemplateAction {
  label: string;
  nextState: string;
  operation?: string;
  handle?: "left" | "center" | "right";
}

export interface TemplateState {
  name: string;
  type: "process" | "decision";
  assignees: Person[]; // Empty initially, filled by user
  forms?: Array<{
    formName: string;
    visibility?: "visible" | "hidden";
    fieldOverrides?: Record<string, unknown>;
  }>;
  actions?: Record<string, TemplateAction>; // For process nodes
  transitions?: TemplateTransition[]; // For decision nodes
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  estimatedTime: string;
  workflow: {
    id: string;
    version: number;
  forms: Record<string, unknown>;
    states: Record<string, TemplateState>;
  };
}

export interface AssignmentData {
  [stateId: string]: Person[];
}
