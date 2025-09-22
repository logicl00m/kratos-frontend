// src/features/workflow-templates/components/WorkflowAssignment.tsx

import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Users, Plus, X, Check, AlertCircle } from "lucide-react";
import { mockPeople } from "@features/workflow-config-edit/data/mockPeople";
import type { WorkflowTemplate, AssignmentData } from "../types/template.types";
import type { Person } from "@features/workflow-config-edit/types/builder.types";
import "./WorkflowAssignment.css";

// Custom Process Node Component
const ProcessNode: React.FC<NodeProps> = ({ data, selected }) => {
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div
      className={`workflow-node process-node ${selected ? "selected" : ""}`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(30, 41, 59, 0.85))"
          : "linear-gradient(135deg, #ffffff, #f8fafc)",
        border: `2px solid ${
          selected ? "#6366f1" : isDark ? "#475569" : "#cbd5e1"
        }`,
        borderRadius: "12px",
        padding: "16px 20px",
        minWidth: "200px",
        boxShadow: selected
          ? "0 8px 24px rgba(99, 102, 241, 0.3)"
          : isDark
          ? "0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isDark ? "#6366f1" : "#3b82f6",
          width: "10px",
          height: "10px",
          border: "2px solid " + (isDark ? "#1e293b" : "white"),
        }}
      />

      <div
        style={{
          fontWeight: 600,
          fontSize: "14px",
          color: isDark ? "#f1f5f9" : "#1e293b",
          marginBottom: "8px",
        }}
      >
        {data.label}
      </div>

      {data.assignees && data.assignees.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "8px",
            padding: "6px 10px",
            background: isDark
              ? "rgba(99, 102, 241, 0.2)"
              : "rgba(99, 102, 241, 0.1)",
            borderRadius: "8px",
          }}
        >
          <Users size={14} color={isDark ? "#a5b4fc" : "#6366f1"} />
          <span
            style={{
              fontSize: "12px",
              color: isDark ? "#a5b4fc" : "#6366f1",
              fontWeight: 500,
            }}
          >
            {data.assignees.length} assigned
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: isDark ? "#6366f1" : "#3b82f6",
          width: "10px",
          height: "10px",
          border: "2px solid " + (isDark ? "#1e293b" : "white"),
        }}
      />
    </div>
  );
};

// Custom Decision Node Component
const DecisionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div
      className={`workflow-node decision-node ${selected ? "selected" : ""}`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.1))"
          : "linear-gradient(135deg, #fef3c7, #fef9c3)",
        border: `2px solid ${
          selected ? "#f59e0b" : isDark ? "#6366f1" : "#f59e0b"
        }`,
        borderRadius: "12px",
        padding: "16px 20px",
        minWidth: "200px",
        boxShadow: selected
          ? "0 8px 24px rgba(245, 158, 11, 0.3)"
          : isDark
          ? "0 4px 12px rgba(99, 102, 241, 0.3)"
          : "0 4px 12px rgba(245, 158, 11, 0.2)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isDark ? "#f59e0b" : "#f59e0b",
          width: "10px",
          height: "10px",
          border: "2px solid " + (isDark ? "#1e293b" : "white"),
        }}
      />

      <div
        style={{
          fontWeight: 600,
          fontSize: "14px",
          color: isDark ? "#f1f5f9" : "#1e293b",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            transform: "rotate(45deg)",
            background: isDark ? "#6366f1" : "#f59e0b",
          }}
        ></div>
        <span style={{ transform: "translateX(-4px)" }}>{data.label}</span>
      </div>

      {data.assignees && data.assignees.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "8px",
            padding: "6px 10px",
            background: isDark
              ? "rgba(99, 102, 241, 0.2)"
              : "rgba(245, 158, 11, 0.1)",
            borderRadius: "8px",
          }}
        >
          <Users size={14} color={isDark ? "#a5b4fc" : "#f59e0b"} />
          <span
            style={{
              fontSize: "12px",
              color: isDark ? "#a5b4fc" : "#f59e0b",
              fontWeight: 500,
            }}
          >
            {data.assignees.length} assigned
          </span>
        </div>
      )}

      {data.transitions &&
        data.transitions.map((transition: any, index: number) => (
          <Handle
            key={transition.id}
            type="source"
            position={Position.Bottom}
            id={transition.id}
            style={{
              left: `${30 + index * 40}%`,
              background: isDark ? "#f59e0b" : "#f59e0b",
              width: "10px",
              height: "10px",
              border: "2px solid " + (isDark ? "#1e293b" : "white"),
            }}
          />
        ))}
    </div>
  );
};

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
};

