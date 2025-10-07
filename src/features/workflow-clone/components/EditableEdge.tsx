import React, { useCallback, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useReactFlow,
  type EdgeProps,
  getBezierPath,
  type XYPosition,
} from 'reactflow';

const circle = (x: number, y: number) =>
  `translate(-50%, -50%) translate(${x}px, ${y}px)`;

function buildPath(sourceX: number, sourceY: number, targetX: number, targetY: number, points: Array<XYPosition> = []): string {
  if (points.length === 0) {
    // If no control points, create a straight line
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  // If we have control points, create a path that goes through them
  const pts = [{ x: sourceX, y: sourceY }, ...points, { x: targetX, y: targetY }];
  return pts.reduce(
    (d, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${d} L ${p.x} ${p.y}`),
    ''
  );
}

type EditableEdgeData = {
  points?: XYPosition[];
};

type CustomEdgeProps = EdgeProps<EditableEdgeData>;

const EditableEdge: React.FC<CustomEdgeProps> = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
    selected,
    label,
    labelStyle,
    labelBgStyle,
    style,
  } = props;

  const rf = useReactFlow();
  const points = data?.points ?? [];
  const isDraggingRef = useRef(false);

  // Use straight path initially, with control points if available
  const path = buildPath(sourceX, sourceY, targetX, targetY, points);

  // Calculate midpoint for the add button
  const [, midX, midY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  // Calculate label position
  const labelX = points.length > 0 ? points[0].x : midX;
  const labelY = points.length > 0 ? points[0].y : midY;

  const updatePoint = (idx: number, pos: XYPosition) => {
    rf.setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? { 
              ...e, 
              data: { 
                ...e.data, 
                points: e.data?.points?.map((p, i) => (i === idx ? pos : p)) 
              } 
            }
          : e
      )
    );
  };

  const addPoint = (pos: XYPosition) => {
    rf.setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? { 
              ...e, 
              data: { 
                ...e.data, 
                points: [...(e.data?.points ?? []), pos] 
              } 
            }
          : e
      )
    );
  };

  const removePoint = (idx: number) => {
    rf.setEdges((eds) =>
      eds.map((e) =>
        e.id === id
          ? { 
              ...e, 
              data: { 
                ...e.data, 
                points: e.data?.points?.filter((_, i) => i !== idx) 
              } 
            }
          : e
      )
    );
  };

  const onHandlePointerDown = (idx: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    const startPos = { x: e.clientX, y: e.clientY };
    const startPoint = points[idx];

    const onMove = (ev: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const currentPos = { x: ev.clientX, y: ev.clientY };
      const startProjected = rf.project(startPos);
      const currentProjected = rf.project(currentPos);

      const delta = {
        x: currentProjected.x - startProjected.x,
        y: currentProjected.y - startProjected.y,
      };

      updatePoint(idx, {
        x: startPoint.x + delta.x,
        y: startPoint.y + delta.y,
      });
    };

    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onRemovePoint = (idx: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    removePoint(idx);
  };

  const onAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const p = rf.project({ x: e.clientX, y: e.clientY });
    addPoint(p);
  };

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : (style?.strokeWidth || 2),
        }}
      />

      <EdgeLabelRenderer>
        {/* Edge label */}
        {label && (
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: circle(labelX, labelY),
              fontSize: labelStyle?.fontSize || 14,
              fontWeight: (labelStyle?.fontWeight as number) || 600,
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
          >
            {label}
          </div>
        )}

        {/* Add control point button - only show when selected */}
        {selected && (
          <button
            className="nodrag nopan"
            onClick={onAddClick}
            style={{
              position: 'absolute',
              transform: circle(midX, midY),
              pointerEvents: 'all',
              border: '2px solid #6366f1',
              background: '#fff',
              borderRadius: '50%',
              width: 24,
              height: 24,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
            }}
            title="Add control point"
          >
            +
          </button>
        )}

        {/* Control points */}
        {points.map((pt, i) => (
          <div key={i} style={{ position: 'absolute', transform: circle(pt.x, pt.y), zIndex: 1001 }}>
            <button
              className="nodrag nopan"
              onPointerDown={onHandlePointerDown(i)}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                border: '3px solid #6366f1',
                cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                pointerEvents: 'all',
                padding: 0,
              }}
              title="Drag to adjust path"
            />
            {selected && (
              <button
                className="nodrag nopan"
                onClick={onRemovePoint(i)}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid white',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  pointerEvents: 'all',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                title="Remove control point"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </EdgeLabelRenderer>
    </>
  );
};

export default EditableEdge;