/*
PROMPT (Copilot/GPT-5): Validation incl. Forms coverage

- Extend Validate to include Forms coverage:
  - Compute withForms / totalProcessNodes.
  - If any process node lacks data.form, push error: "{stateName} has no form attached".
  - If any node uses binding=latest, push warning: "{stateName} tracks latest; builds may be non-deterministic" with a “Pin all” quick fix.
- In the Validate modal/panel, show:
  - Coverage bar and list of items with “Go to state” links.
- Export should block when errors exist, allow with warnings.

Notes: “Binding type” and “formRef” patterns mirror Camunda form linking; keep parity so backend can evolve to an engine later.
Docs: https://docs.camunda.io/docs/components/modeler/web-modeler/advanced-modeling/form-linking/
*/

import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Plus, Download, Play, AlertCircle, FileText } from "lucide-react";
import ProcessNode from "./ProcessNode";
import DecisionNode from "./DecisionNode";
import BuilderDetailsPanel from "./BuilderDetailsPanel";
import ContextMenu from "./ContextMenu";
import { FormPickerDialog } from "./FormPickerDialog";
import {
  validateWorkflowWithForms,
  exportToWorkflowJson,
} from "@features/workflow-config-edit/utils/builderUtils";
import { mockPeople } from "@features/workflow-config-edit/data/mockPeople";
import type {
  BuilderNodeData,
  ProcessNodeData,
  DecisionNodeData,
  Person,
  FormRef,
} from "@features/workflow-config-edit/types/builder.types";
import "./WorkflowBuilder.css";

// Create context for global form
const GlobalFormContext = createContext<FormRef | null>(null);

