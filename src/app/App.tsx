// src/app/App.tsx
import { useState } from "react";
import WorkflowGraph from "@features/workflow/components/WorkflowGraph";
import FormViewer from "@features/form/components/FormViewer";
import JsonEditor from "@features/workflow/components/JsonEditor";
import Dashboard from "@features/dashboard/components/Dashboard";
import ApplicationDetails from "@features/application-details/components/ApplicationDetails";
import RunningWorkflowsPage from "@features/running-workflows/components/RunningWorkflowsPage";
import WorkflowBuilder from "@features/workflow-config-edit/components/builder/WorkflowBuilder";
import { DynamicFormBuilder } from "@features/dynamic-form-builder";
import {
  parseWorkflowToGraph,
  getDefaultWorkflow,
} from "@features/workflow/utils/graphParser";
import type { WorkflowConfig } from "@features/workflow/types/workflow.types";
import type { WorkflowData } from "@features/dashboard/types/dashboard.types";
import "./App.css";
import MainLayout from "@shared/components/layout/MainLayout";

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
    | "dashboard"
    | "graph"
    | "form"
    | "details"
    | "running"
    | "builder"
    | "form-builder"
  >("dashboard");
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(
    null
  );
  const stateKeys = Object.keys(workflow.workflow?.states || {});
  const [currentStateIndex, setCurrentStateIndex] = useState<number>(0);
  const currentState = stateKeys[currentStateIndex] || stateKeys[0] || "";
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

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

  const handleApplicationClick = (workflowData: WorkflowData) => {
    setSelectedWorkflow(workflowData);
    setViewMode("details");
  };

  const handleBackToDashboard = () => {
    setViewMode("dashboard");
    setSelectedWorkflow(null);
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

  const handleWorkflowExport = (workflowJson: unknown) => {
    let parsed: unknown = workflowJson;
    try {
      if (typeof workflowJson === "string") {
        parsed = JSON.parse(workflowJson);
      }

      if (
        !parsed ||
        typeof parsed !== "object" ||
        (parsed as Record<string, unknown>) === null ||
        !("workflow" in (parsed as Record<string, unknown>))
      ) {
        throw new Error("Invalid workflow format: missing 'workflow' property");
      }

      setWorkflow(parsed as WorkflowConfig);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
      setCurrentStateIndex(0);
      setViewMode("graph");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to import workflow:", message);
      setError(
        message || "Failed to import workflow. Provide valid JSON or object."
      );
    }
  };

  const handleNavigation = (itemId: string) => {
    switch (itemId) {
      case "dashboard":
        setViewMode("dashboard");
        break;
      case "running":
        setViewMode("running");
        break;
      case "builder":
        setViewMode("builder");
        break;
      case "form-builder":
        setViewMode("form-builder");
        break;
      case "viewer":
        setViewMode("graph");
        break;
      default:
        break;
    }
  };

  const { nodes, edges } = parseWorkflowToGraph(workflow);

  // Dashboard view with integrated layout
  if (viewMode === "dashboard") {
    return (
      <MainLayout 
        title="Dashboard" 
        showMenuButton={true}
        onNavigate={handleNavigation}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapseChange={setSidebarCollapsed}
      >
        <Dashboard 
          onApplicationClick={handleApplicationClick}
        />
      </MainLayout>
    );
  }

  // Form builder view
  if (viewMode === "form-builder") {
    return (
      <MainLayout 
        title="Form Builder" 
        showMenuButton={true}
        onNavigate={handleNavigation}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapseChange={setSidebarCollapsed}
      >
        <DynamicFormBuilder />
      </MainLayout>
    );
  }

  // Workflow Builder view
  if (viewMode === "builder") {
    return (
      <MainLayout 
        title="Workflow Builder" 
        showMenuButton={false}
        onNavigate={handleNavigation}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapseChange={setSidebarCollapsed}
      >
        <div className="app-container">
          <WorkflowBuilder
            onExport={handleWorkflowExport}
            onBack={() => setViewMode("dashboard")}
          />
        </div>
      </MainLayout>
    );
  }

  // Running workflows view
  if (viewMode === "running") {
    return (
      <MainLayout 
        title="Running Workflows" 
        showMenuButton={true}
        onNavigate={handleNavigation}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapseChange={setSidebarCollapsed}
      >
        <RunningWorkflowsPage onBack={() => setViewMode("dashboard")} />
      </MainLayout>
    );
  }

  // Application Details view
  if (viewMode === "details" && selectedWorkflow) {
    return (
      <MainLayout 
        title="Application Details" 
        showMenuButton={true}
        onNavigate={handleNavigation}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapseChange={setSidebarCollapsed}
      >
        <ApplicationDetails
          workflowData={selectedWorkflow}
          onBack={handleBackToDashboard}
        />
      </MainLayout>
    );
  }

  // Graph/Form view
  return (
    <MainLayout
      title="Workflow Visualizer"
      showMenuButton={true}
      onNavigate={handleNavigation}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapseChange={setSidebarCollapsed}
    >
      <div className="workflow-viewer-container">
        {viewMode === "form" ? (
          <div className="form-container">
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
          <div className="workflow-graph-container">
            {showEditor && (
              <div className="json-editor-panel">
                <div className="editor-header">
                  <h3>JSON Editor</h3>
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
                onNodeFormView={handleNodeFormView}
              />
              {!showEditor && (
                <button
                  className="show-editor-btn"
                  onClick={() => setShowEditor(true)}
                  title="Show JSON Editor"
                >
                  {'</>'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default App;
