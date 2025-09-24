// Modular Workflow Toolbar Component
import React from "react";
import { Search, RefreshCw, Grid, List } from "lucide-react";

interface WorkflowToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: "graph" | "list";
  onViewModeChange: (mode: "graph" | "list") => void;
  onRefresh?: () => void;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
}) => {
  return (
    <div className="rwp-toolbar">
      <div className="rwp-toolbar-left">
        <div className="rwp-search-box">
          <Search size={16} className="rwp-search-icon" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rwp-search-input"
          />
        </div>
        <select
          className="rwp-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="rwp-toolbar-right">
        <div className="rwp-view-toggle">
          <button
            className={viewMode === "graph" ? "active" : ""}
            onClick={() => onViewModeChange("graph")}
            title="Graph View"
          >
            <Grid size={16} />
          </button>
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => onViewModeChange("list")}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
        {onRefresh && (
          <button className="rwp-refresh-btn" onClick={onRefresh}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkflowToolbar;