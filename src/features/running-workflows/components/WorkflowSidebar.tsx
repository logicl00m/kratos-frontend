// Modular Workflow Sidebar Component
import React from "react";
import type { WorkflowDataWrapper } from "../types/runningWorkflow.types";
import { getWorkflowStatus, calculateProgress, getWorkflowOwner } from "../utils/runningWorkflowParser";

interface WorkflowSidebarProps {
  workflows: WorkflowDataWrapper[];
  selectedWorkflow: WorkflowDataWrapper | null;
  onWorkflowSelect: (workflow: WorkflowDataWrapper) => void;
  className?: string;
}

export const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
  workflows,
  selectedWorkflow,
  onWorkflowSelect,
  className = "",
}) => {
  return (
    <div className={`rwp-sidebar ${className}`}>
      <div className="rwp-sidebar-header">
        <span className="rwp-sidebar-title">Workflow Instances</span>
        <span className="rwp-sidebar-badge">{workflows.length}</span>
      </div>

      <div className="rwp-sidebar-list">
        {workflows.map((workflow) => {
          const statusInfo = getWorkflowStatus(workflow);
          const progress = calculateProgress(workflow);
          const owner = getWorkflowOwner(workflow);
          const isSelected = selectedWorkflow?.workflow.id === workflow.workflow.id;

          return (
            <button
              key={workflow.workflow.id}
              className={`rwp-workflow-card ${isSelected ? "selected" : ""}`}
              onClick={() => onWorkflowSelect(workflow)}
            >
              <div className="rwp-card-header">
                <span className="rwp-card-id">{workflow.workflow.id}</span>
                <span className={`rwp-card-status ${statusInfo.status}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="rwp-card-info">
                <span className="rwp-card-state">
                  {workflow.workflow.currentState}
                </span>
                <span className="rwp-card-owner">
                  {owner?.employeeName || "Unassigned"}
                </span>
              </div>

              <div className="rwp-card-progress">
                <div
                  className="rwp-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSidebar;