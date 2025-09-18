// src/features/workflow-config-edit/components/builder/WorkflowBuilder.tsx
import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  Panel,
  MarkerType,
  ReactFlowProvider,
} from "reactflow";
import type { Connection, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Download, Play, AlertCircle } from "lucide-react";
import ProcessNode from "./ProcessNode";
import DecisionNode from "./DecisionNode";
import BuilderDetailsPanel from "./BuilderDetailsPanel";
import ContextMenu from "./ContextMenu";
import {
  validateWorkflow,
  exportToWorkflowJson,
} from "@features/workflow-config-edit/utils/builderUtils";
import { mockPeople } from "@features/workflow-config-edit/data/mockPeople";
import type {
  BuilderNodeData,
  ProcessNodeData,
  DecisionNodeData,
  Person,
} from "@features/workflow-config-edit/types/builder.types";
import "./WorkflowBuilder.css";

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
};

const cloneAssignees = (people: Person[]): Person[] =>
  people.map((person) => ({ ...person }));

const defaultProcessAssignees = cloneAssignees(mockPeople.slice(0, 1));
const defaultDecisionAssignees = cloneAssignees(
  mockPeople.length > 1 ? mockPeople.slice(1, 2) : mockPeople.slice(0, 1)
);

const INITIAL_NODES: Node<BuilderNodeData>[] = [
  {
    id: "process-initial",
    type: "process",
    position: { x: 180, y: 180 },
    data: {
      label: "ARM Draft",
      internalId: "state_arm_draft",
      assignees: cloneAssignees(defaultProcessAssignees),
      actions: {
        left: { label: "Send Back" },
        center: { label: "Submit" },
        right: { label: "Recommend" },
      },
      forms: ["CoreDetails", "ReviewOutputs"],
    } as ProcessNodeData,
  },
  {
    id: "decision-initial",
    type: "decision",
    position: { x: 520, y: 200 },
    data: {
      label: "Credit Review",
      internalId: "state_credit_review",
      assignees: cloneAssignees(defaultDecisionAssignees),
      transitions: [
        { id: "approve", label: "Approve", operation: "approve" },
        { id: "reject", label: "Reject", operation: "reject" },
      ],
      forms: ["CreditReview"],
    } as DecisionNodeData,
  },
];

const INITIAL_EDGES: Edge<{ operation?: string }>[] = [
  {
    id: "edge-process-decision",
    source: "process-initial",
    target: "decision-initial",
    sourceHandle: "right",
    label: "Recommend",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    data: { operation: "recommend" },
  },
];

const cloneData = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

