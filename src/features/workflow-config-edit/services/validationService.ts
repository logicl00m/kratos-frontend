// src/features/workflow-config-edit/services/validationService.ts
import type { BuilderNode, BuilderEdge } from "@features/workflow-config-edit/types/builder.types";

export interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    type: "error" | "warning";
    nodeId?: string;
    edgeId?: string;
    message: string;
    suggestion?: string;
  }>;
  statistics: {
    nodeCount: number;
    edgeCount: number;
    orphanedNodes: string[];
    unreachableNodes: string[];
    cyclesDetected: boolean;
  };
}

export const validationService = {
  /**
   * Validate workflow configuration
   */
  async validateWorkflow(nodes: BuilderNode[], edges: BuilderEdge[]): Promise<ValidationResponse> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll perform basic client-side validation
      
      const nodeCount = nodes.length;
      const edgeCount = edges.length;
      
      // Find orphaned nodes (nodes with no connections)
      const connectedNodeIds = new Set([
        ...edges.map(edge => edge.source),
        ...edges.map(edge => edge.target)
      ]);
      
      const orphanedNodes = nodes
        .filter(node => !connectedNodeIds.has(node.id))
        .map(node => node.id);
      
      // Basic validation rules
      const errors = [];
      
      // Check for start node
      const startNodes = nodes.filter(node => node.type === "process" && 
        node.data.label.toLowerCase().includes("start"));
      
      if (startNodes.length === 0) {
        errors.push({
          type: "error",
          message: "No start node found. Workflow must have a start node.",
          suggestion: "Add a process node labeled 'Start' or similar."
        });
      }
      
      // Check for end node
      const endNodes = nodes.filter(node => node.type === "process" && 
        node.data.label.toLowerCase().includes("end"));
      
      if (endNodes.length === 0) {
        errors.push({
          type: "warning",
          message: "No end node found. Workflow may not have a clear completion point.",
          suggestion: "Consider adding a process node labeled 'End' or similar."
        });
      }
      
      // Check for nodes with no assignees
      const unassignedNodes = nodes.filter(node => 
        node.type === "process" && 
        (!node.data.assignees || node.data.assignees.length === 0)
      );
      
      unassignedNodes.forEach(node => {
        errors.push({
          type: "warning",
          nodeId: node.id,
          message: `Node "${node.data.label}" has no assignees.`,
          suggestion: "Assign at least one user or role to this node."
        });
      });
      
      // Check for edges with no labels
      const unlabeledEdges = edges.filter(edge => !edge.label || edge.label.trim() === "");
      
      unlabeledEdges.forEach(edge => {
        errors.push({
          type: "warning",
          edgeId: edge.id,
          message: "Edge has no label.",
          suggestion: "Add a descriptive label to this edge."
        });
      });
      
      return {
        valid: errors.filter(e => e.type === "error").length === 0,
        errors,
        statistics: {
          nodeCount,
          edgeCount,
          orphanedNodes,
          unreachableNodes: [], // Would need more complex analysis for this
          cyclesDetected: false // Would need more complex analysis for this
        }
      };
    } catch (error) {
      console.error("Error validating workflow:", error);
      throw error;
    }
  }
};