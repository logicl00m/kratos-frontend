import React from "react";
import { Edit3 } from "lucide-react";
import "./StateInfoSection.css";

interface StateInfoSectionProps {
  label: string;
  internalId?: string;
  onLabelChange: (label: string) => void;
  onInternalIdChange: (id: string) => void;
  onRename: () => void;
}

export const StateInfoSection: React.FC<StateInfoSectionProps> = ({
  label,
  internalId = "",
  onLabelChange,
  onInternalIdChange,
  onRename,
}) => {
  return (
    <div className="state-info-section">
      <div className="section-header">
        <h4 className="section-title">State Information</h4>
        <button onClick={onRename} className="icon-btn" title="Quick rename">
          <Edit3 size={14} />
        </button>
      </div>

      <div className="form-field">
        <label htmlFor="state-name">Name</label>
        <input
          id="state-name"
          type="text"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="form-input"
          placeholder="Enter state name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="state-id">Internal ID</label>
        <input
          id="state-id"
          type="text"
          value={internalId}
          onChange={(e) => onInternalIdChange(e.target.value)}
          className="form-input mono"
          placeholder="e.g., state_arm_draft"
        />
        <span className="field-hint">Optional unique identifier</span>
      </div>
    </div>
  );
};
