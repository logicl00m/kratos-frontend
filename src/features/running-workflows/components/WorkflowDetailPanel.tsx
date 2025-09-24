// Modular Workflow Detail Panel Component
import React from "react";
import { Clock, FileText, X, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { WorkflowDataWrapper } from "../types/runningWorkflow.types";
import {
  getAllHistory,
  getHistoryForState,
  getWorkflowFormData,
  getFormDataForState,
} from "../utils/runningWorkflowParser";

interface WorkflowDetailPanelProps {
  workflow: WorkflowDataWrapper | null;
  selectedNodeId?: string | null;
  onClose: () => void;
  className?: string;
}

export const WorkflowDetailPanel: React.FC<WorkflowDetailPanelProps> = ({
  workflow,
  selectedNodeId,
  onClose,
  className = "",
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDisplayValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item && typeof item === "object" && "name" in item) {
            return (item as { name?: string }).name || String(item);
          }
          return String(item ?? "");
        })
        .join(", ");
    }
    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }
    if (value == null) return "";
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch {
      return "[unserializable]";
    }
  };

  const getActionIcon = (actionText: string) => {
    const lower = actionText.toLowerCase();
    if (lower.includes("approve"))
      return <CheckCircle size={16} className="success" />;
    if (lower.includes("reject"))
      return <XCircle size={16} className="danger" />;
    return <ArrowRight size={16} />;
  };

  if (!workflow) return null;

  return (
    <div className={`rwp-detail-panel running-workflow-detail ${className}`}>
      <div className="rwp-detail-header">
        <h3 className="rwp-detail-title">
          {selectedNodeId ? `State: ${selectedNodeId}` : "Workflow Details"}
        </h3>
        <button className="rwp-detail-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="rwp-detail-body">
        {/* Action History */}
        <div className="rwp-detail-section">
          <h4 className="rwp-section-title">
            <Clock size={14} />
            Action History
          </h4>
          <div className="rwp-history-list">
            {(selectedNodeId
              ? getHistoryForState(workflow, selectedNodeId)
              : getAllHistory(workflow)
            )
              .slice(0, 5)
              .map((action) => (
                <div key={action.id} className="rwp-history-item">
                  <div className="rwp-history-icon">
                    {getActionIcon(action.action)}
                  </div>
                  <div className="rwp-history-content">
                    <div className="rwp-history-action">{action.action}</div>
                    <div className="rwp-history-meta">
                      <span>{action.byUser.name}</span>
                      <span>{formatDate(action.at)}</span>
                    </div>
                    {action.stateTo && (
                      <div className="rwp-history-state">→ {action.stateTo}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Current Data */}
        <div className="rwp-detail-section">
          <h4 className="rwp-section-title">
            <FileText size={14} />
            Current Data
          </h4>
          <div className="rwp-data-grid">
            {Object.entries(
              selectedNodeId
                ? getFormDataForState(workflow, selectedNodeId)
                : getWorkflowFormData(workflow)
            )
              .slice(0, 6)
              .map(([key, value]) => (
                <div key={key} className="rwp-data-item">
                  <span className="rwp-data-label">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="rwp-data-value">
                    {formatDisplayValue(value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailPanel;