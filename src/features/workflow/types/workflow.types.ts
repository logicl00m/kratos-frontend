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
  status?: "hidden" | "readonly" | "editable";  // Default is "editable"
  required?: boolean;
  overrideActions?: FieldAction[];
}

export interface StateAction {
  NextState: string;
  Operation: string;
}

export interface State {
  Fields?: Record<string, StateFieldConfig>;  // Only specify overrides
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