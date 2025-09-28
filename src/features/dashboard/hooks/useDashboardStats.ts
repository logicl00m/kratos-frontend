// src/features/dashboard/hooks/useDashboardStats.ts
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import type { FilterOptions } from "@lib/api/types";
import { mockWorkflowData } from "../data/mockWorkflowData";
import { transformWorkflowsToApplications } from "../utils/workflowTransformer";
import { DASHBOARD_CONFIG } from "../config/dashboardConfig";

/**
 * Custom hook to fetch dashboard statistics
 * 
 * This hook provides a unified interface for dashboard stats, 
 * whether using mock data or real API data based on configuration.
 * 
 * To switch between mock and real data, change the `useMockData` value 
 * in the DASHBOARD_CONFIG file.
 */
export const useDashboardStats = (filters?: FilterOptions) => {
  return useQuery({
    queryKey: ["dashboard", "stats", filters],
    queryFn: () => {
      if (DASHBOARD_CONFIG.useMockData) {
        // When using mock data, calculate stats from mock workflow data
        // Simulate API delay for more realistic experience
        return new Promise((resolve) => {
          setTimeout(() => {
            // Transform mock workflow data to LoanApplication format
            const applications = transformWorkflowsToApplications(mockWorkflowData);
            
            // Calculate stats based on mock data
            const totalApplications = applications.length;
            const pendingApplications = applications.filter(app => 
              app.stage !== 'Completed' && !app.stage.includes('Completed')
            ).length;
            const approvedApplications = applications.filter(app => 
              app.stage === 'Completed' || app.stage.includes('Completed')
            ).length;
            const rejectedApplications = 0; // No rejections in mock data
            
            // Calculate SLA metrics
            const slaMetrics = {
              onTime: applications.filter(app => app.slaStatus === 'ontime').length,
              due: applications.filter(app => app.slaStatus === 'due').length,
              overdue: applications.filter(app => app.slaStatus === 'overdue').length,
              completed: applications.filter(app => app.slaStatus === 'completed').length,
            };

            resolve({
              data: {
                totalApplications,
                pendingApplications,
                approvedApplications,
                rejectedApplications,
                slaMetrics
              }
            });
          }, 300); // Simulate network delay
        }) as Promise<any>;
      } else {
        // When not using mock data, make actual API call
        return dashboardService.getStats(filters);
      }
    },
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // 1 minute
    // Always enable the query, the queryFn handles the choice
    enabled: true
  });
};