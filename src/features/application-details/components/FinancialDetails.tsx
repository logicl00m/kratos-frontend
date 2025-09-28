// src/features/application-details/components/FinancialDetails.tsx
import React from "react";
import { DollarSign } from "lucide-react";
import "./FinancialDetails.css";

const FinancialDetails: React.FC<{ amount: number }> = ({ amount }) => (
  <div className="financial-details">
    <div className="financial-details-header">
      <h3 className="financial-details-title">
        <DollarSign size={18} className="dark:text-green-400" />
        Financial Details
      </h3>
    </div>
    <div className="financial-details-grid">
      <div className="financial-details-field">
        <div className="financial-details-label">Loan Amount</div>
        <div className="financial-details-value">${amount.toLocaleString()}</div>
      </div>
      <div className="financial-details-field">
        <div className="financial-details-label">Estimated Monthly Payment</div>
        <div className="financial-details-value">${(amount * 0.02).toFixed(2)}</div>
      </div>
      <div className="financial-details-field">
        <div className="financial-details-label">Interest Rate</div>
        <div className="financial-details-value">12.5%</div>
      </div>
    </div>
  </div>
);

export default FinancialDetails;
