import type {
  WorkflowData,
  WorkflowInstance,
  WorkflowHistoryEntry,
  WorkflowAssignee,
  Actor,
  FieldChange,
  WorkflowHistoryItem,
} from "../types/runningWorkflow.types";
import {
  getWorkflowStatus,
  getAllHistory,
  getWorkflowFormData,
  getWorkflowOwner,
  getCurrentAssignee,
} from "./runningWorkflowParser";

export function transformWorkflowToInstance(
  workflow: WorkflowData
): WorkflowInstance {
  const statusInfo = getWorkflowStatus(workflow);
  const historyEntries = getAllHistory(workflow);
  const fieldLookup = buildFieldNameLookup(workflow);

  const ownerAssignee = getWorkflowOwner(workflow);
  const currentAssignee = getCurrentAssignee(workflow) || ownerAssignee;

  const createdAt = historyEntries[0]?.at || workflow.workflow.currentStateEnteredAt;
  const updatedAt = historyEntries[historyEntries.length - 1]?.at || createdAt;

  const history: WorkflowHistoryItem[] = historyEntries.map((entry) =>
    convertHistoryEntry(entry, fieldLookup)
  );

  const metrics = buildMetrics(historyEntries, workflow);
  const watchers = collectWatchers(workflow, [ownerAssignee, currentAssignee]);

  return {
    id: workflow.workflow.id,
    workflowName: toTitleCase(workflow.workflow.id.replace(/_/g, " ")),
    currentState: workflow.workflow.currentState,
    status: statusInfo.status,
    priority: derivePriority(workflow),
    createdAt,
    updatedAt,
    completedAt:
      statusInfo.status === "completed"
        ? workflow.workflow.currentStateEnteredAt
        : undefined,
    dueDate: undefined,
    owner: assigneeToActor(ownerAssignee) || systemActor(),
    currentAssignee: assigneeToActor(currentAssignee),
    watchers,
    data: getWorkflowFormData(workflow),
    history,
    metrics,
    context: deriveContext(workflow),
  };
}

export function transformWorkflowsToInstances(
  workflows: WorkflowData[]
): WorkflowInstance[] {
  return workflows.map(transformWorkflowToInstance);
}

function convertHistoryEntry(
  entry: WorkflowHistoryEntry,
  fieldLookup: Record<string, string>
): WorkflowHistoryItem {
  return {
    id: entry.id,
    timestamp: entry.at,
    actor: {
      id: entry.byUser.id,
      name: entry.byUser.name,
      role: entry.byUser.role,
    },
    event: {
      type: resolveEventType(entry),
      action: formatAction(entry.action),
      from: entry.stateFrom || undefined,
      to: entry.stateTo || undefined,
      details: entry.changes?.length
        ? { changedFields: entry.changes.map((c) => c.fieldId) }
        : undefined,
    },
    changes: entry.changes?.map((change) => convertChange(change, fieldLookup)),
    metadata: {
      source: entry.byUser.role === "SYSTEM" ? "SYSTEM" : "UI",
    },
  };
}

function convertChange(
  change: NonNullable<WorkflowHistoryEntry["changes"]>[number],
  fieldLookup: Record<string, string>
): FieldChange {
  const changeType = resolveChangeType(change.old, change.new);

  return {
    fieldId: change.fieldId,
    fieldName: fieldLookup[change.fieldId],
    oldValue: change.old,
    newValue: change.new,
    changeType,
  };
}

function resolveChangeType(oldValue: unknown, newValue: unknown): FieldChange["changeType"] {
  if (oldValue === undefined || oldValue === null) return "CREATE";
  if (newValue === undefined || newValue === null) return "DELETE";
  return "UPDATE";
}

function assigneeToActor(assignee?: WorkflowAssignee): Actor | undefined {
  if (!assignee) return undefined;
  return {
    id: assignee.subjectId,
    name: assignee.employeeName,
    role: assignee.role,
    email: assignee.email,
  };
}

function systemActor(): Actor {
  return {
    id: "system",
    name: "Workflow Engine",
    role: "SYSTEM",
  };
}

