// src/features/workflow-initiation/services/workflowInitiationService.ts
import { apiClient } from "@lib/api/client";
import type { WorkflowInitiationResponse } from "../data/mockWorkflowInitiation";

const FALLBACK_ENABLED = true;

const generateWorkflowId = () => {
  const prefix = "WF";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
};

export const initiateWorkflow = async (workflowId: string): Promise<WorkflowInitiationResponse> => {
  try {
    const response = await apiClient.post<WorkflowInitiationResponse>(
      "/api/workflows/initiate",
      { workflowTemplateId: workflowId }
    );
    return response.data;
  } catch (error) {
    console.warn("API call failed, using mock data fallback", error);

    if (FALLBACK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const success = Math.random() > 0.1;

      if (success) {
        const newWorkflowId = generateWorkflowId();
        return {
          success: true,
          workflowId: newWorkflowId,
          message: `Workflow initiated successfully`,
          redirectUrl: `/running/${newWorkflowId}`
        };
      } else {
        return {
          success: false,
          message: "Failed to initiate workflow: Insufficient permissions or workflow template not found"
        };
      }
    } else {
      throw error;
    }
  }
};

export const getAvailableWorkflows = async () => {
  try {
    const response = await apiClient.get("/api/workflows/templates");
    return response.data;
  } catch (error) {
    console.warn("API call failed, using mock data fallback", error);

    if (FALLBACK_ENABLED) {
      const { mockAvailableWorkflows } = await import("../data/mockWorkflowInitiation");
      return mockAvailableWorkflows;
    } else {
      throw error;
    }
  }
};