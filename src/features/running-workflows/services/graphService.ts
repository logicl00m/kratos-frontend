// src/features/running-workflows/services/graphService.ts
import type { WorkflowNode, WorkflowEdge } from "@lib/api/types";

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export const graphService = {
  /**
   * Get workflow graph data for visualization
   */
  async getGraph(instanceId: string): Promise<WorkflowGraph> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll return mock data
      return {
        nodes: [
          {
            id: "start",
            type: "start",
            position: { x: 100, y: 100 },
            data: {
              label: "Start"
            }
          },
          {
            id: "review",
            type: "process",
            position: { x: 300, y: 100 },
            data: {
              label: "Review Application",
              description: "Initial review by RM",
              assignees: ["rm1"]
            }
          },
          {
            id: "approve",
            type: "process",
            position: { x: 500, y: 100 },
            data: {
              label: "Approve",
              description: "Credit approval",
              assignees: ["cm1"]
            }
          },
          {
            id: "end",
            type: "end",
            position: { x: 700, y: 100 },
            data: {
              label: "End"
            }
          }
        ],
        edges: [
          {
            id: "e1",
            source: "start",
            target: "review",
            type: "default",
            data: {
              label: "Start"
            }
          },
          {
            id: "e2",
            source: "review",
            target: "approve",
            type: "default",
            data: {
              label: "Approved"
            }
          },
          {
            id: "e3",
            source: "approve",
            target: "end",
            type: "default",
            data: {
              label: "Complete"
            }
          }
        ]
      };
    } catch (error) {
      console.error("Error fetching workflow graph:", error);
      throw error;
    }
  }
};