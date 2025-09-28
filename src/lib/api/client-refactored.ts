/**
 * Unified API Client
 * Single source of truth for all API communications
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios';
import { auth } from './auth-simple';

// API Response format from backend
interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
}

// API Error class
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

  isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }
}

class UnifiedApiClient {
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
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Check for hardcoded token first (development)
        const hardcodedToken = import.meta.env.VITE_HARDCODED_ACCESS_TOKEN;
        const token = hardcodedToken || auth.getAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add subject ID
        const hardcodedSubject = import.meta.env.VITE_HARDCODED_SUBJECT_ID;
        const subjectId = hardcodedSubject || auth.getSubjectId();

        if (subjectId) {
          config.headers['X-Subject'] = subjectId;
        }

        // Log in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log in development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }

        // Extract data from standard API response format
        const responseData = response.data as ApiResponse;

        if (responseData && typeof responseData === 'object' && 'status' in responseData) {
          // Return the data portion directly
          return { ...response, data: responseData.data || responseData };
        }

        // Return response as-is for non-standard responses
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error);

        // Handle 401 Unauthorized
        if (apiError.status === 401) {
          auth.clearTokens();

          if (import.meta.env.VITE_ENABLE_AUTH_REDIRECT === 'true') {
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return new ApiError(
          'Network error. Please check your connection.',
          0,
          'NETWORK_ERROR'
        );
      }

      const data = error.response.data as any;
      const message = data?.message || error.message || 'Request failed';

      return new ApiError(
        message,
        error.response.status,
        data?.code || error.code,
        data
      );
    }

    return new ApiError(
      error?.message || 'An unexpected error occurred',
      undefined,
      'UNKNOWN_ERROR',
      error
    );
  }

  // Core HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Utility methods
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<T>(url, formData, {
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

  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Create cancel token for request cancellation
  createCancelToken() {
    return axios.CancelToken.source();
  }

  isCancel(error: unknown): boolean {
    return axios.isCancel(error);
  }

  // Get raw axios instance for advanced usage
  getRawClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new UnifiedApiClient();

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

// Export for backward compatibility
export default apiClient;