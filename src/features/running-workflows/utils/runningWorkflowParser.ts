// src/features/running-workflows/utils/runningWorkflowParser.ts

import type { Node, Edge } from "reactflow";
import type { WorkflowInstance } from "../types/runningWorkflow.types";
import type { WorkflowConfig } from "@features/workflow/types/workflow.types";

interface RunningNodeData {
  label: string;
  status: "visited" | "current" | "pending";
  visitedAt?: string;
  performedBy?: string;
  data?: Record<string, any>;
}

export function parseRunningWorkflowToGraph(
  instance: WorkflowInstance,
  workflowConfig: WorkflowConfig
): {
  nodes: Node<RunningNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<RunningNodeData>[] = [];
  const edges: Edge[] = [];

  if (!workflowConfig?.workflow?.states) {
    return { nodes, edges };
  }

  const states = workflowConfig.workflow.states;
  const stateKeys = Object.keys(states);
  
  // Get visited states from new history format
  const visitedStates = new Set<string>();
  instance.history.forEach(h => {
    if (h.event.to) visitedStates.add(h.event.to);
    if (h.event.from) visitedStates.add(h.event.from);
  });
  
  // Create nodes with status
  stateKeys.forEach((stateKey, index) => {
    let status: "visited" | "current" | "pending" = "pending";
    let visitedAt: string | undefined;
    let performedBy: string | undefined;
    
    if (stateKey === instance.currentState) {
      status = "current";
    } else if (visitedStates.has(stateKey)) {
      status = "visited";
      const historyItem = instance.history.find(h => h.event.to === stateKey);
      visitedAt = historyItem?.timestamp;
      performedBy = historyItem?.actor.email;
    }

    nodes.push({
      id: stateKey,
      type: "runningStateNode",
      position: {
        x: 300 * (index % 3),
        y: 250 * Math.floor(index / 3),
      },
      data: {
        label: stateKey,
        status,
        visitedAt,
        performedBy,
        data: status === "current" ? instance.data : undefined,
      },
    });
  });

  // Create edges with execution status
  const executedActions = new Set<string>();
  instance.history.forEach((item) => {
    if (item.event.action && item.event.from && item.event.to) {
      executedActions.add(`${item.event.from}-${item.event.action}-${item.event.to}`);
    }
  });

  stateKeys.forEach((stateKey) => {
    const state = states[stateKey];
    if (state?.actions && typeof state.actions === "object") {
      Object.entries(state.actions).forEach(([actionName, actionData]) => {
        if (actionData?.nextState && states[actionData.nextState]) {
          const edgeId = `${stateKey}-${actionName}-${actionData.nextState}`;
          const isExecuted = executedActions.has(edgeId);
          
          let stroke = "#d1d5db"; // Default gray
          if (isExecuted) {
            if (actionName.includes("Reject")) {
              stroke = "#ef4444"; // Red for reject
            } else if (actionName.includes("Approve") || actionName.includes("Finalize")) {
              stroke = "#10b981"; // Green for approve
            } else {
              stroke = "#3b82f6"; // Blue for normal executed
            }
          }

          edges.push({
            id: edgeId,
            source: stateKey,
            target: actionData.nextState,
            label: actionName,
            type: "smoothstep",
            animated: isExecuted,
            style: { 
              stroke,
              strokeWidth: isExecuted ? 3 : 1,
              opacity: isExecuted ? 1 : 0.3,
            },
            data: { 
              operation: actionData.operation,
              executed: isExecuted,
            },
          });
        }
      });
    }
  });

  return { nodes, edges };
}

export function getStatusInfo(instance: WorkflowInstance) {
  const statusColors = {
    active: "#3b82f6",
    completed: "#10b981",
    pending: "#f59e0b",
    rejected: "#ef4444",
  };

  const statusLabels = {
    active: "In Progress",
    completed: "Completed",
    pending: "Pending",
    rejected: "Rejected",
  };

  return {
    color: statusColors[instance.status],
    label: statusLabels[instance.status],
  };
}

export function calculateProgress(instance: WorkflowInstance, totalStates: number): number {
  const visitedStates = new Set<string>();
  instance.history.forEach(h => {
    if (h.event.to) visitedStates.add(h.event.to);
    if (h.event.from) visitedStates.add(h.event.from);
  });
  return Math.round((visitedStates.size / totalStates) * 100);
}