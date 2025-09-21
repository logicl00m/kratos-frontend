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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={
                    selectedRows.length === applications.length &&
                    applications.length > 0
                  }
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Application ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Current Stage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Initiated By
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                SLA Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Docs
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Update
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
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
      </div>
    </div>
  );
};

export default ApplicationTable;
