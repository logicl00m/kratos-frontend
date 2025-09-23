// formsApi.ts - Updated to work with centralized API client
// The centralized API client now handles response validation, status checking, and data extraction
// Features receive the extracted data directly without manual parsing

import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api/config';

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

/**
 * Fetch all forms from your backend
 * With centralized API, we now receive the extracted data directly
 */
const fetchAllForms = async (): Promise<BackendForm[]> => {
  try {
    // The centralized API client now returns the extracted data directly
    // No more need to handle ApiResponse wrapper - we get the forms array directly
    const forms = await api.post<BackendForm[]>(API_ENDPOINTS.CLIENT_PRIVATE.FORM.GET_ALL, {});
    
    console.log('✅ Forms data received from centralized API:', forms);
    
    // The centralized parser has already validated the response structure,
    // checked for S2000 status, and extracted the data array for us
    return forms || [];
    
  } catch (error) {
    console.error('❌ Forms API Error:', error);
    // The centralized parser will throw structured errors with clear messages
    throw error;
  }
};

/**
 * Search forms by term - filters the full list
 */
export const searchForms = async (term: string): Promise<FormSummary[]> => {
  if (!term || term.trim() === '') return [];

  // fetchAllForms now returns extracted data directly
  const forms = await fetchAllForms();
  console.log("Searching through forms:", forms);
  
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
 * With centralized API, we receive the extracted data directly
 */
export const createForm = async (payload: FormDTO): Promise<FormDTO> => {
  try {
    // The centralized API client handles the response validation and extracts data
    // We expect to receive the created form data directly, not wrapped in a response object
    const createdFormData = await api.post<BackendForm>(API_ENDPOINTS.CLIENT_PRIVATE.FORM.CREATE, {
      formName: payload.name,
      configJson: payload.json
    });

    console.log('✅ Create Form Response (extracted data):', createdFormData);

    // Transform the backend form to our FormDTO format
    return {
      id: createdFormData.id,
      name: createdFormData.formName,
      version: payload.version ?? 1,
      json: createdFormData.configJson
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