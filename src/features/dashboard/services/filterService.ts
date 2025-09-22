// src/features/dashboard/services/filterService.ts
import { dashboardApi } from "@lib/api/endpoints/workflow";
import type { FilterOptions } from "@lib/api/types";

export const filterService = {
  /**
   * Fetch available filter options for the dashboard
   */
  async getFilterOptions(): Promise<{
    stages: string[];
    products: string[];
    assignees: Array<{ id: string; name: string; role: string }>;
  }> {
    try {
      // For now, we'll return static options since the API doesn't seem to have a specific endpoint
      // In the future, this could be replaced with an actual API call
      return {
        stages: [
          "All Stages",
          "ARMDraft",
          "RMReview",
          "CMReview",
          "RMResubmission",
          "THCRMDecision",
          "Completed"
        ],
        products: [
          "All Products",
          "Business Loan",
          "Personal Loan",
          "Mortgage",
          "Auto Loan"
        ],
        assignees: [
          { id: "all", name: "All Owners", role: "" }
          // In a real implementation, this would be populated from the API
        ]
      };
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  }
};