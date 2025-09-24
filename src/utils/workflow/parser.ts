// Global workflow parser
import type { Node, Edge, MarkerType } from "reactflow";
import type {
  WorkflowConfig,
  State,
  StateFormField,
  BuilderNodeData,
  ProcessNodeData,
  DecisionNodeData,
  StateNodeData,
  ParserOptions,
  ParsedWorkflow,
  StateForm,
  FieldOverride,
  Form,
} from "./types";

const DEFAULT_OPTIONS: ParserOptions = {
  nodeStyle: "builder",
  layoutDirection: "horizontal",
  spacing: {
    horizontal: 350,
    vertical: 250,
  },
  includeFormData: true,
  includeAssignees: false,
};

/**
 * Main parser function that converts workflow JSON to React Flow graph
 * Combines the best of workflow viewer's logic with workflow builder's look
 */
export function parseWorkflowToGraph(
  workflow: WorkflowConfig,
  options: Partial<ParserOptions> = {}
): ParsedWorkflow {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const nodes: Node<BuilderNodeData>[] = [];
  const edges: Edge[] = [];

  if (!workflow?.workflow?.states) {
    return { nodes, edges, metadata: workflow?.workflow?.metadata };
  }

  const states = workflow.workflow.states;
  const forms = workflow.workflow.forms;
  const stateKeys = Object.keys(states);

  // Create nodes based on style preference
  if (opts.nodeStyle === "builder") {
    nodes.push(...createBuilderNodes(states, stateKeys, forms, opts));
  } else if (opts.nodeStyle === "viewer") {
    nodes.push(...createViewerNodes(states, stateKeys, forms, opts));
  } else {
    nodes.push(...createSimpleNodes(states, stateKeys, opts));
  }

  // Create edges with workflow builder's visual style
  edges.push(...createStyledEdges(states, stateKeys));

  return {
    nodes,
    edges,
    metadata: workflow.workflow.metadata,
  };
}

/**
 * Create nodes with workflow builder's style (ProcessNode/DecisionNode look)
 */
function createBuilderNodes(
  states: Record<string, State>,
  stateKeys: string[],
  forms: Record<string, Form> | undefined,
  opts: ParserOptions
): Node<BuilderNodeData>[] {
  return stateKeys.map((stateKey, index) => {
    const state = states[stateKey];
    const position = calculateNodePosition(index, stateKeys.length, opts);

    // Determine node type based on actions
    const nodeType = determineNodeType(state);

    if (nodeType === "decision") {
      // Create decision node
      const transitions = Object.entries(state.actions || {}).map(
        ([actionName, actionData]) => ({
          id: actionName,
          label: actionName,
          operation: actionData.operation,
        })
      );

      const nodeData: DecisionNodeData = {
        label: stateKey,
        internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, "_")}`,
        assignees: [],
        transitions,
        forms: extractFormNames(state),
      };

      return {
        id: stateKey,
        type: "decision",
        position,
        data: nodeData,
      };
    } else {
      // Create process node
      const actions = mapActionsToProcessNode(state);
      const stateFields = opts.includeFormData
        ? getStateFields(forms, state)
        : [];

      const nodeData: ProcessNodeData = {
        label: stateKey,
        internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, "_")}`,
        assignees: [],
        actions,
        forms: extractFormNames(state),
      };

      return {
        id: stateKey,
        type: "process",
        position,
        data: nodeData,
      };
    }
  });
}

/**
 * Create nodes with workflow viewer's style (StateNode look)
 */
