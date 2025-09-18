// src/features/workflow/components/builder/BuilderDetailsPanel.tsx
import React, { useState } from "react";
import { X, Users, Plus, Trash2, Eye, Edit3 } from "lucide-react";
import type { Node, Edge } from "reactflow";
import type {
  ProcessNodeData,
  DecisionNodeData,
  Person,
} from "@features/workflow-config-edit/types/builder.types";
import "./BuilderDetailsPanel.css";

interface BuilderDetailsPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onClose: () => void;
  onNodeUpdate: (nodeId: string, data: any) => void;
  onEdgeUpdate: (edgeId: string, data: any) => void;
  onViewForm?: (nodeId: string) => void;
  availablePeople: Person[];
}

const BuilderDetailsPanel: React.FC<BuilderDetailsPanelProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  onNodeUpdate,
  onEdgeUpdate,
  onViewForm,
  availablePeople,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  if (!selectedNode && !selectedEdge) return null;

  const nodeData = selectedNode?.data;
  const isProcessNode = selectedNode?.type === "process";
  const isDecisionNode = selectedNode?.type === "decision";

  const handleRename = () => {
    const newName = prompt("Enter new state name:", nodeData?.label);
    if (newName && selectedNode && nodeData) {
      onNodeUpdate(selectedNode.id, { ...nodeData, label: newName });
    }
  };

  const handleAddAssignee = (person: Person) => {
    if (selectedNode && nodeData) {
      const currentAssignees = nodeData.assignees || [];
      if (!currentAssignees.find((a) => a.id === person.id)) {
        onNodeUpdate(selectedNode.id, {
          ...nodeData,
          assignees: [...currentAssignees, person],
        });
      }
    }
    setShowAssigneeDropdown(false);
    setSearchTerm("");
  };

  const handleRemoveAssignee = (personId: string) => {
    if (selectedNode && nodeData) {
      onNodeUpdate(selectedNode.id, {
        ...nodeData,
        assignees: nodeData.assignees.filter((a) => a.id !== personId),
      });
    }
  };

  const handleActionUpdate = (
    side: "left" | "center" | "right",
    field: "label" | "operation",
    value: string
  ) => {
    if (selectedNode && isProcessNode) {
      const data = nodeData as ProcessNodeData;
      onNodeUpdate(selectedNode.id, {
        ...data,
        actions: {
          ...data.actions,
          [side]: { ...data.actions[side], [field]: value },
        },
      });
    }
  };

  const handleAddTransition = () => {
    if (selectedNode && isDecisionNode) {
      const data = nodeData as DecisionNodeData;
      const newTransition = {
        id: `transition-${Date.now()}`,
        label: `Condition ${data.transitions.length + 1}`,
        operation: "",
      };
      onNodeUpdate(selectedNode.id, {
        ...data,
        transitions: [...data.transitions, newTransition],
      });
    }
  };

  const handleTransitionUpdate = (
    transitionId: string,
    field: "label" | "operation",
    value: string
  ) => {
    if (selectedNode && isDecisionNode) {
      const data = nodeData as DecisionNodeData;
      onNodeUpdate(selectedNode.id, {
        ...data,
        transitions: data.transitions.map((t) =>
          t.id === transitionId ? { ...t, [field]: value } : t
        ),
      });
    }
  };

  const handleRemoveTransition = (transitionId: string) => {
    if (selectedNode && isDecisionNode) {
      const data = nodeData as DecisionNodeData;
      onNodeUpdate(selectedNode.id, {
        ...data,
        transitions: data.transitions.filter((t) => t.id !== transitionId),
      });
    }
  };

  const filteredPeople = availablePeople.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="builder-detail-panel">
      <div className="panel-header">
        <h3 className="panel-title">
          {selectedNode ? "State Configuration" : "Action Details"}
        </h3>
        <button onClick={onClose} className="panel-close">
          <X size={18} />
        </button>
      </div>

      <div className="panel-body">
        {selectedNode && (
          <>
            <div className="section">
              <div className="section-header">
                <span className="section-title">State Information</span>
                <button onClick={handleRename} className="action-btn">
                  <Edit3 size={14} /> Rename
                </button>
              </div>
              <div className="field-group">
                <label>State Name</label>
                <input
                  type="text"
                  value={nodeData?.label || ""}
                  onChange={(e) =>
                    onNodeUpdate(selectedNode.id, {
                      ...nodeData,
                      label: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
              <div className="field-group">
                <label>Internal ID (optional)</label>
                <input
                  type="text"
                  value={(nodeData as any)?.internalId || ""}
                  onChange={(e) =>
                    onNodeUpdate(selectedNode.id, {
                      ...nodeData,
                      internalId: e.target.value,
                    })
                  }
                  className="input-field mono"
                  placeholder="e.g., node-ARM-1"
                />
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <span className="section-title">
                  <Users size={14} /> Assignees
                </span>
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="action-btn primary"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {showAssigneeDropdown && (
                <div className="assignee-dropdown">
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                  <div className="assignee-list">
                    {filteredPeople.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => handleAddAssignee(person)}
                        className="assignee-item"
                      >
                        <span>{person.name}</span>
                        <span className="assignee-type">{person.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="assignee-chips">
                {nodeData?.assignees?.map((person) => (
                  <div key={person.id} className="assignee-chip">
                    <span>{person.name}</span>
                    <button onClick={() => handleRemoveAssignee(person.id)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {(!nodeData?.assignees || nodeData.assignees.length === 0) && (
                  <div className="empty-state">No assignees</div>
                )}
              </div>
            </div>

            {isProcessNode && (
              <div className="section">
                <div className="section-title">Actions / Transitions</div>
                <div className="actions-config">
                  {["left", "center", "right"].map((side) => {
                    const data = nodeData as ProcessNodeData;
                    const action =
                      data.actions[side as keyof typeof data.actions];
                    const colors = {
                      left: "#ef4444",
                      center: "#111827",
                      right: "#10b981",
                    };

                    return (
                      <div key={side} className="action-config">
                        <div className="action-header">
                          <span
                            className="action-side"
                            style={{
                              color: colors[side as keyof typeof colors],
                            }}
                          >
                            {side.charAt(0).toUpperCase() + side.slice(1)}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Action label"
                          value={action?.label || ""}
                          onChange={(e) =>
                            handleActionUpdate(
                              side as any,
                              "label",
                              e.target.value
                            )
                          }
                          className="input-field"
                        />
                        <textarea
                          placeholder="Operation/description"
                          value={action?.operation || ""}
                          onChange={(e) =>
                            handleActionUpdate(
                              side as any,
                              "operation",
                              e.target.value
                            )
                          }
                          className="textarea-field"
                          rows={2}
                        />
                        <div className="next-state">
                          Next state:{" "}
                          <span className="state-badge">Not connected</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isDecisionNode && (
              <div className="section">
                <div className="section-header">
                  <span className="section-title">Transitions</span>
                  <button
                    onClick={handleAddTransition}
                    className="action-btn primary"
                  >
                    <Plus size={14} /> Add Transition
                  </button>
                </div>
                <div className="transitions-list">
                  {(nodeData as DecisionNodeData)?.transitions?.map(
                    (transition) => (
                      <div key={transition.id} className="transition-item">
                        <input
                          type="text"
                          placeholder="Condition label"
                          value={transition.label}
                          onChange={(e) =>
                            handleTransitionUpdate(
                              transition.id,
                              "label",
                              e.target.value
                            )
                          }
                          className="input-field"
                        />
                        <textarea
                          placeholder="Operation"
                          value={transition.operation || ""}
                          onChange={(e) =>
                            handleTransitionUpdate(
                              transition.id,
                              "operation",
                              e.target.value
                            )
                          }
                          className="textarea-field"
                          rows={1}
                        />
                        <button
                          onClick={() => handleRemoveTransition(transition.id)}
                          className="remove-btn"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="section">
              <button
                onClick={() => onViewForm?.(selectedNode.id)}
                className="form-view-btn"
              >
                <Eye size={16} /> Form View
              </button>
            </div>
          </>
        )}

        {selectedEdge && (
          <div className="section">
            <div className="section-title">Edge Configuration</div>
            <div className="field-group">
              <label>Action Label</label>
              <input
                type="text"
                value={(selectedEdge.label as string) || ""}
                onChange={(e) =>
                  onEdgeUpdate(selectedEdge.id, { label: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="field-group">
              <label>Operation</label>
              <textarea
                value={selectedEdge.data?.operation || ""}
                onChange={(e) =>
                  onEdgeUpdate(selectedEdge.id, { operation: e.target.value })
                }
                className="textarea-field"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderDetailsPanel;

