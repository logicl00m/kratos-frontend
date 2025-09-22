// src/features/workflow-templates/components/TemplateCard.tsx

import React from "react";
import { Clock, Layers, ArrowRight } from "lucide-react";
import type { WorkflowTemplate } from "../types/template.types";
import "./TemplateCard.css";

interface TemplateCardProps {
  template: WorkflowTemplate;
  onSelect: (template: WorkflowTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const stateCount = Object.keys(template.workflow.states).length;
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="template-card" onClick={() => onSelect(template)}>
      <div className="template-card-header">
        <div className="template-icon">{template.icon}</div>
        <div className="template-category">{template.category}</div>
      </div>

      <div className="template-card-body">
        <h3 className="template-name">{template.name}</h3>
        <p className="template-description">{template.description}</p>

        <div className="template-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{template.estimatedTime}</span>
          </div>
          <div className="meta-item">
            <Layers size={14} />
            <span>{stateCount} states</span>
          </div>
        </div>
      </div>

      <div className="template-card-footer">
        <button className="template-select-btn">
          Use Template
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
