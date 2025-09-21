// src/features/dashboard/components/DashboardFilters.tsx
import React from "react";
import { Filter } from "lucide-react";
import "./DashboardFilters.css";

interface DashboardFiltersProps {
  myQueueOnly: boolean;
  selectedStage: string;
  selectedStatus: string;
  selectedProduct: string;
  selectedOwner: string;
  ownerOptions: string[];
  onMyQueueToggle: (checked: boolean) => void;
  onStageChange: (stage: string) => void;
  onStatusChange: (status: string) => void;
  onProductChange: (product: string) => void;
  onOwnerChange: (owner: string) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  myQueueOnly,
  selectedStage,
  selectedStatus,
  selectedProduct,
  selectedOwner,
  ownerOptions,
  onMyQueueToggle,
  onStageChange,
  onStatusChange,
  onProductChange,
  onOwnerChange,
}) => {
  return (
    <div className="dashboard-filters">
      <label
        className="filter-label"
      >
        <input
          type="checkbox"
          checked={myQueueOnly}
          onChange={(e) => onMyQueueToggle(e.target.checked)}
          className="filter-checkbox"
        />
        <span>My Queue</span>
      </label>

      <select
        value={selectedStage}
        onChange={(e) => onStageChange(e.target.value)}
        className="filter-select"
      >
        <option>All Stages</option>
        <option>ARMDraft</option>
        <option>RMReview</option>
        <option>CMReview</option>
        <option>RMResubmission</option>
        <option>THCRMDecision</option>
        <option>Completed</option>
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="filter-select"
      >
        <option>All Status</option>
        <option>Overdue</option>
        <option>Due Soon</option>
        <option>On Time</option>
        <option>Completed</option>
      </select>

      <select
        value={selectedProduct}
        onChange={(e) => onProductChange(e.target.value)}
        className="filter-select"
      >
        <option>All Products</option>
        <option>Business Loan</option>
        <option>Personal Loan</option>
        <option>Mortgage</option>
      </select>

      <select
        value={selectedOwner}
        onChange={(e) => onOwnerChange(e.target.value)}
        className="filter-select"
      >
        {ownerOptions.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <button
        className="filter-button"
      >
        <Filter size={14} />
        More
      </button>
    </div>
  );
};

export default DashboardFilters;
