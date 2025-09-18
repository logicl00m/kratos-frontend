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
import { RefreshCw, Grid, List, Search } from "lucide-react";
import RunningStateNode from "./RunningStateNode";
import RunningWorkflowDetailPanel from "./RunningWorkflowDetailPanel";
import { runningWorkflowsData } from "../data/runningWorkflows.data";
import {
  parseRunningWorkflowToGraph,
  getStatusInfo,
} from "../utils/runningWorkflowParser";
import { getDefaultWorkflow } from "@features/workflow/utils/graphParser";
import type { WorkflowInstance } from "../types/runningWorkflow.types";
import "./RunningWorkflowsPage.css";

const calculateProgress = (
  instance: WorkflowInstance,
  totalStates: number
): number => {
  const visitedStates = new Set(instance.history.map((h) => h.state));
  return Math.round((visitedStates.size / totalStates) * 100);
};

const nodeTypes = {
  runningStateNode: RunningStateNode,
};

interface RunningWorkflowsPageProps {
  onBack?: () => void;
}

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

  const workflowConfig = getDefaultWorkflow();

  // Calculate initial nodes and edges
  const { nodes: graphNodes, edges: graphEdges } = React.useMemo(() => {
    return selectedInstance
      ? parseRunningWorkflowToGraph(selectedInstance, workflowConfig)
      : { nodes: [], edges: [] };
  }, [selectedInstance, workflowConfig]);

  // State management for draggable nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  // Update nodes/edges when selected instance changes
  React.useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [selectedInstance]); // Only depend on selectedInstance change

  const filteredInstances = runningWorkflowsData.instances.filter(
    (instance) => {
      const matchesSearch =
        instance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.currentState.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || instance.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const handleInstanceSelect = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    if (viewMode === "list") {
      setViewMode("graph");
    }
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
                    <span
                      className="rwp-instance-status"
                      style={{ background: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="rwp-instance-info">
                    <span className="rwp-instance-state">
                      State: {instance.currentState}
                    </span>
                    <span className="rwp-instance-owner">
                      {instance.owner.split("@")[0]}
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
                        <td>{instance.owner.split("@")[0]}</td>
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
          <RunningWorkflowDetailPanel
            instance={selectedInstance}
            onClose={() => setSelectedInstance(null)}
          />
        )}
      </div>
    </div>
  );
};

export default RunningWorkflowsPage;
