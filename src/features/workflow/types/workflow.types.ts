// src/features/workflow/types/workflow.types.ts

export interface FieldAction {
  Operation: string;
}

export interface Field {
  ID: string;
  Name: string;
  Type: string;
  DataSource: string;
  FieldActions?: FieldAction[];
}

export interface StateFieldConfig {
  visible?: boolean;
  editable?: boolean;
  required?: boolean;
  validations?: string[];
  overrideActions?: FieldAction[];
}

export interface StateAction {
  NextState: string;
  Operation: string;
}

export interface State {
  Fields?: Record<string, StateFieldConfig>;
  Actions?: Record<string, StateAction>;
}

export interface WorkflowConfig {
  Workflow: {
    Form: {
      Fields: Field[];
    };
    States: Record<string, State>;
  };
}

export interface StateFormField extends Field {
  stateConfig?: StateFieldConfig;
}