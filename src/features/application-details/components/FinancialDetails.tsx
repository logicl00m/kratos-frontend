// src/features/application-details/components/FinancialDetails.tsx
import React from "react";
import { DollarSign } from "lucide-react";

const FinancialDetails: React.FC<{ amount: number }> = ({ amount }) => (
  <div
    style={{
      background: "white",
      borderRadius: "8px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      height: "100%",
    }}
    className="dark:bg-slate-800 dark:border-slate-700"
  >
    <h3
      style={{
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "16px",
        color: "#0f172a",
      }}
      className="dark:text-slate-100"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <DollarSign size={18} className="dark:text-green-400" />
        Financial Details
      </div>
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <div
          style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}
          className="dark:text-slate-300 font-medium"
        >
          Loan Amount
        </div>
        <div style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a" }} className="dark:text-slate-100">
          ${amount.toLocaleString()}
        </div>
      </div>
      <div>
        <div
          style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}
          className="dark:text-slate-300 font-medium"
        >
          Estimated Monthly Payment
        </div>
        <div style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a" }} className="dark:text-slate-100">
          ${(amount * 0.02).toFixed(2)}
        </div>
      </div>
      <div>
        <div
          style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}
          className="dark:text-slate-300 font-medium"
        >
          Interest Rate
        </div>
        <div style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a" }} className="dark:text-slate-100">
          12.5%
        </div>
      </div>
    </div>
  </div>
);

export default FinancialDetails;
