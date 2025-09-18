// src/features/workflow/components/DetailPanel.tsx
import React from "react";
import {
  X,
  ArrowRight,
  FileText,
  Settings,
  Eye,
  Edit,
  Zap,
  Folder,
} from "lucide-react";
import type { Node, Edge } from "reactflow";
import type { StateFormField } from "@features/workflow/types/workflow.types";
import "./DetailPanel.css";

interface DetailPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onClose: () => void;
  onViewForm?: (nodeId: string) => void;
}

const getFieldActions = (f: StateFormField): string[] => {
  if (Array.isArray(f.fieldActions)) {
    return f.fieldActions.map((a) => a.operation).filter(Boolean);
  }
  return [];
};

const splitOperations = (op?: string): string[] => {
  return typeof op === "string" ? op.split(";").map((s) => s.trim()) : [];
};

type NodeData = {
  hasForm?: boolean;
  label?: string;
  fields?: StateFormField[];
};
type EdgeData = { operation?: string };

const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  onViewForm,
}) => {
  if (!selectedNode && !selectedEdge) return null;

  const nodeData: NodeData = (selectedNode?.data as NodeData) ?? {};
  const edgeData: EdgeData = (selectedEdge?.data as EdgeData) ?? {};
  const fields: StateFormField[] = Array.isArray(nodeData.fields)
    ? nodeData.fields
    : [];

  // Group fields by form name
  const fieldsByForm = fields.reduce((acc, field) => {
    const formName = field.formName || "Default Form";
    if (!acc[formName]) acc[formName] = [];
    acc[formName].push(field);
    return acc;
  }, {} as Record<string, StateFormField[]>);

  const safeString = (v: unknown): string => {
    if (v == null) return "";
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      return String(v);
    }
    return "";
  };

  // Helper to support legacy field shapes (some sources use ID/Name instead of id/name)
  const getFieldDisplayName = (f: StateFormField): string => {
    const asRecord = f as unknown as Record<string, unknown>;
    return (
      safeString(asRecord["Name"]) ||
      safeString(asRecord["name"]) ||
      safeString(asRecord["ID"]) ||
      safeString(asRecord["id"]) ||
      ""
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "editable":
        return <Edit size={10} color="#10b981" />;
      case "actionable":
        return <Zap size={10} color="#f59e0b" />;
      case "readonly":
      default:
        return <Eye size={10} color="#6b7280" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "editable":
        return "Editable";
      case "actionable":
        return "Actionable";
      case "readonly":
      default:
        return "Read-only";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "editable":
        return "#10b981";
      case "actionable":
        return "#f59e0b";
      case "readonly":
      default:
        return "#6b7280";
    }
  };

  const getStatusDescription = (status?: string) => {
    switch (status) {
      case "editable":
        return "User can modify this field";
      case "actionable":
        return "Read-only with special actions";
      case "readonly":
      default:
        return "View only, no modifications";
    }
  };

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h3 className="detail-panel-title">
          {selectedNode ? "State Details" : "Action Details"}
        </h3>
        <button
          onClick={onClose}
          className="detail-panel-close"
          aria-label="Close details"
        >
          <X size={18} />
        </button>
      </div>

      <div className="detail-panel-body">
        {selectedNode ? (
          <section aria-label="State details">
            {nodeData.hasForm ? (
              <button
                onClick={() =>
                  onViewForm ? onViewForm(selectedNode.id) : undefined
                }
                className="dp-form-view-btn"
              >
                <Eye size={16} />
                Form View
              </button>
            ) : null}

            <div style={{ marginBottom: "16px" }}>
              <div className="dp-section-label">State Name</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {safeString(nodeData.label)}
              </div>
            </div>

            {nodeData.hasForm ? (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FileText size={12} />
                  <span>Visible Fields ({fields.length})</span>
                </div>

                <div style={{ display: "block" }}>
                  {Object.entries(fieldsByForm).map(
                    ([formName, formFields]) => (
                      <div key={formName} style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: 500,
                          }}
                        >
                          <Folder size={10} />
                          <span>{formName}</span>
                        </div>
                        {formFields.map((f, idx) => {
                          const actions = getFieldActions(f);
                          const key = f.id || f.name || `field-${idx}`;
                          const status = f.stateConfig?.status || "readonly";

                          return (
                            <div
                              key={key}
                              className="dp-field-card"
                              style={{ marginLeft: "8px" }}
                            >
                              <div className="dp-field-name">
                                {getFieldDisplayName(f)}
                                {f.stateConfig?.required && (
                                  <span
                                    style={{
                                      color: "#ef4444",
                                      fontSize: "11px",
                                      marginLeft: "4px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    *
                                  </span>
                                )}
                              </div>
                              <div className="dp-field-meta">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    marginBottom: "2px",
                                  }}
                                >
                                  {getStatusIcon(status)}
                                  <span
                                    style={{ color: getStatusColor(status) }}
                                  >
                                    {getStatusLabel(status)}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: "#9ca3af",
                                    }}
                                  >
                                    - {getStatusDescription(status)}
                                  </span>
                                </div>
                                <div>Type: {safeString(f.type)}</div>
                                {f.data ? (
                                  <div>
                                    Source:{" "}
                                    <code className="dp-code">
                                      {safeString(f.data)}
                                    </code>
                                  </div>
                                ) : null}
                                {actions.length > 0 && (
                                  <div>Actions: {actions.join(", ")}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="dp-noform">No fields visible in this state</div>
            )}
          </section>
        ) : null}

        {selectedEdge ? (
          <section aria-label="Action details">
            <div style={{ marginBottom: "16px" }}>
              <div className="dp-section-label">Action Name</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {(typeof selectedEdge.label === "string" &&
                  selectedEdge.label) ||
                  "Unnamed Action"}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div className="dp-section-label">Flow</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <span className="dp-flow-badge source">
                  {selectedEdge.source}
                </span>
                <ArrowRight size={16} color="#6b7280" />
                <span className="dp-flow-badge target">
                  {selectedEdge.target}
                </span>
              </div>
            </div>

            {edgeData.operation ? (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Settings size={12} />
                  <span>Operations</span>
                </div>

                <div className="dp-ops-list">
                  {splitOperations(edgeData.operation).map((op, idx, arr) => (
                    <div
                      key={`${op}-${idx}`}
                      className="dp-op-item"
                      style={{
                        borderBottom:
                          idx < arr.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      • {op}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default DetailPanel;
