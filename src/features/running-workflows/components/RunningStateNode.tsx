// src/features/running-workflows/components/RunningStateNode.tsx

import React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { Clock, User, CheckCircle, Circle, AlertCircle } from "lucide-react";
import "./RunningStateNode.css";

interface RunningNodeData {
  label: string;
  status: "visited" | "current" | "pending";
  visitedAt?: string;
  performedBy?: string;
  data?: Record<string, any>;
}

const RunningStateNode: React.FC<NodeProps<RunningNodeData>> = ({
  data,
  selected,
}) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case "visited":
        return <CheckCircle size={16} color="#10b981" />;
      case "current":
        return <AlertCircle size={16} color="#3b82f6" />;
      case "pending":
      default:
        return <Circle size={16} color="#9ca3af" />;
    }
  };

  const getNodeClassName = () => {
    let className = "running-state-node";
    if (selected) className += " selected";
    if (data.status === "current") className += " current";
    if (data.status === "visited") className += " visited";
    if (data.status === "pending") className += " pending";
    return className;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={getNodeClassName()}>
      <Handle
        type="target"
        position={Position.Top}
        className="handle-running"
      />

      <div className="running-node-header">
        <div className="running-node-title">
          {getStatusIcon()}
          <span>{data.label}</span>
        </div>
      </div>

      {data.status === "visited" && (
        <div className="running-node-info">
          {data.visitedAt && (
            <div className="info-row">
              <Clock size={12} />
              <span>{formatDate(data.visitedAt)}</span>
            </div>
          )}
          {data.performedBy && (
            <div className="info-row">
              <User size={12} />
              <span>{data.performedBy.split("@")[0]}</span>
            </div>
          )}
        </div>
      )}

      {data.status === "current" && (
        <div className="running-node-status">
          <div className="status-pulse"></div>
          <span>Active</span>
        </div>
      )}

      {data.status === "pending" && (
        <div className="running-node-pending">
          <span>Not reached</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="handle-running"
      />
    </div>
  );
};

export default RunningStateNode;
