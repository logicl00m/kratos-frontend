// src/features/running-workflows/components/RunningWorkflowDetailPanel.tsx

import React from "react";
import {
  X,
  Clock,
  User,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadgeClass = (status: string) => {
    return `status-badge status-${status}`;
  };

  const getEventTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase();
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const colors = {
      critical: "status-rejected",
      high: "status-pending",
      medium: "status-active",
      low: "status-completed",
    };
    return (
      <span className={`status-badge ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="running-detail-panel">
      <div className="rdp-header">
        <div>
          <h3 className="rdp-title">{instance.id}</h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className={getStatusBadgeClass(instance.status)}>
              {instance.status.toUpperCase()}
            </span>
            {getPriorityBadge(instance.priority)}
          </div>
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
              <span className="rdp-value">{instance.owner.name}</span>
            </div>
            <div className="rdp-info-item">
              <span className="rdp-label">Assigned To</span>
              <span className="rdp-value">
                {instance.currentAssignee?.name || "Unassigned"}
              </span>
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
            <div className="rdp-info-item">
              <span className="rdp-label">Due Date</span>
              <span className="rdp-value">
                {instance.dueDate
                  ? formatDate(instance.dueDate)
                  : "No deadline"}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {instance.metrics && (
          <div className="rdp-section">
            <div className="rdp-section-title">
              <Clock size={14} />
              Performance Metrics
            </div>
            <div className="rdp-info-grid">
              <div className="rdp-info-item">
                <span className="rdp-label">Total Duration</span>
                <span className="rdp-value">
                  {formatDuration(instance.metrics.totalDuration)}
                </span>
              </div>
              <div className="rdp-info-item">
                <span className="rdp-label">States Visited</span>
                <span className="rdp-value">
                  {Object.keys(instance.metrics.statesDuration || {}).length}
                </span>
              </div>
            </div>
          </div>
        )}

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

        {/* Enhanced History */}
        <div className="rdp-section">
          <div className="rdp-section-title">
            <Clock size={14} />
            Workflow History
          </div>
          <div className="rdp-history">
            {instance.history.map((item, index) => (
              <div key={item.id} className="rdp-history-item">
                <div className="rdp-history-marker"></div>
                <div className="rdp-history-content">
                  <div className="rdp-history-header">
                    <span className="rdp-history-state">
                      {getEventTypeLabel(item.event.type)}
                    </span>
                    {item.event.action && (
                      <span className="rdp-history-action">
                        {item.event.action}
                      </span>
                    )}
                    {item.validation && !item.validation.passed && (
                      <AlertCircle size={12} style={{ color: "#ef4444" }} />
                    )}
                    {item.validation && item.validation.passed && (
                      <CheckCircle size={12} style={{ color: "#10b981" }} />
                    )}
                  </div>
                  {item.event.from && item.event.to && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      {item.event.from} → {item.event.to}
                    </div>
                  )}
                  <div className="rdp-history-meta">
                    <User size={10} />
                    <span>
                      {item.actor.name} ({item.actor.role})
                    </span>
                    <Clock size={10} />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                  {item.notes && (
                    <div className="rdp-history-comments">{item.notes}</div>
                  )}
                  {item.validation && item.validation.errors.length > 0 && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        color: "#ef4444",
                      }}
                    >
                      Errors: {item.validation.errors.join(", ")}
                    </div>
                  )}
                  {item.changes && item.changes.length > 0 && (
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        color: "#6b7280",
                      }}
                    >
                      {item.changes.map((change, idx) => (
                        <div key={idx}>
                          • {change.fieldName || change.fieldId}:{" "}
                          {change.changeType.toLowerCase()}
                        </div>
                      ))}
                    </div>
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
