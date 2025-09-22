// src/features/dashboard/components/ApplicationRow.tsx
import React from "react";
import { Eye } from "lucide-react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";

type ApplicationRowProps = {
  app: LoanApplication;
  selected: boolean;
  onSelect: (id: string) => void;
  onClick: (app: LoanApplication) => void;
  getStageColor: (stage: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
};

const ApplicationRow: React.FC<ApplicationRowProps> = ({
  app,
  selected,
  onSelect,
  onClick,
  getStageColor,
  getStatusIcon,
}) => {
  return (
    <tr
      key={app.id}
      className="dashboard-table-row"
    >
      <td className="dashboard-table-cell">
        <input
          type="checkbox"
          className="dashboard-table-checkbox"
          checked={selected}
          onChange={() => onSelect(app.id)}
        />
      </td>
      <td className="dashboard-table-cell">
        <span className="text-sm font-medium dashboard-table-id">{app.id}</span>
      </td>
      <td className="dashboard-table-cell">
        <span className="dashboard-table-applicant">{app.applicant}</span>
      </td>
      <td className="dashboard-table-cell">
        <span className="dashboard-table-amount">
          ৳{app.amount.toLocaleString()}
        </span>
      </td>
      <td className="dashboard-table-cell">
        <span
          className={`dashboard-table-stage-badge ${getStageColor(
            app.stage
          )}`}
        >
          {app.stage}
        </span>
      </td>
      <td className="dashboard-table-cell">
        <span className="text-sm dashboard-table-assignee">{app.assignee}</span>
      </td>
      <td className="dashboard-table-cell">
        <span className="text-sm dashboard-table-initiated-by">{app.initiatedBy}</span>
      </td>
      <td className="dashboard-table-cell">
        <div className="dashboard-table-sla-container">
          {getStatusIcon(app.slaStatus)}
          <span
            className={`text-sm dashboard-table-sla-text dashboard-table-sla-${app.slaStatus}`}
          >
            {app.sla}
          </span>
        </div>
      </td>
      <td className="dashboard-table-cell">
        <span className="dashboard-table-docs-badge">
          {app.docs || 0}
        </span>
      </td>
      <td className="dashboard-table-cell">
        <span className="text-sm dashboard-table-last-update">{app.lastUpdate}</span>
      </td>
      <td className="dashboard-table-cell text-center">
        <button
          onClick={() => onClick(app)}
          className="dashboard-table-action-button"
        >
          <Eye className="dashboard-table-action-icon" />
          View
        </button>
      </td>
    </tr>
  );
};

export default ApplicationRow;
