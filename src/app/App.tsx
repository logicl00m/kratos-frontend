import { useState } from "react";
import WorkflowGraph from "@features/workflow/components/WorkflowGraph";
import FormViewer from "@features/form/components/FormViewer";
import JsonEditor from "@features/workflow/components/JsonEditor";
import Dashboard from "@features/dashboard/components/Dashboard";
import ApplicationDetails from "@features/application-details/components/ApplicationDetails";
import RunningWorkflowsPage from "@features/running-workflows/components/RunningWorkflowsPage";
import {
  parseWorkflowToGraph,
  getDefaultWorkflow,
} from "@features/workflow/utils/graphParser";
import type { WorkflowConfig } from "@features/workflow/types/workflow.types";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";
import "./App.css";
import TopBar from "@shared/components/layout/TopBar";

function App() {
  const [workflow, setWorkflow] = useState<WorkflowConfig>(
    getDefaultWorkflow()
  );
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(getDefaultWorkflow(), null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<
    "dashboard" | "graph" | "form" | "details" | "running"
  >("dashboard");
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const stateKeys = Object.keys(workflow.workflow?.states || {});
  const [currentStateIndex, setCurrentStateIndex] = useState<number>(0);
  const currentState = stateKeys[currentStateIndex] || stateKeys[0] || "";

  const handleNodeFormView = (nodeId: string) => {
    const index = stateKeys.indexOf(nodeId);
    if (index !== -1) {
      setCurrentStateIndex(index);
      setViewMode("form");
    }
  };

  const handleBackToGraph = () => {
    setViewMode("graph");
  };

  const handleApplicationClick = (application: LoanApplication) => {
    setSelectedApplication(application);
    setViewMode("details");
  };

  const handleBackToDashboard = () => {
    setViewMode("dashboard");
    setSelectedApplication(null);
  };

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

  // Running Workflows view
  if (viewMode === "running") {
    return <RunningWorkflowsPage onBack={() => setViewMode("dashboard")} />;
  }

  // Application Details view
  if (viewMode === "details" && selectedApplication) {
    return (
      <ApplicationDetails
        application={selectedApplication}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Dashboard view - no editor panel
  if (viewMode === "dashboard") {
    return (
      <div className="app">
        <TopBar
          title="Workflow Manager"
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="toggle-button"
                onClick={() => setViewMode("running")}
                style={{ background: "#3b82f6" }}
              >
                Running Workflows
              </button>
              <button
                className="toggle-button"
                onClick={() => setViewMode("graph")}
                style={{ background: "#10b981" }}
              >
                Workflow Editor
              </button>
            </div>
          }
        />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Dashboard onApplicationClick={handleApplicationClick} />
        </div>
      </div>
    );
  }

  // Graph/Form view
  return (
    <div className="app">
      <TopBar
        title="Workflow Visualizer"
        right={
          <>
            <button
              className="toggle-button"
              onClick={() => setViewMode("dashboard")}
              style={{ background: "#6366f1", marginRight: 12 }}
            >
              Dashboard
            </button>
            <button
              className="toggle-button"
              onClick={() => setViewMode("running")}
              style={{ background: "#3b82f6", marginRight: 12 }}
            >
              Running Workflows
            </button>
            <button
              className="toggle-button"
              onClick={() =>
                setViewMode(viewMode === "graph" ? "form" : "graph")
              }
            >
              {viewMode === "graph" ? "View Form" : "View Graph"}
            </button>
            <button
              className="toggle-button"
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? "Hide" : "Show"} Editor
            </button>
          </>
        }
      />

      <div className="app-body">
        {viewMode === "form" ? (
          <div style={{ width: "100%" }}>
            <FormViewer
              stateName={currentState}
              workflow={workflow}
              currentState={currentState}
              onSubmit={(data) => console.log("Submit:", data)}
              onReject={(data) => console.log("Reject:", data)}
              onBack={handleBackToGraph}
            />
          </div>
        ) : (
          <>
            {showEditor && (
              <div className="editor-panel">
                <JsonEditor
                  value={jsonText}
                  onChange={setJsonText}
                  onApply={handleApplyJson}
                  error={error}
                />
              </div>
            )}

            <div className="graph-panel">
              <WorkflowGraph
                nodes={nodes}
                edges={edges}
                onNodeFormView={handleNodeFormView}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
