// Modular Workflow List View Component
import React from "react";
import type { WorkflowDataWrapper } from "../types/runningWorkflow.types";
import {
  getWorkflowStatus,
  calculateProgress,
  getWorkflowOwner,
} from "../utils/runningWorkflowParser";

interface WorkflowListViewProps {
  workflows: WorkflowDataWrapper[];
  selectedWorkflow: WorkflowDataWrapper | null;
  onWorkflowSelect: (workflow: WorkflowDataWrapper) => void;
  className?: string;
}

export const WorkflowListView: React.FC<WorkflowListViewProps> = ({
  workflows,
  selectedWorkflow,
  onWorkflowSelect,
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

  return (
    <div className={`rwp-list-container ${className}`}>
      <table className="rwp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Current State</th>
            <th>Owner</th>
            <th>Last Updated</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => {
            const statusInfo = getWorkflowStatus(workflow);
            const progress = calculateProgress(workflow);
            const owner = getWorkflowOwner(workflow);

            return (
              <tr
                key={workflow.workflow.id}
                onClick={() => onWorkflowSelect(workflow)}
                className={
                  selectedWorkflow?.workflow.id === workflow.workflow.id
                    ? "selected"
                    : ""
                }
              >
                <td className="rwp-table-id">{workflow.workflow.id}</td>
                <td>
                  <span className={`rwp-table-status ${statusInfo.status}`}>
                    {statusInfo.label}
                  </span>
                </td>
                <td>{workflow.workflow.currentState}</td>
                <td>{owner?.employeeName || "Unassigned"}</td>
                <td>{formatDate(workflow.workflow.currentStateEnteredAt)}</td>
                <td>
                  <div className="rwp-table-progress">
                    <div className="rwp-table-progress-bar">
                      <div
                        className="rwp-table-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span>{progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkflowListView;