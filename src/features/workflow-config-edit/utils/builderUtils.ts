import type { Edge, Node } from "reactflow";
import type {
  BuilderNodeData,
  ProcessNodeData,
  DecisionNodeData,
  WorkflowBuilderConfig,
} from "@features/workflow-config-edit/types/builder.types";

/**
 * Basic validation helpers for the visual builder.
 * Returns an array of error messages (empty when valid).
 */
export function validateWorkflow(
  nodes: Node<BuilderNodeData>[],
  edges: Edge<unknown>[]
): string[] {
  const errors: string[] = [];

  if (nodes.length === 0) {
    errors.push("Add at least one state to the workflow.");
    return errors;
  }

  const nodeIds = new Set(nodes.map((node) => node.id));

  edges.forEach((edge) => {
    if (!edge.source || !nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} has an invalid source state.`);
    }
    if (!edge.target || !nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} has an invalid target state.`);
    }
    if (!edge.label) {
      errors.push(`Edge ${edge.id} is missing a label.`);
    }
  });

  nodes.forEach((node) => {
    if (!node.data?.label) {
      errors.push(`State ${node.id} must have a name.`);
    }

    if (node.type === "process") {
      const data = node.data as ProcessNodeData;
      if (!data.actions.center?.label) {
        errors.push(`Process state ${node.data.label} needs a submit action label.`);
      }
    }

    if (node.type === "decision") {
      const data = node.data as DecisionNodeData;
      if (!data.transitions || data.transitions.length === 0) {
        errors.push(`Decision state ${node.data.label} requires at least one transition.`);
      }
    }
  });

  return errors;
}

/**
 * Export the builder graph into a light-weight workflow schema
 * that can be saved or inspected by other parts of the app.
 */
export function exportToWorkflowJson(
  nodes: Node<BuilderNodeData>[],
  edges: Edge<unknown>[]
): WorkflowBuilderConfig {
  const states: WorkflowBuilderConfig["workflow"]["states"] = {};

  const outgoingEdges = edges.reduce<Record<string, Edge<unknown>[]>>((acc, edge) => {
    if (!acc[edge.source]) {
      acc[edge.source] = [];
    }
    acc[edge.source].push(edge);
    return acc;
  }, {});

  nodes.forEach((node) => {
    if (node.type === "process") {
      const data = node.data as ProcessNodeData;
      const transitions = outgoingEdges[node.id] || [];
      const actions = transitions.reduce<Record<string, { nextState: string; operation?: string }>>(
        (acc, edge, index) => {
          const defaultHandles = ["left", "center", "right"];
          const key = edge.sourceHandle || defaultHandles[index] || `transition_${index + 1}`;
          acc[key] = {
            nextState: edge.target,
            operation: (edge.data as { operation?: string } | undefined)?.operation,
          };
          return acc;
        },
        {}
      );

      states[node.id] = {
        forms: data.forms?.map((formName) => ({ formName })) ?? [],
        actions,
      };
    } else if (node.type === "decision") {
      const data = node.data as DecisionNodeData;
      const transitions = outgoingEdges[node.id] || [];
      const actions = transitions.reduce<Record<string, { nextState: string; operation?: string }>>(
        (acc, edge, index) => {
          const transitionMeta = data.transitions[index];
          const key = transitionMeta?.id || edge.sourceHandle || `transition_${index + 1}`;
          acc[key] = {
            nextState: edge.target,
            operation: transitionMeta?.operation,
          };
          return acc;
        },
        {}
      );

      states[node.id] = {
        forms: data.forms?.map((formName) => ({ formName })) ?? [],
        actions,
      };
    }
  });

  const workflow: WorkflowBuilderConfig["workflow"] = {
    forms: {},
    states,
    startState: nodes[0]?.id,
  };

  return { workflow };
}