function createViewerNodes(
  states: Record<string, State>,
  stateKeys: string[],
  forms: Record<string, Form> | undefined,
  opts: ParserOptions
): Node<StateNodeData>[] {
  return stateKeys.map((stateKey, index) => {
    const state = states[stateKey];
    const position = calculateNodePosition(index, stateKeys.length, opts);
    const stateFields = getStateFields(forms, state);
    const hasForm = stateFields.length > 0;

    const nodeData: StateNodeData = {
      label: stateKey,
      hasForm,
      fields: stateFields,
      internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, "_")}`,
    };

    return {
      id: stateKey,
      type: "stateNode",
      position,
      data: nodeData,
    };
  });
}

/**
 * Create simple nodes for basic visualization
 */
function createSimpleNodes(
  states: Record<string, State>,
  stateKeys: string[],
  opts: ParserOptions
): Node[] {
  return stateKeys.map((stateKey, index) => ({
    id: stateKey,
    type: "default",
    position: calculateNodePosition(index, stateKeys.length, opts),
    data: { label: stateKey },
  }));
}

/**
 * Calculate node position based on layout options
 */
function calculateNodePosition(
  index: number,
  total: number,
  opts: ParserOptions
): { x: number; y: number } {
  const { spacing, layoutDirection } = opts;

  if (layoutDirection === "vertical") {
    // Vertical layout
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: col * spacing!.horizontal,
      y: row * spacing!.vertical,
    };
  } else {
    // Horizontal layout (default)
    const rows = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / rows);
    const col = index % rows;
    return {
      x: col * spacing!.horizontal,
      y: row * spacing!.vertical,
    };
  }
}

/**
 * Create edges with workflow builder's visual styling
 */
function createStyledEdges(
  states: Record<string, State>,
  stateKeys: string[]
): Edge[] {
  const edges: Edge[] = [];
  const edgeCountMap = new Map<string, number>();
  const directedEdgeMap = new Map<string, number>();

  stateKeys.forEach((stateKey) => {
    const state = states[stateKey];
    if (!state?.actions) return;

    Object.entries(state.actions).forEach(([actionName, actionData]) => {
      if (!actionData?.nextState || !states[actionData.nextState]) return;

      // Determine edge styling based on action name
      const { stroke, strokeWidth, animated } = getEdgeStyle(actionName);

      // Track directed edges for proper curve handling
      const directedKey = `${stateKey}->${actionData.nextState}`;
      const reverseKey = `${actionData.nextState}->${stateKey}`;
      const hasReverseEdge = directedEdgeMap.has(reverseKey);
      const directedCount = directedEdgeMap.get(directedKey) || 0;
      directedEdgeMap.set(directedKey, directedCount + 1);

      // Determine edge type and handle positions
      const { sourceHandle, targetHandle, edgeType } = determineEdgeHandles(
        actionName,
        stateKey === actionData.nextState,
        hasReverseEdge
      );

      // Calculate curve properties for better edge separation
      const curveProps = calculateCurveProperties(
        hasReverseEdge,
        directedCount,
        stateKey === actionData.nextState
      );

      edges.push({
        id: `${stateKey}-${actionName}-${actionData.nextState}-${directedCount}`,
        source: stateKey,
        target: actionData.nextState,
        sourceHandle,
        targetHandle,
        label: actionName,
        type: edgeType,
        animated,
        style: {
          stroke,
          strokeWidth,
          ...curveProps.style,
        },
        labelStyle: {
          fill: "#1f2937",
          fontWeight: 600,
          fontSize: 14,
        },
        labelBgStyle: {
          fill: "#ffffff",
          fillOpacity: 1,
          padding: 4,
          borderRadius: 3,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        },
        labelShowBg: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
        },
        data: {
          operation: actionData.operation,
          ...curveProps.data,
        },
      });
    });
  });

  return edges;
}

/**
 * Determine node type based on state configuration
 */
function determineNodeType(state: State): "process" | "decision" {
  const actions = Object.keys(state.actions || {});

  // If has multiple distinct transitions, treat as decision
  if (actions.length > 3) return "decision";

  // Check for decision-like action names
  const hasDecisionActions = actions.some((action) =>
    /branch|condition|check|evaluate/i.test(action)
  );

  return hasDecisionActions ? "decision" : "process";
}

/**
 * Map state actions to ProcessNode action format
 */
function mapActionsToProcessNode(state: State): ProcessNodeData["actions"] {
  const actions = Object.entries(state.actions || {});
  const result: ProcessNodeData["actions"] = {
    left: { label: "Reject" },
    center: { label: "Submit" },
    right: { label: "Approve" },
  };

  actions.forEach(([actionName, actionData]) => {
    const lowerAction = actionName.toLowerCase();
    if (lowerAction.includes("reject") || lowerAction.includes("back")) {
      result.left = { label: actionName, operation: actionData.operation };
    } else if (
      lowerAction.includes("approve") ||
      lowerAction.includes("finalize") ||
      lowerAction.includes("complete")
    ) {
      result.right = { label: actionName, operation: actionData.operation };
    } else {
      result.center = { label: actionName, operation: actionData.operation };
    }
  });

  return result;
}

/**
 * Extract form names from state configuration
 */
function extractFormNames(state: State): string[] {
  if (!state.forms) return [];
  return state.forms
    .filter((form) => form.visibility !== "hidden")
    .map((form) => form.formName);
}

/**
 * Get state fields from forms (from workflow viewer logic)
 */
export function getStateFields(
  forms: Record<string, Form> | undefined,
  state: State
): StateFormField[] {
  if (!forms || !state.forms) return [];

  const allFields: StateFormField[] = [];

  state.forms.forEach((stateForm: StateForm) => {
    if (stateForm.visibility === "hidden") return;

    const form = forms[stateForm.formName];
    if (!form?.fields) return;

    form.fields.forEach((field) => {
      const fieldOverride: FieldOverride =
        stateForm.fieldOverrides?.[field.id] || {};

      if (fieldOverride.status === "hidden") return;

      const status = fieldOverride.status || "readonly";

      allFields.push({
        ...field,
        formName: stateForm.formName,
        stateConfig: {
          status,
          required: fieldOverride.required,
        },
      });
    });
  });

  return allFields;
}

/**
 * Determine edge visual style based on action name
 */
function getEdgeStyle(actionName: string): {
  stroke: string;
  strokeWidth: number;
  animated: boolean;
} {
  const lowerAction = actionName.toLowerCase();

  if (lowerAction.includes("reject") || lowerAction.includes("back")) {
    return { stroke: "#ef4444", strokeWidth: 2, animated: false };
  }

  if (
    lowerAction.includes("approve") ||
    lowerAction.includes("finalize") ||
    lowerAction.includes("complete")
  ) {
    return { stroke: "#10b981", strokeWidth: 2, animated: true };
  }

  return { stroke: "#6b7280", strokeWidth: 2, animated: false };
}

/**
 * Determine edge handles and type
 */
function determineEdgeHandles(
  actionName: string,
  isSelfLoop: boolean,
  hasReverseEdge: boolean
): {
  sourceHandle: string;
  targetHandle: string;
  edgeType: string;
} {
  const lowerAction = actionName.toLowerCase();
  let sourceHandle = "center"; // default
  const targetHandle = "target"; // always top

  if (lowerAction.includes("reject") || lowerAction.includes("back")) {
    sourceHandle = "left";
  } else if (
    lowerAction.includes("approve") ||
    lowerAction.includes("finalize") ||
    lowerAction.includes("complete")
  ) {
    sourceHandle = "right";
  }

  let edgeType = "smoothstep"; // default for clean routing
  if (isSelfLoop) {
    edgeType = "bezier";
  } else if (hasReverseEdge) {
    edgeType = "smoothstep"; // step edges handle bidirectional better
  }

  return { sourceHandle, targetHandle, edgeType };
}

/**
 * Calculate curve properties for edge separation
 */
function calculateCurveProperties(
  hasReverseEdge: boolean,
  directedCount: number,
  isSelfLoop: boolean
): {
  style: Record<string, any>;
  data: Record<string, any>;
} {
  const style: Record<string, any> = {};
  const data: Record<string, any> = {};

  if (isSelfLoop) {
    style.strokeDasharray = "3 3";
    data.curvature = 0.8;
  } else if (hasReverseEdge) {
    data.curvature = 0.5;
    data.offset = 40;
    data.labelOffset = 30;
  }

  if (directedCount > 0) {
    style.strokeDasharray = directedCount > 1 ? "5 5" : "10 5";
    data.offset = directedCount * 30;
    data.labelOffset = directedCount * 40;
    data.curvature = (data.curvature || 0) + directedCount * 0.2;
  }

  return { style, data };
}

/**
 * Export workflow from graph back to JSON format
 */
export function exportGraphToWorkflow(
  nodes: Node<BuilderNodeData>[],
  edges: Edge[]
): WorkflowConfig {
  const states: Record<string, State> = {};

  // Build states from nodes
  nodes.forEach((node) => {
    const state: State = {
      forms: [],
      actions: {},
    };

    // Add forms if present
    if ("forms" in node.data && node.data.forms) {
      state.forms = node.data.forms.map((formName) => ({
        formName,
        visibility: "visible",
      }));
    }

    // Build actions from edges
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);
    outgoingEdges.forEach((edge) => {
      const actionName = edge.label || `action_${edge.id}`;
      state.actions![actionName] = {
        nextState: edge.target,
        operation: edge.data?.operation,
      };
    });

    states[node.id] = state;
  });

  return {
    workflow: {
      states,
      forms: {},
    },
  };
}