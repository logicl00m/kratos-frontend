import React from 'react';
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const SmartStepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  labelStyle,
  labelBgStyle,
  style,
  markerEnd,
  data,
  selected,
}: any) => {
  const edgeIndex = data?.edgeIndex || 0;
  const labelOffset = data?.labelOffset || 0;
  const offset = data?.offset || 0;

  // Use smoothstep path with border radius for nice corners and offset
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15,
    offset: offset,
  });

  // Calculate perpendicular offset for label positioning
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / length;
  const perpY = dx / length;

  // Apply label offset
  const labelPosX = labelX + (perpX * labelOffset);
  const labelPosY = labelY + (perpY * labelOffset);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : (style?.strokeWidth || 2),
        }}
        id={id}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelPosX}px, ${labelPosY}px)`,
              fontSize: labelStyle?.fontSize || 14,
              fontWeight: labelStyle?.fontWeight || 600,
              color: labelStyle?.fill || '#1f2937',
              background: labelBgStyle?.fill || '#ffffff',
              padding: '4px 8px',
              borderRadius: '4px',
              border: selected ? '2px solid #6366f1' : '1px solid #e5e7eb',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              pointerEvents: 'all',
              zIndex: 1000 + edgeIndex,
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default SmartStepEdge;