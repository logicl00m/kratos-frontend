// formsApi.ts - Updated to work with your actual backend API

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

const API_BASE = 'http://localhost:8080/api/v1/client/private';

/**
 * Fetch all forms from your backend
 */
const fetchAllForms = async () => {
  const response = await fetch(`${API_BASE}/form/get/all`, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'X-Subject': 'fsadf', // You may want to make this dynamic
      'Content-Type': 'application/json'
    },
    body: ''
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status !== 'S2000') {
    throw new Error(result.message || 'Failed to fetch forms');
  }

  return result.data || [];
};

/**
 * Search forms by term - filters the full list
 */
export const searchForms = async (term: string): Promise<FormSummary[]> => {
  if (!term || term.trim() === '') return [];

  const forms = await fetchAllForms();
  
  // Filter forms by search term
  const filtered = forms.filter((f: any) => 
    f.formName.toLowerCase().includes(term.toLowerCase())
  );

  // Transform to FormSummary format expected by the UI
  // Group by formName and assign versions
  const grouped = filtered.reduce((acc: any, f: any) => {
    if (!acc[f.formName]) {
      acc[f.formName] = [];
    }
    acc[f.formName].push(f);
    return acc;
  }, {});

  const result: FormSummary[] = [];
  Object.keys(grouped).forEach(formName => {
    grouped[formName].forEach((f: any, index: number) => {
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
  const grouped = forms.reduce((acc: any, f: any) => {
    if (!acc[f.formName]) {
      acc[f.formName] = [];
    }
    acc[f.formName].push(f);
    return acc;
  }, {});

  const allForms: FormSummary[] = [];
  Object.keys(grouped).forEach(formName => {
    grouped[formName].forEach((f: any, index: number) => {
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
  const form = forms.find((f: any) => f.id === id);
  
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
 * Create a new form (you'll need to implement the actual endpoint)
 */
export const createForm = async (payload: FormDTO): Promise<{
  id: string;
  name: string;
  version: number;
  json: Record<string, unknown>;
}> => {
  // TODO: Implement actual create endpoint call
  // For now, return the payload with a generated ID
  return {
    id: payload.id || `form-${Date.now()}`,
    name: payload.name,
    version: payload.version ?? 1,
    json: payload.json
  };
};

export default {
  searchForms,
  listForms,
  getForm,
  createForm
};