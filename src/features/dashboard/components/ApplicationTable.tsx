// src/features/dashboard/components/ApplicationTable.tsx
import React from "react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";
import ApplicationRow from "./ApplicationRow";
import "./ApplicationTable.css";

interface ApplicationTableProps {
  applications: LoanApplication[];
  selectedRows: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onRowClick: (app: LoanApplication) => void;
  getStageColor: (stage: string) => string;
  getStatusIcon?: (status: string) => React.ReactNode;
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  selectedRows,
  onSelectAll,
  onSelectRow,
  onRowClick,
  getStageColor,
  getStatusIcon,
}) => {
  const colWidths: Array<number | string> = [
    40, // Checkbox
    "10%", // Application ID
    "14%", // Applicant
    "9%", // Amount
    "11%", // Current Stage
    "11%", // Product
    "11%", // Assignee
    "9%", // Initiated By
    "7%", // SLA Status
    "5%", // Docs
    "8%", // Last Update
    "5%", // Action
  ];
  return (
    <table className="application-table">
      <colgroup>
        {colWidths.map((w, i) => (
          <col key={`col-${i}-${String(w)}`} style={{ width: w }} />
        ))}
      </colgroup>
      <thead className="application-table-header">
        <tr className="application-table-header-row">
          <th className="application-table-header-cell">
            <input
              type="checkbox"
              className="application-table-checkbox"
              onChange={(e) => onSelectAll(e.target.checked)}
              checked={
                selectedRows.length === applications.length &&
                applications.length > 0
              }
            />
          </th>
          <th className="application-table-header-cell">
            Application ID
          </th>
          <th className="application-table-header-cell">
            Applicant
          </th>
          <th className="application-table-header-cell">
            Amount
          </th>
          <th className="application-table-header-cell">
            Current Stage
          </th>
          <th className="application-table-header-cell">
            Product
          </th>
          <th className="application-table-header-cell">
            Assignee
          </th>
          <th className="application-table-header-cell">
            Initiated By
          </th>
          <th className="application-table-header-cell">
            SLA Status
          </th>
          <th className="application-table-header-cell">
            Docs
          </th>
          <th className="application-table-header-cell">
            Last Update
          </th>
          <th className="application-table-header-cell" style={{ textAlign: 'center' }}>
            Action
          </th>
        </tr>
      </thead>
      <tbody className="application-table-body">
        {applications.map((app) => (
          <ApplicationRow
            key={app.id}
            app={app}
            selected={selectedRows.includes(app.id)}
            onSelect={onSelectRow}
            onClick={onRowClick}
            getStageColor={getStageColor}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ApplicationTable;
