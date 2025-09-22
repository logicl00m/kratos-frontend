// src/features/application-details/components/RiskSnapshot.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";

const RiskSnapshot: React.FC = () => (
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
        <AlertTriangle size={18} className="dark:text-amber-400" />
        Risk Snapshot
      </div>
    </h3>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "12px", color: "#6b7280" }} className="dark:text-slate-300 font-medium">
            Risk Score
          </span>
          <span
            style={{
              padding: "2px 8px",
              background: "#dbeafe",
              color: "#1e40af",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "500",
            }}
            className="dark:bg-slate-700 dark:text-slate-200"
          >
            Low
          </span>
        </div>
        <div
          style={{
            background: "#e5e7eb",
            height: "8px",
            borderRadius: "4px",
            overflow: "hidden",
          }}
          className="dark:bg-slate-700"
        >
          <div
            style={{
              width: "20%",
              height: "100%",
              background: "#3b82f6",
            }}
            className="dark:bg-blue-500"
          />
        </div>
      </div>
      <div>
        <div
          style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}
          className="dark:text-slate-300 font-medium"
        >
          Credit Score
        </div>
        <div style={{ fontSize: "24px", fontWeight: "600", color: "#f59e0b" }} className="dark:text-amber-400">
          720
        </div>
      </div>
      <div>
        <div
          style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}
          className="dark:text-slate-300 font-medium"
        >
          Debt-to-Income Ratio
        </div>
        <div style={{ fontSize: "24px", fontWeight: "600", color: "#10b981" }} className="dark:text-emerald-400">
          28%
        </div>
      </div>
    </div>
  </div>
);

export default RiskSnapshot;
