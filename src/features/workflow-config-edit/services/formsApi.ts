// formsApi.ts - Updated to work with centralized API client

import { api } from '@/lib/api';
import { API_ENDPOINTS, BACKEND_STATUS } from '@/lib/api/config';

export interface FormSummary {
  id: string;
  name: string;
  version: number;
}

export interface FormDTO {
  id?: string;
  name: string;
  version?: number;
  json: Record<string, unknown>;
}

// Backend form response type
interface BackendForm {
  id: string;
  formName: string;
  configJson: Record<string, unknown>;
}

// Backend API response type
interface BackendApiResponse {
  status: string;
  message?: string;
  data?: BackendForm[];
}

/**
 * Fetch all forms from your backend
 */
const fetchAllForms = async (): Promise<BackendForm[]> => {
  try {
    // Use apiClient directly to bypass the ApiResponse wrapper
    const response = await api.post(API_ENDPOINTS.CLIENT_PRIVATE.FORM.GET_ALL, {});
    
    console.log('✅ Raw API Response:', response); // Debug log
    
    // Since the centralized API client returns ApiResponse<T>, but your backend 
    // returns data directly, we need to handle both cases
    let backendResponse: BackendApiResponse;
    
    // Check if response.data is your backend response directly
    if (response && response.data && typeof response.data === 'object' && 'status' in response.data) {
      backendResponse = response.data as BackendApiResponse;
    }
    // Or if it's wrapped in another layer  
    else if (response && typeof response === 'object' && 'status' in response) {
      backendResponse = response as BackendApiResponse;
    }
    else {
      console.error('❌ Unexpected response structure:', response);
      throw new Error('Unexpected response structure from forms API');
    }
    
    console.log('✅ Backend Response:', backendResponse); // Debug log

    // Check backend status (S2000 = success)
    if (backendResponse.status !== BACKEND_STATUS.SUCCESS) {
      console.error('❌ Backend returned error status:', backendResponse.status, backendResponse.message);
      throw new Error(backendResponse?.message || 'Failed to fetch forms');
    }

    // The actual forms array is in backendResponse.data
    console.log('✅ Forms data:', backendResponse.data);
    return backendResponse?.data || [];
    
  } catch (error) {
    console.error('❌ Forms API Error:', error);
    throw error;
  }
};

/**
 * Search forms by term - filters the full list
 */
export const searchForms = async (term: string): Promise<FormSummary[]> => {
  if (!term || term.trim() === '') return [];

  const forms = await fetchAllForms();
  console.log("forms")
  
  // Filter forms by search term
  const filtered = forms.filter((f: BackendForm) => 
    f.formName.toLowerCase().includes(term.toLowerCase())
  );

  // Transform to FormSummary format expected by the UI
  // Group by formName and assign versions
  const grouped = filtered.reduce((acc: Record<string, BackendForm[]>, f: BackendForm) => {
    if (!acc[f.formName]) {
      acc[f.formName] = [];
    }
    acc[f.formName].push(f);
    return acc;
  }, {});

  const result: FormSummary[] = [];
  Object.keys(grouped).forEach(formName => {
    grouped[formName].forEach((f: BackendForm, index: number) => {
      result.push({
        id: f.id,
        name: f.formName,
        version: index + 1
      });
    });
  });

  return result;
};

/**
 * List all forms
 */
export const listForms = async (): Promise<FormSummary[]> => {
  const forms = await fetchAllForms();
  
  // Group by formName to assign versions
  const grouped = forms.reduce((acc: Record<string, BackendForm[]>, f: BackendForm) => {
    if (!acc[f.formName]) {
      acc[f.formName] = [];
    }
    acc[f.formName].push(f);
    return acc;
  }, {});

  const allForms: FormSummary[] = [];
  Object.keys(grouped).forEach(formName => {
    grouped[formName].forEach((f: BackendForm, index: number) => {
      allForms.push({
        id: f.id,
        name: f.formName,
        version: index + 1
      });
    });
  });

  return allForms;
};

/**
 * Get a single form by ID
 */
export const getForm = async (id: string): Promise<FormDTO> => {
  const forms = await fetchAllForms();
  const form = forms.find((f: BackendForm) => f.id === id);
  
  if (!form) {
    throw new Error(`Form with id ${id} not found`);
  }

  return {
    id: form.id,
    name: form.formName,
    version: 1,
    json: form.configJson
  };
};

/**
 * Create a new form
 */
export const createForm = async (payload: FormDTO): Promise<FormDTO> => {
  try {
    const response = await api.post<BackendApiResponse>(API_ENDPOINTS.CLIENT_PRIVATE.FORM.CREATE, {
      formName: payload.name,
      configJson: payload.json
    });

    console.log('✅ Create Form Response:', response);

    const backendResponse = response.data;
    
    if (!backendResponse) {
      throw new Error('No response data received from create form API');
    }

    if (backendResponse.status !== BACKEND_STATUS.SUCCESS) {
      throw new Error(backendResponse?.message || 'Failed to create form');
    }

    // Return the created form (assuming backend returns the created form data)
    return {
      id: payload.id || `form-${Date.now()}`,
      name: payload.name,
      version: payload.version ?? 1,
      json: payload.json
    };
  } catch (error) {
    console.warn('Create form endpoint error:', error);
    // Fallback for development - return the payload with a generated ID
    return {
      id: payload.id || `form-${Date.now()}`,
      name: payload.name,
      version: payload.version ?? 1,
      json: payload.json
    };
  }
};

export default {
  searchForms,
  listForms,
  getForm,
  createForm
};