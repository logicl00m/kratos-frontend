import type { Node, Edge } from "reactflow";
import type {
  WorkflowData,
  WorkflowHistoryEntry,
  WorkflowAssignee,
  RunningWorkflowNodeData,
} from "../types/runningWorkflow.types";

type WorkflowStatusKey = "active" | "completed" | "pending" | "rejected";

interface WorkflowStatusInfo {
  status: WorkflowStatusKey;
  label: string;
  color: string;
}

const STATUS_META: Record<WorkflowStatusKey, { label: string; color: string }> = {
  active: { label: "In Progress", color: "#3b82f6" },
  completed: { label: "Completed", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

export function parseRunningWorkflowToGraph(
  workflow: WorkflowData
): {
  nodes: Node<RunningWorkflowNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<RunningWorkflowNodeData>[] = [];
  const edges: Edge[] = [];

  if (!workflow?.workflow?.states) {
    return { nodes, edges };
  }

  const states = workflow.workflow.states;
  const history = getAllHistory(workflow);

  const visitedStates = new Set<string>();
  const entryInfo = new Map<string, { timestamp: string; actor: string }>();

  history.forEach((entry) => {
    if (entry.stateFrom) {
      visitedStates.add(entry.stateFrom);
    }
    if (entry.stateTo) {
      visitedStates.add(entry.stateTo);
      if (!entryInfo.has(entry.stateTo)) {
        entryInfo.set(entry.stateTo, {
          timestamp: entry.at,
          actor:
            entry.byUser?.name || entry.byUser?.email || entry.byUser?.id || "System",
        });
      }
    }
  });

  const nodesPerRow = 3;
  const xSpacing = 300;
  const ySpacing = 250;

  Object.keys(states).forEach((stateKey, index) => {
    let status: "visited" | "current" | "pending" = "pending";
    let visitedAt: string | undefined;
    let performedBy: string | undefined;

    if (stateKey === workflow.workflow.currentState) {
      status = "current";
      const info = entryInfo.get(stateKey);
      visitedAt = info?.timestamp || workflow.workflow.currentStateEnteredAt;
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

  Object.entries(states).forEach(([stateKey, state]) => {
    if (!state?.actions) return;

    Object.entries(state.actions).forEach(([actionName, actionData]) => {
      if (!actionData?.nextState || !states[actionData.nextState]) return;

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
        animated: isExecuted && targetState === workflow.workflow.currentState,
        style: {
          stroke,
          strokeWidth: isExecuted ? 2 : 1,
          opacity: isExecuted ? 1 : 0.4,
        },
        labelStyle: {
          fill: isExecuted ? stroke : "#9ca3af",
          fontWeight: isExecuted ? 500 : 400,
          fontSize: 11,
        },
        data: {
          operation: actionData.operation,
          executed: isExecuted,
        },
      });
    });
  });

  return { nodes, edges };
}

export function getWorkflowStatus(workflow: WorkflowData): WorkflowStatusInfo {
  return toStatusInfo(resolveWorkflowStatus(workflow));
}

export function calculateProgress(workflow: WorkflowData): number {
  const states = workflow.workflow.states;
  const totalStates = Object.keys(states || {}).length;
  if (!totalStates) return 0;

  const history = getAllHistory(workflow);
  const visited = new Set<string>();

  history.forEach((entry) => {
    if (entry.stateFrom) visited.add(entry.stateFrom);
    if (entry.stateTo) visited.add(entry.stateTo);
  });

  if (workflow.workflow.initialState) {
    visited.add(workflow.workflow.initialState);
  }

  if (workflow.workflow.currentState) {
    visited.add(workflow.workflow.currentState);
  }

  return Math.min(100, Math.round((visited.size / totalStates) * 100));
}

export function getAllHistory(workflow: WorkflowData): WorkflowHistoryEntry[] {
  const stateEntries = Object.values(workflow.workflow.states || {});
  const combined = stateEntries.flatMap((state) => state.history || []);

  return combined.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

export function getWorkflowFormData(workflow: WorkflowData): Record<string, unknown> {
  const currentState = workflow.workflow.currentState;
  const formData: Record<string, unknown> = {};
  const forms = workflow.workflow.forms || {};
  const stateConfig = workflow.workflow.states[currentState];

  const formRefs = stateConfig?.forms?.length
    ? stateConfig.forms
    : Object.keys(forms).map((name) => ({ formName: name }));

  formRefs.forEach((formRef) => {
    const form = forms[formRef.formName];
    if (!form?.fields) return;

    form.fields.forEach((field) => {
      formData[field.id] = field.data;
    });
  });

  return formData;
}

export function getCurrentAssignee(workflow: WorkflowData): WorkflowAssignee | undefined {
  const currentState = workflow.workflow.currentState;
  const assignees = workflow.workflow.states[currentState]?.assignees;
  return selectPrimaryAssignee(assignees);
}

export function getWorkflowOwner(workflow: WorkflowData): WorkflowAssignee | undefined {
  const initialState = workflow.workflow.initialState;
  const assignees = workflow.workflow.states[initialState]?.assignees;
  return selectPrimaryAssignee(assignees);
}

export function getStatusInfo(workflow: WorkflowData): WorkflowStatusInfo {
  return getWorkflowStatus(workflow);
}

function selectPrimaryAssignee(
  assignees?: WorkflowAssignee[]
): WorkflowAssignee | undefined {
  if (!assignees || assignees.length === 0) return undefined;
  return assignees.find((assignee) => assignee.primary) || assignees[0];
}

function resolveWorkflowStatus(workflow: WorkflowData): WorkflowStatusKey {
  const currentState = workflow.workflow.currentState?.toLowerCase() || "";

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
