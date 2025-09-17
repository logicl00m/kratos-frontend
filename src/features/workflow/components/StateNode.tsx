// StateNode.tsx - properly handles state field configuration
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
  EyeOff,
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
    default:
      return <Type size={12} />;
  }
};

const StateNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);

  const renderFieldStatus = (field: StateFormField) => {
    const config = field.stateConfig;
    if (!config) return null;

    return (
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginTop: "2px",
          alignItems: "center",
        }}
      >
        {config.editable ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              color: "#10b981",
              fontSize: "10px",
            }}
          >
            <Edit size={10} />
            Editable
          </span>
        ) : (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              color: "#6b7280",
              fontSize: "10px",
            }}
          >
            <EyeOff size={10} />
            Read-only
          </span>
        )}
        {config.required && (
          <span
            style={{
              color: "#ef4444",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            * Required
          </span>
        )}
      </div>
    );
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
              {data.fields.map((field: StateFormField) => (
                <div key={field.ID || field.Name} className="state-node-field">
                  {getFieldIcon(field.Type)}
                  <div style={{ flex: 1 }}>
                    <div className="state-node-field-name">
                      {field.Name || field.ID}
                    </div>
                    {renderFieldStatus(field)}
                    {field.FieldActions && field.FieldActions.length > 0 && (
                      <div className="state-node-field-actions">
                        Actions:{" "}
                        {field.FieldActions.map(
                          (action) => action.Operation
                        ).join(", ")}
                      </div>
                    )}
                  </div>
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
          No fields configured
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
