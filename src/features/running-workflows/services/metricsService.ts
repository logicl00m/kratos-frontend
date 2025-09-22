// src/features/running-workflows/services/metricsService.ts
import type { WorkflowNode, WorkflowEdge } from "@lib/api/types";

export interface WorkflowMetrics {
  summary: {
    totalInstances: number;
    activeInstances: number;
    completedInstances: number;
    averageDuration: number;
    slaCompliance: number;
  };
  timeSeries: Array<{
    date: string;
    started: number;
    completed: number;
    avgDuration: number;
  }>;
  bottlenecks: Array<{
    state: string;
    avgDuration: number;
    instanceCount: number;
    slaBreaches: number;
  }>;
  performanceByAssignee: Array<{
    assignee: string;
    completedCount: number;
    avgDuration: number;
    slaCompliance: number;
  }>;
}

export const metricsService = {
  /**
   * Get workflow performance metrics
   */
  async getMetrics(params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: "day" | "week" | "month";
    workflowType?: string;
  }): Promise<WorkflowMetrics> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll return mock data
      return {
        summary: {
          totalInstances: 124,
          activeInstances: 23,
          completedInstances: 101,
          averageDuration: 3.2,
          slaCompliance: 87.5
        },
        timeSeries: [
          { date: "2025-09-01", started: 5, completed: 3, avgDuration: 2.1 },
          { date: "2025-09-02", started: 7, completed: 6, avgDuration: 3.2 },
          { date: "2025-09-03", started: 4, completed: 5, avgDuration: 2.8 },
          { date: "2025-09-04", started: 6, completed: 4, avgDuration: 3.5 },
          { date: "2025-09-05", started: 8, completed: 7, avgDuration: 2.9 },
          { date: "2025-09-06", started: 3, completed: 2, avgDuration: 4.1 },
          { date: "2025-09-07", started: 9, completed: 8, avgDuration: 3.0 }
        ],
        bottlenecks: [
          {
            state: "Credit Review",
            avgDuration: 1.8,
            instanceCount: 45,
            slaBreaches: 12
          },
          {
            state: "Documentation",
            avgDuration: 2.3,
            instanceCount: 38,
            slaBreaches: 8
          }
        ],
        performanceByAssignee: [
          {
            assignee: "Fahim Ahmed",
            completedCount: 24,
            avgDuration: 2.1,
            slaCompliance: 92.3
          },
          {
            assignee: "Sadia Rahman",
            completedCount: 19,
            avgDuration: 3.2,
            slaCompliance: 84.7
          },
          {
            assignee: "Rafiq Khan",
            completedCount: 21,
            avgDuration: 2.8,
            slaCompliance: 88.1
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching workflow metrics:", error);
      throw error;
    }
  }
};