interface WorkflowAssignmentProps {
  template: WorkflowTemplate;
  onComplete: (assignments: AssignmentData) => void;
  onBack: () => void;
}

const WorkflowAssignment: React.FC<WorkflowAssignmentProps> = ({
  template,
  onComplete,
  onBack,
}) => {
  const [assignments, setAssignments] = useState<AssignmentData>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const isDark = document.documentElement.classList.contains("dark");

  // Generate nodes and edges from template using proper graph layout
  const generateNodesAndEdges = useCallback(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const stateKeys = Object.keys(template.workflow.states);

    // Layout configuration
    const cols = 3;
    const rowHeight = 180;
    const colWidth = 280;
    const startX = 100;
    const startY = 100;

    // Create nodes
    stateKeys.forEach((stateId, index) => {
      const state = template.workflow.states[stateId];
      const row = Math.floor(index / cols);
      const col = index % cols;
      const assignees = assignments[stateId] || [];

      const nodeData: any = {
        label: state.name,
        assignees,
        actions: state.actions || {},
        transitions: state.transitions || [],
      };

      nodes.push({
        id: stateId,
        type: state.type,
        position: {
          x: startX + col * colWidth + (row % 2 === 1 ? colWidth / 2 : 0), // Stagger rows
          y: startY + row * rowHeight,
        },
        data: nodeData,
      });
    });

    // Create edges based on actions and transitions
    stateKeys.forEach((stateId) => {
      const state = template.workflow.states[stateId];

      if (state.type === "process" && state.actions) {
        Object.entries(state.actions).forEach(
          ([actionKey, action]: [string, any]) => {
            if (
              action.nextState &&
              template.workflow.states[action.nextState]
            ) {
              edges.push({
                id: `${stateId}-${actionKey}-${action.nextState}`,
                source: stateId,
                target: action.nextState,
                sourceHandle: action.handle || actionKey,
                label: action.label,
                type: "smoothstep",
                animated: true,
                style: {
                  stroke: isDark ? "#6366f1" : "#3b82f6",
                  strokeWidth: 2,
                },
                labelStyle: {
                  fill: isDark ? "#f1f5f9" : "#1e293b",
                  fontWeight: 500,
                  fontSize: 11,
                },
                labelBgStyle: {
                  fill: isDark ? "#1e293b" : "#ffffff",
                  fillOpacity: 0.9,
                },
              });
            }
          }
        );
      } else if (state.type === "decision" && state.transitions) {
        state.transitions.forEach((transition: any) => {
          if (
            transition.nextState &&
            template.workflow.states[transition.nextState]
          ) {
            edges.push({
              id: `${stateId}-${transition.id}-${transition.nextState}`,
              source: stateId,
              target: transition.nextState,
              sourceHandle: transition.id,
              label: transition.label,
              type: "smoothstep",
              animated: true,
              style: {
                stroke: isDark ? "#f59e0b" : "#f59e0b",
                strokeWidth: 2,
              },
              labelStyle: {
                fill: isDark ? "#f1f5f9" : "#1e293b",
                fontWeight: 500,
                fontSize: 11,
              },
              labelBgStyle: {
                fill: isDark ? "#1e293b" : "#ffffff",
                fillOpacity: 0.9,
              },
            });
          }
        });
      }
    });

    return { nodes, edges };
  }, [template, assignments, isDark]);

  const { nodes: initialNodes, edges: initialEdges } = generateNodesAndEdges();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when assignments change
  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } =
      generateNodesAndEdges();
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [assignments, generateNodesAndEdges, setNodes, setEdges]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setShowAssignmentPanel(true);
  };

  const handleAddAssignee = (person: Person) => {
    if (!selectedNodeId) return;

    const currentAssignees = assignments[selectedNodeId] || [];
    if (!currentAssignees.find((a) => a.id === person.id)) {
      setAssignments({
        ...assignments,
        [selectedNodeId]: [...currentAssignees, person],
      });
    }
  };

  const handleRemoveAssignee = (stateId: string, personId: string) => {
    setAssignments({
      ...assignments,
      [stateId]: (assignments[stateId] || []).filter((a) => a.id !== personId),
    });
  };

  const validateAssignments = (): string[] => {
    const errors: string[] = [];
    const stateKeys = Object.keys(template.workflow.states);

    stateKeys.forEach((stateId) => {
      const state = template.workflow.states[stateId];
      const assignees = assignments[stateId] || [];

      // Skip terminal states (no actions/transitions)
      const isTerminal =
        state.type === "process"
          ? !state.actions || Object.keys(state.actions).length === 0
          : !state.transitions || state.transitions.length === 0;

      if (!isTerminal && assignees.length === 0) {
        errors.push(`"${state.name}" requires at least one assignee`);
      }
    });

    return errors;
  };

  const handleComplete = () => {
    const errors = validateAssignments();
    setValidationErrors(errors);

    if (errors.length === 0) {
      onComplete(assignments);
    }
  };

  const filteredPeople = mockPeople.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedState = selectedNodeId
    ? template.workflow.states[selectedNodeId]
    : null;

  return (
    <div className="workflow-assignment">
      <div
        className="assignment-header"
        style={{
          background: isDark ? "#1e293b" : "white",
          borderBottom: `1px solid ${
            isDark ? "#334155" : "rgba(208, 215, 230, 0.8)"
          }`,
        }}
      >
        <div className="assignment-title">
          <h2 style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>
            Assign People to Workflow
          </h2>
          <p style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            {template.name}
          </p>
        </div>
        <div className="assignment-actions">
          <button
            onClick={onBack}
            className="assignment-btn secondary"
            style={{
              background: isDark ? "#334155" : "white",
              borderColor: isDark ? "#475569" : "rgba(208, 215, 230, 0.8)",
              color: isDark ? "#e2e8f0" : "#475569",
            }}
          >
            Back
          </button>
          <button onClick={handleComplete} className="assignment-btn primary">
            <Check size={16} />
            Complete Setup
          </button>
        </div>
      </div>

      <div
        className="assignment-canvas"
        style={{
          background: isDark ? "#0f172a" : "white",
        }}
      >
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
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background
            gap={12}
            size={1}
            color={isDark ? "#1e293b" : "#e2e8f0"}
          />
          <Controls
            style={{
              background: isDark ? "#1e293b" : "white",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            }}
          />
          <MiniMap
            style={{
              height: 100,
              width: 140,
              background: isDark ? "#1e293b" : "white",
              border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            }}
            nodeColor={() => (isDark ? "#334155" : "#e2e8f0")}
            zoomable
            pannable
          />
        </ReactFlow>

        {showAssignmentPanel && selectedState && (
          <div
            className="assignment-panel"
            style={{
              background: isDark ? "#1e293b" : "white",
              border: `1px solid ${
                isDark ? "#334155" : "rgba(208, 215, 230, 0.8)"
              }`,
              boxShadow: isDark
                ? "0 12px 32px rgba(0, 0, 0, 0.4)"
                : "0 12px 32px rgba(15, 23, 42, 0.12)",
            }}
          >
            <div
              className="panel-header"
              style={{
                borderBottom: `1px solid ${
                  isDark ? "#334155" : "rgba(208, 215, 230, 0.6)"
                }`,
              }}
            >
              <h3 style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>
                {selectedState.name}
              </h3>
              <button
                onClick={() => setShowAssignmentPanel(false)}
                className="panel-close"
                style={{
                  background: isDark
                    ? "rgba(71, 85, 105, 0.6)"
                    : "rgba(226, 232, 240, 0.6)",
                  color: isDark ? "#94a3b8" : "#475569",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="panel-body">
              <div className="assignee-section">
                <div className="section-header">
                  <span
                    className="section-title"
                    style={{
                      color: isDark ? "#94a3b8" : "#64748b",
                    }}
                  >
                    <Users size={16} /> Assigned People
                  </span>
                </div>

                <div
                  className="current-assignees"
                  style={{
                    background: isDark
                      ? "rgba(30, 41, 59, 0.5)"
                      : "rgba(248, 250, 252, 0.8)",
                    border: `1px solid ${
                      isDark ? "#334155" : "rgba(226, 232, 240, 0.8)"
                    }`,
                  }}
                >
                  {(assignments[selectedNodeId!] || []).length > 0 ? (
                    assignments[selectedNodeId!].map((person) => (
                      <div
                        key={person.id}
                        className="assignee-chip"
                        style={{
                          background: isDark ? "#334155" : "white",
                          border: `1px solid ${
                            isDark ? "#475569" : "rgba(191, 219, 254, 0.8)"
                          }`,
                          color: isDark ? "#93c5fd" : "#1e40af",
                        }}
                      >
                        <span>{person.name}</span>
                        <span
                          className="chip-type"
                          style={{
                            background: isDark
                              ? "rgba(99, 102, 241, 0.2)"
                              : "rgba(99, 102, 241, 0.1)",
                            color: isDark ? "#a5b4fc" : "#4c1d95",
                          }}
                        >
                          {person.type}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveAssignee(selectedNodeId!, person.id)
                          }
                          className="chip-remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className="no-assignees"
                      style={{
                        color: isDark ? "#64748b" : "#94a3b8",
                      }}
                    >
                      No one assigned yet
                    </div>
                  )}
                </div>

                <div className="add-assignee">
                  <input
                    type="text"
                    placeholder="Search people or roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{
                      background: isDark ? "#0f172a" : "white",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                      border: `1px solid ${
                        isDark ? "#334155" : "rgba(208, 215, 230, 0.8)"
                      }`,
                    }}
                    autoFocus
                  />

                  <div className="people-list">
                    {filteredPeople.map((person) => {
                      const isAssigned = assignments[selectedNodeId!]?.find(
                        (a) => a.id === person.id
                      );

                      return (
                        <div
                          key={person.id}
                          className={`person-item ${
                            isAssigned ? "assigned" : ""
                          }`}
                          onClick={() =>
                            !isAssigned && handleAddAssignee(person)
                          }
                          style={{
                            border: `1px solid ${
                              isAssigned
                                ? isDark
                                  ? "#065f46"
                                  : "rgba(134, 239, 172, 0.6)"
                                : isDark
                                ? "#334155"
                                : "rgba(226, 232, 240, 0.8)"
                            }`,
                            background: isAssigned
                              ? isDark
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(240, 253, 244, 0.5)"
                              : isDark
                              ? "#1e293b"
                              : "white",
                          }}
                        >
                          <div className="person-info">
                            <span
                              className="person-name"
                              style={{
                                color: isDark ? "#f1f5f9" : "#1f2937",
                              }}
                            >
                              {person.name}
                            </span>
                            <span
                              className="person-type"
                              style={{
                                background: isDark
                                  ? "rgba(99, 102, 241, 0.2)"
                                  : "rgba(99, 102, 241, 0.1)",
                                color: isDark ? "#a5b4fc" : "#4c1d95",
                              }}
                            >
                              {person.type}
                            </span>
                          </div>
                          {isAssigned ? (
                            <Check size={16} className="assigned-icon" />
                          ) : (
                            <Plus size={16} className="add-icon" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div
            className="validation-popup"
            style={{
              background: isDark ? "#1e293b" : "white",
              border: `1px solid ${
                isDark ? "#991b1b" : "rgba(254, 202, 202, 0.8)"
              }`,
              boxShadow: isDark
                ? "0 12px 32px rgba(220, 38, 38, 0.3)"
                : "0 12px 32px rgba(239, 68, 68, 0.15)",
            }}
          >
            <div
              className="validation-header"
              style={{
                background: isDark
                  ? "rgba(220, 38, 38, 0.2)"
                  : "rgba(254, 226, 226, 0.5)",
                borderBottom: `1px solid ${
                  isDark ? "#991b1b" : "rgba(254, 202, 202, 0.5)"
                }`,
                color: isDark ? "#fca5a5" : "#991b1b",
              }}
            >
              <AlertCircle size={16} />
              Missing Assignments
            </div>
            <ul className="validation-errors">
              {validationErrors.map((error, idx) => (
                <li
                  key={idx}
                  style={{
                    color: isDark ? "#fca5a5" : "#b91c1c",
                  }}
                >
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkflowAssignmentWithProvider: React.FC<WorkflowAssignmentProps> = (
  props
) => (
  <ReactFlowProvider>
    <WorkflowAssignment {...props} />
  </ReactFlowProvider>
);

export default WorkflowAssignmentWithProvider;
