// src/features/form/components/FormViewer.tsx
import React, { useState } from "react";
import { Edit, Save, ArrowLeft } from "lucide-react";
import FieldInput from "./FieldInput";
import type { FieldInputField } from "./FieldInput";
import type {
  WorkflowConfig,
  Field as WorkflowField,
  FieldOverride as WorkflowFieldOverride,
  State as WorkflowState,
} from "../../workflow/types/workflow.types";

interface LegacyFieldAction {
  Operation?: string;
  operation?: string;
}

interface LegacyField {
  ID?: string;
  id?: string;
  Name?: string;
  name?: string;
  Type?: string;
  type?: string;
  DataSource?: string;
  data?: string;
  FieldActions?: LegacyFieldAction[];
  fieldActions?: LegacyFieldAction[];
}

interface LegacyWorkflowState {
  Form?: {
    Fields?: LegacyField[];
  };
}

interface FormViewerProps {
  stateName: string;
  workflow?: WorkflowConfig;
  currentState?: string;
  state?: LegacyWorkflowState;
  onSubmit?: (data: Record<string, unknown>) => void;
  onReject?: (data: Record<string, unknown>) => void;
  onBack?: () => void;
}

const toFieldInputField = (
  field: WorkflowField
): FieldInputField => ({
  id: field.id,
  name: field.name,
  type: field.type,
  data: field.data,
  fieldActions: field.fieldActions?.map((action) => ({
    operation: action.operation,
  })),
});

const toFieldInputFieldFromLegacy = (
  field: LegacyField,
  index: number
): FieldInputField => {
  const actionSource = field.FieldActions ?? field.fieldActions ?? [];
  const operations = actionSource
    .map((action) => action.operation ?? action.Operation)
    .filter((operation): operation is string => Boolean(operation));

  const id = field.ID ?? field.id ?? `legacy-field-${index}`;
  const name = field.Name ?? field.name ?? `Field ${index + 1}`;
  const type = field.Type ?? field.type ?? "text";

  return {
    id: String(id),
    name: String(name),
    type: String(type),
    data: field.DataSource ?? field.data,
    fieldActions: operations.map((operation) => ({ operation })),
  };
};

const FormViewer: React.FC<FormViewerProps> = ({
  stateName,
  workflow,
  currentState,
  state: legacyState,
  onSubmit,
  onReject,
  onBack,
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [editMode, setEditMode] = useState(false);

  const handleFieldChange = (
    fieldId: string,
    value: string | number | File | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Support legacy tests/code that pass a `state` prop directly instead of a workflow
  if (!workflow?.workflow && legacyState) {
    const legacyFields = Array.isArray(legacyState.Form?.Fields)
      ? legacyState.Form?.Fields ?? []
      : [];

    const normalizedFields = legacyFields.map((field, index) =>
      toFieldInputFieldFromLegacy(field, index)
    );

    return (
      <div className="form-viewer">
        <div className="form-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Graph
          </button>
          <h2>{stateName}</h2>
          <div className="form-status">
            <span className="status-badge">Finalized</span>
          </div>
        </div>

        <div className="form-content">
          {normalizedFields.map((field) => (
            <div key={field.id} className="form-group">
              <div className="field-row">
                <label className="field-label">{field.name}</label>
                <div className="field-value">
                  <FieldInput
                    field={field}
                    value={formData[field.id]}
                    disabled
                    onChange={(val) => handleFieldChange(field.id, val)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-footer">
          <button className="btn-save" onClick={() => onSubmit?.(formData)}>
            Save
          </button>
          <button className="btn-submit" onClick={() => onSubmit?.(formData)}>
            Submit
          </button>
          <button className="btn-reject" onClick={() => onReject?.(formData)}>
            Reject
          </button>
          <button className="btn-approve" onClick={() => onSubmit?.(formData)}>
            Approve
          </button>
        </div>
      </div>
    );
  }

  const workflowDefinition: WorkflowConfig["workflow"] | undefined = workflow?.workflow;

  if (!workflowDefinition) {
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

  const { forms, states } = workflowDefinition;

  if (!forms) {
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

  const stateKey = currentState ?? stateName;
  const stateConfig: WorkflowState | undefined = stateKey
    ? states[stateKey]
    : undefined;

  if (!stateConfig) {
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
          <p>Error: State '{stateKey}' not found in workflow</p>
        </div>
      </div>
    );
  }

  const getVisibleFields = () => {
    const visibleFields: Array<{
      field: WorkflowField;
      config?: WorkflowFieldOverride;
    }> = [];

    stateConfig.forms?.forEach((stateForm) => {
      if (stateForm.visibility === "hidden") return;

      const formDef = stateForm.formName ? forms[stateForm.formName] : undefined;
      if (!formDef) return;

      formDef.fields.forEach((field) => {
        const override = stateForm.fieldOverrides?.[field.id];
        if (override?.status === "hidden") return;

        visibleFields.push({
          field,
          config: override,
        });
      });
    });

    return visibleFields;
  };

  const isFieldEditable = (config?: WorkflowFieldOverride): boolean => {
    if (!config) return false;

    if (config.status === "readonly") return false;
    if (config.status === "editable") return editMode;
    if (config.status === "actionable") return true;

    return false;
  };

  const getFieldStatusDisplay = (
    fieldId: string,
    config?: WorkflowFieldOverride
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
          <span className="status-badge">State: {stateKey}</span>
        </div>
        <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
          {editMode ? <Save size={16} /> : <Edit size={16} />}
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      <div className="form-content">
        {visibleFields.map(({ field, config }) => {
          const statusText = getFieldStatusDisplay(field.id, config);
          const normalizedField = toFieldInputField(field);

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
                    field={normalizedField}
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
                  {field.fieldActions.map((action, index) => {
                    const key = action.operation
                      ? `${field.id}-${action.operation}`
                      : `${field.id}-action-${index}`;
                    return (
                      <span key={key} className="action-tag">
                        {action.operation}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="form-footer">
        {stateConfig.actions &&
          Object.keys(stateConfig.actions).map((actionKey) => (
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

        {!stateConfig.actions || Object.keys(stateConfig.actions).length === 0 ? (
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
        ) : null}
      </div>
    </div>
  );
};

export default FormViewer;
