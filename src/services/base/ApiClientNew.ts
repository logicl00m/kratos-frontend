import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { extractResponseData, logResponseParsing } from '@/lib/api/response-parser';

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface ApiError {
  message: string;
  code: string | number;
  status?: number;
  details?: unknown;
}

export interface RequestInterceptor {
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRequestError?: (error: AxiosError) => Promise<AxiosError>;
}

export interface ResponseInterceptor {
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onResponseError?: (error: AxiosError) => Promise<AxiosError>;
}

export class ApiClient {
  private readonly instance: AxiosInstance;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: ApiConfig = {}) {
    this.instance = axios.create({
      baseURL: config.baseURL || import.meta.env.VITE_API_URL || '/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials ?? true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        // Apply all request interceptors
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onRequest) {
            config = await interceptor.onRequest(config);
          }
        }
        return config;
      },
      async (error) => {
        // Apply all request error interceptors
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onRequestError) {
            error = await interceptor.onRequestError(error);
          }
        }
        return Promise.reject(new Error(`Request failed: ${error.message}`));
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      async (response) => {
        // Log response parsing in development
        if (import.meta.env.DEV && response.config.url && response.config.method) {
          logResponseParsing(response.config.url, response.config.method, response);
        }

        // Apply all response interceptors
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponse) {
            response = await interceptor.onResponse(response);
          }
        }
        return response;
      },
      async (error) => {
        // Apply all response error interceptors
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponseError) {
            error = await interceptor.onResponseError(error);
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as Record<string, unknown>;
      return new Error(
        responseData?.message as string || error.message || 'Server error occurred'
      );
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Request setup error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // HTTP Methods - Now return extracted data directly
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.get(url, config);
    return extractResponseData<T>(response);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return extractResponseData<T>(response);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return extractResponseData<T>(response);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return extractResponseData<T>(response);
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.delete(url, config);
    return extractResponseData<T>(response);
  }

  // Utility methods
  async upload<T = unknown>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    return this.post<T>(url, formData, config);
  }

  async download(
    url: string,
    filename?: string
  ): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data as BlobPart]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Cancel token support
  createCancelToken() {
    return axios.CancelToken.source();
  }

  isCancel(error: unknown): boolean {
    return axios.isCancel(error);
  }
}