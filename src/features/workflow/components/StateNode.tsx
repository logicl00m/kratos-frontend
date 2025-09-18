// src/features/workflow/components/StateNode.tsx
import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Hash,
  Type,
  List,
  Edit,
  Eye,
  Upload,
  Zap,
  Folder,
} from "lucide-react";
import "./StateNode.css";
import type { StateFormField } from "@features/workflow/types/workflow.types";

const getFieldIcon = (type?: string) => {
  if (!type) return <Type size={12} />;
  switch (type?.toLowerCase()) {
    case "number":
      return <Hash size={12} />;
    case "select":
      return <List size={12} />;
    case "file":
      return <Upload size={12} />;
    case "textarea":
      return <FileText size={12} />;
    default:
      return <Type size={12} />;
  }
};

const StateNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "editable":
        return <Edit size={10} />;
      case "actionable":
        return <Zap size={10} />;
      case "readonly":
      default:
        return <Eye size={10} />;
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

  // Group fields by form name
  const fieldsByForm =
    data.fields?.reduce(
      (acc: Record<string, StateFormField[]>, field: StateFormField) => {
        const formName = field.formName || "Default Form";
        if (!acc[formName]) acc[formName] = [];
        acc[formName].push(field);
        return acc;
      },
      {}
    ) || {};

  const totalFieldCount = data.fields?.length || 0;
  const formCount = Object.keys(fieldsByForm).length;

  return (
    <div className={`state-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} className="handle-accent" />

      <div className="state-node-title">{data.label}</div>

      {data.hasForm ? (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="state-node-toggle"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <FileText size={14} />
            <span>{totalFieldCount} fields</span>
            {formCount > 1 && (
              <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                ({formCount} forms)
              </span>
            )}
          </button>

          {expanded && data.fields && (
            <div className="state-node-fields">
              {Object.entries(fieldsByForm).map(([formName, formFields]) => (
                <div
                  key={formName}
                  style={{ marginBottom: formCount > 1 ? "8px" : "0" }}
                >
                  {formCount > 1 && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 500,
                      }}
                    >
                      <Folder size={10} />
                      <span>{formName}</span>
                    </div>
                  )}
                  {formFields.map((field: StateFormField) => {
                    const status = field.stateConfig?.status || "readonly";

                    return (
                      <div
                        key={field.id || field.name}
                        className="state-node-field"
                        style={{ marginLeft: formCount > 1 ? "8px" : "0" }}
                      >
                        {getFieldIcon(field.type)}
                        <div style={{ flex: 1 }}>
                          <div className="state-node-field-name">
                            {field.name || field.id}
                            {field.stateConfig?.required && (
                              <span
                                style={{
                                  color: "#ef4444",
                                  marginLeft: "4px",
                                  fontWeight: "bold",
                                }}
                              >
                                *
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "2px",
                            }}
                          >
                            {getStatusIcon(status)}
                            <span
                              style={{
                                fontSize: "10px",
                                color: getStatusColor(status),
                              }}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
            padding: "8px",
          }}
        >
          No form configured
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="handle-accent"
      />
    </div>
  );
};

export default StateNode;
