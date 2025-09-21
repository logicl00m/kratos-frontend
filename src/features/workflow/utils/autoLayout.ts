import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

const nodeWidth = 280;
const nodeHeight = 120;

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph({
    compound: true,
    multigraph: true
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure layout with optimal spacing for edge routing
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 300,        // Even larger vertical spacing for edge routing
    nodesep: 250,        // Even larger horizontal spacing
    edgesep: 150,        // Larger edge separation
    marginx: 150,        // Larger graph margins
    marginy: 150,
    acyclicer: 'greedy',
    ranker: 'network-simplex',  // Better ranking algorithm
    align: 'UL'          // Align nodes to upper-left
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      label: node.id
    });
  });

  // Add edges to the graph with proper weight
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, {
      weight: 1,
      minlen: 2  // Minimum edge length in ranks
    });
  });

  // Apply the layout
  dagre.layout(dagreGraph);

  // Update node positions with the calculated layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      }
    };
  });

  // Group edges by source-target pairs for better routing
  const edgeGroups = new Map<string, Edge[]>();
  edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`;
    if (!edgeGroups.has(key)) {
      edgeGroups.set(key, []);
    }
    edgeGroups.get(key)!.push(edge);
  });

  // Process edges with step routing that avoids nodes
  const layoutedEdges = edges.map((edge) => {
    const key = `${edge.source}-${edge.target}`;
    const reverseKey = `${edge.target}-${edge.source}`;
    const sameDirectionEdges = edgeGroups.get(key) || [];
    const reverseEdges = edgeGroups.get(reverseKey) || [];

    const edgeIndex = sameDirectionEdges.indexOf(edge);
    const totalSameDirection = sameDirectionEdges.length;
    const hasReverse = reverseEdges.length > 0;

    // Calculate offset for multiple edges
    let offset = 0;
    let labelOffset = 0;
    let edgeType = 'step'; // Use step edges by default for node avoidance

    if (totalSameDirection > 1) {
      // Multiple edges in same direction - spread them out with larger offsets
      offset = (edgeIndex - (totalSameDirection - 1) / 2) * 50; // Larger offset
      labelOffset = edgeIndex * 50;
      edgeType = 'step';
    }

    if (hasReverse) {
      // Bidirectional edges - use step edges with different offsets
      const isForward = edge.source < edge.target;
      offset = isForward ? 60 : -60; // Larger offset for bidirectional
      labelOffset = isForward ? 40 : -40;
      edgeType = 'step';
    }

    // Self-loops - use bezier
    if (edge.source === edge.target) {
      edgeType = 'bezier';
      offset = 100; // Large offset for self-loops
    }

    return {
      ...edge,
      type: edgeType,
      animated: edge.animated,
      updatable: true,
      style: {
        ...edge.style,
        strokeWidth: 2,
        stroke: edge.style?.stroke,
      },
      data: {
        ...edge.data,
        offset: offset,
        labelOffset: labelOffset,
        edgeIndex: edgeIndex,
        curvature: hasReverse ? 0.5 : 0,
      }
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};