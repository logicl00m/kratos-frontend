// src/features/dashboard/components/DashboardFilters.tsx
import React from "react";
import { Filter } from "lucide-react";

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
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          fontSize: "14px",
          color: "#4b5563",
        }}
      >
        <input
          type="checkbox"
          checked={myQueueOnly}
          onChange={(e) => onMyQueueToggle(e.target.checked)}
          style={{ cursor: "pointer" }}
        />
        <span>My Queue</span>
      </label>

      <select
        value={selectedStage}
        onChange={(e) => onStageChange(e.target.value)}
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          backgroundColor: "white",
          cursor: "pointer",
        }}
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
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          backgroundColor: "white",
          cursor: "pointer",
        }}
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
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        <option>All Products</option>
        <option>Business Loan</option>
        <option>Personal Loan</option>
        <option>Mortgage</option>
      </select>

      <select
        value={selectedOwner}
        onChange={(e) => onOwnerChange(e.target.value)}
        style={{
          padding: "6px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        {ownerOptions.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>

      <button
        style={{
          padding: "6px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          backgroundColor: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Filter size={14} />
        More
      </button>
    </div>
  );
};

export default DashboardFilters;
