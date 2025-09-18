// src/features/running-workflows/components/RunningWorkflowsPage.tsx

import React, { useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
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
  Activity,
  User,
} from "lucide-react";
import RunningStateNode from "./RunningStateNode";
import {
  parseRunningWorkflowToGraph,
  getWorkflowStatus,
  calculateProgress,
  getAllHistory,
  getWorkflowFormData,
  getCurrentAssignee,
  getWorkflowOwner,
} from "../utils/runningWorkflowParser";
import { allWorkflows } from "../data/runningWorkflows.data";
import type {
  WorkflowData,
  WorkflowHistoryEntry,
} from "../types/runningWorkflow.types";
import "./RunningWorkflowsPage.css";

const nodeTypes = {
  runningStateNode: RunningStateNode,
};

interface RunningWorkflowsPageProps {
  onBack?: () => void;
}

interface DetailPanelProps {
  workflow: WorkflowData | null;
  selectedNodeId: string | null;
  nodes: Node<RunningWorkflowNodeData>[];
  onClose: () => void;
  onNodeDetailClose: () => void;
}

const formatDisplayValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === "object" && "name" in item) {
          const name = (item as { name?: unknown }).name;
          if (typeof name === "string") {
            return name;
          }
        }
        return String(item ?? "");
      })
      .join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value == null) {
    return "";
  }

  return String(value);
};

const formatStateTransition = (
  from?: string | null,
  to?: string | null
): string => {
  if (from && to) {
    return `${from} -> ${to}`;
  }
  return to ?? from ?? "State";
};

