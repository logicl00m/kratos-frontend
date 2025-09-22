// src/features/application-details/services/applicationDetailsService.ts
import { workflowInstanceApi } from "@/lib/api";
import type { ApplicationInstance, ApplicationEvent } from "@/lib/api";
import { mockWorkflowData } from "@features/dashboard/data/mockWorkflowData";
import type { WorkflowData } from "@features/dashboard/types/dashboard.types";

function findMock(id: string): WorkflowData | undefined {
  return mockWorkflowData.find((w) => w.workflow.id === id);
}

function extractFormData(forms: WorkflowData["workflow"]["forms"]): Record<string, string | number | boolean | object> {
  const data: Record<string, string | number | boolean | object> = {};
  Object.values(forms || {}).forEach((form) => {
    form.fields?.forEach((field) => {
      const v = field.data as unknown;
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        (typeof v === "object" && v !== null)
      ) {
        data[field.id] = v as Record<string, unknown> | string | number | boolean;
      }
    });
  });
  return data;
}

function getCurrentAssigneeName(wf: WorkflowData["workflow"]): string | undefined {
  const state = wf.states[wf.currentState];
  return state?.assignees?.[0]?.employeeName ?? undefined;
}

function toApplicationInstance(mock: WorkflowData): ApplicationInstance {
  const wf = mock.workflow;
  const status: ApplicationInstance["status"] =
    wf.currentState === "Completed" ? "completed" : "pending";
  const slaStatus: ApplicationInstance["metadata"]["slaStatus"] =
    status === "completed" ? "completed" : "on-time";
  return {
    id: wf.id,
    workflowId: wf.id,
    currentState: wf.currentState,
    status,
    assignee: getCurrentAssigneeName(wf),
    data: extractFormData(wf.forms),
    history: toApplicationHistory(mock),
    metadata: {
      createdAt: new Date(
        new Date(wf.currentStateEnteredAt).getTime() - 48 * 3600 * 1000
      ).toISOString(),
      updatedAt: wf.currentStateEnteredAt,
      slaStatus,
      priority: "medium",
    },
  };
}

function toApplicationHistory(mock: WorkflowData): ApplicationEvent[] {
  const events: ApplicationEvent[] = [];
  const wf = mock.workflow;
  // Convert state histories when available
  Object.values(wf.states || {}).forEach((state) => {
    state.history?.forEach((h) => {
      events.push({
        id: h.id || `${wf.id}-${h.at}`,
        type: "state_change",
        timestamp: h.at,
        user: h.byUser?.name || "System",
        details: {
          fromState: h.stateFrom || undefined,
          toState: h.stateTo || undefined,
        },
      });
    });
  });
  // Ensure at least a created and entered-current-state event
  if (!events.length) {
    const createdAt = new Date(
      new Date(wf.currentStateEnteredAt).getTime() - 72 * 3600 * 1000
    ).toISOString();
    events.push({
      id: `${wf.id}-created`,
      type: "state_change",
      timestamp: createdAt,
      user: "System",
      details: { toState: wf.initialState || "ARMDraft" },
    });
  }
  events.push({
    id: `${wf.id}-entered-${wf.currentState}`,
    type: "state_change",
    timestamp: wf.currentStateEnteredAt,
    user: getCurrentAssigneeName(wf) || "System",
    details: { toState: wf.currentState },
  });
  // Order by time asc
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return events;
}
function toDocuments(mock: WorkflowData): Array<{ name: string; type: string; size: number }> {
  const docs: Array<{ name: string; type: string; size: number }> = [];
  Object.values(mock.workflow.forms || {}).forEach((form) => {
    form.fields?.forEach((f) => {
      if (f.type === "file" && Array.isArray(f.data)) {
        f.data.forEach((d: { name: string }) => {
          docs.push({ name: d.name, type: "application/pdf", size: 0 });
        });
      }
    });
  });
  return docs;
}

export const applicationDetailsService = {
  /**
   * Fetch application details by ID
   */
  async getApplicationDetails(id: string): Promise<ApplicationInstance> {
    try {
      const response = await workflowInstanceApi.get(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch application details for ID: ${id}`);
    } catch (error) {
      // Fallback to mock data as source of truth
      const mock = findMock(id);
      if (mock) {
        return toApplicationInstance(mock);
      }
      console.error("Error fetching application details:", error);
      throw error;
    }
  },

  /**
   * Fetch application history/audit trail
   */
  async getApplicationHistory(id: string) {
    try {
      const response = await workflowInstanceApi.getHistory(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch application history for ID: ${id}`);
    } catch (error) {
      // Fallback to mock data history
      const mock = findMock(id);
      if (mock) {
        return toApplicationHistory(mock);
      }
      console.error("Error fetching application history:", error);
      throw error;
    }
  },

  /**
   * Fetch application documents
   */
  async getApplicationDocuments(id: string) {
    try {
      const response = await workflowInstanceApi.getDocuments(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch application documents for ID: ${id}`);
    } catch (error) {
      // Fallback to mock documents from forms
      const mock = findMock(id);
      if (mock) {
        return toDocuments(mock);
      }
      console.error("Error fetching application documents:", error);
      throw error;
    }
  },

  /**
   * Add a comment to an application
   */
  async addComment(id: string, comment: string) {
    try {
      const response = await workflowInstanceApi.addComment(id, comment);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to add comment to application ID: ${id}`);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  /**
   * Upload a document to an application
   */
  async uploadDocument(id: string, file: File, documentType?: string) {
    try {
      const response = await workflowInstanceApi.uploadDocument(id, file, documentType);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to upload document to application ID: ${id}`);
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }
};