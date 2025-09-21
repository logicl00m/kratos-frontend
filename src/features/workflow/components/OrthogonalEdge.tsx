import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';

const OrthogonalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandle,
  targetHandle,
  label,
  labelStyle,
  labelBgStyle,
  style,
  markerEnd,
  data,
  selected,
}: any) => {
  // Get edge metadata
  const edgeIndex = data?.edgeIndex || 0;
  const offset = data?.offset || 0;
  const labelOffset = data?.labelOffset || 0;

  // Determine routing based on handle positions
  // For rejection (left handle) or approval (right handle), route around sides
  // For other (bottom handle), route normally

  let centerOffset = 0;
  let routingType = 'center';

  if (sourceHandle === 'reject') {
    // Route on the left side
    routingType = 'left';
    centerOffset = -100 - (edgeIndex * 30);
  } else if (sourceHandle === 'approve') {
    // Route on the right side
    routingType = 'right';
    centerOffset = 100 + (edgeIndex * 30);
  } else {
    // Route normally with offset for multiple edges
    centerOffset = offset;
  }

  // Use smooth step path for orthogonal routing
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
    centerX: sourceX + centerOffset,
    centerY: sourceY + ((targetY - sourceY) / 2),
    offset: Math.abs(centerOffset),
  });

  // Calculate label position
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  // Position label at the middle of the path
  let finalLabelX = labelX;
  let finalLabelY = labelY;

  // Adjust label position based on routing type
  if (routingType === 'left') {
    finalLabelX = Math.min(sourceX, targetX) - Math.abs(centerOffset) / 2;
    finalLabelY = (sourceY + targetY) / 2;
  } else if (routingType === 'right') {
    finalLabelX = Math.max(sourceX, targetX) + Math.abs(centerOffset) / 2;
    finalLabelY = (sourceY + targetY) / 2;
  } else {
    // For center routing, offset label vertically to avoid edge overlap
    finalLabelY = labelY + (edgeIndex * 25);
  }

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
              transform: `translate(-50%, -50%) translate(${finalLabelX}px, ${finalLabelY}px)`,
              fontSize: labelStyle?.fontSize || 14,
              fontWeight: labelStyle?.fontWeight || 600,
              color: labelStyle?.fill || '#1f2937',
              background: labelBgStyle?.fill || '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              border: selected ? '2px solid #6366f1' : '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              pointerEvents: 'all',
              zIndex: 1000 + edgeIndex,
              whiteSpace: 'nowrap',
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

export default OrthogonalEdge;