function buildFieldNameLookup(workflow: WorkflowData): Record<string, string> {
  const lookup: Record<string, string> = {};

  Object.values(workflow.workflow.forms || {}).forEach((form) => {
    form.fields.forEach((field) => {
      lookup[field.id] = field.name;
    });
  });

  return lookup;
}

function resolveEventType(entry: WorkflowHistoryEntry): WorkflowHistoryItem["event"]["type"] {
  const action = entry.action.toLowerCase();

  if (action.includes("upload")) {
    return "DOCUMENT_UPLOAD";
  }
  if (action.includes("validate")) {
    return "VALIDATION_FAILURE";
  }
  if (action.includes("comment")) {
    return "COMMENT_ADDED";
  }
  if (action.includes("delegate")) {
    return "DELEGATION";
  }
  if (action.includes("escalate")) {
    return "ESCALATION";
  }
  if (action.includes("update")) {
    return "FIELD_UPDATE";
  }

  return "STATE_TRANSITION";
}

function buildMetrics(
  history: WorkflowHistoryEntry[],
  workflow: WorkflowData
): NonNullable<WorkflowInstance["metrics"]> {
  const sorted = [...history].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  const statesDuration: Record<string, number> = {};
  const stateEntryAt = new Map<string, number>();
  const revisitCount: Record<string, number> = {};

  sorted.forEach((entry) => {
    const timestamp = new Date(entry.at).getTime();

    if (entry.stateFrom && stateEntryAt.has(entry.stateFrom)) {
      const enteredAt = stateEntryAt.get(entry.stateFrom)!;
      const spent = Math.max(timestamp - enteredAt, 0);
      statesDuration[entry.stateFrom] = (statesDuration[entry.stateFrom] || 0) + spent;
    }

    if (entry.stateTo) {
      stateEntryAt.set(entry.stateTo, timestamp);
      revisitCount[entry.stateTo] = (revisitCount[entry.stateTo] || 0) + 1;
    }
  });

  const totalDuration = computeTotalDuration(sorted, workflow);

  return {
    totalDuration,
    statesDuration,
    revisitCount,
  };
}

function computeTotalDuration(
  history: WorkflowHistoryEntry[],
  workflow: WorkflowData
): number {
  if (!history.length) {
    return 0;
  }

  const firstTimestamp = new Date(history[0].at).getTime();
  const lastTimestamp = new Date(
    history[history.length - 1]?.at || workflow.workflow.currentStateEnteredAt
  ).getTime();

  return Math.max(lastTimestamp - firstTimestamp, 0);
}

function collectWatchers(
  workflow: WorkflowData,
  exclude: Array<WorkflowAssignee | undefined>
): Actor[] {
  const excludeIds = new Set(
    exclude.filter(Boolean).map((assignee) => assignee!.subjectId)
  );

  const unique = new Map<string, Actor>();

  Object.values(workflow.workflow.states || {}).forEach((state) => {
    (state.assignees || []).forEach((assignee) => {
      if (excludeIds.has(assignee.subjectId)) return;
      if (!unique.has(assignee.subjectId)) {
        unique.set(assignee.subjectId, assigneeToActor(assignee)!);
      }
    });
  });

  return Array.from(unique.values());
}

function derivePriority(workflow: WorkflowData): WorkflowInstance["priority"] {
  const state = workflow.workflow.currentState.toLowerCase();
  if (state.includes("escalation") || state.includes("critical")) {
    return "critical";
  }
  if (state.includes("review") || state.includes("approval")) {
    return "high";
  }
  if (state.includes("draft")) {
    return "medium";
  }
  return "medium";
}

function deriveContext(
  workflow: WorkflowData
): NonNullable<WorkflowInstance["context"]> {
  const [category, ...rest] = workflow.workflow.id.split("_");
  const tags = new Set<string>();
  tags.add(workflow.workflow.currentState);
  tags.add(workflow.workflow.initialState);

  rest.forEach((segment) => {
    if (segment) tags.add(segment);
  });

  return {
    businessUnit: category,
    category,
    tags: Array.from(tags),
    externalReferences: {},
  };
}

function formatAction(action: string): string {
  return action
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
