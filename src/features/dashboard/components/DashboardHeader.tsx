// src/features/dashboard/components/DashboardHeader.tsx
import React from "react";
import { Search, Activity, Filter } from "lucide-react";

interface DashboardHeaderProps {
  searchTerm?: string;
  myQueueOnly?: boolean;
  selectedStage?: string;
  selectedStatus?: string;
  selectedProduct?: string;
  selectedOwner?: string;
  ownerOptions?: string[];
  onSearchChange?: (term: string) => void;
  onMyQueueToggle?: (checked: boolean) => void;
  onStageChange?: (stage: string) => void;
  onStatusChange?: (status: string) => void;
  onProductChange?: (product: string) => void;
  onOwnerChange?: (owner: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchTerm = "",
  myQueueOnly = false,
  selectedStage = "All Stages",
  selectedStatus = "All Status",
  selectedProduct = "All Products",
  selectedOwner = "All Owners",
  ownerOptions = ["All Owners"],
  onSearchChange = () => {},
  onMyQueueToggle = () => {},
  onStageChange = () => {},
  onStatusChange = () => {},
  onProductChange = () => {},
  onOwnerChange = () => {},
}) => {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header-content">
        <div className="dashboard-header-top">
          <div className="dashboard-logo-container">
            <Activity className="w-7 h-7 text-white" />
            <h1 className="dashboard-title text-white">Applications Queue</h1>
          </div>
          <div className="dashboard-header-actions">
            <button
              className="dashboard-view-button bg-white/20 text-white hover:bg-white/30"
              aria-label="View options"
            >
              <Filter className="w-4 h-4 text-white" />
              View
            </button>
            <button className="dashboard-admin-link text-white/90 hover:text-white">
              Admin
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="dashboard-filters-container">
          <div className="dashboard-search-container">
            <div className="dashboard-search-wrapper">
              <Search className="dashboard-search-icon text-white/80" />
              <input
                type="text"
                placeholder="Search applications..."
                className="dashboard-search-input bg-white/20 text-white placeholder-white/70 border-white/30 focus:ring-2 focus:ring-white/50"
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
              <span className="dashboard-my-queue-text text-white">
                My Queue
              </span>
            </label>
          </div>

          <div className="dashboard-dropdowns-container">
            <select
              className="dashboard-dropdown bg-white/20 text-white border-white/30"
              value={selectedStage}
              onChange={(e) => onStageChange(e.target.value)}
            >
              <option className="text-gray-900">All Stages</option>
              <option className="text-gray-900">ARMDraft</option>
              <option className="text-gray-900">RMReview</option>
              <option className="text-gray-900">CMReview</option>
              <option className="text-gray-900">RMResubmission</option>
              <option className="text-gray-900">THCRMDecision</option>
              <option className="text-gray-900">Completed</option>
            </select>
            <select
              className="dashboard-dropdown bg-white/20 text-white border-white/30"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <option className="text-gray-900">All Status</option>
              <option className="text-gray-900">Overdue</option>
              <option className="text-gray-900">Due Soon</option>
              <option className="text-gray-900">On Time</option>
              <option className="text-gray-900">Completed</option>
            </select>
            <select
              className="dashboard-dropdown bg-white/20 text-white border-white/30"
              value={selectedProduct}
              onChange={(e) => onProductChange(e.target.value)}
            >
              <option className="text-gray-900">All Products</option>
              <option className="text-gray-900">Business Loan</option>
              <option className="text-gray-900">Personal Loan</option>
              <option className="text-gray-900">Mortgage</option>
            </select>
            <select
              className="dashboard-dropdown bg-white/20 text-white border-white/30"
              value={selectedOwner}
              onChange={(e) => onOwnerChange(e.target.value)}
            >
              {ownerOptions.map((o) => (
                <option key={o} className="text-gray-900">
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