interface WorkflowBuilderProps {
  onExport?: (json: unknown) => void;
  onBack?: () => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onExport, onBack }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<BuilderNodeData>(
    INITIAL_NODES
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<{ operation?: string }>(
    INITIAL_EDGES
  );
  const [selectedNode, setSelectedNode] = useState<
    Node<BuilderNodeData> | null
  >(null);
  const [selectedEdge, setSelectedEdge] = useState<
    Edge<{ operation?: string }> | null
  >(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
    edgeId?: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: Edge<{ operation?: string }> = {
        id: `${params.source}-${params.sourceHandle ?? "action"}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        label: params.sourceHandle ?? "Action",
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        data: {},
      };

      setEdges((current) => addEdge(newEdge, current));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<BuilderNodeData>) => {
      setSelectedNode(node);
      setSelectedEdge(null);
    },
    []
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge<{ operation?: string }>) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setContextMenu(null);
  }, []);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node<BuilderNodeData>) => {
      event.preventDefault();
      const rect = reactFlowWrapper.current?.getBoundingClientRect();
      if (!rect) return;

      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        nodeId: node.id,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge<{ operation?: string }>) => {
      event.preventDefault();
      const rect = reactFlowWrapper.current?.getBoundingClientRect();
      if (!rect) return;

      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        edgeId: edge.id,
      });
    },
    []
  );

  const addProcessNode = () => {
    const newNode: Node<BuilderNodeData> = {
      id: `process-${Date.now()}`,
      type: "process",
      position: { x: 200 + nodes.length * 40, y: 260 + nodes.length * 20 },
      data: {
        label: `Process ${nodes.length + 1}`,
        assignees: cloneAssignees(defaultProcessAssignees),
        actions: {
          left: { label: "Send Back" },
          center: { label: "Submit" },
          right: { label: "Approve" },
        },
      } as ProcessNodeData,
    };

    setNodes((current) => [...current, newNode]);
  };

  const addDecisionNode = () => {
    const newNode: Node<BuilderNodeData> = {
      id: `decision-${Date.now()}`,
      type: "decision",
      position: { x: 420 + nodes.length * 40, y: 300 + nodes.length * 20 },
      data: {
        label: `Decision ${nodes.length + 1}`,
        assignees: cloneAssignees(defaultDecisionAssignees),
        transitions: [
          { id: `transition-${Date.now()}-1`, label: "Condition 1" },
        ],
      } as DecisionNodeData,
    };

    setNodes((current) => [...current, newNode]);
  };

  const handleNodeUpdate = (nodeId: string, data: BuilderNodeData) => {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, data } : node))
    );
  };

  const handleEdgeUpdate = (
    edgeId: string,
    data: { label: string; operation?: string }
  ) => {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === edgeId
          ? { ...edge, label: data.label, data: { operation: data.operation } }
          : edge
      )
    );
  };

  const duplicateNode = (nodeId: string) => {
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const duplicatedNode: Node<BuilderNodeData> = {
      ...nodeToDuplicate,
      id: `${nodeToDuplicate.type}-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 60,
        y: nodeToDuplicate.position.y + 60,
      },
      data: cloneData(nodeToDuplicate.data),
    };

    setNodes((current) => [...current, duplicatedNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setEdges((current) =>
      current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    setSelectedNode(null);
  };

  const deleteEdge = (edgeId: string) => {
    setEdges((current) => current.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
  };

  const handleRename = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newLabel = window.prompt("Enter a new state name", node.data.label ?? "");
    if (!newLabel) return;

    handleNodeUpdate(nodeId, { ...node.data, label: newLabel });
  };

  const handleValidate = () => {
    const errors = validateWorkflow(nodes, edges);
    setValidationErrors(errors);
    setShowValidation(true);
  };

  const handleExport = () => {
    const validation = validateWorkflow(nodes, edges);
    setValidationErrors(validation);

    if (validation.length > 0) {
      setShowValidation(true);
      return;
    }

    const workflowJson = exportToWorkflowJson(nodes, edges);
    onExport?.(workflowJson);

    const blob = new Blob([JSON.stringify(workflowJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `workflow-export-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleAssignPeople = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleContextDuplicate = () => {
    if (contextMenu?.nodeId) duplicateNode(contextMenu.nodeId);
    closeContextMenu();
  };

  const handleContextDelete = () => {
    if (contextMenu?.nodeId) {
      deleteNode(contextMenu.nodeId);
    } else if (contextMenu?.edgeId) {
      deleteEdge(contextMenu.edgeId);
    }
    closeContextMenu();
  };

  const handleContextRename = () => {
    if (contextMenu?.nodeId) handleRename(contextMenu.nodeId);
    closeContextMenu();
  };

  const handleContextAssign = () => {
    if (contextMenu?.nodeId) handleAssignPeople(contextMenu.nodeId);
    closeContextMenu();
  };

  return (
    <div className="workflow-builder">
      <div className="builder-header">
        <div className="builder-title">Workflow Builder</div>
        <div className="builder-actions">
          {onBack && (
            <button onClick={onBack} className="builder-btn">
              Back to Dashboard
            </button>
          )}
          <button onClick={handleValidate} className="builder-btn">
            <Play size={16} /> Validate
          </button>
          <button onClick={handleExport} className="builder-btn primary">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div ref={reactFlowWrapper} className="builder-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={12} size={1} />
          <Controls />
          <MiniMap style={{ height: 100, width: 140 }} zoomable pannable />

          <Panel position="top-left">
            <div className="node-palette">
              <button onClick={addProcessNode} className="node-btn">
                <div className="node-icon process">
                  <Plus size={14} />
                </div>
                <span>Process</span>
              </button>
              <button onClick={addDecisionNode} className="node-btn">
                <div className="node-icon decision">
                  <Plus size={14} />
                </div>
                <span>Decision</span>
              </button>
            </div>
          </Panel>
        </ReactFlow>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onDuplicate={contextMenu.nodeId ? handleContextDuplicate : undefined}
            onDelete={handleContextDelete}
            onRename={contextMenu.nodeId ? handleContextRename : undefined}
            onAssignPeople={contextMenu.nodeId ? handleContextAssign : undefined}
            isNode={!!contextMenu.nodeId}
          />
        )}

        <BuilderDetailsPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
          onNodeUpdate={handleNodeUpdate}
          onEdgeUpdate={handleEdgeUpdate}
          availablePeople={mockPeople}
        />

        {showValidation && (
          <div className="validation-panel" role="status">
            <div className="validation-header">
              <AlertCircle size={16} />
              Validation {validationErrors.length > 0 ? "Failed" : "Passed"}
              <button onClick={() => setShowValidation(false)}>Close</button>
            </div>
            {validationErrors.length > 0 ? (
              <ul className="validation-errors">
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <div className="validation-success">
                Workflow is valid and ready for export.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkflowBuilderWithProvider: React.FC<WorkflowBuilderProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowBuilder {...props} />
  </ReactFlowProvider>
);

export default WorkflowBuilderWithProvider;
