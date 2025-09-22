// src/features/dashboard/services/dashboardService.ts
import { apiClient } from '@/lib/api';

export const dashboardService = {
  async getStatistics() {
    const response = await apiClient.get('/api/dashboard/statistics');
    return response.data;
  },
  
  async getFilterOptions() {
    const response = await apiClient.get('/api/dashboard/filter-options');
    return response.data;
  }
};