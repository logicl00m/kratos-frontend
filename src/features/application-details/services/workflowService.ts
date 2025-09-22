// src/features/application-details/services/workflowService.ts
import { workflowInstanceApi } from "@lib/api/endpoints/workflow";
import type { ApplicationInstance } from "@lib/api/types";

export const workflowService = {
  /**
   * Get available actions for a workflow instance
   */
  async getAvailableActions(id: string) {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll return a mock response
      return [
        {
          id: "approve",
          label: "Approve",
          type: "primary" as const,
          requiresComment: false,
          requiresAssignee: false,
          targetState: "Approved",
        },
        {
          id: "reject",
          label: "Reject",
          type: "danger" as const,
          requiresComment: true,
          requiresAssignee: false,
          targetState: "Rejected",
        },
        {
          id: "assign",
          label: "Assign",
          type: "secondary" as const,
          requiresComment: false,
          requiresAssignee: true,
          targetState: "Assigned",
        },
        {
          id: "return",
          label: "Return for Review",
          type: "secondary" as const,
          requiresComment: true,
          requiresAssignee: false,
          targetState: "Review",
        },
      ];
    } catch (error) {
      console.error("Error fetching available actions:", error);
      throw error;
    }
  },

  /**
   * Perform a workflow transition
   */
  async performTransition(
    id: string,
    action: {
      targetState: string;
      data?: Record<string, unknown>;
      comment?: string;
    }
  ): Promise<ApplicationInstance> {
    try {
      const response = await workflowInstanceApi.advance(id, action);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to perform workflow transition for ID: ${id}`);
    } catch (error) {
      console.error("Error performing workflow transition:", error);
      throw error;
    }
  },

  /**
   * Assign a workflow instance to a user
   */
  async assignInstance(id: string, assignee: string, comment?: string) {
    try {
      const response = await workflowInstanceApi.assign(id, assignee, comment);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to assign workflow instance ID: ${id}`);
    } catch (error) {
      console.error("Error assigning workflow instance:", error);
      throw error;
    }
  }
};