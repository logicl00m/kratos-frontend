import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Eye } from "lucide-react";
import type { Node, Edge } from "reactflow";
import type {
  ProcessNodeData,
  DecisionNodeData,
  Person,
} from "@features/workflow-config-edit/types/builder.types";

import { StateInfoSection } from "./StateInfoSection";
import { AssigneesSection } from "./AssigneesSection";
import { FormSection } from "./FormSection";
import { ActionsSection } from "./ActionsSection";
import { getAllForms } from "@features/workflow-config-edit/services/formsApi";
import "./BuilderDetailsPanel.css";

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

export const BuilderDetailsPanel: React.FC<BuilderDetailsPanelProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  onNodeUpdate,
  onEdgeUpdate,
  onViewForm,
  availablePeople,
}) => {
  const navigate = useNavigate();
  const nodeData = selectedNode?.data;
  const isProcessNode = selectedNode?.type === "process";
  const isDecisionNode = selectedNode?.type === "decision";

  // Prefetch forms when the panel opens for a process node (mirrors FormPickerModal behavior)
    React.useEffect(() => {
    let cancelled = false;
    if (selectedNode && isProcessNode) {
      (async () => {
        try {
          // call getAllForms to warm any network/cache and normalize shape if needed
          await getAllForms();
        } catch (err) {
          if (!cancelled) {
            // log but don't block UI
            console.warn('Prefetching forms failed in BuilderDetailsPanel:', err);
          }
        }
      })();
    }

    return () => {
      cancelled = true;
    };
    // Intentionally depend on selectedNode id/type to run when panel opens for a node
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id, selectedNode?.type]);

  const handleRename = () => {
    const newName = prompt("Enter new state name:", nodeData?.label);
    if (newName && selectedNode && nodeData) {
      onNodeUpdate(selectedNode.id, { ...nodeData, label: newName });
    }
  };

  const handleLabelChange = (label: string) => {
    if (selectedNode && nodeData) {
      onNodeUpdate(selectedNode.id, { ...nodeData, label });
    }
  };

  const handleInternalIdChange = (internalId: string) => {
    if (selectedNode && nodeData) {
      onNodeUpdate(selectedNode.id, { ...nodeData, internalId });
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
  };

  const handleRemoveAssignee = (personId: string) => {
    if (selectedNode && nodeData) {
      onNodeUpdate(selectedNode.id, {
        ...nodeData,
        assignees: nodeData.assignees.filter((a: Person) => a.id !== personId),
      });
    }
  };

  const handleFormSelect = (form: {
    id: string;
    name: string;
    version: number;
  }) => {
    if (selectedNode && isProcessNode) {
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
    }
  };

  const handleBindingChange = (binding: "pinned" | "latest") => {
    if (selectedNode && isProcessNode) {
      const data = nodeData as ProcessNodeData;
      if (data.form) {
        onNodeUpdate(selectedNode.id, {
          ...data,
          form: { ...data.form, binding },
        });
      }
    }
  };

  const handleRequireChange = (required: boolean) => {
    if (selectedNode && isProcessNode) {
      const data = nodeData as ProcessNodeData;
      onNodeUpdate(selectedNode.id, {
        ...data,
        requireFormToTransition: required,
      });
    }
  };

  const handleCreateNewForm = () => {
    if (selectedNode) {
      navigate("/form-builder/new", {
        state: { from: "/builder", nodeId: selectedNode.id },
        replace: false,
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

  if (!selectedNode && !selectedEdge) {
    return null;
  }

  return (
    <div className="builder-details-panel">
      <div className="panel-header-main">
        <div className="panel-title-wrap">
          <h3 className="panel-title">
            {selectedNode ? "State Configuration" : "Edge Configuration"}
          </h3>
          {selectedNode && (
            <span className="panel-subtitle">{selectedNode.type}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="panel-close-btn"
          title="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="panel-content">
        {selectedNode && (
          <>
            <StateInfoSection
              label={nodeData?.label || ""}
              internalId={nodeData?.internalId}
              onLabelChange={handleLabelChange}
              onInternalIdChange={handleInternalIdChange}
              onRename={handleRename}
            />

            <AssigneesSection
              assignees={nodeData?.assignees || []}
              availablePeople={availablePeople}
              onAdd={handleAddAssignee}
              onRemove={handleRemoveAssignee}
            />

            {isProcessNode && (
              <>
                <ActionsSection
                  actions={(nodeData as ProcessNodeData).actions}
                  onActionUpdate={handleActionUpdate}
                />

                <FormSection
                  form={(nodeData as ProcessNodeData).form}
                  requireFormToTransition={
                    (nodeData as ProcessNodeData).requireFormToTransition
                  }
                  onFormSelect={handleFormSelect}
                  onBindingChange={handleBindingChange}
                  onRequireChange={handleRequireChange}
                  onCreateNew={handleCreateNewForm}
                />
              </>
            )}

            {isDecisionNode && (
              <DecisionTransitionsSection
                transitions={(nodeData as DecisionNodeData).transitions || []}
                onUpdate={(transitions) => {
                  if (selectedNode) {
                    onNodeUpdate(selectedNode.id, {
                      ...nodeData,
                      transitions,
                    } as DecisionNodeData);
                  }
                }}
              />
            )}
          </>
        )}

        {selectedEdge && (
          <EdgeConfigSection
            label={(selectedEdge.label as string) || ""}
            operation={selectedEdge.data?.operation || ""}
            onUpdate={(data) => onEdgeUpdate(selectedEdge.id, data)}
          />
        )}
      </div>

      {selectedNode && onViewForm && (
        <div className="panel-footer">
          <button
            className="view-form-btn"
            onClick={() => onViewForm(selectedNode.id)}
          >
            <Eye size={16} />
            <span>Preview Form</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Decision Transitions Section Component
const DecisionTransitionsSection: React.FC<{
  transitions: Array<{ id: string; label: string; operation?: string }>;
  onUpdate: (
    transitions: Array<{ id: string; label: string; operation?: string }>
  ) => void;
}> = ({ transitions, onUpdate }) => {
  const handleAdd = () => {
    const newTransition = {
      id: `transition-${Date.now()}`,
      label: `Condition ${transitions.length + 1}`,
      operation: "",
    };
    onUpdate([...transitions, newTransition]);
  };

  const handleUpdate = (
    id: string,
    field: "label" | "operation",
    value: string
  ) => {
    onUpdate(
      transitions.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleRemove = (id: string) => {
    onUpdate(transitions.filter((t) => t.id !== id));
  };

  return (
    <div className="transitions-section">
      <div className="section-header">
        <h4 className="section-title">Decision Conditions</h4>
        <button className="add-btn" onClick={handleAdd}>
          + Add
        </button>
      </div>
      {transitions.map((transition) => (
        <div key={transition.id} className="transition-item">
          <input
            type="text"
            value={transition.label}
            onChange={(e) =>
              handleUpdate(transition.id, "label", e.target.value)
            }
            placeholder="Condition label"
          />
          <textarea
            value={transition.operation || ""}
            onChange={(e) =>
              handleUpdate(transition.id, "operation", e.target.value)
            }
            placeholder="Operation"
            rows={2}
          />
          <button onClick={() => handleRemove(transition.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

// Edge Configuration Section Component
const EdgeConfigSection: React.FC<{
  label: string;
  operation: string;
  onUpdate: (data: { label?: string; operation?: string }) => void;
}> = ({ label, operation, onUpdate }) => {
  return (
    <div className="edge-section">
      <div className="section-header">
        <h4 className="section-title">Edge Properties</h4>
      </div>
      <div className="form-field">
        <label>Action Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Enter action label"
        />
      </div>
      <div className="form-field">
        <label>Operation</label>
        <textarea
          value={operation}
          onChange={(e) => onUpdate({ operation: e.target.value })}
          placeholder="Enter operation details"
          rows={3}
        />
      </div>
    </div>
  );
};

export default BuilderDetailsPanel;
