// src/features/workflow/components/builder/ProcessNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Users, User } from "lucide-react";
import type { ProcessNodeData } from "@features/workflow-config-edit/types/builder.types";
import "./ProcessNode.css";

const ProcessNode: React.FC<NodeProps<ProcessNodeData>> = ({
  data,
  selected,
}) => {
  const getAssigneeIcon = () => {
    if (data.assignees.length === 0) return null;
    if (data.assignees.length === 1) {
      return <User size={14} className="assignee-icon single" />;
    }
    return <Users size={14} className="assignee-icon multiple" />;
  };

  return (
    <div className={`process-node ${selected ? "selected" : ""}`}>
      {/* Left port - Reject (Red) */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="process-handle handle-left"
        style={{ background: "#ef4444" }}
      />

      {/* Center port - Submit (Black) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="center"
        className="process-handle handle-center"
        style={{ background: "#111827" }}
      />

      {/* Right port - Approve (Green) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="process-handle handle-right"
        style={{ background: "#10b981" }}
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
          <span className="action-indicator" style={{ background: "#fecaca" }}>
            L
          </span>
          <span className="action-text">
            {data.actions.left.label || "Reject"}
          </span>
        </div>
        <div className="action-label center">
          <span className="action-indicator" style={{ background: "#e5e7eb" }}>
            C
          </span>
          <span className="action-text">
            {data.actions.center.label || "Submit"}
          </span>
        </div>
        <div className="action-label right">
          <span className="action-indicator" style={{ background: "#bbf7d0" }}>
            R
          </span>
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
    </div>
  );
};

export default ProcessNode;

