// Shared workflow node components with workflow builder's look and feel
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import {
  Users,
  User,
  FileText,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Hash,
  Type,
  List,
  Edit,
  Eye,
  Upload,
  Zap,
} from "lucide-react";
import type {
  ProcessNodeData,
  DecisionNodeData,
  StateNodeData,
  FormRef,
} from "./types";

// Shared Process Node Component
export const SharedProcessNode: React.FC<
  NodeProps<ProcessNodeData> & { globalForm?: FormRef | null }
> = ({ data, selected, id, globalForm }) => {
  const getAssigneeIcon = () => {
    if (!data.assignees || data.assignees.length === 0) return null;
    if (data.assignees.length === 1) {
      return <User size={14} className="assignee-icon single" />;
    }
    return <Users size={14} className="assignee-icon multiple" />;
  };

  const displayForm = data.form || globalForm;
  const isUsingGlobalForm = !data.form && globalForm;
  const formText = displayForm
    ? `Form: ${displayForm.name}@v${displayForm.version}${
        isUsingGlobalForm ? " (Global)" : ""
      }`
    : "Form: Not connected";
  const formTitle = displayForm
    ? `binding: ${displayForm.binding}${
        isUsingGlobalForm ? " (Global form)" : ""
      }`
    : "Form: Not connected";

  return (
    <div className={`workflow-process-node ${selected ? "selected" : ""}`}>
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="process-handle handle-left"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="center"
        className="process-handle handle-center"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="process-handle handle-right"
      />
      <Handle
        type="target"
        position={Position.Top}
        className="process-handle handle-target"
      />

      <div className="node-header">
        <div className="node-title">{data.label}</div>
        {data.internalId && (
          <div className="node-internal-id">{data.internalId}</div>
        )}
      </div>

      <div className="node-actions">
        <div className="action-label left">
          <span className="action-indicator">L</span>
          <span className="action-text">
            {data.actions.left.label || "Reject"}
          </span>
        </div>
        <div className="action-label center">
          <span className="action-indicator">C</span>
          <span className="action-text">
            {data.actions.center.label || "Submit"}
          </span>
        </div>
        <div className="action-label right">
          <span className="action-indicator">R</span>
          <span className="action-text">
            {data.actions.right.label || "Approve"}
          </span>
        </div>
      </div>

      {data.assignees && data.assignees.length > 0 && (
        <div className="node-assignees">
          {getAssigneeIcon()}
          {data.assignees.length <= 2 ? (
            <span className="assignee-names">
              {data.assignees.map((a) => a.name).join(", ")}
            </span>
          ) : (
            <span className="assignee-names">
              {data.assignees[0].name} +{data.assignees.length - 1}
            </span>
          )}
        </div>
      )}

      <div className="node-form-chip-wrap">
        <button
          type="button"
          className={`form-chip ${
            displayForm ? "connected" : "disconnected"
          } ${isUsingGlobalForm ? "global" : ""}`}
          aria-label={`Attach or edit form for ${data.label}`}
          title={formTitle}
          onClick={() => data.onOpenFormConfig?.(id)}
        >
          <FileText size={14} aria-hidden="true" />
          <span className="form-chip-text">{formText}</span>
        </button>
      </div>
    </div>
  );
};

// Shared Decision Node Component
export const SharedDecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({
  data,
  selected,
}) => {
  const getAssigneeIcon = () => {
    if (!data.assignees || data.assignees.length === 0) return null;
    if (data.assignees.length === 1) {
      return <User size={14} className="assignee-icon single" />;
    }
    return <Users size={14} className="assignee-icon multiple" />;
  };

  const getHandlePosition = (index: number, total: number) => {
    const angle = (Math.PI / (total + 1)) * (index + 1);
    const radius = 60;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <div className={`workflow-decision-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="decision-handle handle-target"
      />

      {data.transitions.map((transition, index) => {
        const pos = getHandlePosition(index, data.transitions.length);
        return (
          <Handle
            key={transition.id}
            type="source"
            position={Position.Bottom}
            id={transition.id}
            className="decision-handle handle-source"
            style={{
              left: `${50 + pos.x}%`,
              bottom: `${-pos.y}px`,
            }}
          />
        );
      })}

      <div className="node-header">
        <GitBranch size={16} className="decision-icon" />
        <div>
          <div className="node-title">{data.label}</div>
          {data.internalId && (
            <div className="node-internal-id">{data.internalId}</div>
          )}
        </div>
      </div>

      <div className="node-transitions">
        {data.transitions.map((transition, index) => (
          <div key={transition.id} className="transition-item">
            <span className="transition-indicator">{index + 1}</span>
            <span className="transition-label">{transition.label}</span>
          </div>
        ))}
      </div>

      {data.assignees && data.assignees.length > 0 && (
        <div className="node-assignees">
          {getAssigneeIcon()}
          {data.assignees.length <= 2 ? (
            <span className="assignee-names">
              {data.assignees.map((a) => a.name).join(", ")}
            </span>
          ) : (
            <span className="assignee-names">
              {data.assignees[0].name} +{data.assignees.length - 1}
            </span>
          )}
        </div>
      )}

      {data.forms && data.forms.length > 0 && (
        <div className="node-forms">
          <FileText size={12} />
          <span>{data.forms.length} forms</span>
        </div>
      )}
    </div>
  );
};

// Shared State Node Component (Viewer style with expandable fields)
export const SharedStateNode: React.FC<NodeProps<StateNodeData>> = ({
  data,
  selected,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getFieldIcon = (type?: string) => {
    if (!type) return <Type size={12} />;
    switch (type?.toLowerCase()) {
      case "number":
        return <Hash size={12} />;
      case "select":
        return <List size={12} />;
      case "file":
        return <Upload size={12} />;
      case "textarea":
        return <FileText size={12} />;
      default:
        return <Type size={12} />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "editable":
        return <Edit size={10} />;
      case "actionable":
        return <Zap size={10} />;
      case "readonly":
      default:
        return <Eye size={10} />;
    }
  };

  return (
    <div className={`workflow-state-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} id="target" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="center" />
      <Handle type="source" position={Position.Right} id="right" />

      <div className="state-node-header">
        <div className="state-node-label">{data.label}</div>
        {data.hasForm && (
          <button
            className="expand-button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        )}
      </div>

      {data.hasForm && (
        <div className="state-node-form-badge">
          <FileText size={12} />
          <span>{data.fields.length} fields</span>
        </div>
      )}

      {expanded && data.fields.length > 0 && (
        <div className="state-node-fields">
          {data.fields.map((field) => (
            <div key={field.id} className="field-item">
              <div className="field-info">
                <span className="field-icon">
                  {getFieldIcon(field.type)}
                </span>
                <span className="field-name">{field.name}</span>
              </div>
              <span className="field-status">
                {getStatusIcon(field.stateConfig?.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.assignees && data.assignees.length > 0 && (
        <div className="node-assignees">
          {data.assignees.length === 1 ? (
            <User size={12} />
          ) : (
            <Users size={12} />
          )}
          <span className="assignee-names">
            {data.assignees.length <= 2
              ? data.assignees.map((a) => a.name).join(", ")
              : `${data.assignees[0].name} +${data.assignees.length - 1}`}
          </span>
        </div>
      )}
    </div>
  );
};