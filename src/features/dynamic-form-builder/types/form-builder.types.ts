export interface FieldAction {
  value: string;
  label: string;
}

export interface Field {
  id: string;
  name: string;
  type:
    | 'text'
    | 'number'
    | 'textarea'
    | 'file'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'section'
    | 'divider';
  status: 'default' | 'readonly' | 'disabled';
  data: string;
  fieldActions: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    regex?: string;
  };
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface FormConfig {
  [formName: string]: {
    fields: Field[];
  };
}
