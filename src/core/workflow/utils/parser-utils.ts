/**
 * Parser Utilities Module
 *
 * Common utilities for workflow parsing operations.
 * These functions are shared across all parser implementations.
 */

import type { Edge, Node, MarkerType } from 'reactflow';
import type {
  WorkflowState,
  StateAction,
  WorkflowField,
  StateFormReference,
  WorkflowForm,
  FieldOverride,
  ParserOptions,
  WorkflowNodeData,
  WorkflowHistoryEntry,
  WorkflowStatus,
  WorkflowStatusInfo,
  WORKFLOW_STATUS_CONFIG
} from '../types/unified-types';

// ============================================================================
// Edge Styling Utilities
// ============================================================================

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  animated: boolean;
  strokeDasharray?: string;
}

/**
 * Determines edge visual style based on action name
 */
export function getEdgeStyle(actionName: string, isExecuted = false): EdgeStyle {
  const lowerAction = actionName.toLowerCase();

  // Rejection/negative actions - Red
  if (
    lowerAction.includes('reject') ||
    lowerAction.includes('decline') ||
    lowerAction.includes('deny') ||
    lowerAction.includes('back') ||
    lowerAction.includes('return')
  ) {
    return {
      stroke: '#ef4444',
      strokeWidth: isExecuted ? 3 : 2,
      animated: false
    };
  }

  // Approval/positive actions - Green
  if (
    lowerAction.includes('approve') ||
    lowerAction.includes('accept') ||
    lowerAction.includes('finalize') ||
    lowerAction.includes('complete') ||
    lowerAction.includes('confirm')
  ) {
    return {
      stroke: '#10b981',
      strokeWidth: isExecuted ? 3 : 2,
      animated: true
    };
  }

  // Submit/forward actions - Blue
  if (
    lowerAction.includes('submit') ||
    lowerAction.includes('forward') ||
    lowerAction.includes('send') ||
    lowerAction.includes('proceed')
  ) {
    return {
      stroke: '#3b82f6',
      strokeWidth: isExecuted ? 3 : 2,
      animated: false
    };
  }

  // Default - Gray
  return {
    stroke: isExecuted ? '#6b7280' : '#d1d5db',
    strokeWidth: isExecuted ? 3 : 2,
    animated: false
  };
}

/**
 * Determines edge handle positions based on action type
 */
export function getEdgeHandles(actionName: string): {
  sourceHandle: string;
  targetHandle: string;
} {
  const lowerAction = actionName.toLowerCase();

  let sourceHandle = 'center'; // default

  if (lowerAction.includes('reject') || lowerAction.includes('back')) {
    sourceHandle = 'left';
  } else if (
    lowerAction.includes('approve') ||
    lowerAction.includes('finalize') ||
    lowerAction.includes('complete')
  ) {
    sourceHandle = 'right';
  }

  return {
    sourceHandle,
    targetHandle: 'target' // Always use top for target
  };
}

/**
 * Calculates curve properties for edge separation
 */
export function calculateEdgeCurveProperties(
  hasReverseEdge: boolean,
  edgeCount: number,
  isSelfLoop: boolean
): {
  style: Record<string, any>;
  data: Record<string, any>;
} {
  const style: Record<string, any> = {};
  const data: Record<string, any> = {};

  if (isSelfLoop) {
    style.strokeDasharray = '3 3';
    data.curvature = 0.8;
  } else if (hasReverseEdge) {
    data.curvature = 0.5;
    data.offset = 40;
    data.labelOffset = 30;
  }

  if (edgeCount > 1) {
    style.strokeDasharray = edgeCount > 2 ? '5 5' : '10 5';
    data.offset = (edgeCount - 1) * 30;
    data.labelOffset = edgeCount * 40;
    data.curvature = (data.curvature || 0) + edgeCount * 0.2;
  }

  return { style, data };
}

/**
 * Creates a styled edge with all visual properties
 */
