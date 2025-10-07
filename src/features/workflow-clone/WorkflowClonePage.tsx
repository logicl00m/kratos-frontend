// src/features/workflow-clone/WorkflowClonePage.tsx
import { useState } from "react";
import WorkflowGraph from "./components/WorkflowGraph";
import JsonEditor from "./components/JsonEditor";
import { parseWorkflowToGraph, getDefaultWorkflow } from "./utils/graphParser";
import type { WorkflowConfig } from "./types/workflow.types";
import "./WorkflowClonePage.css";

interface WorkflowClonePageProps {
  onBack?: () => void;
}

const WorkflowClonePage: React.FC<WorkflowClonePageProps> = ({ onBack }) => {
  const [workflow, setWorkflow] = useState<WorkflowConfig>(
    getDefaultWorkflow()
  );
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(getDefaultWorkflow(), null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(true);

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setWorkflow(parsed);
      setError(null);
    } catch {
      setError("Failed to parse JSON. Please check the format.");
    }
  };

  const { nodes, edges } = parseWorkflowToGraph(workflow);

  return (
    <div className="workflow-clone-container">
      <div className="workflow-graph-container">
        {showEditor && (
          <div className="json-editor-panel">
            <div className="editor-header">
              <h3>Workflow Clone JSON Editor</h3>
              <button
                className="editor-toggle-btn"
                onClick={() => setShowEditor(false)}
                aria-label="Close editor"
              >
                ×
              </button>
            </div>
            <JsonEditor
              value={jsonText}
              onChange={setJsonText}
              onApply={handleApplyJson}
              error={error}
            />
          </div>
        )}
        <div className="graph-main-panel">
          <WorkflowGraph
            nodes={nodes}
            edges={edges}
            workflow={workflow}
            onNodeFormView={() => {}}
          />
          {!showEditor && (
            <button
              className="show-editor-btn"
              onClick={() => setShowEditor(true)}
              title="Show JSON Editor"
            >
              {"</>"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowClonePage;