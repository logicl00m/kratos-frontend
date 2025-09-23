// src/features/workflow/components/builder/BuilderDetailsPanel.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Users,
  Plus,
  Trash2,
  Eye,
  Edit3,
  FileText,
  Search,
  Check,
} from "lucide-react";
import type { Node, Edge } from "reactflow";
import type {
  ProcessNodeData,
  DecisionNodeData,
  Person,
} from "@features/workflow-config-edit/types/builder.types";
import "./BuilderDetailsPanel.css";
import {
  searchForms,
  listForms,
} from "@features/workflow-config-edit/services/formsApi";

interface BuilderDetailsPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onClose: () => void;
  onNodeUpdate: (
    nodeId: string,
    data: ProcessNodeData | DecisionNodeData
  ) => void;
  onEdgeUpdate: (
    edgeId: string,
    data: { label?: string; operation?: string }
  ) => void;
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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [formQuery, setFormQuery] = useState("");
  const [formResults, setFormResults] = useState<
    Array<{ id: string; name: string; version: number }>
  >([]);
  const [prefetchedForms, setPrefetchedForms] = useState<
    Array<{ id: string; name: string; version: number }>
  >([]);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  type ActionSide = "left" | "center" | "right";

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
      if (!currentAssignees.find((a: Person) => a.id === person.id)) {
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
        assignees: nodeData.assignees.filter((a: Person) => a.id !== personId),
      });
    }
  };

  const handleActionUpdate = (
    side: ActionSide,
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFormDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search forms effect
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingForms(true);
      try {
        if (formQuery.trim()) {
          const res = await searchForms(formQuery);
          if (!cancelled) setFormResults(res);
        } else {
          // When no query, show all prefetched forms
          if (!cancelled) setFormResults(prefetchedForms);
        }
      } catch (error) {
        console.error("Failed to search forms:", error);
        if (!cancelled) setFormResults([]);
      } finally {
        if (!cancelled) setLoadingForms(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [formQuery, prefetchedForms]);

  // Prefetch forms on mount
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const list = await listForms();
        if (!cancelled) {
          setPrefetchedForms(list);
          setFormResults(list);
        }
      } catch (error) {
        console.error("Failed to load forms:", error);
        if (!cancelled) {
          setPrefetchedForms([]);
          setFormResults([]);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFormSelect = (form: {
    id: string;
    name: string;
    version: number;
  }) => {
    if (!selectedNode) return;
    const data = nodeData as ProcessNodeData;
    onNodeUpdate(selectedNode.id, {
      ...data,
      form: {
        id: form.id,
        name: form.name,
        version: form.version,
        binding: data.form?.binding || "pinned",
      },
    });
    setShowFormDropdown(false);
    setFormQuery("");
  };

  const currentForm = isProcessNode ? (nodeData as ProcessNodeData).form : null;

  const nothingSelected = !selectedNode && !selectedEdge;

  return nothingSelected ? null : (
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
                <label htmlFor="state-name-input">State Name</label>
                <input
                  id="state-name-input"
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
                <label htmlFor="state-internal-id">
                  Internal ID (optional)
                </label>
                <input
                  id="state-internal-id"
                  type="text"
                  value={
                    (nodeData as ProcessNodeData | DecisionNodeData)
                      ?.internalId || ""
                  }
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
                  <ul className="assignee-list">
                    {filteredPeople.map((person: Person) => (
                      <li key={person.id} className="assignee-item">
                        <button
                          type="button"
                          onClick={() => handleAddAssignee(person)}
                        >
                          <span>{person.name}</span>
                          <span className="assignee-type">{person.type}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="assignee-chips">
                {nodeData?.assignees?.map((person: Person) => (
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
                              side as "left" | "center" | "right",
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
                              side as "left" | "center" | "right",
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

            {isProcessNode && (
              <div className="section">
                <div className="section-header">
                  <span className="section-title">
                    <FileText size={14} /> Form
                  </span>
                </div>

                <div className="field-group" ref={dropdownRef}>
                  <label htmlFor="builder-form-search">Attach existing</label>
                  <div className="form-select-wrapper">
                    <div
                      className="form-select-input"
                      onClick={() => setShowFormDropdown(!showFormDropdown)}
                    >
                      <Search size={16} className="search-icon" />
                      <input
                        id="builder-form-search"
                        type="text"
                        value={
                          showFormDropdown
                            ? formQuery
                            : currentForm
                            ? `${currentForm.name}@v${currentForm.version}`
                            : ""
                        }
                        onChange={(e) => {
                          setFormQuery(e.target.value);
                          setShowFormDropdown(true);
                        }}
                        onFocus={() => setShowFormDropdown(true)}
                        placeholder="Search forms (name)"
                        className="form-search-field"
                      />
                      {currentForm && !showFormDropdown && (
                        <Check size={16} className="selected-icon" />
                      )}
                    </div>

                    {showFormDropdown && (
                      <div className="form-dropdown">
                        {loadingForms ? (
                          <div className="loading-state">Loading forms...</div>
                        ) : formResults.length > 0 ? (
                          <ul className="form-list">
                            {formResults.map((form) => (
                              <li
                                key={`${form.id}@${form.version}`}
                                className={`form-item ${
                                  currentForm?.id === form.id ? "selected" : ""
                                }`}
                                onClick={() => handleFormSelect(form)}
                              >
                                <span className="form-name">
                                  {form.name}@v{form.version}
                                </span>
                                {currentForm?.id === form.id && (
                                  <Check size={16} className="check-icon" />
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="empty-state">No forms found</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="help-text">
                    Search by name; latest first.
                    {currentForm && (
                      <span className="current-form-info">
                        Current: {currentForm.name}@v{currentForm.version}
                      </span>
                    )}
                  </div>
                </div>

                <div className="field-group">
                  <span className="label">Binding</span>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="form-binding"
                        checked={currentForm?.binding !== "latest"}
                        onChange={() => {
                          const data = nodeData as ProcessNodeData;
                          if (!data.form || !selectedNode) return;
                          onNodeUpdate(selectedNode.id, {
                            ...data,
                            form: { ...data.form, binding: "pinned" },
                          });
                        }}
                      />
                      <span className="radio-label">
                        Pinned
                        {currentForm && currentForm.binding !== "latest" && (
                          <span className="version-badge">
                            v{currentForm.version}
                          </span>
                        )}
                      </span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="form-binding"
                        checked={currentForm?.binding === "latest"}
                        onChange={() => {
                          const data = nodeData as ProcessNodeData;
                          if (!data.form || !selectedNode) return;
                          onNodeUpdate(selectedNode.id, {
                            ...data,
                            form: { ...data.form, binding: "latest" },
                          });
                        }}
                      />
                      <span className="radio-label">Track latest</span>
                    </label>
                  </div>
                </div>

                <div className="field-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        (nodeData as ProcessNodeData).requireFormToTransition
                      )}
                      onChange={(e) => {
                        const data = nodeData as ProcessNodeData;
                        if (!selectedNode) return;
                        onNodeUpdate(selectedNode.id, {
                          ...data,
                          requireFormToTransition: e.target.checked,
                        });
                      }}
                    />
                    <span>Require to transition</span>
                  </label>
                </div>

                <div className="field-group">
                  <button
                    type="button"
                    className="action-btn create-new"
                    onClick={() => {
                      if (!selectedNode) return;
                      navigate("/form-builder/new", {
                        state: { from: "/builder", nodeId: selectedNode.id },
                        replace: false,
                      });
                    }}
                  >
                    <Plus size={14} /> Create new
                  </button>
                </div>

                {currentForm && (
                  <div className="field-group">
                    <details className="json-viewer">
                      <summary>Form JSON</summary>
                      <pre aria-label="Form JSON preview">
                        {JSON.stringify(currentForm, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
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
              <label htmlFor="edge-action-label">Action Label</label>
              <input
                id="edge-action-label"
                type="text"
                value={(selectedEdge.label as string) || ""}
                onChange={(e) =>
                  onEdgeUpdate(selectedEdge.id, { label: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div className="field-group">
              <label htmlFor="edge-operation">Operation</label>
              <textarea
                id="edge-operation"
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
