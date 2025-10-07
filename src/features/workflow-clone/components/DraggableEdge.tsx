import React, { useState, useCallback } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, getStraightPath, getSmoothStepPath } from 'reactflow';

const DraggableEdge = ({
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Calculate control points for the edge
  const curvature = data?.curvature || 0;
  const edgeIndex = data?.edgeIndex || 0;
  const labelOffset = data?.labelOffset || 0;

  // Calculate midpoint
  const midX = (sourceX + targetX) / 2 + dragOffset.x;
  const midY = (sourceY + targetY) / 2 + dragOffset.y;

  // Calculate perpendicular offset for curved edges
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;

  // Perpendicular vector (rotated 90 degrees)
  const perpX = -dy / length;
  const perpY = dx / length;

  // Apply curvature offset
  const offsetDistance = curvature * 50;
  const controlPointX = midX + perpX * offsetDistance;
  const controlPointY = midY + perpY * offsetDistance;

  // Get the appropriate path based on edge type
  let edgePath, labelX, labelY;

  if (data?.edgeType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else if (data?.edgeType === 'step') {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  } else {
    // Default to bezier
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: curvature,
    });
  }

  // Calculate label position with offset
  const labelPosX = labelX + (perpX * labelOffset) + dragOffset.x;
  const labelPosY = labelY + (perpY * labelOffset) + dragOffset.y;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const currentOffsetX = dragOffset.x;
    const currentOffsetY = dragOffset.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragOffset({
        x: currentOffsetX + deltaX,
        y: currentOffsetY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dragOffset]);

  // Create a draggable control point
  const controlPointSize = 12;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : (style?.strokeWidth || 2),
          cursor: 'pointer',
        }}
        id={id}
      />

      {/* Draggable control point */}
      {selected && (
        <g>
          <circle
            cx={controlPointX}
            cy={controlPointY}
            r={controlPointSize / 2}
            fill="#6366f1"
            stroke="#fff"
            strokeWidth={2}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
          />
        </g>
      )}

      {/* Edge label */}
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              pointerEvents: 'all',
              zIndex: 1000 + edgeIndex,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default DraggableEdge;