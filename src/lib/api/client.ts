import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getAuthToken, clearAuthToken, isTokenExpired, willTokenExpireSoon, getSubject } from './auth';
import { handleAxiosError, logApiError, type ApiError } from './errors';
import { extractResponseData, logResponseParsing } from './response-parser';
import type { ApiConfig } from './types';
import { DEFAULT_API_CONFIG, DEFAULT_HEADERS, isDevelopment } from './config';

/**
 * Create and configure the axios instance
 */
const createApiClient = (config: Partial<ApiConfig> = {}): AxiosInstance => {
  const finalConfig = { ...DEFAULT_API_CONFIG, ...config };

  const client = axios.create({
    baseURL: finalConfig.baseURL,
    timeout: finalConfig.timeout,
    headers: {
      ...DEFAULT_HEADERS,
    },
  });

  // Request interceptor for authentication and logging
  client.interceptors.request.use(
    (config) => {
      // Add authentication token - use hardcoded token from env if available, otherwise use stored token
      const hardcodedToken = import.meta.env.VITE_HARDCODED_ACCESS_TOKEN;
      const storedToken = getAuthToken();
      
      if (hardcodedToken) {
        config.headers.Authorization = `Bearer ${hardcodedToken}`;
      } else if (storedToken && !isTokenExpired()) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }

      // Add X-Subject header - use hardcoded subject ID from env if available, otherwise use stored subject
      if (!config.headers['X-Subject']) {
        const hardcodedSubject = import.meta.env.VITE_HARDCODED_SUBJECT_ID;
        const storedSubject = getSubject();
        config.headers['X-Subject'] = hardcodedSubject || storedSubject || finalConfig.defaultSubject;
      }

      // Log the request in development
      if (isDevelopment()) {
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
      if (isDevelopment()) {
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
 * Generic API request wrapper with centralized response parsing
 * Returns only the extracted data portion of the server response
 */
export const apiRequest = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.request(config);
    
    // Log response parsing in development
    if (isDevelopment()) {
      logResponseParsing(
        config.url || 'unknown',
        config.method || 'unknown',
        response
      );
    }
    
    // Extract and return only the data portion
    return extractResponseData<T>(response);
  } catch (error) {
    // Re-throw as our custom ApiError
    throw error instanceof Error ? error : handleAxiosError(error as never);
  }
};

/**
 * HTTP method helpers with centralized response parsing
 * All methods return only the extracted data from the server response
 */
export const api = {
  /**
   * GET request - returns extracted data
   */
  get: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ ...config, method: 'GET', url });
  },

  /**
   * POST request - returns extracted data
   */
  post: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ ...config, method: 'POST', url, data });
  },

  /**
   * PUT request - returns extracted data
   */
  put: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ ...config, method: 'PUT', url, data });
  },

  /**
   * PATCH request - returns extracted data
   */
  patch: async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ ...config, method: 'PATCH', url, data });
  },

  /**
   * DELETE request - returns extracted data
   */
  delete: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return apiRequest<T>({ ...config, method: 'DELETE', url });
  },
};

/**
 * File upload helper - returns extracted data
 */
export const uploadFile = async <T = unknown>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<T>({
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
  maxAttempts: number = DEFAULT_API_CONFIG.retryAttempts,
  delay: number = DEFAULT_API_CONFIG.retryDelay
): Promise<T> => {
  let lastError: ApiError | undefined;

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

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Request failed after all retry attempts');
};

/**
 * Health check endpoint - returns extracted data
 */
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
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
  return DEFAULT_API_CONFIG;
};

/**
 * Update API base URL at runtime
 */
export const updateApiBaseUrl = (baseURL: string): void => {
  apiClient.defaults.baseURL = baseURL;
};