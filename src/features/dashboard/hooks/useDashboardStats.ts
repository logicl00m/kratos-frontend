// src/features/dashboard/hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import type { FilterOptions } from "@lib/api/types";

export const useDashboardStats = (filters?: FilterOptions) => {
  return useQuery({
    queryKey: ["dashboard", "stats", filters],
    queryFn: () => dashboardService.getStats(filters),
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // 1 minute
  });
};