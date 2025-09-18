// src/features/workflow/types/workflow.types.ts

export interface FieldAction {
  operation: string;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  data: string;
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

export interface StateAction {
  nextState: string;
  operation: string;
}

export interface State {
  forms?: StateForm[];
  actions?: Record<string, StateAction>;
}

export interface WorkflowConfig {
  workflow: {
    forms?: Record<string, Form>;
    states: Record<string, State>;
  };
}

export interface StateFormField extends Field {
  stateConfig?: FieldOverride;
  formName?: string;
}