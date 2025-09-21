// src/features/workflow/components/WorkflowGraph.tsx
import React, { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
} from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";
import StateNode from "./StateNode";
import DetailPanel from "./DetailPanel";
import { exportGraphToJson } from "@features/workflow/utils/graphExport";

const nodeTypes = {
  stateNode: StateNode,
};

interface WorkflowGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeFormView?: (nodeId: string) => void;
}

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeFormView,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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

  return (
    <div style={{ width: "100%", height: "calc(100vh - 120px)", position: "relative" }}>
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
        connectionMode={ConnectionMode.Loose}
        fitView
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
      </ReactFlow>

      <DetailPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
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
