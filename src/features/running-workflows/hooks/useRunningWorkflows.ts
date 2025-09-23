// src/features/running-workflows/hooks/useRunningWorkflows.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { runningWorkflowService } from "../services/runningWorkflowService";
import { validateWorkflowData, normalizeWorkflowData } from "../utils/runningWorkflowParser";

export const useRunningWorkflows = (pollInterval: number = 30000) => {
  const [filters, setFilters] = useState<{
    status?: "running" | "paused" | "completed" | "failed";
    workflowId?: string;
    assignee?: string;
  }>({});

  // Fetch running workflows
  const { data: rawResponse, isLoading, error, refetch } = useQuery({
    queryKey: ["runningWorkflows", filters],
    queryFn: async () => {
      console.group('🎣 React Query Hook - useRunningWorkflows');
      console.log('📥 Query Params:', filters);
      
      const workflows = await runningWorkflowService.getInstances(filters);
      
      console.log("🎯 Query Result from Service:", workflows);
      console.log("🎯 Result Type:", typeof workflows);
      console.log("🎯 Is Array:", Array.isArray(workflows));
      
      if (Array.isArray(workflows)) {
        console.log("🎯 Array Length:", workflows.length);
        if (workflows.length > 0) {
          console.log("🎯 First Workflow:", workflows[0]);
          console.log("🎯 First Workflow Keys:", Object.keys(workflows[0] || {}));
        }
      }
      
      console.groupEnd();
      return workflows;
    },
    refetchInterval: pollInterval, // Poll every 30 seconds by default
    placeholderData: (previousData) => previousData, // New syntax for keeping previous data
  });

  // Process and normalize the data
  const processedData = useMemo(() => {
    console.group('🔄 React Query Hook - Processing Data');
    console.log('📦 Raw Response:', rawResponse);
    console.log('📊 Is Array:', Array.isArray(rawResponse));
    
    if (!rawResponse || !Array.isArray(rawResponse)) {
      console.log('❌ No valid data to process');
      console.groupEnd();
      return [];
    }
    
    console.log('📊 Raw Response Length:', rawResponse.length);
    
    const filteredData = rawResponse.filter((item, index) => {
      const isValid = validateWorkflowData(item);
      console.log(`✅ Item ${index} validation:`, isValid, item);
      return isValid;
    });
    
    console.log('🔍 After validation filter:', filteredData.length, 'items');
    
    const normalizedData = filteredData.map((item, index) => {
      const normalized = normalizeWorkflowData(item);
      console.log(`🔄 Normalized Item ${index}:`, normalized);
      return normalized;
    });
    
    console.log('✅ Final processed data:', normalizedData);
    console.groupEnd();
    return normalizedData;
  }, [rawResponse]);

  // Update filters
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    workflows: processedData,
    isLoading,
    error,
    refetch,
    filters,
    updateFilters,
  };
};

export const useRunningWorkflow = (instanceId: string) => {
  const { data: rawData, ...rest } = useQuery({
    queryKey: ["runningWorkflow", instanceId],
    queryFn: () => runningWorkflowService.getInstance(instanceId),
    enabled: !!instanceId,
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  // Normalize the single workflow data
  const normalizedData = useMemo(() => {
    if (!rawData || !validateWorkflowData(rawData)) return null;
    return normalizeWorkflowData(rawData);
  }, [rawData]);

  return {
    data: normalizedData,
    ...rest,
  };
};

export const useWorkflowMetrics = (instanceId: string) => {
  return useQuery({
    queryKey: ["workflowMetrics", instanceId],
    queryFn: () => runningWorkflowService.getMetrics(instanceId),
    enabled: !!instanceId,
    staleTime: 60000, // 1 minute
  });
};