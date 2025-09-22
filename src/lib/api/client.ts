import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getAuthToken, clearAuthToken, isTokenExpired, willTokenExpireSoon } from './auth';
import { handleAxiosError, logApiError, type ApiError } from './errors';
import type { ApiConfig, ApiResponse } from './types';

/**
 * Default API configuration
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'https://kratos-api.local.fintech23.xyz',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT as string) || 30000,
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS as string) || 3,
  retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY as string) || 1000,
};

/**
 * Create and configure the axios instance
 */
const createApiClient = (config: Partial<ApiConfig> = {}): AxiosInstance => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const client = axios.create({
    baseURL: finalConfig.baseURL,
    timeout: finalConfig.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
  });

  // Request interceptor for authentication and logging
  client.interceptors.request.use(
    (config) => {
      // Add authentication token if available and not expired
      const token = getAuthToken();
      if (token && !isTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add X-Subject header (from your API spec)
      if (!config.headers['X-Subject']) {
        config.headers['X-Subject'] = '4a286067-5a97-451e-825c-942ce5bfc727';
      }

      // Log the request in development
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      const apiError = handleAxiosError(error);
      logApiError(apiError, 'Request Interceptor');
      return Promise.reject(apiError);
    }
  );

  // Response interceptor for error handling and token refresh
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses in development
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }

      // Check if token will expire soon and warn
      if (willTokenExpireSoon(5)) {
        console.warn('🔔 Auth token will expire soon. Consider refreshing.');
      }

      return response;
    },
    async (error) => {
      const apiError = handleAxiosError(error);
      
      // Handle 401 errors (unauthorized)
      if (apiError.status === 401) {
        console.warn('🔒 Authentication failed. Clearing tokens and redirecting to login.');
        clearAuthToken();
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Log the error
      logApiError(apiError, 'Response Interceptor');

      return Promise.reject(apiError);
    }
  );

  return client;
};

/**
 * Main API client instance
 */
export const apiClient = createApiClient();

/**
 * Generic API request wrapper with type safety
 */
export const apiRequest = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    // Re-throw as our custom ApiError
    throw error instanceof Error ? error : handleAxiosError(error as never);
  }
};

/**
 * HTTP method helpers with type safety
 */
export const api = {
  /**
   * GET request
   */
  get: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'GET', url });
  },

  /**
   * POST request
   */
  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'POST', url, data });
  },

  /**
   * PUT request
   */
  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'PUT', url, data });
  },

  /**
   * PATCH request
   */
  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'PATCH', url, data });
  },

  /**
   * DELETE request
   */
  delete: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>({ ...config, method: 'DELETE', url });
  },
};

/**
 * File upload helper
 */
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest({
    method: 'POST',
    url,
    data: formData,
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
};

/**
 * Download file helper
 */
export const downloadFile = async (
  url: string,
  filename?: string
): Promise<void> => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw handleAxiosError(error as never);
  }
};

/**
 * Retry mechanism for failed requests
 */
export const retryRequest = async <T = unknown>(
  requestFn: () => Promise<T>,
  maxAttempts: number = DEFAULT_CONFIG.retryAttempts,
  delay: number = DEFAULT_CONFIG.retryDelay
): Promise<T> => {
  let lastError: ApiError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as ApiError;

      // Don't retry client errors (4xx) except 429 (rate limit)
      if (lastError.isClientError() && lastError.status !== 429) {
        throw lastError;
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying request in ${waitTime}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
  return api.get('/health');
};

/**
 * Create a new API client instance with custom configuration
 */
export const createCustomApiClient = (config: Partial<ApiConfig>): AxiosInstance => {
  return createApiClient(config);
};

/**
 * Get the current API configuration
 */
export const getApiConfig = (): ApiConfig => {
  return DEFAULT_CONFIG;
};

/**
 * Update API base URL at runtime
 */
export const updateApiBaseUrl = (baseURL: string): void => {
  apiClient.defaults.baseURL = baseURL;
};