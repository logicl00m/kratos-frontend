import React, { useState, useCallback, useRef } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow';

const EditableEdge = ({
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
  const { setEdges } = useReactFlow();
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  // Initialize control points based on source and target positions
  const initialControlPoint1 = {
    x: data?.controlPoint1?.x || sourceX + (targetX - sourceX) * 0.25,
    y: data?.controlPoint1?.y || sourceY + (targetY - sourceY) * 0.25,
  };

  const initialControlPoint2 = {
    x: data?.controlPoint2?.x || sourceX + (targetX - sourceX) * 0.75,
    y: data?.controlPoint2?.y || sourceY + (targetY - sourceY) * 0.75,
  };

  const [controlPoint1, setControlPoint1] = useState(initialControlPoint1);
  const [controlPoint2, setControlPoint2] = useState(initialControlPoint2);
  const [isDragging, setIsDragging] = useState<number | null>(null);

  // Calculate path based on handle positions
  let pathControlPoint1 = controlPoint1;
  let pathControlPoint2 = controlPoint2;

  // Adjust control points based on source handle
  if (sourceHandle === 'reject') {
    // Left handle - route to the left
    pathControlPoint1 = {
      x: sourceX - 100,
      y: sourceY + 50,
    };
  } else if (sourceHandle === 'approve') {
    // Right handle - route to the right
    pathControlPoint1 = {
      x: sourceX + 100,
      y: sourceY + 50,
    };
  } else if (sourceHandle === 'other') {
    // Bottom handle - route down first
    pathControlPoint1 = {
      x: sourceX,
      y: sourceY + 100,
    };
  }

  // Create cubic bezier path
  const path = `M ${sourceX},${sourceY} C ${pathControlPoint1.x},${pathControlPoint1.y} ${pathControlPoint2.x},${pathControlPoint2.y} ${targetX},${targetY}`;

  // Calculate label position (middle of the curve)
  const t = 0.5;
  const labelX = Math.pow(1 - t, 3) * sourceX +
                 3 * Math.pow(1 - t, 2) * t * pathControlPoint1.x +
                 3 * (1 - t) * Math.pow(t, 2) * pathControlPoint2.x +
                 Math.pow(t, 3) * targetX;
  const labelY = Math.pow(1 - t, 3) * sourceY +
                 3 * Math.pow(1 - t, 2) * t * pathControlPoint1.y +
                 3 * (1 - t) * Math.pow(t, 2) * pathControlPoint2.y +
                 Math.pow(t, 3) * targetY;

  const handleControlPointDragStart = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(index);
    dragRef.current = { startX: e.clientX, startY: e.clientY };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      if (index === 1) {
        const newPoint = {
          x: controlPoint1.x + deltaX,
          y: controlPoint1.y + deltaY,
        };
        setControlPoint1(newPoint);

        // Update edge data
        setEdges((edges) =>
          edges.map((edge) => {
            if (edge.id === id) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  controlPoint1: newPoint,
                  controlPoint2,
                },
              };
            }
            return edge;
          })
        );
      } else {
        const newPoint = {
          x: controlPoint2.x + deltaX,
          y: controlPoint2.y + deltaY,
        };
        setControlPoint2(newPoint);

        // Update edge data
        setEdges((edges) =>
          edges.map((edge) => {
            if (edge.id === id) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  controlPoint1,
                  controlPoint2: newPoint,
                },
              };
            }
            return edge;
          })
        );
      }

      dragRef.current = { startX: e.clientX, startY: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, controlPoint1, controlPoint2, setEdges]);

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : (style?.strokeWidth || 2),
        }}
        id={id}
      />

      {/* Show control points when edge is selected */}
      {selected && (
        <>
          {/* Control line 1 */}
          <line
            x1={sourceX}
            y1={sourceY}
            x2={pathControlPoint1.x}
            y2={pathControlPoint1.y}
            stroke="#b1b1b7"
            strokeWidth={1}
            strokeDasharray="5,5"
          />
          {/* Control line 2 */}
          <line
            x1={targetX}
            y1={targetY}
            x2={pathControlPoint2.x}
            y2={pathControlPoint2.y}
            stroke="#b1b1b7"
            strokeWidth={1}
            strokeDasharray="5,5"
          />

          {/* Control point 1 */}
          <circle
            cx={pathControlPoint1.x}
            cy={pathControlPoint1.y}
            r={8}
            fill="#fff"
            stroke="#6366f1"
            strokeWidth={2}
            style={{
              cursor: isDragging === 1 ? 'grabbing' : 'grab',
            }}
            onMouseDown={(e) => handleControlPointDragStart(1, e)}
          />

          {/* Control point 2 */}
          <circle
            cx={pathControlPoint2.x}
            cy={pathControlPoint2.y}
            r={8}
            fill="#fff"
            stroke="#6366f1"
            strokeWidth={2}
            style={{
              cursor: isDragging === 2 ? 'grabbing' : 'grab',
            }}
            onMouseDown={(e) => handleControlPointDragStart(2, e)}
          />
        </>
      )}

      {/* Edge label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: labelStyle?.fontSize || 14,
              fontWeight: labelStyle?.fontWeight || 600,
              color: labelStyle?.fill || '#1f2937',
              background: labelBgStyle?.fill || '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              border: selected ? '2px solid #6366f1' : '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              pointerEvents: 'all',
              zIndex: 1000,
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

export default EditableEdge;