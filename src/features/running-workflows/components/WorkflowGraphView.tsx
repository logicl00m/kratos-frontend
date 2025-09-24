// Modular Workflow Graph View Component
import React from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import RunningStateNode from "./RunningStateNode";
import RunningWorkflowEdge from "./RunningWorkflowEdge";
import type { WorkflowDataWrapper } from "../types/runningWorkflow.types";
import { parseRunningWorkflowToGraph } from "../utils/runningWorkflowParser";

const nodeTypes = {
  runningStateNode: RunningStateNode,
};

const edgeTypes = {
  default: RunningWorkflowEdge,
  smoothstep: RunningWorkflowEdge,
};

interface WorkflowGraphViewProps {
  workflow: WorkflowDataWrapper;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  className?: string;
}

export const WorkflowGraphView: React.FC<WorkflowGraphViewProps> = ({
  workflow,
  onNodeClick,
  className = "",
}) => {
  const { nodes: graphNodes, edges: graphEdges } = React.useMemo(() => {
    return workflow ? parseRunningWorkflowToGraph(workflow) : { nodes: [], edges: [] };
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  React.useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

  return (
    <div className={`reactflow-wrapper rwp-graph-container ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
      >
        <Background gap={16} size={1} color="rgba(99, 102, 241, 0.03)" />
        <Controls className="rwp-controls" />
        <MiniMap className="rwp-minimap" zoomable pannable />
      </ReactFlow>
    </div>
  );
};

export default WorkflowGraphView;