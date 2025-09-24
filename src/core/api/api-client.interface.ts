/**
 * API Client Interface
 * Defines the contract for API client implementations
 */

export interface IApiClient {
  get<T = any>(url: string, config?: IRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: IRequestConfig): Promise<T>;
  upload<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T>;
  download(url: string, filename?: string): Promise<void>;
  setHeader(name: string, value: string): void;
  removeHeader(name: string): void;
  setBaseURL(url: string): void;
  addInterceptor(interceptor: IInterceptor): void;
  removeInterceptor(interceptor: IInterceptor): void;
}

export interface IRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  withCredentials?: boolean;
  signal?: AbortSignal;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  validateStatus?: (status: number) => boolean;
  onUploadProgress?: (progressEvent: IProgressEvent) => void;
  onDownloadProgress?: (progressEvent: IProgressEvent) => void;
}

export interface IProgressEvent {
  loaded: number;
  total?: number;
  progress?: number;
}

export interface IInterceptor {
  request?: IRequestInterceptor;
  response?: IResponseInterceptor;
}

export interface IRequestInterceptor {
  onRequest?: (config: IRequestConfig) => IRequestConfig | Promise<IRequestConfig>;
  onError?: (error: any) => any;
}

export interface IResponseInterceptor {
  onResponse?: (response: IApiResponse) => IApiResponse | Promise<IApiResponse>;
  onError?: (error: IApiError) => any;
}

export interface IApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: IRequestConfig;
}

export interface IApiError {
  message: string;
  code: string;
  status?: number;
  response?: IApiResponse;
  request?: any;
  config?: IRequestConfig;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isCancelled?: boolean;
}

/**
 * API Response wrapper for standardized responses
 */
export interface IStandardApiResponse<T = any> {
  status: string;
  message: string;
  data: T;
  metadata?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
}

/**
 * Paginated response interface
 */
export interface IPaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * API Error response interface
 */
export interface IErrorResponse {
  status: string;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  timestamp?: string;
  path?: string;
  requestId?: string;
}