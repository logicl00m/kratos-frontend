// src/features/running-workflows/hooks/useWorkflowMetrics.ts
import { useQuery } from "@tanstack/react-query";
import { metricsService } from "../services/metricsService";

export const useWorkflowMetrics = (params?: {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: "day" | "week" | "month";
  workflowType?: string;
}) => {
  return useQuery({
    queryKey: ["workflowMetrics", params],
    queryFn: () => metricsService.getMetrics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};