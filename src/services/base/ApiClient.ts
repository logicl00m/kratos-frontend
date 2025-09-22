import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
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
  private instance: AxiosInstance;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

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
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      async (response) => {
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

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.message || 'Server error occurred',
        code: error.response.data?.code || error.response.status,
        status: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
        details: error.request,
      };
    } else {
      // Request setup error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_ERROR',
        details: error,
      };
    }
  }

  // HTTP Methods
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<T>(url, config);
    return response;
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<T>(url, data, config);
    return response;
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<T>(url, data, config);
    return response;
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<T>(url, data, config);
    return response;
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<T>(url, config);
    return response;
  }

  // Utility methods
  async upload<T = unknown>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
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
    const response = await this.get(url, {
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