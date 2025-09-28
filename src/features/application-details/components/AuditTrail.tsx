// src/features/application-details/components/AuditTrail.tsx
import React, { useState } from "react";
import { Download, User, MessageCircle } from "lucide-react";
import "./AuditTrail.css";

interface AuditEntry {
  user: string;
  action: "action" | "system";
  message: string;
  time: string;
}

const AuditTrail: React.FC<{ auditTrail: AuditEntry[] }> = ({ auditTrail }) => {
  const [activeComment, setActiveComment] = useState("");

  return (
    <div className="audit-trail">
      <div className="audit-trail-header">
        <h3 className="audit-trail-title">
          <MessageCircle size={18} className="dark:text-blue-400" />
          Audit Trail ({auditTrail.length})
        </h3>
        <button className="audit-trail-export-btn">
          <Download size={14} />
          Export
        </button>
      </div>

      <div className="audit-trail-comment-section">
        <textarea
          placeholder="Add a comment..."
          value={activeComment}
          onChange={(e) => setActiveComment(e.target.value)}
          className="audit-trail-textarea"
        />
        <button className="audit-trail-add-btn">
          Add Comment
        </button>
      </div>

      <ul className="audit-trail-list">
        {auditTrail.map((entry, index) => {
          const key = `${entry.time}-${entry.user}-${entry.message.substring(
            0,
            20
          )}`;
          return (
            <li
              key={key}
              className="audit-trail-item"
            >
              <div className="audit-trail-timestamp">
                {entry.time}
              </div>
              <div className="audit-trail-event">
                {entry.message}
              </div>
              <div className="audit-trail-user">
                <User size={14} className="audit-trail-user-icon" />
                {entry.user}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AuditTrail;