const DetailPanel: React.FC<DetailPanelProps> = ({
  workflow,
  selectedNodeId,
  nodes,
  onClose,
  onNodeDetailClose,
}) => {
  if (!workflow) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action?: string) => {
    if (!action) return <ArrowRight size={12} />;
    if (action.toLowerCase().includes("reject")) {
      return <XCircle size={12} color="#ef4444" />;
    }
    if (
      action.toLowerCase().includes("approve") ||
      action.toLowerCase().includes("finalize")
    ) {
      return <CheckCircle size={12} color="#10b981" />;
    }
    if (action.toLowerCase().includes("submit")) {
      return <ArrowRight size={12} color="#3b82f6" />;
    }
    return <ArrowRight size={12} />;
  };

  const formatAction = (action: string) => {
    return action
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  if (selectedNodeId) {
    const state = workflow.workflow.states[selectedNodeId];
    const nodeStatus = nodes.find((n) => n.id === selectedNodeId)?.data?.status;

    const nodeHistory =
      state?.history.filter(
        (h) => h.stateTo === selectedNodeId || h.stateFrom === selectedNodeId
      ) || [];

    return (
      <div className="rdp-enhanced-panel">
        <div className="rdp-header">
          <div>
            <h3 className="rdp-title">State: {selectedNodeId}</h3>
          </div>
          <button onClick={onNodeDetailClose} className="rdp-close">
            <X size={16} />
          </button>
        </div>

        <div className="rdp-body">
          {nodeHistory.length === 0 && nodeStatus === "pending" ? (
            <div className="rdp-node-not-reached">
              <AlertCircle size={24} color="#9ca3af" />
              <p>This state has not been reached yet</p>
              <div className="rdp-state-info">
                <h4>State Information</h4>
                <p>Actions will be available when this state is reached</p>
              </div>
            </div>
          ) : (
            <div className="rdp-section">
              <div className="rdp-section-title">
                <Activity size={14} />
                Actions on this state
              </div>
              {nodeHistory.map((item) => (
                <div key={item.id} className="rdp-action-detail">
                  <div className="rdp-action-header">
                    {getActionIcon(item.action)}
                    <span className="rdp-action-title">
                      {formatAction(item.action)}
                    </span>
                  </div>
                  {item.stateFrom && item.stateTo && (
                    <div className="rdp-action-transition">
                      {formatStateTransition(item.stateFrom, item.stateTo)}
                    </div>
                  )}
                  <div className="rdp-action-meta">
                    <User size={12} />
                    <span>
                      {item.byUser.name} ({item.byUser.role})
                    </span>
                  </div>
                  <div className="rdp-action-meta">
                    <Clock size={12} />
                    <span>{formatDate(item.at)}</span>
                  </div>
                  {item.changes && item.changes.length > 0 && (
                    <div className="rdp-action-changes">
                      <strong>Changes made:</strong>
                      {item.changes.map((change) => {
                        const key =
                          change.fieldId ||
                          `${change.fieldName || "change"}-${
                            change.changeType
                          }`;
                        const fieldLabel =
                          change.fieldId || change.fieldName || "Field";
                        return (
                          <div key={key}>
                            - {fieldLabel}: {formatDisplayValue(change.old)}{" -> "}
                            {formatDisplayValue(change.new)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const allHistory = getAllHistory(workflow);
  const mainActions = allHistory.filter((h) => h.action !== "updateFields");
  const formData = getWorkflowFormData(workflow);
  const statusInfo = getWorkflowStatus(workflow);

  return (
    <div className="rdp-enhanced-panel">
      <div className="rdp-header">
        <div>
          <h3 className="rdp-title">{workflow.workflow.id}</h3>
          <span className={`status-badge status-${statusInfo.status}`}>
            {statusInfo.label}
          </span>
        </div>
        <button onClick={onClose} className="rdp-close">
          <X size={16} />
        </button>
      </div>

      <div className="rdp-body">
        <div className="rdp-section">
          <div className="rdp-section-title">
            <Clock size={14} />
            Action Summary
          </div>
          <div className="rdp-action-list">
            {mainActions.map((action) => (
              <div key={action.id} className="rdp-summary-item">
                <div className="rdp-summary-icon">
                  {getActionIcon(action.action)}
                </div>
                <div className="rdp-summary-content">
                  <div className="rdp-summary-header">
                    <span className="rdp-summary-time">
                      {formatDate(action.at)}
                    </span>
                  </div>
                  <div className="rdp-summary-state">
                    {formatStateTransition(action.stateFrom, action.stateTo)}
                  </div>
                  <div className="rdp-summary-action">
                    <span className="rdp-action-badge">
                      {formatAction(action.action)}
                    </span>
                    <span className="rdp-summary-actor">
                      by {action.byUser.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rdp-section">
          <div className="rdp-section-title">
            <FileText size={14} />
            Current Data
          </div>
          <div className="rdp-data-container">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="rdp-data-item">
                <span className="rdp-data-key">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </span>
                <span className="rdp-data-value">
                  {formatDisplayValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RunningWorkflowsPage: React.FC<RunningWorkflowsPageProps> = ({
  onBack,
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(
    allWorkflows[0] || null
  );
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes: graphNodes, edges: graphEdges } = React.useMemo(() => {
    return selectedWorkflow
      ? parseRunningWorkflowToGraph(selectedWorkflow)
      : { nodes: [], edges: [] };
  }, [selectedWorkflow]);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<RunningWorkflowNodeData>(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  React.useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

  const lowerSearchTerm = searchTerm.toLowerCase();

  const filteredWorkflows = allWorkflows.filter((workflow) => {
    const status = getWorkflowStatus(workflow).status;
    const owner = getWorkflowOwner(workflow);
    const ownerName = owner?.employeeName?.toLowerCase() ?? "";
    const matchesSearch =
      workflow.workflow.id.toLowerCase().includes(lowerSearchTerm) ||
      workflow.workflow.currentState.toLowerCase().includes(lowerSearchTerm) ||
      ownerName.includes(lowerSearchTerm);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWorkflowSelect = (workflow: WorkflowData) => {
    setSelectedWorkflow(workflow);
    setSelectedNodeId(null);
    if (viewMode === "list") {
      setViewMode("graph");
    }
  };

  const handleNodeClick = (
    _event: React.MouseEvent,
    node: Node<RunningWorkflowNodeData>
  ) => {
    setSelectedNodeId(node.id);
  };

  const renderViewContent = (): React.ReactNode => {
    if (viewMode === "graph" && selectedWorkflow) {
      return (
        <>
          <div className="rwp-graph-info">
            <h2>{selectedWorkflow.workflow.id} - Workflow Visualization</h2>
            <span>
              Current State{" "}
              <strong>{selectedWorkflow.workflow.currentState}</strong>
            </span>
          </div>
          <div className="rwp-graph-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              nodesConnectable={false}
              elementsSelectable={true}
            >
              <Background gap={12} size={1} />
              <Controls />
              <MiniMap style={{ height: 100, width: 120 }} zoomable pannable />
            </ReactFlow>
          </div>
        </>
      );
    }

    if (viewMode === "list") {
      return (
        <div className="rwp-list-view">
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
                      selectedWorkflow?.workflow.id === workflow.workflow.id
                        ? "selected"
                        : ""
                    }
                  >
                    <td>{workflow.workflow.id}</td>
                    <td>
                      <span
                        className="rwp-table-status"
                        style={{ background: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{workflow.workflow.currentState}</td>
                    <td>{owner?.employeeName || "System"}</td>
                    <td>
                      {new Date(
                        workflow.workflow.currentStateEnteredAt
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="rwp-table-progress">
                        <div
                          className="rwp-table-progress-bar"
                          style={{
                            width: `${progress}%`,
                            background: statusInfo.color,
                          }}
                        />
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
      <div className="rwp-empty">
        <p>Select a workflow instance to view its visualization</p>
      </div>
    );
  };
  return (
    <div className="running-workflows-page">
      <div className="rwp-header">
        <div className="rwp-header-left">
          <h1 className="rwp-title">Running Workflows</h1>
          <button className="rwp-back-btn" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
        <div className="rwp-controls">
          <div className="rwp-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rwp-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="rwp-view-toggle">
            <button
              className={viewMode === "graph" ? "active" : ""}
              onClick={() => setViewMode("graph")}
            >
              <Grid size={16} />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </button>
          </div>
          <button className="rwp-refresh">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="rwp-body">
        <div className="rwp-sidebar">
          <div className="rwp-sidebar-header">
            <span>Workflow Instances ({filteredWorkflows.length})</span>
          </div>
          <div className="rwp-instances-list">
            {filteredWorkflows.map((workflow) => {
              const statusInfo = getWorkflowStatus(workflow);
              const progress = calculateProgress(workflow);
              const owner = getWorkflowOwner(workflow);

              return (
                <button
                  type="button"
                  key={workflow.workflow.id}
                  className={`rwp-instance-card ${
                    selectedWorkflow?.workflow.id === workflow.workflow.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleWorkflowSelect(workflow)}
                >
                  <div className="rwp-instance-header">
                    <span className="rwp-instance-id">
                      {workflow.workflow.id}
                    </span>
                    <span
                      className="rwp-instance-status"
                      style={{ background: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="rwp-instance-info">
                    <span className="rwp-instance-state">
                      State: {workflow.workflow.currentState}
                    </span>
                    <span className="rwp-instance-owner">
                      {owner?.employeeName || "System"}
                    </span>
                  </div>
                  <div className="rwp-instance-progress">
                    <div
                      className="rwp-progress-bar"
                      style={{
                        width: `${progress}%`,
                        background: statusInfo.color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rwp-main">{renderViewContent()}</div>

        {selectedWorkflow && viewMode === "graph" && (
          <DetailPanel
            workflow={selectedWorkflow}
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            onClose={() => setSelectedWorkflow(null)}
            onNodeDetailClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default RunningWorkflowsPage;

