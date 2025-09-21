// src/features/dashboard/components/DashboardHeader.tsx
import React from "react";
import { Search, Activity } from "lucide-react";

interface DashboardHeaderProps {
  searchTerm: string;
  myQueueOnly: boolean;
  selectedStage: string;
  onSearchChange: (term: string) => void;
  onMyQueueToggle: (checked: boolean) => void;
  onStageChange: (stage: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchTerm,
  myQueueOnly,
  selectedStage,
  onSearchChange,
  onMyQueueToggle,
  onStageChange,
}) => {
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Workflow Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              New Application
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by applicant or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={selectedStage}
            onChange={(e) => onStageChange(e.target.value)}
          >
            <option>All Stages</option>
            <option>ARMDraft</option>
            <option>RMReview</option>
            <option>CMReview</option>
            <option>RMResubmission</option>
            <option>THCRMDecision</option>
            <option>Completed</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              checked={myQueueOnly}
              onChange={(e) => onMyQueueToggle(e.target.checked)}
            />
            <span className="font-medium text-gray-700">My Queue</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
