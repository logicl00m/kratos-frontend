// src/features/dashboard/services/applicationService.ts
// src/features/dashboard/services/applicationService.ts
import { apiClient } from '@/lib/api';

export const applicationService = {
  async getApplications(params: any) {
    const response = await apiClient.get('/api/applications', { params });
    return response.data;
  },
  
  async getApplicationById(id: string) {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data;
  }
};