const nodeTypes = {
  process: (props: any) => {
    const globalForm = useContext(GlobalFormContext);
    return <ProcessNode {...props} globalForm={globalForm} />;
  },
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

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  onExport,
  onBack,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node<BuilderNodeData>[]>(INITIAL_NODES);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<BuilderNodeData>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<{
    operation?: string;
  }>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] =
    useState<Node<BuilderNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<{
    operation?: string;
  }> | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
    edgeId?: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [formsCoverage, setFormsCoverage] = useState<{
    withForms: number;
    totalProcessNodes: number;
  }>({ withForms: 0, totalProcessNodes: 0 });
  const [showValidation, setShowValidation] = useState(false);
  const [formPickerOpen, setFormPickerOpen] = useState(false);
  const [formPickerNodeId, setFormPickerNodeId] = useState<string | null>(null);
  const [globalForm, setGlobalForm] = useState<FormRef | null>(null);
  const [globalFormPickerOpen, setGlobalFormPickerOpen] = useState(false);

  // keep ref in sync for event handlers
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const attachFormToNode = useCallback(
    (
      currentNodes: Node<BuilderNodeData>[],
      nodeId: string,
      form: { id?: string; name: string; version?: number }
    ) => {
      return currentNodes.map((n) => {
        if (n.id !== nodeId || n.type !== "process") return n;
        const data = n.data as ProcessNodeData;
        return {
          ...n,
          data: {
            ...data,
            form: {
              id: form.id ?? "",
              name: form.name,
              version: form.version ?? 1,
              binding: "pinned",
            },
          },
        } as Node<BuilderNodeData>;
      });
    },
    []
  );

  // Router state: attach form on return from FormBuilderPage
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const state = location.state as
      | {
          attachForm?: { id?: string; name: string; version?: number };
          nodeId?: string;
        }
      | null
      | undefined;
    if (state?.attachForm && state?.nodeId) {
      const next = attachFormToNode(
        nodesRef.current,
        state.nodeId,
        state.attachForm
      );
      setNodes(next);
      // Clear the state to avoid re-attaching on refresh
      navigate("/builder", { replace: true, state: null });
    }
  }, [location.state, navigate, attachFormToNode, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: Edge<{ operation?: string }> = {
        id: `${params.source}-${params.sourceHandle ?? "action"}-${
          params.target
        }`,
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
        onOpenFormConfig: (nodeId: string) => {
          const node = nodes.find((n) => n.id === nodeId) ?? null;
          setSelectedNode(node);
          setSelectedEdge(null);
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
    data: { label?: string; operation?: string }
  ) => {
    setEdges((current) =>
      current.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              label: data.label ?? edge.label,
              data: { operation: data.operation },
            }
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

    const newLabel = window.prompt(
      "Enter a new state name",
      node.data.label ?? ""
    );
    if (!newLabel) return;

    handleNodeUpdate(nodeId, { ...node.data, label: newLabel });
  };

  const handleValidate = () => {
    const { errors, warnings, coverage } = validateWorkflowWithForms(
      nodes,
      edges,
      globalForm || undefined
    );
    setValidationErrors(errors);
    setValidationWarnings(warnings);
    setFormsCoverage(coverage);
    setShowValidation(true);
  };

  const handleExport = () => {
    const { errors, warnings, coverage } = validateWorkflowWithForms(
      nodes,
      edges,
      globalForm || undefined
    );
    setValidationErrors(errors);
    setValidationWarnings(warnings);
    setFormsCoverage(coverage);

    if (errors.length > 0) {
      setShowValidation(true);
      return;
    }

    const workflowJson = exportToWorkflowJson(nodes, edges, globalForm || undefined);
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
          {/* Global Form Selector */}
          <div className="global-form-selector">
            <button 
              className="global-form-btn"
              onClick={() => setGlobalFormPickerOpen(true)}
            >
              <FileText size={16} />
              {globalForm ? `${globalForm.name}@v${globalForm.version}` : "Attach Global Form"}
            </button>
            {globalForm && (
              <button 
                className="clear-global-form"
                onClick={() => setGlobalForm(null)}
                title="Remove global form"
              >
                ×
              </button>
            )}
          </div>
          
          
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
          <GlobalFormContext.Provider value={globalForm}>
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
          </GlobalFormContext.Provider>
        </ReactFlow>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onDuplicate={
              contextMenu.nodeId ? handleContextDuplicate : undefined
            }
            onDelete={handleContextDelete}
            onRename={contextMenu.nodeId ? handleContextRename : undefined}
            onAssignPeople={
              contextMenu.nodeId ? handleContextAssign : undefined
            }
            onOpenFormConfig={(nodeId) => {
              const node = nodes.find((n) => n.id === nodeId) ?? null;
              setSelectedNode(node);
              setSelectedEdge(null);
            }}
            onOpenFormPicker={(nodeId) => {
              setFormPickerNodeId(nodeId);
              setFormPickerOpen(true);
            }}
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

        <FormPickerDialog
          open={formPickerOpen}
          onClose={() => setFormPickerOpen(false)}
          onSelect={(form) => {
            if (!formPickerNodeId) return;
            setNodes((curr) =>
              curr.map((n) => {
                if (n.id !== formPickerNodeId || n.type !== "process") return n;
                const data = n.data as ProcessNodeData;
                return {
                  ...n,
                  data: {
                    ...data,
                    form: {
                      id: form.id,
                      name: form.name,
                      version: form.version,
                      binding: "pinned",
                    },
                  },
                } as Node<BuilderNodeData>;
              })
            );
            setFormPickerOpen(false);
            setFormPickerNodeId(null);
          }}
        />

        <FormPickerDialog
          open={globalFormPickerOpen}
          onClose={() => setGlobalFormPickerOpen(false)}
          onSelect={(form) => {
            setGlobalForm({
              id: form.id,
              name: form.name,
              version: form.version,
              binding: "pinned",
            });
            setGlobalFormPickerOpen(false);
          }}
        />

        {showValidation && (
          <div className="validation-panel">
            <div className="validation-header">
              <AlertCircle size={16} />
              Validation {validationErrors.length > 0 ? "Failed" : "Passed"}
              <button onClick={() => setShowValidation(false)}>Close</button>
            </div>
            <div className="validation-body">
              <div className="coverage-row" aria-live="polite">
                Forms coverage: {formsCoverage.withForms}/
                {formsCoverage.totalProcessNodes}
                {globalForm && (
                  <span className="global-form-indicator">
                    {" "}• Global form: {globalForm.name}@v{globalForm.version}
                  </span>
                )}
              </div>
              {validationErrors.length > 0 && (
                <ul className="validation-errors">
                  {validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
              {validationWarnings.length > 0 && (
                <ul className="validation-warnings">
                  {validationWarnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
              {validationErrors.length === 0 &&
                validationWarnings.length === 0 && (
                  <div className="validation-success">
                    Workflow is valid and ready for export.
                  </div>
                )}
            </div>
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
