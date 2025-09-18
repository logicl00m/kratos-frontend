// src/features/form/components/FormViewer.tsx
import React, { useState } from "react";
import { Edit, Save, ArrowLeft } from "lucide-react";
import FieldInput from "./FieldInput";

// Type definitions matching the JSON structure
interface FieldDefinition {
  id: string;
  name: string;
  type: string;
  data?: string;
  fieldActions?: Array<{ operation: string }>;
}

interface FormDefinition {
  fields: FieldDefinition[];
}

interface FieldOverride {
  status: "editable" | "readonly" | "hidden" | "actionable";
  required?: boolean;
}

interface StateForm {
  formName: string;
  visibility?: "hidden";
  fieldOverrides?: Record<string, FieldOverride>;
}

interface StateAction {
  nextState: string;
  operation: string;
}

interface State {
  forms: StateForm[];
  actions: Record<string, StateAction>;
}

interface Workflow {
  forms: Record<string, FormDefinition>;
  states: Record<string, State>;
}

interface FormViewerProps {
  stateName: string;
  workflow: { workflow: Workflow };
  currentState: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  onReject?: (data: Record<string, unknown>) => void;
  onBack?: () => void;
}

const FormViewer: React.FC<FormViewerProps> = ({
  stateName,
  workflow,
  currentState,
  onSubmit,
  onReject,
  onBack,
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [editMode, setEditMode] = useState(false);

  // Validate workflow structure
  if (!workflow?.workflow) {
    return (
      <div className="form-viewer">
        <div className="form-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Graph
          </button>
          <h2>{stateName}</h2>
        </div>
        <div className="form-content">
          <p>Error: Workflow configuration not loaded</p>
        </div>
      </div>
    );
  }

  const { forms, states } = workflow.workflow;

  if (!states || !forms) {
    return (
      <div className="form-viewer">
        <div className="form-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Graph
          </button>
          <h2>{stateName}</h2>
        </div>
        <div className="form-content">
          <p>Error: Invalid workflow configuration structure</p>
        </div>
      </div>
    );
  }

  const state = states[currentState];

  if (!state) {
    return (
      <div className="form-viewer">
        <div className="form-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Graph
          </button>
          <h2>{stateName}</h2>
        </div>
        <div className="form-content">
          <p>Error: State '{currentState}' not found in workflow</p>
        </div>
      </div>
    );
  }

  const handleFieldChange = (
    fieldId: string,
    value: string | number | File | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Get all fields with their configurations for the current state
  const getVisibleFields = () => {
    const visibleFields: Array<{
      field: FieldDefinition;
      config: FieldOverride | null;
    }> = [];

    state.forms.forEach((stateForm) => {
      // Skip hidden forms
      if (stateForm.visibility === "hidden") return;

      const formDef = forms[stateForm.formName];
      if (!formDef) return;

      formDef.fields.forEach((field) => {
        const override = stateForm.fieldOverrides?.[field.id];

        // Skip hidden fields
        if (override?.status === "hidden") return;

        visibleFields.push({
          field,
          config: override || null,
        });
      });
    });

    return visibleFields;
  };

  // Check if field is editable
  const isFieldEditable = (config: FieldOverride | null): boolean => {
    if (!config) return false;

    if (config.status === "readonly") return false;
    if (config.status === "editable") return editMode;
    if (config.status === "actionable") return true;

    return false;
  };

  // Get field status display text
  const getFieldStatusDisplay = (
    fieldId: string,
    config: FieldOverride | null
  ): string => {
    if (!config) return "";

    if (config.required && !formData[fieldId]) {
      return "Required";
    }

    switch (config.status) {
      case "actionable":
        return "Action required";
      case "editable":
        return editMode ? "Editable" : "Ready for edit";
      case "readonly":
        return "Read only";
      default:
        return "";
    }
  };

  // Transform field to match FieldInput expectations
  const transformField = (field: FieldDefinition) => ({
    ID: field.id,
    Name: field.name,
    Type: field.type,
    DataSource: field.data,
    FieldActions: field.fieldActions?.map((action) => ({
      Operation: action.operation,
    })),
  });

  const visibleFields = getVisibleFields();

  return (
    <div className="form-viewer">
      <div className="form-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Graph
        </button>
        <h2>{stateName}</h2>
        <div className="form-status">
          <span className="status-badge">State: {currentState}</span>
        </div>
        <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
          {editMode ? <Save size={16} /> : <Edit size={16} />}
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      <div className="form-content">
        {visibleFields.map(({ field, config }) => {
          const statusText = getFieldStatusDisplay(field.id, config);

          return (
            <div key={field.id} className="form-group">
              <div className="field-row">
                <label className="field-label">
                  {field.name}
                  {config?.required && (
                    <span className="required-marker"> *</span>
                  )}
                </label>
                <div className="field-value">
                  <FieldInput
                    field={transformField(field)}
                    value={formData[field.id]}
                    disabled={!isFieldEditable(config)}
                    onChange={(val) => handleFieldChange(field.id, val)}
                  />
                </div>
                <div className="field-status">
                  {statusText && (
                    <span className="status-text">{statusText}</span>
                  )}
                  {config?.status === "actionable" && (
                    <button className="recommend-btn">Action</button>
                  )}
                </div>
              </div>

              {field.fieldActions && field.fieldActions.length > 0 && (
                <div className="field-actions">
                  {field.fieldActions.map((action, index) => (
                    <span key={index} className="action-tag">
                      {action.operation}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="form-footer">
        {/* Render state actions dynamically */}
        {state?.actions &&
          Object.entries(state.actions).map(([actionKey, actionData]) => (
            <button
              key={actionKey}
              className={`btn-${actionKey
                .toLowerCase()
                .replace(/([A-Z])/g, "-$1")
                .toLowerCase()}`}
              onClick={() => onSubmit?.(formData)}
            >
              {actionKey
                .replace(/([A-Z])/g, " $1")
                .trim()
                .replace(/^[a-z]/, (s) => s.toUpperCase())}
            </button>
          ))}

        {/* Fallback buttons if no state actions defined */}
        {(!state?.actions || Object.keys(state.actions).length === 0) && (
          <>
            <button className="btn-save" onClick={() => onSubmit?.(formData)}>
              Save
            </button>
            <button className="btn-submit" onClick={() => onSubmit?.(formData)}>
              Submit
            </button>
            <button className="btn-reject" onClick={() => onReject?.(formData)}>
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FormViewer;
