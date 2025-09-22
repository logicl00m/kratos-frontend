// src/features/running-workflows/services/runningWorkflowService.ts
import { runningWorkflowApi } from "@lib/api/endpoints/workflow";
import type { RunningWorkflow } from "@lib/api/types";

export const runningWorkflowService = {
  /**
   * Get all running workflow instances
   */
  async getInstances(params?: {
    status?: "running" | "paused" | "completed" | "failed";
    workflowId?: string;
    assignee?: string;
  }): Promise<RunningWorkflow[]> {
    try {
      const response = await runningWorkflowApi.list(params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || "Failed to fetch running workflows");
    } catch (error) {
      console.error("Error fetching running workflows:", error);
      throw error;
    }
  },

  /**
   * Get running workflow by instance ID
   */
  async getInstance(instanceId: string): Promise<RunningWorkflow> {
    try {
      const response = await runningWorkflowApi.get(instanceId);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch running workflow ${instanceId}`);
    } catch (error) {
      console.error("Error fetching running workflow:", error);
      throw error;
    }
  },

  /**
   * Pause running workflow
   */
  async pause(instanceId: string) {
    try {
      const response = await runningWorkflowApi.pause(instanceId);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to pause workflow ${instanceId}`);
    } catch (error) {
      console.error("Error pausing workflow:", error);
      throw error;
    }
  },

  /**
   * Resume paused workflow
   */
  async resume(instanceId: string) {
    try {
      const response = await runningWorkflowApi.resume(instanceId);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to resume workflow ${instanceId}`);
    } catch (error) {
      console.error("Error resuming workflow:", error);
      throw error;
    }
  },

  /**
   * Stop running workflow
   */
  async stop(instanceId: string, reason?: string) {
    try {
      const response = await runningWorkflowApi.stop(instanceId, reason);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to stop workflow ${instanceId}`);
    } catch (error) {
      console.error("Error stopping workflow:", error);
      throw error;
    }
  },

  /**
   * Get workflow execution metrics
   */
  async getMetrics(instanceId: string) {
    try {
      const response = await runningWorkflowApi.getMetrics(instanceId);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch metrics for workflow ${instanceId}`);
    } catch (error) {
      console.error("Error fetching workflow metrics:", error);
      throw error;
    }
  }
};