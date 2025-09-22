// src/features/application-details/components/DocumentsSection.tsx
import React from "react";
import { Upload, Check, Eye, FileText } from "lucide-react";

interface AppDocument {
  name: string;
  filename: string;
  status: "complete" | "review" | "pending";
  required: boolean;
}

const DocumentsSection: React.FC<{ documents: AppDocument[] }> = ({
  documents,
}) => {
  const completedCount = documents.filter(
    (d) => d.status === "complete"
  ).length;
  const totalRequired = documents.filter((d) => d.required).length;
  const progressPercent = (completedCount / totalRequired) * 100;

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
            <FileText size={18} className="dark:text-blue-400" />
            Documents ({completedCount}/{totalRequired})
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
          <Upload size={14} />
          Upload
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
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
              width: `${progressPercent}%`,
              height: "100%",
              background: "#3b82f6",
            }}
            className="dark:bg-blue-500"
          />
        </div>
        <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }} className="dark:text-slate-300">
          {progressPercent.toFixed(0)}% complete
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflow: "auto",
          flex: 1,
          minHeight: 0,
        }}
      >
        {documents.map((doc) => {
          const key = `${doc.name}-${doc.filename || "none"}`;
          let statusBg = "#f3f4f6";
          let statusColor = "#6b7280";
          let statusIcon: React.ReactNode;
          
          if (doc.status === "complete") {
            statusBg = "#dcfce7";
            statusColor = "#166534";
            statusIcon = <Check size={16} color={statusColor} />;
          } else if (doc.status === "review") {
            statusBg = "#fef3c7";
            statusColor = "#92400e";
            statusIcon = <Eye size={16} color={statusColor} />;
          } else {
            statusBg = "#f3f4f6";
            statusColor = "#6b7280";
            statusIcon = <span style={{ fontSize: "12px", color: statusColor }}>○</span>;
          }

          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "6px",
              }}
              className="dark:bg-slate-700 dark:bg-opacity-50"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: statusBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="dark:bg-opacity-50"
                >
                  {statusIcon}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }} className="dark:text-slate-100">
                    {doc.name}
                    {doc.required && (
                      <span style={{ color: "#ef4444", marginLeft: "4px" }} className="dark:text-red-400">
                        *
                      </span>
                    )}
                  </div>
                  {doc.filename && (
                    <div style={{ fontSize: "12px", color: "#6b7280" }} className="dark:text-slate-300">
                      {doc.filename}
                    </div>
                  )}
                </div>
              </div>
              <div>
                {doc.status === "complete" && (
                  <span
                    style={{
                      padding: "4px 8px",
                      background: "#3b82f6",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "11px",
                    }}
                    className="dark:bg-blue-600"
                  >
                    Complete
                  </span>
                )}
                {doc.status === "review" && (
                  <span
                    style={{
                      padding: "4px 8px",
                      background: "#f59e0b",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "11px",
                    }}
                    className="dark:bg-amber-600"
                  >
                    In Review
                  </span>
                )}
                {doc.status === "pending" && (
                  <button
                    style={{
                      padding: "4px 8px",
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                      color: "#0f172a",
                    }}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 hover:dark:bg-slate-600"
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsSection;
