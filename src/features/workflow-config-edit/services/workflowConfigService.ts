// src/features/workflow-config-edit/services/workflowConfigService.ts
import type { WorkflowBuilderConfig } from "@features/workflow-config-edit/types/builder.types";

export const workflowConfigService = {
  /**
   * Save workflow configuration
   */
  async saveConfiguration(config: WorkflowBuilderConfig): Promise<{ id: string }> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just return a mock response
      console.log("Saving workflow configuration:", config);
      return { id: "workflow-" + Date.now() };
    } catch (error) {
      console.error("Error saving workflow configuration:", error);
      throw error;
    }
  },

  /**
   * Load workflow configuration by ID
   */
  async loadConfiguration(id: string): Promise<WorkflowBuilderConfig> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just return a mock response
      console.log("Loading workflow configuration:", id);
      return {
        workflow: {
          forms: {},
          states: {},
        },
      };
    } catch (error) {
      console.error("Error loading workflow configuration:", error);
      throw error;
    }
  },

  /**
   * Get workflow templates
   */
  async getTemplates() {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll return mock data
      return [
        {
          id: "template1",
          name: "Business Loan Application",
          description: "Standard workflow for business loan applications",
          category: "New Application",
        },
        {
          id: "template2",
          name: "Personal Loan Review",
          description: "Workflow for personal loan review process",
          category: "Review",
        },
        {
          id: "template3",
          name: "Mortgage Assessment",
          description: "Comprehensive workflow for mortgage assessment",
          category: "Assessment",
        },
      ];
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  }
};