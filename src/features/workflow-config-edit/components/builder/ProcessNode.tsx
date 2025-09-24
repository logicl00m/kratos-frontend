// src/features/workflow/components/builder/ProcessNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Users, User, FileText } from "lucide-react";
import type { ProcessNodeData, FormRef } from "@features/workflow-config-edit/types/builder.types";
import "./ProcessNode.css";

/*
PROMPT (Copilot/GPT-5): Form chip + actions

- Add a compact Form chip in the node body.
  - If data.form exists, show: Form: ${name}@v${version} with a tooltip "binding: pinned|latest".
  - If absent but global form exists, show: Form: ${globalName}@v${globalVersion} (Global)
  - If absent and no global form, show a gray "Form: Not connected".
- Clicking the chip opens the BuilderDetailsPanel scrolled to the Form section for this node.
- Right-click context menu: add "Attach / Edit form" → same behavior.
- Props/Events needed:
  - onOpenFormConfig(nodeId: string): void
- Accessibility:
  - Chip is a <button> with aria-label="Attach or edit form for {stateName}".
- Tests (Jest):
  - renders with form
  - renders without
  - click opens panel

A11y: Avoid color-only meaning; include icon + text per WCAG 1.4.1.
Docs: https://www.w3.org/TR/WCAG22/
*/

interface ProcessNodeProps extends NodeProps<ProcessNodeData> {
  globalForm?: FormRef | null;
}

const ProcessNode: React.FC<ProcessNodeProps> = ({
  data,
  selected,
  id,
  globalForm,
}) => {
  const getAssigneeIcon = () => {
    if (data.assignees.length === 0) return null;
    if (data.assignees.length === 1) {
      return <User size={14} className="assignee-icon single" />;
    }
    return <Users size={14} className="assignee-icon multiple" />;
  };

  // Determine which form to display
  const displayForm = data.form || globalForm;
  const isUsingGlobalForm = !data.form && globalForm;
  const formText = displayForm
    ? `Form: ${displayForm.name}@v${displayForm.version}${isUsingGlobalForm ? " (Global)" : ""}`
    : "Form: Not connected";
  const formTitle = displayForm
    ? `binding: ${displayForm.binding}${isUsingGlobalForm ? " (Global form)" : ""}`
    : "Form: Not connected";

  return (
    <div className={`process-node ${selected ? "selected" : ""}`}>
      {/* Left port - Reject (Red) */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="process-handle handle-left"
      />

      {/* Center port - Submit (Black) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="center"
        className="process-handle handle-center"
      />

      {/* Right port - Approve (Green) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="process-handle handle-right"
      />

      {/* Target handle at top */}
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

      {data.assignees.length > 0 && (
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

      {/* Form chip */}
      <div className="node-form-chip-wrap">
        <button
          type="button"
          className={`form-chip ${displayForm ? "connected" : "disconnected"} ${isUsingGlobalForm ? "global" : ""}`}
          aria-label={`Attach or edit form for ${data.label}`}
          title={formTitle}
          onClick={() => data.onOpenFormConfig?.(id)}
        >
          <FileText size={14} aria-hidden="true" />
          <span className="form-chip-text">
            {formText}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProcessNode;