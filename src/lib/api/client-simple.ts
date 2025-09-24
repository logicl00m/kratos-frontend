/**
 * Simple API Client
 * A straightforward axios wrapper with auth and error handling
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { auth } from './auth-simple';

// API Response format from backend
interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
}

// API Error format
export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add auth token and subject ID
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = auth.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add subject ID
        const subjectId = auth.getSubjectId();
        if (subjectId) {
          config.headers['X-Subject'] = subjectId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Extract data and handle errors
    this.client.interceptors.response.use(
      (response) => {
        // If response has our standard format, extract data
        const responseData = response.data as ApiResponse;

        // Check if it's a standard API response
        if (responseData && typeof responseData === 'object' && 'status' in responseData) {
          // Return the data portion directly
          return responseData.data || responseData;
        }

        // Return raw data for non-standard responses
        return response.data;
      },
      (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
          throw new ApiError('Network error', 0, 'NETWORK_ERROR');
        }

        // Handle 401 Unauthorized
        if (error.response.status === 401) {
          auth.clearTokens();
          // Optionally redirect to login
          if (import.meta.env.VITE_ENABLE_AUTH_REDIRECT === 'true') {
            window.location.href = '/login';
          }
        }

        // Extract error message
        const data = error.response.data as any;
        const message = data?.message || error.message || 'Request failed';

        throw new ApiError(
          message,
          error.response.status,
          data?.status || error.code,
          data
        );
      }
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }

  /**
   * Upload file
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * Download file
   */
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),

  uploadFile: <T = any>(url: string, file: File, onProgress?: (progress: number) => void) =>
    apiClient.uploadFile<T>(url, file, onProgress),

  downloadFile: (url: string, filename?: string) =>
    apiClient.downloadFile(url, filename),
};