export function createStyledEdge(
  source: string,
  target: string,
  action: StateAction,
  actionName: string,
  options: {
    isExecuted?: boolean;
    isSelfLoop?: boolean;
    hasReverseEdge?: boolean;
    edgeCount?: number;
  } = {}
): Edge {
  const { isExecuted = false, isSelfLoop = false, hasReverseEdge = false, edgeCount = 1 } = options;

  const edgeStyle = getEdgeStyle(actionName, isExecuted);
  const handles = getEdgeHandles(actionName);
  const curveProps = calculateEdgeCurveProperties(hasReverseEdge, edgeCount, isSelfLoop);

  let edgeType = 'smoothstep';
  if (isSelfLoop) {
    edgeType = 'bezier';
  } else if (hasReverseEdge) {
    edgeType = 'step';
  }

  return {
    id: `${source}-${actionName}-${target}-${edgeCount}`,
    source,
    target,
    sourceHandle: handles.sourceHandle,
    targetHandle: handles.targetHandle,
    label: formatActionLabel(actionName),
    type: edgeType,
    animated: edgeStyle.animated,
    style: {
      stroke: edgeStyle.stroke,
      strokeWidth: edgeStyle.strokeWidth,
      ...curveProps.style
    },
    labelStyle: {
      fill: '#1f2937',
      fontWeight: 600,
      fontSize: 14
    },
    labelBgStyle: {
      fill: '#ffffff',
      fillOpacity: 1,
      padding: 4,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: '#e5e7eb'
    },
    labelShowBg: true,
    markerEnd: {
      type: 'arrowclosed' as MarkerType,
      color: edgeStyle.stroke
    },
    data: {
      operation: action.operation,
      executed: isExecuted,
      ...curveProps.data
    }
  };
}

// ============================================================================
// Node Positioning Utilities
// ============================================================================

export interface LayoutOptions {
  algorithm: 'grid' | 'dagre' | 'elk' | 'force';
  direction: 'horizontal' | 'vertical' | 'radial';
  spacing: {
    horizontal: number;
    vertical: number;
  };
}

/**
 * Calculates node position based on layout options
 */
export function calculateNodePosition(
  index: number,
  totalNodes: number,
  layout: LayoutOptions
): { x: number; y: number } {
  const { algorithm, direction, spacing } = layout;

  switch (algorithm) {
    case 'grid':
      return calculateGridPosition(index, totalNodes, spacing, direction);
    case 'force':
      return calculateForcePosition(index, totalNodes, spacing);
    case 'radial':
      return calculateRadialPosition(index, totalNodes, spacing);
    default:
      return calculateGridPosition(index, totalNodes, spacing, direction);
  }
}

function calculateGridPosition(
  index: number,
  totalNodes: number,
  spacing: { horizontal: number; vertical: number },
  direction: 'horizontal' | 'vertical' | 'radial'
): { x: number; y: number } {
  const columns = Math.ceil(Math.sqrt(totalNodes));
  const rows = Math.ceil(totalNodes / columns);

  if (direction === 'vertical') {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return {
      x: col * spacing.horizontal,
      y: row * spacing.vertical
    };
  } else {
    const row = Math.floor(index / rows);
    const col = index % rows;
    return {
      x: col * spacing.horizontal,
      y: row * spacing.vertical
    };
  }
}

function calculateForcePosition(
  index: number,
  totalNodes: number,
  spacing: { horizontal: number; vertical: number }
): { x: number; y: number } {
  // Simple force-directed layout approximation
  const angle = (2 * Math.PI * index) / totalNodes;
  const radius = Math.min(spacing.horizontal, spacing.vertical) * 2;

  return {
    x: Math.cos(angle) * radius + radius * 2,
    y: Math.sin(angle) * radius + radius
  };
}

