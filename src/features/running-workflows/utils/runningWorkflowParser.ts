import type { Node, Edge } from "reactflow";
import type {
  WorkflowData,
  WorkflowDataWrapper,
  WorkflowHistoryEntry,
  WorkflowAssignee,
  RunningWorkflowNodeData,
} from "../types/runningWorkflow.types";

export type { WorkflowData, WorkflowDataWrapper } from "../types/runningWorkflow.types";

type WorkflowStatusKey = "active" | "completed" | "pending" | "rejected";

interface WorkflowStatusInfo {
  status: WorkflowStatusKey;
  label: string;
  color: string;
}

/**
 * Lenient validation - accepts partial workflow data
 */
export function validateWorkflowData(data: unknown): data is WorkflowData {
  try {
    if (!data || typeof data !== 'object') return false;
    
    const d = data as Record<string, unknown>;
    
    // Only check for essential fields
    const hasRequiredFields = !!(
      d.id &&
      typeof d.id === 'string' &&
      d.currentState &&
      typeof d.currentState === 'string' &&
      d.initialState &&
      typeof d.initialState === 'string' &&
      d.states &&
      typeof d.states === 'object' &&
      d.forms &&
      typeof d.forms === 'object'
    );
    
    return hasRequiredFields;
  } catch {
    return false;
  }
}

/**
 * Normalizes workflow data to wrapper format for backward compatibility
 */
export function normalizeWorkflowData(data: WorkflowData | WorkflowDataWrapper): WorkflowDataWrapper {
  try {
    if ('workflow' in data) return data;
    return { workflow: data };
  } catch {
    // Return a minimal valid structure if normalization fails
    return { workflow: data as WorkflowData };
  }
}

