// src/features/workflow-initiation/components/WorkflowInitiation.tsx
import { useState } from "react";
import { Search, Play, Clock, TrendingUp, AlertCircle } from "lucide-react";
import WorkflowCard from "./WorkflowCard";
import { mockAvailableWorkflows } from "../data/mockWorkflowInitiation";
import { initiateWorkflow } from "../services/workflowInitiationService";
import type { WorkflowTemplateInfo } from "../data/mockWorkflowInitiation";
import "./WorkflowInitiation.css";

type WorkflowInitiationProps = {
  onBack?: () => void;
};

const WorkflowInitiation = ({ onBack }: WorkflowInitiationProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplateInfo | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [initiationMessage, setInitiationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const categories = ["all", "Credit", "Onboarding", "Operations", "Customer Service", "Insurance", "Risk Management"];

  const filteredWorkflows = mockAvailableWorkflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || workflow.category === selectedCategory;
    const isNotDeprecated = workflow.status !== "deprecated";

    return matchesSearch && matchesCategory && isNotDeprecated;
  });

  const handleInitiateWorkflow = async (workflow: WorkflowTemplateInfo) => {
    setIsInitiating(true);
    setInitiationMessage(null);

    try {
      const response = await initiateWorkflow(workflow.id);

      if (response.success) {
        setInitiationMessage({
          type: "success",
          text: `Workflow "${workflow.name}" initiated successfully! Workflow ID: ${response.workflowId}`,
        });
        setSelectedWorkflow(null);
      } else {
        setInitiationMessage({
          type: "error",
          text: response.message || "Failed to initiate workflow",
        });
      }
    } catch (error) {
      setInitiationMessage({
        type: "error",
        text: "An error occurred while initiating the workflow",
      });
    } finally {
      setIsInitiating(false);
    }
  };

  const activeWorkflowsCount = mockAvailableWorkflows.filter(w => w.status === 'active').length;
  const totalUsageCount = mockAvailableWorkflows.reduce((sum, w) => sum + w.usageCount, 0);

  return (
    <div className="workflow-initiation">
      <div className="initiation-header">
        <div className="header-content">
          <h1>Initiate Workflow</h1>
          <p className="header-description">
            Select and run existing workflow templates. Cannot edit or assign users.
          </p>
        </div>
        {onBack && (
          <button className="back-button" onClick={onBack}>
            Back to Dashboard
          </button>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">
            <Play size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeWorkflowsCount}</span>
            <span className="stat-label">Active Workflows</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalUsageCount}</span>
            <span className="stat-label">Total Runs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">2-5 days</span>
            <span className="stat-label">Avg. Duration</span>
          </div>
        </div>
      </div>

      {initiationMessage && (
        <div className={`initiation-message ${initiationMessage.type}`}>
          <AlertCircle size={20} />
          <span>{initiationMessage.text}</span>
          <button
            className="close-message"
            onClick={() => setInitiationMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="filter-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-pill ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="workflows-grid">
        {filteredWorkflows.length === 0 ? (
          <div className="no-workflows">
            <AlertCircle size={48} />
            <h3>No workflows found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onSelect={() => setSelectedWorkflow(workflow)}
              isSelected={selectedWorkflow?.id === workflow.id}
            />
          ))
        )}
      </div>

      {selectedWorkflow && (
        <div className="workflow-modal-overlay" onClick={() => setSelectedWorkflow(null)}>
          <div className="workflow-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Initiate Workflow</h2>
              <button
                className="close-modal"
                onClick={() => setSelectedWorkflow(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <h3>{selectedWorkflow.name}</h3>
              <p className="workflow-description">{selectedWorkflow.description}</p>
              <div className="workflow-details">
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedWorkflow.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estimated Time:</span>
                  <span className="detail-value">{selectedWorkflow.estimatedTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Usage Count:</span>
                  <span className="detail-value">{selectedWorkflow.usageCount} times</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Required Fields:</span>
                  <span className="detail-value">
                    {selectedWorkflow.requiredFields.join(", ")}
                  </span>
                </div>
              </div>
              <div className="modal-warning">
                <AlertCircle size={16} />
                <span>
                  This will create a new instance of the workflow with default settings.
                  You cannot modify the workflow structure or assign users.
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setSelectedWorkflow(null)}
              >
                Cancel
              </button>
              <button
                className="initiate-button"
                onClick={() => handleInitiateWorkflow(selectedWorkflow)}
                disabled={isInitiating}
              >
                {isInitiating ? (
                  <>
                    <span className="spinner" />
                    Initiating...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Initiate Workflow
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowInitiation;