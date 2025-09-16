// src/features/application-details/components/WorkflowProgress.tsx
import React from "react";
import { Check } from "lucide-react";
import "./WorkflowProgress.css";

export interface WorkflowStage {
  name: string;
  status: "completed" | "current";
}

const WorkflowProgress: React.FC<{ workflowStages: WorkflowStage[] }> = ({
  workflowStages,
}) => {
  return (
    <div className="workflow-progress">
      <div className="workflow-progress-inner">
        <div className="workflow-track" />
        {workflowStages.map((stage, idx) => (
          <div
            key={stage.name}
            className="workflow-stage"
            data-testid="workflow-stage"
            data-status={stage.status}
          >
            <div className={`workflow-bubble ${stage.status}`}>
              {stage.status === "current" ? idx + 1 : <Check size={20} />}
            </div>
            <span className="workflow-label">{stage.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowProgress;
