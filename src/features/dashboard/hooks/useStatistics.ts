// src/features/dashboard/hooks/useStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useStatistics = () => {
  return useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: dashboardService.getStatistics,
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000 // 5 minutes
  });
};