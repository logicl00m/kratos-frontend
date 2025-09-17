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
  /**
   * Field status in this state:
   * - hidden: Field not displayed
   * - editable: User can edit the field
   * - actionable: Field is read-only but has special actions enabled
   * - If not specified, field is displayed as read-only
   */
  status?: "hidden" | "editable" | "actionable";
  required?: boolean;
  overrideActions?: FieldAction[];
}

export interface StateAction {
  NextState: string;
  Operation: string;
}

export interface State {
  /**
   * Field configurations for this state.
   * If a field is not listed here, it will be displayed as read-only by default.
   * Only fields that need special behavior (hidden, editable, actionable) need to be specified.
   */
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