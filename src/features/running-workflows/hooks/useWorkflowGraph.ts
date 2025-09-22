// src/features/running-workflows/hooks/useWorkflowGraph.ts
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { graphService } from "../services/graphService";

export const useWorkflowGraph = (instanceId: string) => {
  const queryClient = useQueryClient();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  // Fetch workflow graph data
  const { data, isLoading, error } = useQuery({
    queryKey: ["workflowGraph", instanceId],
    queryFn: () => graphService.getGraph(instanceId),
    enabled: !!instanceId,
    onSuccess: (data) => {
      setNodes(data.nodes);
      setEdges(data.edges);
    }
  });

  // WebSocket for real-time updates
  useEffect(() => {
    if (!instanceId) return;

    // In a real implementation, we would connect to a WebSocket endpoint
    // For now, we'll simulate real-time updates
    const interval = setInterval(() => {
      // Simulate occasional updates
      if (Math.random() > 0.7) {
        queryClient.invalidateQueries(["workflowGraph", instanceId]);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [instanceId, queryClient]);

  return {
    nodes,
    edges,
    isLoading,
    error,
    setNodes,
    setEdges
  };
};