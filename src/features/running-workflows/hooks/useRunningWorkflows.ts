// src/features/running-workflows/hooks/useRunningWorkflows.ts
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { runningWorkflowService } from "../services/runningWorkflowService";

export const useRunningWorkflows = (pollInterval: number = 30000) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    status?: "running" | "paused" | "completed" | "failed";
    workflowId?: string;
    assignee?: string;
  }>({});

  // Fetch running workflows
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["runningWorkflows", filters],
    queryFn: () => runningWorkflowService.getInstances(filters),
    refetchInterval: pollInterval, // Poll every 30 seconds by default
    keepPreviousData: true,
  });

  // Update filters
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    workflows: data || [],
    isLoading,
    error,
    refetch,
    filters,
    updateFilters,
  };
};

export const useRunningWorkflow = (instanceId: string) => {
  return useQuery({
    queryKey: ["runningWorkflow", instanceId],
    queryFn: () => runningWorkflowService.getInstance(instanceId),
    enabled: !!instanceId,
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
};

export const useWorkflowMetrics = (instanceId: string) => {
  return useQuery({
    queryKey: ["workflowMetrics", instanceId],
    queryFn: () => runningWorkflowService.getMetrics(instanceId),
    enabled: !!instanceId,
    staleTime: 60000, // 1 minute
  });
};