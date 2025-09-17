// src/features/workflow/utils/graphParser.ts
import type { Node, Edge } from "reactflow";
import type { WorkflowConfig, StateFormField, StateFieldConfig } from "@features/workflow/types/workflow.types";

export function parseWorkflowToGraph(workflow: WorkflowConfig): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!workflow?.Workflow?.States) {
    return { nodes, edges };
  }

  const states = workflow.Workflow.States;
  const globalForm = workflow.Workflow.Form;
  const stateKeys = Object.keys(states);

  // Create nodes
  stateKeys.forEach((stateKey, index) => {
    const state = states[stateKey];
    
    // Get all fields for this state (except hidden ones)
    const stateFields = getStateFields(globalForm, state);
    const hasForm = stateFields.length > 0;

    nodes.push({
      id: stateKey,
      type: "stateNode",
      position: {
        x: 250 * (index % 3),
        y: 200 * Math.floor(index / 3),
      },
      data: {
        label: stateKey,
        hasForm,
        fields: stateFields,
      },
    });
  });

  // Create edges from Actions
  stateKeys.forEach((stateKey) => {
    const state = states[stateKey];
    if (state?.Actions && typeof state.Actions === "object") {
      Object.entries(state.Actions).forEach(([actionName, actionData]) => {
        if (actionData?.NextState && states[actionData.NextState]) {
          let stroke = "#6b7280";
          if (actionName.includes("Reject")) {
            stroke = "#ef4444";
          } else if (actionName.includes("Approve")) {
            stroke = "#10b981";
          }
          edges.push({
            id: `${stateKey}-${actionName}-${actionData.NextState}`,
            source: stateKey,
            target: actionData.NextState,
            label: actionName,
            type: "smoothstep",
            animated: true,
            style: { stroke },
            data: { operation: actionData.Operation },
          });
        }
      });
    }
  });

  return { nodes, edges };
}

export function getStateFields(
  globalForm: WorkflowConfig["Workflow"]["Form"], 
  state: WorkflowConfig["Workflow"]["States"][string]
): StateFormField[] {
  if (!globalForm?.Fields) return [];
  
  // ALL fields are visible by default unless explicitly hidden
  return globalForm.Fields
    .map(field => {
      const fieldConfig: StateFieldConfig = state.Fields?.[field.ID] || {};
      
      // Default status is "editable" if not specified
      const status = fieldConfig.status || "editable";
      
      // Skip hidden fields
      if (status === "hidden") return null;
      
      return {
        ...field,
        stateConfig: {
          ...fieldConfig,
          status,
          // For backward compatibility
          editable: status === "editable",
          visible: status !== "hidden",
        },
        // Override field actions if specified
        FieldActions: fieldConfig.overrideActions || field.FieldActions,
      } as StateFormField;
    })
    .filter(field => field !== null) as StateFormField[];
}
