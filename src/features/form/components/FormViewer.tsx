// src/features/form/components/FormViewer.tsx
import React, { useState } from "react";
import { Edit, Save, ArrowLeft } from "lucide-react";
import FieldInput from "./FieldInput";

// Updated type definitions for v2 structure
interface FieldDefinition {
  ID: string;
  Name: string;
  Type: string;
  DataSource?: string;
  FieldActions?: Array<{ Operation: string }>;
}

interface FieldConfig {
  status: "editable" | "readonly" | "hidden" | "actionable";
  required?: boolean;
}

interface StateV2 {
  Fields: Record<string, FieldConfig>;
  Actions: Record<string, any>;
}

interface WorkflowV2 {
  Form: {
    Fields: FieldDefinition[];
  };
  States: Record<string, StateV2>;
}

interface FormViewerProps {
  stateName: string;
  workflow: WorkflowV2;
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

  // Add null checks for workflow
  if (!workflow) {
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

  if (!workflow.States || !workflow.Form) {
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

  const state = workflow.States[currentState];
  const globalFields = workflow.Form.Fields;

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

  // Get visible fields for current state
  const getVisibleFields = () => {
    if (!state?.Fields || !globalFields) return [];

    return globalFields.filter((field) => {
      const fieldConfig = state.Fields[field.ID];
      return fieldConfig && fieldConfig.status !== "hidden";
    });
  };

  // Get field configuration for a specific field
  const getFieldConfig = (fieldId: string): FieldConfig | undefined => {
    return state?.Fields?.[fieldId];
  };

  // Check if field is editable based on current state and edit mode
  const isFieldEditable = (fieldId: string): boolean => {
    const fieldConfig = getFieldConfig(fieldId);
    if (!fieldConfig) return false;

    if (fieldConfig.status === "readonly") return false;
    if (fieldConfig.status === "editable") return editMode;
    if (fieldConfig.status === "actionable") return true; // actionable fields are always interactive

    return false;
  };

  // Check if field is required
  const isFieldRequired = (fieldId: string): boolean => {
    const fieldConfig = getFieldConfig(fieldId);
    return fieldConfig?.required === true;
  };

  // Get field status display
  const getFieldStatusDisplay = (fieldId: string): string => {
    const fieldConfig = getFieldConfig(fieldId);
    if (!fieldConfig) return "";

    if (fieldConfig.required && !formData[fieldId]) {
      return "Required";
    }

    // You can customize this based on your business logic
    switch (fieldConfig.status) {
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

  const renderField = (field: FieldDefinition) => {
    const fieldConfig = getFieldConfig(field.ID);

    return (
      <FieldInput
        field={field}
        value={formData[field.ID]}
        disabled={!isFieldEditable(field.ID)}
        onChange={(val) => handleFieldChange(field.ID, val)}
      />
    );
  };

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
        {visibleFields.map((field) => {
          const fieldConfig = getFieldConfig(field.ID);
          const statusText = getFieldStatusDisplay(field.ID);

          return (
            <div key={field.ID} className="form-group">
              <div className="field-row">
                <label className="field-label">
                  {field.Name}
                  {isFieldRequired(field.ID) && (
                    <span className="required-marker"> *</span>
                  )}
                </label>
                <div className="field-value">{renderField(field)}</div>
                <div className="field-status">
                  {statusText && (
                    <span className="status-text">{statusText}</span>
                  )}
                  {fieldConfig?.status === "actionable" && (
                    <button className="recommend-btn">Action</button>
                  )}
                </div>
              </div>

              {field.FieldActions && field.FieldActions.length > 0 && (
                <div className="field-actions">
                  {field.FieldActions.map((action, index) => (
                    <span key={index} className="action-tag">
                      {action.Operation}
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
        {state?.Actions &&
          Object.entries(state.Actions).map(([actionKey, actionData]) => (
            <button
              key={actionKey}
              className={`btn-${actionKey.toLowerCase()}`}
              onClick={() => onSubmit?.(formData)}
            >
              {actionKey.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}

        {/* Fallback buttons if no state actions defined */}
        {(!state?.Actions || Object.keys(state.Actions).length === 0) && (
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