function calculateRadialPosition(
  index: number,
  totalNodes: number,
  spacing: { horizontal: number; vertical: number }
): { x: number; y: number } {
  if (index === 0) {
    // Center node
    return { x: 0, y: 0 };
  }

  const angle = (2 * Math.PI * (index - 1)) / (totalNodes - 1);
  const radius = Math.min(spacing.horizontal, spacing.vertical) * 1.5;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

// ============================================================================
// Field Extraction Utilities
// ============================================================================

/**
 * Extracts form fields for a state with overrides applied
 */
export function extractStateFields(
  forms: Record<string, WorkflowForm>,
  state: WorkflowState
): WorkflowField[] {
  if (!forms || !state.forms) return [];

  const allFields: WorkflowField[] = [];

  state.forms.forEach((formRef: StateFormReference) => {
    // Skip hidden forms
    if (formRef.visibility === 'hidden') return;

    const form = forms[formRef.formName];
    if (!form?.fields) return;

    form.fields.forEach(field => {
      const override = formRef.fieldOverrides?.[field.id];

      // Skip hidden fields
      if (override?.status === 'hidden') return;

      // Apply overrides
      const processedField: WorkflowField = {
        ...field,
        ...(override?.defaultValue && { data: override.defaultValue })
      };

      // Add validation from override
      if (override?.required !== undefined) {
        processedField.validation = {
          ...processedField.validation,
          required: override.required
        };
      }

      allFields.push(processedField);
    });
  });

  return allFields;
}

/**
 * Builds a lookup map for field names
 */
export function buildFieldLookup(
  forms: Record<string, WorkflowForm>
): Record<string, string> {
  const lookup: Record<string, string> = {};

  Object.values(forms).forEach(form => {
    form.fields.forEach(field => {
      lookup[field.id] = field.name;
    });
  });

  return lookup;
}

// ============================================================================
// Status Determination Utilities
// ============================================================================

/**
 * Determines workflow status from state and history
 */
export function determineWorkflowStatus(
  currentState: string,
  history: WorkflowHistoryEntry[] = []
): WorkflowStatus {
  const stateLower = currentState.toLowerCase();

  // Check state name for status keywords
  if (stateLower.includes('complete') || stateLower.includes('finish')) {
    return 'completed';
  }

  if (stateLower.includes('reject') || stateLower.includes('decline')) {
    return 'rejected';
  }

  if (stateLower.includes('cancel') || stateLower.includes('abort')) {
    return 'cancelled';
  }

  if (stateLower.includes('draft') || stateLower.includes('prepare')) {
    return 'draft';
  }

  // Check last action in history
  if (history.length > 0) {
    const lastAction = history[history.length - 1].action.toLowerCase();

    if (lastAction.includes('complete') || lastAction.includes('approve')) {
      return 'completed';
    }

    if (lastAction.includes('reject') || lastAction.includes('decline')) {
      return 'rejected';
    }

    return 'active';
  }

  return 'pending';
}

/**
 * Gets status configuration with color and label
 */
export function getStatusInfo(status: WorkflowStatus): WorkflowStatusInfo {
  const config: Record<WorkflowStatus, WorkflowStatusInfo> = {
    draft: { status: 'draft', label: 'Draft', color: '#6b7280' },
    active: { status: 'active', label: 'Active', color: '#3b82f6' },
    completed: { status: 'completed', label: 'Completed', color: '#10b981' },
    rejected: { status: 'rejected', label: 'Rejected', color: '#ef4444' },
    cancelled: { status: 'cancelled', label: 'Cancelled', color: '#f59e0b' },
    pending: { status: 'pending', label: 'Pending', color: '#8b5cf6' }
  };

  return config[status];
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates workflow structure
 */
export function validateWorkflowStructure(
  states: Record<string, WorkflowState>,
  forms: Record<string, WorkflowForm>
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for empty states
  if (Object.keys(states).length === 0) {
    errors.push('Workflow must have at least one state');
  }

  // Validate state references
  Object.entries(states).forEach(([stateName, state]) => {
    // Check action targets
    if (state.actions) {
      Object.entries(state.actions).forEach(([actionName, action]) => {
        if (action.nextState && !states[action.nextState]) {
          errors.push(`Action "${actionName}" in state "${stateName}" references non-existent state "${action.nextState}"`);
        }
      });
    }

    // Check form references
    if (state.forms) {
      state.forms.forEach(formRef => {
        if (!forms[formRef.formName]) {
          warnings.push(`State "${stateName}" references non-existent form "${formRef.formName}"`);
        }
      });
    }
  });

  // Check for unreachable states
  const reachableStates = findReachableStates(states);
  const allStates = Object.keys(states);
  const unreachableStates = allStates.filter(s => !reachableStates.has(s));

  if (unreachableStates.length > 0 && allStates.length > 1) {
    warnings.push(`Unreachable states detected: ${unreachableStates.join(', ')}`);
  }

  // Check for terminal states
  const terminalStates = allStates.filter(s =>
    !states[s].actions || Object.keys(states[s].actions || {}).length === 0
  );

  if (terminalStates.length === 0 && allStates.length > 0) {
    warnings.push('Workflow has no terminal states (states without actions)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function findReachableStates(
  states: Record<string, WorkflowState>,
  startState?: string
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [];

  // Start from the first state if no start state specified
  const start = startState || Object.keys(states)[0];
  if (start) {
    queue.push(start);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;

    reachable.add(current);

    const state = states[current];
    if (state?.actions) {
      Object.values(state.actions).forEach(action => {
        if (action.nextState && !reachable.has(action.nextState)) {
          queue.push(action.nextState);
        }
      });
    }
  }

  return reachable;
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Formats action names for display
 */
export function formatActionLabel(action: string): string {
  return action
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Formats state names for display
 */
export function formatStateName(state: string): string {
  return state
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Converts string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ============================================================================
// Metric Calculation Utilities
// ============================================================================

/**
 * Calculates workflow metrics
 */
export function calculateWorkflowMetrics(
  nodes: Node[],
  edges: Edge[]
): {
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  cycleDetected: boolean;
  complexity: number;
} {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const maxDepth = calculateMaxDepth(nodes, edges);
  const cycleDetected = detectCycles(edges);
  const complexity = calculateComplexity(nodes, edges);

  return {
    nodeCount,
    edgeCount,
    maxDepth,
    cycleDetected,
    complexity
  };
}

function calculateMaxDepth(nodes: Node[], edges: Edge[]): number {
  if (nodes.length === 0) return 0;

  const adjacencyList = buildAdjacencyList(edges);
  const visited = new Set<string>();
  let maxDepth = 0;

  function dfs(nodeId: string, depth: number): void {
    visited.add(nodeId);
    maxDepth = Math.max(maxDepth, depth);

    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, depth + 1);
      }
    });

    visited.delete(nodeId);
  }

  // Start DFS from all nodes without incoming edges
  const nodesWithIncoming = new Set(edges.map(e => e.target));
  const startNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));

  if (startNodes.length === 0 && nodes.length > 0) {
    // If no start nodes found (cycle), start from first node
    dfs(nodes[0].id, 0);
  } else {
    startNodes.forEach(node => dfs(node.id, 0));
  }

  return maxDepth;
}

function detectCycles(edges: Edge[]): boolean {
  const adjacencyList = buildAdjacencyList(edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of adjacencyList.keys()) {
    if (!visited.has(node)) {
      if (hasCycle(node)) return true;
    }
  }

  return false;
}

function calculateComplexity(nodes: Node[], edges: Edge[]): number {
  // Cyclomatic complexity: E - N + 2P
  // Where E = edges, N = nodes, P = connected components
  const connectedComponents = countConnectedComponents(nodes, edges);
  return edges.length - nodes.length + 2 * connectedComponents;
}

function buildAdjacencyList(edges: Edge[]): Map<string, string[]> {
  const adjacencyList = new Map<string, string[]>();

  edges.forEach(edge => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });

  return adjacencyList;
}

function countConnectedComponents(nodes: Node[], edges: Edge[]): number {
  const adjacencyList = buildAdjacencyList(edges);
  const visited = new Set<string>();
  let components = 0;

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    });
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      components++;
      dfs(node.id);
    }
  });

  return components;
}