/*
PROMPT (Copilot/GPT-5): Types & contracts for forms linking

- Add types:
  - FormRef: id: string; name: string; version: number; binding: 'pinned' | 'latest'
  - Update ProcessNodeData with optional:
    - form?: FormRef
    - requireFormToTransition?: boolean
  - WorkflowValidationResult: ok: boolean; errors: string[]; warnings: string[]; coverage: { withForms: number; totalProcessNodes: number }
- Export narrow helpers:
  - isProcessNode(node): boolean
  - getFormLabel(form?: FormRef): string → "name@vX" or "Not connected".

Notes: Keep pinned default; 'latest' warns as non-deterministic like Camunda/Flowable.
Docs: https://docs.camunda.io/docs/components/best-practices/modeling/choosing-the-resource-binding-type/
*/

// src/features/workflow/types/builder.types.ts

export interface Person {
  id: string;
  name: string;
  type: 'user' | 'role';
}

export interface FormRef {
  /** unique id of the form */
  id: string;
  /** human-readable name */
  name: string;
  /** version number of the form */
  version: number;
  /** binding to determine whether to pin to version or track latest */
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
  /** deprecated: legacy list of names */
  forms?: string[];
  /** attached form reference */
  form?: FormRef;
  /** if true, transitions are blocked until form submission is valid */
  requireFormToTransition?: boolean;
  /** UI-only: handler injected by WorkflowBuilder to open Form config */
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
    forms: Record<string, unknown>;
    states: Record<string, {
      forms?: Array<{
        formName: string;
        visibility?: 'visible' | 'hidden';
        fieldOverrides?: Record<string, unknown>;
      }>;
      actions?: Record<string, {
        nextState: string;
        operation?: string;
      }>;
    }>;
    startState?: string;
    globalForm?: FormRef; // Global form that applies to all process nodes
  };
}

export interface WorkflowValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  coverage: { withForms: number; totalProcessNodes: number };
}

export const isProcessNode = (
  node: { type?: string } | undefined | null
): boolean => node?.type === 'process';

export const getFormLabel = (form?: FormRef): string =>
  form ? `${form.name}@v${form.version}` : 'Not connected';