// src/features/dashboard/components/FilterBar.tsx
import React from "react";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  myQueueOnly: boolean;
  selectedStage: string;
  selectedStatus: string;
  selectedProduct: string;
  selectedOwner: string;
  ownerOptions: string[];
  onSearchChange: (term: string) => void;
  onMyQueueToggle: (checked: boolean) => void;
  onStageChange: (stage: string) => void;
  onStatusChange: (status: string) => void;
  onProductChange: (product: string) => void;
  onOwnerChange: (owner: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  myQueueOnly,
  selectedStage,
  selectedStatus,
  selectedProduct,
  selectedOwner,
  ownerOptions,
  onSearchChange,
  onMyQueueToggle,
  onStageChange,
  onStatusChange,
  onProductChange,
  onOwnerChange,
}) => {
  return (
    <div className="dashboard-filters-container">
      <div className="dashboard-search-container">
        <div className="dashboard-search-wrapper">
          <Search className="dashboard-search-icon" />
          <input
            type="text"
            placeholder="Search applications..."
            className="dashboard-search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <label className="dashboard-my-queue-label">
          <input
            type="checkbox"
            className="dashboard-my-queue-checkbox"
            checked={myQueueOnly}
            onChange={(e) => onMyQueueToggle(e.target.checked)}
          />
          <span className="dashboard-my-queue-text">My Queue</span>
        </label>
      </div>

      <div className="dashboard-dropdowns-container">
        <select
          className="dashboard-dropdown"
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
        <select
          className="dashboard-dropdown"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option>All Status</option>
          <option>Overdue</option>
          <option>Due Soon</option>
          <option>On Time</option>
          <option>Completed</option>
        </select>
        <select
          className="dashboard-dropdown"
          value={selectedProduct}
          onChange={(e) => onProductChange(e.target.value)}
        >
          <option>All Products</option>
          <option>Business Loan</option>
          <option>Personal Loan</option>
          <option>Mortgage</option>
        </select>
        <select
          className="dashboard-dropdown"
          value={selectedOwner}
          onChange={(e) => onOwnerChange(e.target.value)}
        >
          {ownerOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;