// src/features/running-workflows/components/RunningWorkflowsPage.tsx

import React, { useState } from "react";
import type { Node } from "reactflow";
import "reactflow/dist/style.css";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AlertCircle, GripVertical } from "lucide-react";
import { useRunningWorkflows } from "@/lib/hooks/useApiWithFallback";
import type {
  WorkflowData,
  WorkflowDataWrapper,
} from "../types/runningWorkflow.types";
import { getWorkflowStatus, getWorkflowOwner } from "../utils/runningWorkflowParser";

// Import modular components
import WorkflowSidebar from "./WorkflowSidebar";
import WorkflowToolbar from "./WorkflowToolbar";
import WorkflowGraphView from "./WorkflowGraphView";
import WorkflowListView from "./WorkflowListView";
import WorkflowDetailPanel from "./WorkflowDetailPanel";
import "./RunningWorkflowsPage.css";

interface RunningWorkflowsPageProps {
  onBack?: () => void;
}

const RunningWorkflowsPage: React.FC<RunningWorkflowsPageProps> = () => {
  // Use API hook with fallback to mock data
  const {
    data: workflowsData,
    loading: workflowsLoading,
    isUsingFallback: workflowsUsingFallback,
  } = useRunningWorkflows();

  const allWorkflows = React.useMemo<WorkflowDataWrapper[]>(() => {
    const data = workflowsData as WorkflowData[];
    if (!data || !Array.isArray(data)) return [];
    return data.map((w) => ({ workflow: w }));
  }, [workflowsData]);

  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowDataWrapper | null>(null);

  // Update selected workflow when data loads
  React.useEffect(() => {
    if (allWorkflows.length > 0 && !selectedWorkflow) {
      setSelectedWorkflow(allWorkflows[0]);
    }
  }, [allWorkflows, selectedWorkflow]);

  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(true);

  const lowerSearchTerm = searchTerm.toLowerCase();

  const filteredWorkflows = allWorkflows.filter((wrapper) => {
    if (!wrapper?.workflow) return false;
    const workflow = wrapper.workflow;

    const status = getWorkflowStatus(wrapper).status;
    const owner = getWorkflowOwner(wrapper);
    const ownerName = owner?.employeeName?.toLowerCase() ?? "";

    const matchesSearch =
      workflow.id?.toLowerCase().includes(lowerSearchTerm) ||
      workflow.currentState?.toLowerCase().includes(lowerSearchTerm) ||
      ownerName.includes(lowerSearchTerm);

    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWorkflowSelect = (workflow: WorkflowDataWrapper) => {
    setSelectedWorkflow(workflow);
    setSelectedNodeId(null);
    if (!showDetailPanel) setShowDetailPanel(true);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (!showDetailPanel) setShowDetailPanel(true);
  };

  // Show loading state
  if (workflowsLoading) {
    return (
      <div className="rwp-container">
        <div className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Loading running workflows...
          </p>
          {workflowsUsingFallback && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Using offline data due to connection issues
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rwp-container running-workflows-page">
      {/* Show data source indicator */}
      {workflowsUsingFallback && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ℹ️ Currently showing offline data. Some information may not be up to
            date.
          </p>
        </div>
      )}

      {/* Header Controls */}
      <WorkflowToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content with Resizable Panels */}
      <div className="rwp-content">
        <PanelGroup direction="horizontal" className="rwp-panel-group">
          {/* Left Sidebar */}
          <Panel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="rwp-panel-left running-workflows-page__list"
          >
            <WorkflowSidebar
              workflows={filteredWorkflows}
              selectedWorkflow={selectedWorkflow}
              onWorkflowSelect={handleWorkflowSelect}
            />
          </Panel>

          <PanelResizeHandle className="rwp-resize-handle">
            <GripVertical size={16} />
          </PanelResizeHandle>

          {/* Center Canvas */}
          <Panel
            defaultSize={showDetailPanel ? 50 : 80}
            className="rwp-panel-center running-workflows-page__graph"
          >
            <div className="rwp-main">
              {selectedWorkflow && (
                <div className="rwp-canvas-header">
                  <h2 className="rwp-canvas-title">
                    {selectedWorkflow.workflow.id}
                  </h2>
                  <span className="rwp-canvas-state">
                    Current State:{" "}
                    <strong>{selectedWorkflow.workflow.currentState}</strong>
                  </span>
                </div>
              )}

              {(() => {
                if (viewMode === "graph" && selectedWorkflow) {
                  return (
                    <WorkflowGraphView
                      workflow={selectedWorkflow}
                      onNodeClick={handleNodeClick}
                    />
                  );
                }
                if (viewMode === "list") {
                  return (
                    <WorkflowListView
                      workflows={filteredWorkflows}
                      selectedWorkflow={selectedWorkflow}
                      onWorkflowSelect={handleWorkflowSelect}
                    />
                  );
                }
                return (
                  <div className="rwp-empty-state">
                    <AlertCircle size={48} />
                    <p>Select a workflow to view details</p>
                  </div>
                );
              })()}
            </div>
          </Panel>

          {/* Right Detail Panel */}
          {showDetailPanel && (
            <>
              <PanelResizeHandle className="rwp-resize-handle">
                <GripVertical size={16} />
              </PanelResizeHandle>

              <Panel
                defaultSize={30}
                minSize={20}
                maxSize={40}
                className="rwp-panel-right running-workflows-page__details"
              >
                <WorkflowDetailPanel
                  workflow={selectedWorkflow}
                  selectedNodeId={selectedNodeId}
                  onClose={() => setShowDetailPanel(false)}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
};

export default RunningWorkflowsPage;
