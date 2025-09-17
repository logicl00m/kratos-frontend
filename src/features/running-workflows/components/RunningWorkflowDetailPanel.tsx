// src/features/running-workflows/components/RunningWorkflowDetailPanel.tsx

import React from "react";
import { X, Clock, User, FileText, Activity } from "lucide-react";
import type { WorkflowInstance } from "../types/runningWorkflow.types";
import "./RunningWorkflowDetailPanel.css";

interface RunningWorkflowDetailPanelProps {
  instance: WorkflowInstance | null;
  onClose: () => void;
}

const RunningWorkflowDetailPanel: React.FC<RunningWorkflowDetailPanelProps> = ({
  instance,
  onClose,
}) => {
  if (!instance) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    return `status-badge status-${status}`;
  };

  return (
    <div className="running-detail-panel">
      <div className="rdp-header">
        <div>
          <h3 className="rdp-title">{instance.id}</h3>
          <span className={getStatusBadgeClass(instance.status)}>
            {instance.status.toUpperCase()}
          </span>
        </div>
        <button onClick={onClose} className="rdp-close">
          <X size={18} />
        </button>
      </div>

      <div className="rdp-body">
        {/* Workflow Info */}
        <div className="rdp-section">
          <div className="rdp-section-title">
            <Activity size={14} />
            Workflow Information
          </div>
          <div className="rdp-info-grid">
            <div className="rdp-info-item">
              <span className="rdp-label">Current State</span>
              <span className="rdp-value">{instance.currentState}</span>
            </div>
            <div className="rdp-info-item">
              <span className="rdp-label">Owner</span>
              <span className="rdp-value">{instance.owner}</span>
            </div>
            <div className="rdp-info-item">
              <span className="rdp-label">Created</span>
              <span className="rdp-value">
                {formatDate(instance.createdAt)}
              </span>
            </div>
            <div className="rdp-info-item">
              <span className="rdp-label">Last Updated</span>
              <span className="rdp-value">
                {formatDate(instance.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Data */}
        <div className="rdp-section">
          <div className="rdp-section-title">
            <FileText size={14} />
            Current Data
          </div>
          <div className="rdp-data-container">
            {Object.entries(instance.data).map(([key, value]) => (
              <div key={key} className="rdp-data-item">
                <span className="rdp-data-key">{key.replace(/_/g, " ")}</span>
                <span className="rdp-data-value">
                  {Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="rdp-section">
          <div className="rdp-section-title">
            <Clock size={14} />
            Workflow History
          </div>
          <div className="rdp-history">
            {instance.history.map((item, index) => (
              <div key={index} className="rdp-history-item">
                <div className="rdp-history-marker"></div>
                <div className="rdp-history-content">
                  <div className="rdp-history-header">
                    <span className="rdp-history-state">{item.state}</span>
                    {item.action && (
                      <span className="rdp-history-action">{item.action}</span>
                    )}
                  </div>
                  <div className="rdp-history-meta">
                    <User size={10} />
                    <span>{item.performedBy}</span>
                    <Clock size={10} />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                  {item.comments && (
                    <div className="rdp-history-comments">{item.comments}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunningWorkflowDetailPanel;
