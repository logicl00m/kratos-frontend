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
  AlertCircle,
} from "lucide-react";
import RunningStateNode from "./RunningStateNode";
import RunningWorkflowDetailPanel from "./RunningWorkflowDetailPanel";
import { runningWorkflowsData } from "../data/runningWorkflows.data";
import {
  parseRunningWorkflowToGraph,
  getStatusInfo,
  calculateProgress,
} from "../utils/runningWorkflowParser";
import { getDefaultWorkflow } from "@features/workflow/utils/graphParser";
import type { WorkflowInstance } from "../types/runningWorkflow.types";
import "./RunningWorkflowsPage.css";

const nodeTypes = {
  runningStateNode: RunningStateNode,
};

interface RunningWorkflowsPageProps {
  onBack?: () => void;
}

interface EnhancedDetailPanelProps {
  instance: WorkflowInstance | null;
  selectedNodeId: string | null;
  nodes: any[];
  onClose: () => void;
  onNodeDetailClose: () => void;
}

const EnhancedDetailPanel: React.FC<EnhancedDetailPanelProps> = ({
  instance,
  selectedNodeId,
  nodes,
  onClose,
  onNodeDetailClose,
}) => {
  if (!instance) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action?: string, type?: string) => {
    if (!action && !type) return <ArrowRight size={12} />;
    if (action?.includes("Reject"))
      return <XCircle size={12} color="#ef4444" />;
    if (action?.includes("Approve") || action?.includes("Finalize"))
      return <CheckCircle size={12} color="#10b981" />;
    if (action?.includes("Submit"))
      return <ArrowRight size={12} color="#3b82f6" />;
    if (type === "COMMENT_ADDED")
      return <AlertCircle size={12} color="#f59e0b" />;
    return <ArrowRight size={12} />;
  };

  const getActionLabel = (action?: string, type?: string) => {
    if (action) {
      if (action.includes("Reject")) return "Rejected";
      if (action.includes("Approve")) return "Approved";
      if (action.includes("Finalize")) return "Finalized";
      if (action.includes("Submit")) return "Submitted";
      return action;
    }
    if (type === "COMMENT_ADDED") return "Comment";
    return "Action";
  };

  const getNodeActionHistory = (nodeId: string) => {
    return instance.history.filter(
      (h) => h.event.to === nodeId || h.event.from === nodeId
    );
  };

  // If a node is selected, show node details
  if (selectedNodeId) {
    const nodeHistory = getNodeActionHistory(selectedNodeId);
    const nodeStatus = nodes.find((n) => n.id === selectedNodeId)?.data?.status;

    return (
      <div className="rdp-enhanced-panel">
        <div className="rdp-header">
          <div>
            <h3 className="rdp-title">State: {selectedNodeId}</h3>
          </div>
          <button onClick={onNodeDetailClose} className="rdp-close">
            ×
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
            <div className="rdp-node-actions">
              <div className="rdp-section">
                <div className="rdp-section-title">
                  <Activity size={14} />
                  Actions on this state
                </div>
                {nodeHistory.map((item) => (
                  <div key={item.id} className="rdp-action-detail">
                    <div className="rdp-action-header">
                      {getActionIcon(item.event.action, item.event.type)}
                      <span className="rdp-action-title">
                        {getActionLabel(item.event.action, item.event.type)}
                      </span>
                    </div>
                    {item.event.from && item.event.to && (
                      <div className="rdp-action-transition">
                        {item.event.from} → {item.event.to}
                      </div>
                    )}
                    <div className="rdp-action-meta">
                      <User size={12} />
                      <span>
                        {item.actor.name} ({item.actor.role})
                      </span>
                    </div>
                    <div className="rdp-action-meta">
                      <Clock size={12} />
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                    {item.notes && (
                      <div className="rdp-action-notes">{item.notes}</div>
                    )}
                    {item.changes && item.changes.length > 0 && (
                      <div className="rdp-action-changes">
                        <strong>Changes made:</strong>
                        {item.changes.map((change, idx) => (
                          <div key={idx}>
                            • {change.fieldName || change.fieldId}:{" "}
                            {change.changeType.toLowerCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise show workflow details with action summary
  const mainActions = instance.history.filter(
    (h) => h.event.type === "STATE_TRANSITION"
  );

  return (
    <div className="rdp-enhanced-panel">
      <div className="rdp-header">
        <div>
          <h3 className="rdp-title">{instance.id}</h3>
          <span className={`status-badge status-${instance.status}`}>
            {instance.status.toUpperCase()}
          </span>
        </div>
        <button onClick={onClose} className="rdp-close">
          ×
        </button>
      </div>

      <div className="rdp-body">
        {/* Action Summary Section */}
        <div className="rdp-section">
          <div className="rdp-section-title">
            <Clock size={14} />
            Action Summary
          </div>
          <div className="rdp-action-list">
            {mainActions.map((action) => (
              <div key={action.id} className="rdp-summary-item">
                <div className="rdp-summary-icon">
                  {getActionIcon(action.event.action, action.event.type)}
                </div>
                <div className="rdp-summary-content">
                  <div className="rdp-summary-header">
                    <span className="rdp-summary-time">
                      {formatDate(action.timestamp)}
                    </span>
                  </div>
                  <div className="rdp-summary-state">
                    {action.event.from && action.event.to
                      ? `${action.event.from} → ${action.event.to}`
                      : action.event.to || action.event.from || "State"}
                  </div>
                  <div className="rdp-summary-action">
                    <span className="rdp-action-badge">
                      {getActionLabel(action.event.action, action.event.type)}
                    </span>
                    <span className="rdp-summary-actor">
                      by {action.actor.name}
                    </span>
                  </div>
                  {action.notes && (
                    <div className="rdp-summary-notes">{action.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Data Section */}
        <div className="rdp-section">
          <div className="rdp-section-title">
            <FileText size={14} />
            Current Data
          </div>
          <div className="rdp-data-container">
            {Object.entries(instance.data).map(([key, value]) => (
              <div key={key} className="rdp-data-item">
                <span className="rdp-data-key">{key.replace(/_/g, " ")}</span>
                <span className="rdp-data-value">
                  {Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { FileText, Activity, User } from "lucide-react";

const RunningWorkflowsPage: React.FC<RunningWorkflowsPageProps> = ({
  onBack,
}) => {
  const [selectedInstance, setSelectedInstance] =
    useState<WorkflowInstance | null>(
      runningWorkflowsData.instances[0] || null
    );
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const workflowConfig = getDefaultWorkflow();

  const { nodes: graphNodes, edges: graphEdges } = React.useMemo(() => {
    return selectedInstance
      ? parseRunningWorkflowToGraph(selectedInstance, workflowConfig)
      : { nodes: [], edges: [] };
  }, [selectedInstance, workflowConfig]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  React.useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [selectedInstance]);

  const filteredInstances = runningWorkflowsData.instances.filter(
    (instance) => {
      const matchesSearch =
        instance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.currentState.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || instance.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const handleInstanceSelect = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setSelectedNodeId(null);
    if (viewMode === "list") {
      setViewMode("graph");
    }
  };

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
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
            <span>Workflow Instances ({filteredInstances.length})</span>
          </div>
          <div className="rwp-instances-list">
            {filteredInstances.map((instance) => {
              const statusInfo = getStatusInfo(instance);
              const progress = calculateProgress(
                instance,
                Object.keys(workflowConfig.workflow.states).length
              );

              return (
                <div
                  key={instance.id}
                  className={`rwp-instance-card ${
                    selectedInstance?.id === instance.id ? "selected" : ""
                  }`}
                  onClick={() => handleInstanceSelect(instance)}
                >
                  <div className="rwp-instance-header">
                    <span className="rwp-instance-id">{instance.id}</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <span
                        className="rwp-instance-status"
                        style={{ background: statusInfo.color }}
                      >
                        {statusInfo.label}
                      </span>
                      {instance.priority && (
                        <span
                          className="rwp-instance-status"
                          style={{
                            background:
                              instance.priority === "critical"
                                ? "#ef4444"
                                : instance.priority === "high"
                                ? "#f59e0b"
                                : instance.priority === "medium"
                                ? "#3b82f6"
                                : "#10b981",
                          }}
                        >
                          {instance.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rwp-instance-info">
                    <span className="rwp-instance-state">
                      State: {instance.currentState}
                    </span>
                    <span className="rwp-instance-owner">
                      {instance.owner.name}
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
                </div>
              );
            })}
          </div>
        </div>

        <div className="rwp-main">
          {viewMode === "graph" && selectedInstance ? (
            <>
              <div className="rwp-graph-info">
                <h2>{selectedInstance.id} - Workflow Visualization</h2>
                <span>
                  Current State:{" "}
                  <strong>{selectedInstance.currentState}</strong>
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
                  <MiniMap
                    style={{ height: 100, width: 120 }}
                    zoomable
                    pannable
                  />
                </ReactFlow>
              </div>
            </>
          ) : viewMode === "list" ? (
            <div className="rwp-list-view">
              <table className="rwp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Current State</th>
                    <th>Owner</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstances.map((instance) => {
                    const statusInfo = getStatusInfo(instance);
                    const progress = calculateProgress(
                      instance,
                      Object.keys(workflowConfig.workflow.states).length
                    );

                    return (
                      <tr
                        key={instance.id}
                        onClick={() => handleInstanceSelect(instance)}
                        className={
                          selectedInstance?.id === instance.id ? "selected" : ""
                        }
                      >
                        <td>{instance.id}</td>
                        <td>
                          <span
                            className="rwp-table-status"
                            style={{ background: statusInfo.color }}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>{instance.currentState}</td>
                        <td>{instance.owner.name.split("@")[0]}</td>
                        <td>
                          {new Date(instance.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(instance.updatedAt).toLocaleDateString()}
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
          ) : (
            <div className="rwp-empty">
              <p>Select a workflow instance to view its visualization</p>
            </div>
          )}
        </div>

        {selectedInstance && viewMode === "graph" && (
          <EnhancedDetailPanel
            instance={selectedInstance}
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            onClose={() => setSelectedInstance(null)}
            onNodeDetailClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default RunningWorkflowsPage;
