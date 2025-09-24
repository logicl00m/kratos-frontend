// src/features/running-workflows/components/RunningWorkflowsPage.tsx

import React, { useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  RefreshCw,
  Grid,
  List,
  Search,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  FileText,
  GripVertical,
} from "lucide-react";
import RunningStateNode from "./RunningStateNode";
import RunningWorkflowEdge from "./RunningWorkflowEdge";
import {
  parseRunningWorkflowToGraph,
  getWorkflowStatus,
  calculateProgress,
  getAllHistory,
  getHistoryForState,
  getWorkflowFormData,
  getFormDataForState,
  getWorkflowOwner,
} from "../utils/runningWorkflowParser";
import { useRunningWorkflows } from "@/lib/hooks/useApiWithFallback";
import type {
  WorkflowData,
  WorkflowDataWrapper,
} from "../types/runningWorkflow.types";
import "./RunningWorkflowsPage.css";

const nodeTypes = {
  runningStateNode: RunningStateNode,
};

const edgeTypes = {
  default: RunningWorkflowEdge,
  smoothstep: RunningWorkflowEdge,
};

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

  const { nodes: graphNodes, edges: graphEdges } = React.useMemo(() => {
    return selectedWorkflow
      ? parseRunningWorkflowToGraph(selectedWorkflow)
      : { nodes: [], edges: [] };
  }, [selectedWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  React.useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDisplayValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item && typeof item === "object" && "name" in item) {
            return (item as { name?: string }).name || String(item);
          }
          return String(item ?? "");
        })
        .join(", ");
    }
    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }
    if (value == null) return "";
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
    // Fallback to JSON for other types to avoid [object Object]
    try {
      return JSON.stringify(value);
    } catch {
      return "[unserializable]";
    }
  };

  const getActionIcon = (actionText: string) => {
    const lower = actionText.toLowerCase();
    if (lower.includes("approve"))
      return <CheckCircle size={16} className="success" />;
    if (lower.includes("reject"))
      return <XCircle size={16} className="danger" />;
    return <ArrowRight size={16} />;
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
      <div className="rwp-toolbar">
        <div className="rwp-toolbar-left">
          <div className="rwp-search-box">
            <Search size={16} className="rwp-search-icon" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rwp-search-input"
            />
          </div>
          <select
            className="rwp-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="rwp-toolbar-right">
          <div className="rwp-view-toggle">
            <button
              className={viewMode === "graph" ? "active" : ""}
              onClick={() => setViewMode("graph")}
              title="Graph View"
            >
              <Grid size={16} />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
          <button className="rwp-refresh-btn">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

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
            <div className="rwp-sidebar">
              <div className="rwp-sidebar-header">
                <span className="rwp-sidebar-title">Workflow Instances</span>
                <span className="rwp-sidebar-badge">
                  {filteredWorkflows.length}
                </span>
              </div>

              <div className="rwp-sidebar-list">
                {filteredWorkflows.map((workflow) => {
                  const statusInfo = getWorkflowStatus(workflow);
                  const progress = calculateProgress(workflow);
                  const owner = getWorkflowOwner(workflow);
                  const isSelected =
                    selectedWorkflow?.workflow.id === workflow.workflow.id;

                  return (
                    <button
                      key={workflow.workflow.id}
                      className={`rwp-workflow-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleWorkflowSelect(workflow)}
                    >
                      <div className="rwp-card-header">
                        <span className="rwp-card-id">
                          {workflow.workflow.id}
                        </span>
                        <span
                          className={`rwp-card-status ${statusInfo.status}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="rwp-card-info">
                        <span className="rwp-card-state">
                          {workflow.workflow.currentState}
                        </span>
                        <span className="rwp-card-owner">
                          {owner?.employeeName || "Unassigned"}
                        </span>
                      </div>

                      <div className="rwp-card-progress">
                        <div
                          className="rwp-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
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
                    <div className="reactflow-wrapper rwp-graph-container">
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={handleNodeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        proOptions={{ hideAttribution: true }}
                        nodesConnectable={false}
                      >
                        <Background
                          gap={16}
                          size={1}
                          color="rgba(99, 102, 241, 0.03)"
                        />
                        <Controls className="rwp-controls" />
                        <MiniMap className="rwp-minimap" zoomable pannable />
                      </ReactFlow>
                    </div>
                  );
                }
                if (viewMode === "list") {
                  return (
                    <div className="rwp-list-container">
                      <table className="rwp-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Current State</th>
                            <th>Owner</th>
                            <th>Last Updated</th>
                            <th>Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWorkflows.map((workflow) => {
                            const statusInfo = getWorkflowStatus(workflow);
                            const progress = calculateProgress(workflow);
                            const owner = getWorkflowOwner(workflow);

                            return (
                              <tr
                                key={workflow.workflow.id}
                                onClick={() => handleWorkflowSelect(workflow)}
                                className={
                                  selectedWorkflow?.workflow.id ===
                                  workflow.workflow.id
                                    ? "selected"
                                    : ""
                                }
                              >
                                <td className="rwp-table-id">
                                  {workflow.workflow.id}
                                </td>
                                <td>
                                  <span
                                    className={`rwp-table-status ${statusInfo.status}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                </td>
                                <td>{workflow.workflow.currentState}</td>
                                <td>{owner?.employeeName || "Unassigned"}</td>
                                <td>
                                  {formatDate(
                                    workflow.workflow.currentStateEnteredAt
                                  )}
                                </td>
                                <td>
                                  <div className="rwp-table-progress">
                                    <div className="rwp-table-progress-bar">
                                      <div
                                        className="rwp-table-progress-fill"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span>{progress}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
                <div className="rwp-detail-panel running-workflow-detail">
                  <div className="rwp-detail-header">
                    <h3 className="rwp-detail-title">
                      {selectedNodeId
                        ? `State: ${selectedNodeId}`
                        : "Workflow Details"}
                    </h3>
                    <button
                      className="rwp-detail-close"
                      onClick={() => setShowDetailPanel(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="rwp-detail-body">
                    {selectedWorkflow && (
                      <>
                        {/* Action History */}
                        <div className="rwp-detail-section">
                          <h4 className="rwp-section-title">
                            <Clock size={14} />
                            Action History
                          </h4>
                          <div className="rwp-history-list">
                            {(selectedNodeId
                              ? getHistoryForState(
                                  selectedWorkflow,
                                  selectedNodeId
                                )
                              : getAllHistory(selectedWorkflow)
                            )
                              .slice(0, 5)
                              .map((action) => (
                                <div
                                  key={action.id}
                                  className="rwp-history-item"
                                >
                                  <div className="rwp-history-icon">
                                    {getActionIcon(action.action)}
                                  </div>
                                  <div className="rwp-history-content">
                                    <div className="rwp-history-action">
                                      {action.action}
                                    </div>
                                    <div className="rwp-history-meta">
                                      <span>{action.byUser.name}</span>
                                      <span>{formatDate(action.at)}</span>
                                    </div>
                                    {action.stateTo && (
                                      <div className="rwp-history-state">
                                        → {action.stateTo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Current Data */}
                        <div className="rwp-detail-section">
                          <h4 className="rwp-section-title">
                            <FileText size={14} />
                            Current Data
                          </h4>
                          <div className="rwp-data-grid">
                            {Object.entries(
                              selectedNodeId
                                ? getFormDataForState(
                                    selectedWorkflow,
                                    selectedNodeId
                                  )
                                : getWorkflowFormData(selectedWorkflow)
                            )
                              .slice(0, 6)
                              .map(([key, value]) => (
                                <div key={key} className="rwp-data-item">
                                  <span className="rwp-data-label">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </span>
                                  <span className="rwp-data-value">
                                    {formatDisplayValue(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
};

export default RunningWorkflowsPage;
