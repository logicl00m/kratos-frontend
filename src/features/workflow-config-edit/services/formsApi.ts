import { api } from '@/lib/api';

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

interface CreateFormResponse {
  id: string;
  name: string;
  version: number;
  json: Record<string, unknown>;
  // Add other response fields as needed
}

export async function createForm(dto: FormDTO): Promise<FormDTO> {
  // Transform DTO to match API payload structure
  const payload: CreateFormPayload = {
    data: {
      formJson: dto.json
    }
  };

  try {
    // Call the exact endpoint you specified
    const response = await api.post<any>(
      '/api/v1/client/private/form/create',
      payload
    );

    // Extract the actual response data
    // Assuming the API returns the created form data
    return {
      id: response.id || Date.now().toString(),
      name: dto.name,
      version: response.version || 1,
      json: dto.json // Keep the original JSON since that's what was sent
    };
  } catch (error) {
    console.error('Failed to create form:', error);
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
    const response = await api.put<CreateFormResponse>(
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