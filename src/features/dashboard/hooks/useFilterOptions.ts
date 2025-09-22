// src/features/dashboard/hooks/useFilterOptions.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['dashboard', 'filterOptions'],
    queryFn: dashboardService.getFilterOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000  // 30 minutes
  });
};