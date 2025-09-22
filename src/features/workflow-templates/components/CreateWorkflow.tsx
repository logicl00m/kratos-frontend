// src/features/workflow-templates/components/CreateWorkflow.tsx

import React, { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import TemplateCard from "./TemplateCard";
import WorkflowAssignment from "./WorkflowAssignment";
import { workflowTemplates } from "../data/workflowTemplates";
import type { WorkflowTemplate, AssignmentData } from "../types/template.types";
import type { WorkflowBuilderConfig } from "@features/workflow-config-edit/types/builder.types";
import "./CreateWorkflow.css";

interface CreateWorkflowProps {
  onBack: () => void;
  onComplete?: (workflow: WorkflowBuilderConfig) => void;
}

const CreateWorkflow: React.FC<CreateWorkflowProps> = ({ onBack, onComplete }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [assignments, setAssignments] = useState<AssignmentData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const isDark = document.documentElement.classList.contains('dark');

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
  };

  const handleAssignmentComplete = (assignmentData: AssignmentData) => {
    setAssignments(assignmentData);
    generateWorkflowJson(assignmentData);
  };

  const generateWorkflowJson = (assignmentData: AssignmentData) => {
    if (!selectedTemplate) return;

    // Build the workflow config with assignments
    const workflow: WorkflowBuilderConfig = {
      workflow: {
        forms: selectedTemplate.workflow.forms,
        states: {},
      },
    };

    // Add states with assignments
    Object.entries(selectedTemplate.workflow.states).forEach(([stateId, state]) => {
      const assignees = assignmentData[stateId] || [];
      
      // Keep original workflow structure, only add assignees metadata
      workflow.workflow.states[stateId] = {
        forms: state.forms,
        actions: state.actions 
          ? Object.entries(state.actions).reduce((acc, [key, action]) => {
              acc[key] = {
                nextState: action.nextState,
                operation: action.operation,
              };
              return acc;
            }, {} as Record<string, any>)
          : {},
      };

      // Store assignees in state metadata
      (workflow.workflow.states[stateId] as any).assignees = assignees;
    });

    // Set start state
    const stateKeys = Object.keys(workflow.workflow.states);
    if (stateKeys.length > 0) {
      (workflow.workflow as any).startState = stateKeys[0];
    }

    setShowSuccess(true);
    
    // Export JSON file
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedTemplate.id}-workflow-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    // Call completion handler if provided
    if (onComplete) {
      onComplete(workflow);
    }

    // Show success for a moment then reset
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedTemplate(null);
      setAssignments(null);
    }, 3000);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setAssignments(null);
  };

  // Show success screen
  if (showSuccess) {
    return (
      <div className={`create-workflow-container ${isDark ? 'dark' : ''}`}>
        <div className="success-screen">
          <div className="success-content">
            <CheckCircle size={64} className="success-icon" />
            <h2>Workflow Created Successfully!</h2>
            <p>Your workflow has been downloaded and is ready to use.</p>
            <button onClick={onBack} className="success-btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show assignment view
  if (selectedTemplate) {
    return (
      <WorkflowAssignment
        template={selectedTemplate}
        onComplete={handleAssignmentComplete}
        onBack={handleBackToTemplates}
      />
    );
  }

  // Show template selection
  return (
    <div className={`create-workflow-container ${isDark ? 'dark' : ''}`}>
      <div className="create-workflow-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Create Workflow from Template</h1>
          <p>Choose a template and assign people to get started quickly</p>
        </div>
      </div>

      <div className="templates-grid">
        {workflowTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={handleTemplateSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default CreateWorkflow;