const STATUS_META: Record<WorkflowStatusKey, { label: string; color: string }> = {
  active: { label: "In Progress", color: "#3b82f6" },
  completed: { label: "Completed", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

export function parseRunningWorkflowToGraph(
  data: WorkflowData | WorkflowDataWrapper
): {
  nodes: Node<RunningWorkflowNodeData>[];
  edges: Edge[];
} {
  try {
    const nodes: Node<RunningWorkflowNodeData>[] = [];
    const edges: Edge[] = [];

    const workflow = 'workflow' in data ? data.workflow : data;

    if (!workflow?.states) {
      return { nodes, edges };
    }

    const states = workflow.states;
    const history = getAllHistory(workflow);

    const visitedStates = new Set<string>();
    const entryInfo = new Map<string, { timestamp: string; actor: string }>();

    history.forEach((entry) => {
      if (entry.stateFrom) visitedStates.add(entry.stateFrom);
      if (entry.stateTo) {
        visitedStates.add(entry.stateTo);
        if (!entryInfo.has(entry.stateTo)) {
          entryInfo.set(entry.stateTo, {
            timestamp: entry.at,
            actor: entry.byUser?.name || entry.byUser?.email || entry.byUser?.id || "System",
          });
        }
      }
    });

    const nodesPerRow = 3;
    const xSpacing = 300;
    const ySpacing = 250;

    // Only create nodes for states that exist
    Object.keys(states).forEach((stateKey, index) => {
      try {
        let status: "visited" | "current" | "pending" = "pending";
        let visitedAt: string | undefined;
        let performedBy: string | undefined;

        if (stateKey === workflow.currentState) {
          status = "current";
          const info = entryInfo.get(stateKey);
          visitedAt = info?.timestamp || workflow.currentStateEnteredAt;
          performedBy = info?.actor;
        } else if (visitedStates.has(stateKey)) {
          status = "visited";
          const info = entryInfo.get(stateKey);
          visitedAt = info?.timestamp;
          performedBy = info?.actor;
        }

        nodes.push({
          id: stateKey,
          type: "runningStateNode",
          position: {
            x: xSpacing * (index % nodesPerRow),
            y: ySpacing * Math.floor(index / nodesPerRow),
          },
          data: {
            label: stateKey,
            status,
            visitedAt,
            performedBy,
            data: status === "current" ? getWorkflowFormData(workflow) : undefined,
          },
        });
      } catch {
        // Skip invalid nodes
      }
    });

    const executedTransitions = new Set<string>();
    const actionLabels = new Map<string, string>();

    history.forEach((entry) => {
      if (entry.stateFrom && entry.stateTo) {
        const transitionKey = `${entry.stateFrom}-${entry.stateTo}`;
        executedTransitions.add(transitionKey);
        if (entry.action) {
          actionLabels.set(transitionKey, entry.action);
        }
      }
    });

    // Only create edges for states that exist
    Object.entries(states).forEach(([stateKey, state]) => {
      try {
        if (!state?.actions) return;

        Object.entries(state.actions).forEach(([actionName, actionData]) => {
          if (!actionData?.nextState) return;
          
          // Only create edge if target state exists
          if (!states[actionData.nextState]) return;

          const targetState = actionData.nextState;
          const transitionKey = `${stateKey}-${targetState}`;
          const isExecuted = executedTransitions.has(transitionKey);
          const executedLabel = actionLabels.get(transitionKey);
          const stroke = getEdgeStroke(actionName, isExecuted);

          edges.push({
            id: `${stateKey}-${actionName}-${targetState}`,
            source: stateKey,
            target: targetState,
            label: formatActionLabel(executedLabel || actionName),
            type: "smoothstep",
            animated: isExecuted && targetState === workflow.currentState,
            style: {
              stroke,
              strokeWidth: isExecuted ? 3 : 2,
              opacity: isExecuted ? 1 : 0.6,
            },
            data: {
              label: formatActionLabel(executedLabel || actionName),
              operation: actionData.operation,
              executed: isExecuted,
            },
          });
        });
      } catch {
        // Skip invalid edges
      }
    });

    return { nodes, edges };
  } catch {
    // Return empty graph on error
    return { nodes: [], edges: [] };
  }
}

export function getWorkflowStatus(data: WorkflowData | WorkflowDataWrapper): WorkflowStatusInfo {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    return toStatusInfo(resolveWorkflowStatus(workflow));
  } catch {
    return toStatusInfo("pending");
  }
}

export function calculateProgress(data: WorkflowData | WorkflowDataWrapper): number {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    const states = workflow.states;
    const totalStates = Object.keys(states || {}).length;
    if (!totalStates) return 0;

    const history = getAllHistory(workflow);
    const visited = new Set<string>();

    history.forEach((entry) => {
      if (entry.stateFrom) visited.add(entry.stateFrom);
      if (entry.stateTo) visited.add(entry.stateTo);
    });

    if (workflow.initialState && states[workflow.initialState]) {
      visited.add(workflow.initialState);
    }

    if (workflow.currentState && states[workflow.currentState]) {
      visited.add(workflow.currentState);
    }

    // Only count states that actually exist
    const validVisited = Array.from(visited).filter(state => states[state]);
    return Math.min(100, Math.round((validVisited.length / totalStates) * 100));
  } catch {
    return 0;
  }
}

export function getAllHistory(data: WorkflowData | WorkflowDataWrapper): WorkflowHistoryEntry[] {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    const stateEntries = Object.values(workflow.states || {});
    const combined = stateEntries.flatMap((state) => state?.history || []);

    return combined.sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
    );
  } catch {
    return [];
  }
}

export function getHistoryForState(
  data: WorkflowData | WorkflowDataWrapper,
  stateId: string
): WorkflowHistoryEntry[] {
  try {
    return getAllHistory(data).filter(
      (entry) => entry.stateFrom === stateId || entry.stateTo === stateId
    );
  } catch {
    return [];
  }
}

export function getWorkflowFormData(data: WorkflowData | WorkflowDataWrapper): Record<string, unknown> {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    const currentState = workflow.currentState;
    const formData: Record<string, unknown> = {};
    const forms = workflow.forms || {};
    
    // Check if current state exists
    if (!workflow.states || !workflow.states[currentState]) {
      return formData;
    }
    
    const stateConfig = workflow.states[currentState];

    // If forms is explicitly set to empty array, don't use any forms
    // If forms is undefined/null, fallback to all forms
    const formRefs = stateConfig?.forms !== undefined
      ? stateConfig.forms
      : Object.keys(forms).map((name) => ({ formName: name }));

    formRefs.forEach((formRef: { formName: string }) => {
      try {
        const form = forms[formRef.formName];
        if (!form?.fields) return;

        form.fields.forEach((field: { id: string; data: unknown }) => {
          formData[field.id] = field.data;
        });
      } catch {
        // Skip invalid forms
      }
    });

    return formData;
  } catch {
    return {};
  }
}

