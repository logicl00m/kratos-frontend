// src/features/workflow/components/WorkflowGraph.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  ConnectionMode,
  type Node,
  type Edge,
  addEdge,
} from "reactflow";
import type { Connection } from "reactflow";
import "reactflow/dist/style.css";
import StateNode from "./StateNode";
import EditableEdge from "./EditableEdge";
import GraphToolbar from "./GraphToolbar";
import DetailPanel from "./DetailPanel";
import type { WorkflowConfig } from "../types/workflow.types";
import { getLayoutedElements } from "../utils/autoLayout";
import { exportGraphToJson } from "../utils/graphExport";
import "./WorkflowGraph.css";

const nodeTypes = {
  stateNode: StateNode,
};

const edgeTypes = {
  editable: EditableEdge,
};

interface WorkflowGraphProps {
  nodes: Node[];
  edges: Edge[];
  workflow: WorkflowConfig;
  onNodeFormView?: (nodeId: string) => void;
}

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  workflow,
  onNodeFormView,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  React.useEffect(() => {
    // Ensure all edges use the editable type
    const updatedEdges = initialEdges.map(edge => ({
      ...edge,
      type: 'editable',
      data: {
        ...edge.data,
        points: edge.data?.points || [],
      }
    }));
    setNodes(initialNodes);
    setEdges(updatedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => 
      addEdge({
        ...params,
        type: 'editable',
        data: { points: [] }
      }, eds)
    ),
    [setEdges]
  );

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_e: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const exportData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: typeof e.label === "string" ? e.label : undefined,
        data: e.data,
      })),
    }),
    [nodes, edges]
  );

  const exportGraph = () => exportGraphToJson(exportData);

  const onLayout = useCallback(
    (direction?: "TB" | "LR") => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      <GraphToolbar onExport={exportGraph} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        elevateEdgesOnSelect={true}
        defaultEdgeOptions={{
          type: "editable",
          updatable: true,
          focusable: true,
          data: { points: [] },
          style: {
            strokeWidth: 2,
            cursor: "pointer",
          },
          labelStyle: {
            fill: "#1f2937",
            fontWeight: 600,
            fontSize: 14,
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 1,
          },
        }}
        edgesUpdatable={true}
        edgesFocusable={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap
          style={{
            height: 100,
            width: 120,
          }}
          zoomable
          pannable
        />

        <Panel position="top-right">
          <div
            style={{
              display: "flex",
              gap: "8px",
              background: "white",
              padding: "8px",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => onLayout("TB")}
              style={{
                padding: "6px 12px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
              }}
              title="Auto Layout - Top to Bottom"
            >
              Auto Layout ↓
            </button>
            <button
              onClick={() => onLayout("LR")}
              style={{
                padding: "6px 12px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
              }}
              title="Auto Layout - Left to Right"
            >
              Auto Layout →
            </button>
            <button
              onClick={exportGraph}
              style={{
                padding: "6px 12px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
              }}
              title="Export Graph"
            >
              Export
            </button>
          </div>
        </Panel>
      </ReactFlow>

      <DetailPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        workflow={workflow}
        onClose={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        onViewForm={onNodeFormView}
      />
    </div>
  );
};

export default WorkflowGraph;
