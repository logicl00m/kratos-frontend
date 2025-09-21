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
  getSlaColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
};

const ApplicationRow: React.FC<ApplicationRowProps> = ({
  app,
  selected,
  onSelect,
  onClick,
  getStageColor,
  getSlaColor,
  getStatusIcon,
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          checked={selected}
          onChange={() => onSelect(app.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.id}</td>
      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
        {app.applicant}
      </td>
      <td className="px-6 py-4 text-sm font-bold text-gray-900">
        ৳{app.amount.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getStageColor(
            app.stage
          )}`}
        >
          {app.stage}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{app.assignee}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{app.initiatedBy}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(app.slaStatus)}
          <span className={`text-sm ${getSlaColor(app.slaStatus)}`}>
            {app.sla}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
          {app.docs || 0}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{app.lastUpdate}</td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => onClick(app)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      </td>
    </tr>
  );
};

export default ApplicationRow;
