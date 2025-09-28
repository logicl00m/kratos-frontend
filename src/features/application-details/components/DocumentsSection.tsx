// src/features/application-details/components/DocumentsSection.tsx
import React from "react";
import { Upload, Check, Eye, FileText } from "lucide-react";
import "./DocumentsSection.css";

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
    <div className="documents-section">
      <div className="documents-section-header">
        <h3 className="documents-section-title">
          <FileText size={18} className="dark:text-blue-400" />
          Documents ({completedCount}/{totalRequired})
        </h3>
        <button className="documents-section-upload-btn">
          <Upload size={14} />
          Upload
        </button>
      </div>

      <div className="documents-grid">
        {documents.map((doc) => {
          const key = `${doc.name}-${doc.filename || "none"}`;
          
          return (
            <div key={key} className="document-card">
              <div className="document-icon">
                <FileText size={20} />
              </div>
              <div className="document-name">{doc.name}</div>
              <div className="document-actions">
                <button className="document-action-btn">
                  {doc.status === "complete" ? "View" : "Upload"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsSection;
