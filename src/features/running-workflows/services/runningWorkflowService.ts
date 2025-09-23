// src/features/running-workflows/services/runningWorkflowService.ts
import { runningWorkflowApi } from "@lib/api/endpoints/workflow";
import type { WorkflowData } from "../types/runningWorkflow.types";
import { validateWorkflowData } from "../utils/runningWorkflowParser";

// API Response structure with nested data
interface ApiWorkflowItem {
  wfConfig?: {
    id: string;
    name?: string;
    version?: number;
  };
  data: WorkflowData;
  isArchived?: boolean;
  metadata?: Record<string, unknown>;
}

export const runningWorkflowService = {
  /**
   * Get all running workflow instances
   * Transforms nested API response to extract the 'data' field from each item
   */
  async getInstances(params?: {
    status?: "running" | "paused" | "completed" | "failed";
    workflowId?: string;
    assignee?: string;
  }): Promise<WorkflowData[]> {
    try {
      console.group('🔄 Running Workflow Service - getInstances');
      console.log('📥 Request Params:', params);
      
      // The centralized API client now returns extracted data directly
      const response = await runningWorkflowApi.list(params);
      
      console.log('📦 Raw Response from API:', response);
      console.log('📊 Response Type:', typeof response);
      console.log('📊 Is Array:', Array.isArray(response));
      
      if (Array.isArray(response)) {
        console.log('📊 Array Length:', response.length);
        if (response.length > 0) {
          console.log('📊 First Item:', response[0]);
          console.log('📊 First Item Keys:', Object.keys(response[0] || {}));
        }
      }
      
      // Transform API response to extract the 'data' field from each item
      const workflowData = (response as unknown as ApiWorkflowItem[])
        .map((item, index) => {
          console.log(`🔍 Processing Item ${index}:`, item);
          console.log(`🔍 Item Keys:`, Object.keys(item || {}));
          console.log(`🔍 Item.data:`, item.data);
          
          const transformed = {
            ...item.data,
            // Preserve workflow config reference as metadata
            __workflowConfigId: item.wfConfig?.id,
            __workflowConfigName: item.wfConfig?.name,
            __isArchived: item.isArchived,
            __metadata: item.metadata
          };
          
          console.log(`🔄 Transformed Item ${index}:`, transformed);
          return transformed;
        })
        .filter((item, index) => {
          const isValid = validateWorkflowData(item);
          console.log(`✅ Item ${index} Valid:`, isValid);
          if (!isValid) {
            console.warn(`❌ Invalid workflow data at index ${index}:`, item);
          }
          return isValid;
        }); // Filter invalid formats
      
      console.log('✅ Final Transformed workflow data:', workflowData);
      console.log('✅ Final Array Length:', workflowData.length);
      console.groupEnd();
      
      return workflowData;
      
    } catch (error) {
      console.error("❌ Error fetching running workflows:", error);
      console.groupEnd();
      throw error;
    }
  },

  /**
   * Get running workflow by instance ID
   * Handles both legacy and new nested response structures
   */
  async getInstance(instanceId: string): Promise<WorkflowData> {
    try {
      const response = await runningWorkflowApi.get(instanceId);
      
      // Handle nested structure if present
      if (response && typeof response === 'object' && 'data' in response) {
        const apiItem = response as unknown as ApiWorkflowItem;
        const workflowData = {
          ...apiItem.data,
          __workflowConfigId: apiItem.wfConfig?.id,
          __workflowConfigName: apiItem.wfConfig?.name,
          __isArchived: apiItem.isArchived,
          __metadata: apiItem.metadata
        };
        
        if (validateWorkflowData(workflowData)) {
          return workflowData;
        }
      }
      
      // Handle direct WorkflowData response
      if (validateWorkflowData(response)) {
        return response as WorkflowData;
      }
      
      throw new Error(`Invalid workflow data structure for instance ${instanceId}`);
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
      // Centralized API client returns extracted data directly
      return await runningWorkflowApi.pause(instanceId);
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
      // Centralized API client returns extracted data directly
      return await runningWorkflowApi.resume(instanceId);
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
      // Centralized API client returns extracted data directly
      return await runningWorkflowApi.stop(instanceId, reason);
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
      // Centralized API client returns extracted data directly
      return await runningWorkflowApi.getMetrics(instanceId);
    } catch (error) {
      console.error("Error fetching workflow metrics:", error);
      throw error;
    }
  }
};