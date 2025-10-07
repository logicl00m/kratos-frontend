import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';

const CustomEdge = ({
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
}: any) => {
  // Calculate control point offset based on curvature
  const curvature = data?.curvature || 0;
  const edgeIndex = data?.edgeIndex || 0;
  const labelOffset = data?.labelOffset || 0;

  // Calculate midpoint
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate perpendicular offset for curved edges
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular vector (rotated 90 degrees)
  const perpX = -dy / length;
  const perpY = dx / length;

  // Apply curvature offset
  const offsetDistance = curvature * 50; // Scale the curvature
  const controlPointX = midX + perpX * offsetDistance;
  const controlPointY = midY + perpY * offsetDistance;

  // Use getBezierPath with custom control point
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: curvature,
  });

  // Calculate label position with offset to prevent overlap
  const labelPosX = labelX + (perpX * labelOffset);
  const labelPosY = labelY + (perpY * labelOffset);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
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
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              pointerEvents: 'all',
              zIndex: 1000 + edgeIndex, // Higher z-index for labels that should appear on top
              cursor: 'grab',
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

export default CustomEdge;