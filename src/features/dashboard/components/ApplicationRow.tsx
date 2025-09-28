// src/features/dashboard/components/ApplicationRow.tsx
import React from "react";
import { Eye } from "lucide-react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";
import "./ApplicationRow.css";

type ApplicationRowProps = {
  app: LoanApplication;
  selected: boolean;
  onSelect: (id: string) => void;
  onClick: (app: LoanApplication) => void;
  getStageColor: (stage: string) => string;
  getStatusIcon?: (status: string) => React.ReactNode;
};

const ApplicationRow: React.FC<ApplicationRowProps> = ({
  app,
  selected,
  onSelect,
  onClick,
  getStageColor,
  getStatusIcon,
}) => {
  const renderStatusIcon = (status: string) =>
    typeof getStatusIcon === "function" ? getStatusIcon(status) : null;
  return (
    <tr className={`application-row ${selected ? 'application-row--selected' : ''}`}>
      <td className="application-row-cell">
        <input
          type="checkbox"
          className="dashboard-table-checkbox"
          checked={selected}
          onChange={() => onSelect(app.id)}
        />
      </td>
      <td className="application-row-cell">
        <span className="application-row-id">{app.id}</span>
      </td>
      <td className="application-row-cell">
        <span className="application-row-applicant">{app.applicant}</span>
      </td>
      <td className="application-row-cell">
        <span className="application-row-amount">
          ${app.amount.toLocaleString()}
        </span>
      </td>
      <td className="application-row-cell">
        <span
          className={`application-row-stage-badge application-row-stage-badge--${app.stage.toLowerCase().replace(' ', '')}`}
        >
          {app.stage}
        </span>
      </td>
      <td className="application-row-cell">
        <span className="application-row-product">{app.product}</span>
      </td>
      <td className="application-row-cell">
        <span className="application-row-assignee">{app.assignee}</span>
      </td>
      <td className="application-row-cell">
        <span className="application-row-initiated">
          {app.initiatedBy}
        </span>
      </td>
      <td className="application-row-cell">
        <div className="application-row-sla-container">
          {renderStatusIcon(app.slaStatus)}
          <span
            className={`application-row-sla-badge application-row-sla-badge--${app.slaStatus}`}
          >
            {app.sla}
          </span>
        </div>
      </td>
      <td className="application-row-cell application-row-docs">
        <span className="application-row-docs-count">{app.docs || 0}</span>
      </td>
      <td className="application-row-cell">
        <span className="application-row-update">
          {new Date(app.lastUpdate).toLocaleDateString()}
        </span>
      </td>
      <td className="application-row-cell application-row-action">
        <button
          onClick={() => onClick(app)}
          className="application-row-action-button"
        >
          <Eye className="application-row-action-icon" />
          View
        </button>
      </td>
    </tr>
  );
};

export default ApplicationRow;
