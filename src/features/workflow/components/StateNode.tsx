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
      case "readonly":
        return <Eye size={10} />;
      case "editable":
      default:
        return <Edit size={10} />;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "readonly":
        return "Read-only";
      case "editable":
      default:
        return "Editable";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "readonly":
        return "#6b7280";
      case "editable":
      default:
        return "#10b981";
    }
  };

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
            <span>{data.fields?.length || 0} fields</span>
          </button>

          {expanded && data.fields && (
            <div className="state-node-fields">
              {data.fields.map((field: StateFormField) => {
                const status = field.stateConfig?.status || "editable";

                return (
                  <div
                    key={field.ID || field.Name}
                    className="state-node-field"
                  >
                    {getFieldIcon(field.Type)}
                    <div style={{ flex: 1 }}>
                      <div className="state-node-field-name">
                        {field.Name || field.ID}
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
