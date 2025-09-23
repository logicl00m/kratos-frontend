import React from "react";
import { ArrowLeft, ArrowDown, ArrowRight } from "lucide-react";
import "./ActionsSection.css";

interface Action {
  label: string;
  operation?: string;
}

interface ActionsConfig {
  left: Action;
  center: Action;
  right: Action;
}

interface ActionsSectionProps {
  actions: ActionsConfig;
  onActionUpdate: (
    side: "left" | "center" | "right",
    field: "label" | "operation",
    value: string
  ) => void;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  actions,
  onActionUpdate,
}) => {
  const actionConfigs = [
    { key: "left", label: "Reject", icon: ArrowLeft, color: "#ef4444" },
    { key: "center", label: "Submit", icon: ArrowDown, color: "#64748b" },
    { key: "right", label: "Approve", icon: ArrowRight, color: "#10b981" },
  ];

  return (
    <div className="actions-section">
      <div className="section-header">
        <h4 className="section-title">Actions & Transitions</h4>
      </div>

      <div className="actions-grid">
        {actionConfigs.map(({ key, label, icon: Icon, color }) => {
          const action = actions[key as keyof ActionsConfig];
          return (
            <div key={key} className="action-card">
              <div className="action-header" style={{ borderColor: color }}>
                <Icon size={14} style={{ color }} />
                <span className="action-type" style={{ color }}>
                  {label}
                </span>
              </div>

              <input
                type="text"
                placeholder="Action label"
                value={action.label || ""}
                onChange={(e) =>
                  onActionUpdate(
                    key as "left" | "center" | "right",
                    "label",
                    e.target.value
                  )
                }
                className="action-input"
              />

              <textarea
                placeholder="Operation/Description"
                value={action.operation || ""}
                onChange={(e) =>
                  onActionUpdate(
                    key as "left" | "center" | "right",
                    "operation",
                    e.target.value
                  )
                }
                className="action-textarea"
                rows={2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
