// src/app/App.tsx
import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "@features/dashboard/components/Dashboard";
import ApplicationDetails from "@features/application-details/components/ApplicationDetails";
import RunningWorkflowsPage from "@features/running-workflows/components/RunningWorkflowsPage";
import WorkflowBuilder from "@features/workflow-config-edit/components/builder/WorkflowBuilder";
import FormBuilderPage from "@features/dynamic-form-builder/FormBuilderPage";
import CreateWorkflow from "@features/workflow-templates/components/CreateWorkflow";
import WorkflowInitiation from "@features/workflow-initiation/components/WorkflowInitiation";
import WorkflowGraph from "@features/workflow/components/WorkflowGraph";
import JsonEditor from "@features/workflow/components/JsonEditor";
import {
  parseWorkflowToGraph,
  getDefaultWorkflow,
} from "@features/workflow/utils/graphParser";
import type { WorkflowConfig } from "@features/workflow/types/workflow.types";
import type { WorkflowData } from "@features/dashboard/types/dashboard.types";
import "./App.css";
import MainLayout from "@shared/components/layout/MainLayout";

function App() {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowConfig>(
    getDefaultWorkflow()
  );
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(getDefaultWorkflow(), null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(
    null
  );

  const handleNavigation = (itemId: string) => {
    const map: Record<string, string> = {
      dashboard: "/dashboard",
      "create-workflow": "/create-workflow",
      "initiate-workflow": "/initiate-workflow",
      running: "/running",
      builder: "/builder",
      "form-builder": "/form-builder/new",
      viewer: "/viewer",
      applications: "/applications",
      analytics: "/analytics",
      users: "/users",
      settings: "/settings",
    };
    navigate(map[itemId] || "/dashboard");
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

  const DashboardPage = (
    <MainLayout title="Dashboard" onNavigate={handleNavigation}>
      <Dashboard
        onApplicationClick={(wf) => {
          setSelectedWorkflow(wf);
          navigate("/applications/details");
        }}
      />
    </MainLayout>
  );

  const CreateWorkflowPage = (
    <MainLayout title="Create Workflow" onNavigate={handleNavigation}>
      <CreateWorkflow
        onBack={() => navigate("/dashboard")}
        onComplete={(wfConfig) => {
          setWorkflow(wfConfig as unknown as WorkflowConfig);
          setJsonText(JSON.stringify(wfConfig, null, 2));
          navigate("/viewer");
        }}
      />
    </MainLayout>
  );

  const InitiateWorkflowPage = (
    <MainLayout title="Initiate Workflow" onNavigate={handleNavigation}>
      <WorkflowInitiation onBack={() => navigate("/dashboard")} />
    </MainLayout>
  );

  const FormBuilderRoute = (
    <MainLayout title="Form Builder" onNavigate={handleNavigation}>
      <FormBuilderPage />
    </MainLayout>
  );

  const WorkflowBuilderPage = (
    <MainLayout title="Workflow Builder" onNavigate={handleNavigation}>
      <div className="app-container">
        <WorkflowBuilder
          onExport={(json) => {
            let parsed: unknown = json;
            try {
              if (typeof json === "string") parsed = JSON.parse(json);
              if (
                !parsed ||
                typeof parsed !== "object" ||
                !("workflow" in (parsed as Record<string, unknown>))
              ) {
                throw new Error(
                  "Invalid workflow format: missing 'workflow' property"
                );
              }
              setWorkflow(parsed as WorkflowConfig);
              setJsonText(JSON.stringify(parsed, null, 2));
              setError(null);
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              console.error("Failed to import workflow:", message);
              setError(
                message ||
                  "Failed to import workflow. Provide valid JSON or object."
              );
            }
          }}
          onBack={() => navigate("/dashboard")}
        />
      </div>
    </MainLayout>
  );

  const RunningPage = (
    <MainLayout title="Running Workflows" onNavigate={handleNavigation}>
      <RunningWorkflowsPage onBack={() => navigate("/dashboard")} />
    </MainLayout>
  );

  const ApplicationDetailsPage = selectedWorkflow ? (
    <MainLayout title="Application Details" onNavigate={handleNavigation}>
      <ApplicationDetails
        workflowData={selectedWorkflow}
        onBack={() => {
          setSelectedWorkflow(null);
          navigate("/dashboard");
        }}
      />
    </MainLayout>
  ) : (
    <Navigate to="/dashboard" replace />
  );

  const ViewerPage = (
    <MainLayout title="Workflow Visualizer" onNavigate={handleNavigation}>
      <div className="workflow-viewer-container">
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
    </MainLayout>
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={DashboardPage} />
      <Route path="/create-workflow" element={CreateWorkflowPage} />
      <Route path="/initiate-workflow" element={InitiateWorkflowPage} />
      <Route path="/running" element={RunningPage} />
      <Route path="/builder" element={WorkflowBuilderPage} />
      <Route path="/form-builder/new" element={FormBuilderRoute} />
      <Route path="/applications/details" element={ApplicationDetailsPage} />
      <Route path="/viewer" element={ViewerPage} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
// End of file
