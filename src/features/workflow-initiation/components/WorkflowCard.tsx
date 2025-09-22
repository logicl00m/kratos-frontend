// src/features/workflow-initiation/components/WorkflowCard.tsx
import { Clock, TrendingUp, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { WorkflowTemplateInfo } from "../data/mockWorkflowInitiation";
import "./WorkflowCard.css";

type WorkflowCardProps = {
  workflow: WorkflowTemplateInfo;
  onSelect: () => void;
  isSelected: boolean;
};

const WorkflowCard = ({ workflow, onSelect, isSelected }: WorkflowCardProps) => {
  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'active':
        return <CheckCircle size={16} className="status-icon active" />;
      case 'inactive':
        return <XCircle size={16} className="status-icon inactive" />;
      case 'deprecated':
        return <AlertTriangle size={16} className="status-icon deprecated" />;
    }
  };

  const getStatusClass = () => {
    return `workflow-card ${workflow.status} ${isSelected ? 'selected' : ''}`;
  };

  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return "Never used";

    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={getStatusClass()} onClick={onSelect}>
      <div className="card-header">
        <div className="card-title-row">
          <h3 className="card-title">{workflow.name}</h3>
          {getStatusIcon()}
        </div>
        <span className="card-category">{workflow.category}</span>
      </div>

      <p className="card-description">{workflow.description}</p>

      <div className="card-stats">
        <div className="stat">
          <Clock size={14} />
          <span>{workflow.estimatedTime}</span>
        </div>
        <div className="stat">
          <TrendingUp size={14} />
          <span>{workflow.usageCount} uses</span>
        </div>
        {workflow.lastUsed && (
          <div className="stat">
            <Calendar size={14} />
            <span>{formatLastUsed(workflow.lastUsed)}</span>
          </div>
        )}
      </div>

      {workflow.status === 'deprecated' && (
        <div className="card-warning">
          <AlertTriangle size={14} />
          <span>This workflow is deprecated</span>
        </div>
      )}

      <div className="card-footer">
        <span className="required-fields">
          {workflow.requiredFields.length} required field{workflow.requiredFields.length !== 1 ? 's' : ''}
        </span>
        <button
          className="select-button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default WorkflowCard;