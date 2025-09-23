/**
 * Centralized Forms Service
 * Uses the centralized API client with automatic token handling
 */

import { api } from '@/lib/api';
import { API_ENDPOINTS, BACKEND_STATUS } from '@/lib/api/config';
import type { FormDefinition, PaginatedRequest, PaginatedResponse } from '@/lib/api/types';

// Service-specific types
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

// Backend response types
interface BackendForm {
  id: string;
  formName: string;
  configJson: Record<string, unknown>;
}

interface BackendFormResponse {
  status: string;
  message?: string;
  data?: BackendForm[];
}

interface CreateFormRequest {
  formName: string;
  configJson: Record<string, unknown>;
}

interface CreateFormResponse {
  status: string;
  message?: string;
  data?: BackendForm;
}

class FormsService {
  /**
   * Fetch all forms from backend
   */
  async getAllForms(): Promise<BackendForm[]> {
    try {
      const response = await api.post<BackendFormResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.FORM.GET_ALL,
        {}
      );
      
      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to fetch forms');
      }

      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  }

  /**
   * Search forms by term
   */
  async searchForms(term: string): Promise<FormSummary[]> {
    if (!term || term.trim() === '') return [];

    const forms = await this.getAllForms();
    
    // Filter forms by search term
    const filtered = forms.filter((form: BackendForm) => 
      form.formName.toLowerCase().includes(term.toLowerCase())
    );

    return this.transformToFormSummaries(filtered);
  }

  /**
   * List all forms with pagination
   */
  async listForms(params?: PaginatedRequest): Promise<PaginatedResponse<FormSummary>> {
    const forms = await this.getAllForms();
    const formSummaries = this.transformToFormSummaries(forms);

    // Apply pagination if specified
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = formSummaries.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: formSummaries.length,
        totalPages: Math.ceil(formSummaries.length / limit)
      }
    };
  }

  /**
   * Get a single form by ID
   */
  async getForm(id: string): Promise<FormDTO> {
    const forms = await this.getAllForms();
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
  }

  /**
   * Create a new form
   */
  async createForm(payload: FormDTO): Promise<FormDTO> {
    try {
      const createRequest: CreateFormRequest = {
        formName: payload.name,
        configJson: payload.json
      };

      const response = await api.post<CreateFormResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.FORM.CREATE,
        createRequest
      );

      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to create form');
      }

      const createdForm = response.data?.data;
      if (!createdForm) {
        throw new Error('No form data returned from creation');
      }

      return {
        id: createdForm.id,
        name: createdForm.formName,
        version: payload.version ?? 1,
        json: createdForm.configJson
      };
    } catch (error) {
      console.warn('Create form endpoint failed, using fallback:', error);
      // Fallback for development
      return {
        id: payload.id || `form-${Date.now()}`,
        name: payload.name,
        version: payload.version ?? 1,
        json: payload.json
      };
    }
  }

  /**
   * Update an existing form
   */
  async updateForm(id: string, payload: Partial<FormDTO>): Promise<FormDTO> {
    try {
      const updateRequest = {
        id,
        formName: payload.name,
        configJson: payload.json
      };

      const response = await api.post<CreateFormResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.FORM.UPDATE,
        updateRequest
      );

      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to update form');
      }

      const updatedForm = response.data?.data;
      if (!updatedForm) {
        throw new Error('No form data returned from update');
      }

      return {
        id: updatedForm.id,
        name: updatedForm.formName,
        version: payload.version ?? 1,
        json: updatedForm.configJson
      };
    } catch (error) {
      console.warn('Update form endpoint failed:', error);
      throw error;
    }
  }

  /**
   * Delete a form
   */
  async deleteForm(id: string): Promise<void> {
    try {
      const response = await api.post<BackendFormResponse>(
        API_ENDPOINTS.CLIENT_PRIVATE.FORM.DELETE,
        { id }
      );

      if (response.data?.status !== BACKEND_STATUS.SUCCESS) {
        throw new Error(response.data?.message || 'Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }

  /**
   * Transform backend forms to FormSummary format
   */
  private transformToFormSummaries(forms: BackendForm[]): FormSummary[] {
    // Group by formName and assign versions
    const grouped = forms.reduce((acc: Record<string, BackendForm[]>, form: BackendForm) => {
      if (!acc[form.formName]) {
        acc[form.formName] = [];
      }
      acc[form.formName].push(form);
      return acc;
    }, {});

    const result: FormSummary[] = [];
    Object.keys(grouped).forEach(formName => {
      grouped[formName].forEach((form: BackendForm, index: number) => {
        result.push({
          id: form.id,
          name: form.formName,
          version: index + 1
        });
      });
    });

    return result;
  }

  /**
   * Convert FormSummary to FormDefinition (for API compatibility)
   */
  async getFormDefinition(id: string): Promise<FormDefinition> {
    const formDto = await this.getForm(id);
    
    return {
      id: formDto.id!,
      name: formDto.name,
      description: `Form definition for ${formDto.name}`,
      fields: [], // Would need to parse formDto.json to extract fields
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: formDto.version?.toString() || '1'
      }
    };
  }
}

// Export singleton instance
export const formsService = new FormsService();

// Export legacy API for backward compatibility
export const searchForms = (term: string) => formsService.searchForms(term);
export const listForms = () => formsService.listForms().then(response => response.data);
export const getForm = (id: string) => formsService.getForm(id);
export const createForm = (payload: FormDTO) => formsService.createForm(payload);

export default formsService;