export function getFormDataForState(
  data: WorkflowData | WorkflowDataWrapper,
  stateId: string
): Record<string, unknown> {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    const formData: Record<string, unknown> = {};
    const forms = workflow.forms || {};
    
    // Check if state exists
    if (!workflow.states || !workflow.states[stateId]) {
      return formData;
    }
    
    const stateConfig = workflow.states[stateId];

    if (!stateConfig?.forms?.length) {
      return formData;
    }

    stateConfig.forms.forEach((formRef: { formName: string }) => {
      try {
        const form = forms[formRef.formName];
        if (!form?.fields) return;

        form.fields.forEach((field: { id: string; data: unknown }) => {
          formData[field.id] = field.data;
        });
      } catch {
        // Skip invalid forms
      }
    });

    return formData;
  } catch {
    return {};
  }
}

export function getCurrentAssignee(data: WorkflowData | WorkflowDataWrapper): WorkflowAssignee | undefined {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    const currentState = workflow.currentState;
    
    if (!currentState || !workflow.states?.[currentState]) {
      return undefined;
    }
    
    const assignees = workflow.states[currentState]?.assignees;
    return selectPrimaryAssignee(assignees);
  } catch {
    return undefined;
  }
}

export function getWorkflowOwner(data: WorkflowData | WorkflowDataWrapper): WorkflowAssignee | undefined {
  try {
    const workflow = 'workflow' in data ? data.workflow : data;
    const initialState = workflow.initialState;
    
    if (!initialState || !workflow.states?.[initialState]) {
      return undefined;
    }
    
    const assignees = workflow.states[initialState]?.assignees;
    return selectPrimaryAssignee(assignees);
  } catch {
    return undefined;
  }
}

export function getStatusInfo(data: WorkflowData | WorkflowDataWrapper): WorkflowStatusInfo {
  return getWorkflowStatus(data);
}

function selectPrimaryAssignee(
  assignees?: WorkflowAssignee[]
): WorkflowAssignee | undefined {
  if (!assignees || assignees.length === 0) return undefined;
  return assignees.find((assignee) => assignee.primary) || assignees[0];
}

function resolveWorkflowStatus(workflow: WorkflowData): WorkflowStatusKey {
  const currentState = workflow.currentState?.toLowerCase() || "";

  if (currentState.includes("complete")) {
    return "completed";
  }

  if (currentState.includes("reject")) {
    return "rejected";
  }

  const history = getAllHistory(workflow);
  if (history.length === 0) {
    return "pending";
  }

  const lastAction = history[history.length - 1]?.action?.toLowerCase() || "";

  if (
    lastAction.includes("approve") ||
    lastAction.includes("finalize") ||
    lastAction.includes("complete")
  ) {
    return "completed";
  }

  if (
    lastAction.includes("reject") ||
    lastAction.includes("sendback") ||
    lastAction.includes("decline")
  ) {
    return "rejected";
  }

  return "active";
}

function toStatusInfo(status: WorkflowStatusKey): WorkflowStatusInfo {
  const meta = STATUS_META[status];
  return {
    status,
    label: meta.label,
    color: meta.color,
  };
}

function formatActionLabel(action: string): string {
  return action
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getEdgeStroke(actionName: string, executed: boolean): string {
  if (!executed) return "#d1d5db";

  const lower = actionName.toLowerCase();
  if (lower.includes("reject") || lower.includes("sendback") || lower.includes("return")) {
    return "#ef4444";
  }
  if (
    lower.includes("approve") ||
    lower.includes("finalize") ||
    lower.includes("recommend") ||
    lower.includes("complete")
  ) {
    return "#10b981";
  }
  if (lower.includes("submit")) {
    return "#3b82f6";
  }
  return "#6b7280";
}