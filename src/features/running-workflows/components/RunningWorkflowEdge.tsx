// src/features/running-workflows/components/RunningWorkflowEdge.tsx

import React from "react";
import { type EdgeProps, getSmoothStepPath } from "reactflow";
import "./RunningWorkflowEdge.css";

const RunningWorkflowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get label from data or use a default
  const label = data?.label || "";
  const executed = data?.executed || false;
  const operation = data?.operation || "";

  // Determine label class based on operation type
  const getLabelClass = () => {
    if (!executed) return "running-workflow-edge-label pending";

    const lowerOp = (operation || "").toLowerCase();
    if (
      lowerOp.includes("reject") ||
      lowerOp.includes("sendback") ||
      lowerOp.includes("return")
    ) {
      return "running-workflow-edge-label danger";
    }
    if (
      lowerOp.includes("approve") ||
      lowerOp.includes("finalize") ||
      lowerOp.includes("recommend") ||
      lowerOp.includes("complete")
    ) {
      return "running-workflow-edge-label success";
    }
    if (lowerOp.includes("submit")) {
      return "running-workflow-edge-label warning";
    }
    return "running-workflow-edge-label";
  };

  // Set default styles for better visibility
  const edgeStyle = {
    ...style,
    strokeWidth: style?.strokeWidth || (executed ? 3 : 2),
    opacity: style?.opacity || (executed ? 1 : 0.6),
  };

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {label && (
        <text className={getLabelClass()}>
          <textPath
            href={`#${id}`}
            startOffset="50%"
            textAnchor="middle"
            style={{ fontSize: "12px", fontWeight: executed ? 600 : 500 }}
          >
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default RunningWorkflowEdge;
