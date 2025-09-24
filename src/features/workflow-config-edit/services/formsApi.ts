import { api } from '@/lib/api';
// Re-export search/list helpers from the centralized formsService for backward compatibility
export { searchForms, listForms } from '@/lib/services/formsService';

export interface FormDTO {
  id?: string;
  name: string;
  version?: number;
  json: Record<string, unknown>;
}

interface CreateFormPayload {
  data: {
    formJson: Record<string, unknown>;
  };
}

export async function createForm(dto: FormDTO): Promise<FormDTO> {
  const payload: CreateFormPayload = {
    data: {
      formJson: dto.json
    }
  };

  try {
    const response = await api.post<any>(
      '/api/v1/client/private/form/create',
      payload
    );

    return {
      id: response.id || Date.now().toString(),
      name: dto.name,
      version: response.version || 1,
      json: dto.json
    };
  } catch (error) {
    console.error('Failed to create form:', error);
    throw error;
  }
}

export async function getAllForms(): Promise<any[]> {
  try {
    const response = await api.post<any>('/api/v1/client/private/form/get/all');
    return response.data || response || [];
  } catch (error) {
    console.error('Failed to get forms:', error);
    throw error;
  }
}

export async function updateForm(dto: FormDTO): Promise<FormDTO> {
  const payload: CreateFormPayload = {
    data: {
      formJson: dto.json
    }
  };

  try {
    const response = await api.put<any>(
      `/api/v1/client/private/form/${dto.id}`,
      payload
    );

    return {
      id: response.id,
      name: response.name || dto.name,
      version: response.version || dto.version,
      json: response.json || dto.json
    };
  } catch (error) {
    console.error('Failed to update form:', error);
    throw error;
  }
}