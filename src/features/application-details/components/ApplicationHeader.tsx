// src/features/application-details/components/ApplicationHeader.tsx
import React from "react";
import "./ApplicationHeader.css";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";
import { Phone, Settings, User } from "lucide-react";
import { getStageColor } from "@shared/utils/colors";

interface ApplicationHeaderProps {
  application: LoanApplication;
  onBack: () => void;
}

export const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({
  application,
  onBack,
}) => {
  return (
    <div className="app-header">
      <div className="app-header-inner">
        <div className="app-header-main">
          <h2 className="app-header-title">{application.applicant}</h2>
          <span
            className="stage-badge"
            style={{ background: getStageColor(application.stage) }}
          >
            {application.stage}
          </span>

          <div className="app-header-meta">
            {application.product} • ${application.amount.toLocaleString()}
          </div>

          <div className="app-header-actions">
            <button className="disbursement-button">Disbursement</button>
            <button className="disburse-button">Disburse</button>
            <button className="call-button" title="Call Applicant">
              <Phone size={16} /> Call
            </button>
            <Settings size={20} color="#6b7280" className="settings-icon" />
            <User size={20} color="#6b7280" />
            <span className="user-role">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
