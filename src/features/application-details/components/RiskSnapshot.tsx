// src/features/application-details/components/RiskSnapshot.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";
import "./RiskSnapshot.css";

const RiskSnapshot: React.FC = () => (
  <div className="risk-snapshot">
    <div className="risk-snapshot-header">
      <h3 className="risk-snapshot-title">
        <AlertTriangle size={18} className="dark:text-amber-400" />
        Risk Snapshot
      </h3>
    </div>
    <div className="risk-indicators">
      <div className="risk-indicator">
        <div className="risk-indicator-value">720</div>
        <div className="risk-indicator-label">Credit Score</div>
      </div>
      <div className="risk-indicator">
        <div className="risk-indicator-value">28%</div>
        <div className="risk-indicator-label">Debt-to-Income Ratio</div>
      </div>
    </div>
  </div>
);

export default RiskSnapshot;
