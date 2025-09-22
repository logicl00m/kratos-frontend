// src/features/application-details/components/AuditTrail.tsx
import React, { useState } from "react";
import { Download, User, MessageCircle } from "lucide-react";

interface AuditEntry {
  user: string;
  action: "action" | "system";
  message: string;
  time: string;
}

const AuditTrail: React.FC<{ auditTrail: AuditEntry[] }> = ({ auditTrail }) => {
  const [activeComment, setActiveComment] = useState("");

  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        border: "1px solid #e5e7eb",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
      className="dark:bg-slate-800 dark:border-slate-700"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" }} className="dark:text-slate-100">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageCircle size={18} className="dark:text-blue-400" />
            Audit Trail ({auditTrail.length})
          </div>
        </h3>
        <button
          style={{
            padding: "6px 12px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "#0f172a",
          }}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 hover:dark:bg-slate-600"
        >
          <Download size={14} />
          Export
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <textarea
          placeholder="Add a comment..."
          value={activeComment}
          onChange={(e) => setActiveComment(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "14px",
            resize: "none",
            minHeight: "80px",
            background: "white",
            color: "#0f172a",
          }}
          className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
        />
        <button
          style={{
            padding: "6px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            cursor: "pointer",
            marginTop: "8px",
            float: "right",
          }}
          className="dark:bg-blue-600 hover:dark:bg-blue-700"
        >
          Add Comment
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          clear: "both",
          paddingTop: "12px",
          overflow: "auto",
          flex: 1,
          minHeight: 0,
        }}
      >
        {auditTrail.map((entry) => {
          const key = `${entry.time}-${entry.user}-${entry.message.substring(
            0,
            20
          )}`;
          return (
            <div
              key={key}
              style={{
                borderBottom: "1px solid #f3f4f6",
                paddingBottom: "12px",
              }}
              className="dark:border-slate-700"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <User size={14} color="#6b7280" className="dark:text-slate-400" />
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#0f172a" }} className="dark:text-slate-100">
                  {entry.user}
                </span>
                <span
                  style={{
                    padding: "2px 6px",
                    background:
                      entry.action === "system" ? "#f3f4f6" : "#e0e7ff",
                    borderRadius: "4px",
                    fontSize: "10px",
                    color: entry.action === "system" ? "#6b7280" : "#4338ca",
                  }}
                  className={`${
                    entry.action === "system" 
                      ? "dark:bg-slate-700 dark:text-slate-300" 
                      : "dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {entry.action}
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  marginLeft: "22px",
                  marginBottom: "4px",
                  color: "#0f172a",
                }}
                className="dark:text-slate-200"
              >
                {entry.message}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  marginLeft: "22px",
                }}
                className="dark:text-slate-400"
              >
                {entry.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditTrail;
