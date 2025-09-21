// src/features/dashboard/components/ApplicationTable.tsx
import React from "react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";
import ApplicationRow from "./ApplicationRow";

interface ApplicationTableProps {
  applications: LoanApplication[];
  selectedRows: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  onRowClick: (app: LoanApplication) => void;
  getStageColor: (stage: string) => string;
  getSlaColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  selectedRows,
  onSelectAll,
  onSelectRow,
  onRowClick,
  getStageColor,
  getSlaColor,
  getStatusIcon,
}) => {
  return (
    <table className="dashboard-table">
      <thead className="dashboard-table-header">
        <tr>
          <th className="dashboard-table-header-cell">
            <input
              type="checkbox"
              className="dashboard-table-header-checkbox"
              onChange={(e) => onSelectAll(e.target.checked)}
              checked={
                selectedRows.length === applications.length &&
                applications.length > 0
              }
            />
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Application ID
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Applicant
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Amount
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Current Stage
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Assignee
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Initiated By
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            SLA Status
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Docs
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row">
            Last Update
          </th>
          <th className="dashboard-table-header-cell dashboard-table-header-row text-center">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="dashboard-table-body">
        {applications.map((app) => (
          <ApplicationRow
            key={app.id}
            app={app}
            selected={selectedRows.includes(app.id)}
            onSelect={onSelectRow}
            onClick={onRowClick}
            getStageColor={getStageColor}
            getSlaColor={getSlaColor}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ApplicationTable;
