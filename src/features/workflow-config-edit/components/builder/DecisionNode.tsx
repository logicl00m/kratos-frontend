// src/features/workflow/components/builder/DecisionNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Users, User, GitBranch } from "lucide-react";
import type { DecisionNodeData } from "@features/workflow-config-edit/types/builder.types";
import "./DecisionNode.css";

const DecisionNode: React.FC<NodeProps<DecisionNodeData>> = ({
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

  // Calculate handle positions for transitions
  const getHandlePosition = (index: number, total: number) => {
    const angle = (Math.PI / (total + 1)) * (index + 1);
    const radius = 60;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <div className={`decision-node ${selected ? "selected" : ""}`}>
      {/* Target handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        className="decision-handle handle-target"
      />

      {/* Dynamic source handles for transitions */}
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
              bottom: `-${pos.y}px`,
              background: "#6366f1",
            }}
          />
        );
      })}

      <div className="diamond-shape">
        <div className="diamond-content">
          <GitBranch size={20} className="decision-icon" />
          <div className="node-title">{data.label}</div>
          {data.internalId && (
            <div className="node-internal-id">{data.internalId}</div>
          )}
        </div>
      </div>

      {data.transitions.length > 0 && (
        <div className="transition-labels">
          {data.transitions.map((t) => (
            <div key={t.id} className="transition-label">
              {t.label}
            </div>
          ))}
        </div>
      )}

      {data.assignees.length > 0 && (
        <div className="decision-assignees">
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

export default DecisionNode;

