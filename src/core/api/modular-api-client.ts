/**
 * Modular API Client Implementation
 * A highly modular and testable API client with feature flag support
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import {
  IApiClient,
  IRequestConfig,
  IInterceptor,
  IApiResponse,
  IApiError,
  IProgressEvent,
  IStandardApiResponse
} from './api-client.interface';
import { getConfig } from '../config/app.config';
import { isFeatureEnabled, FEATURE_FLAGS } from '../config/feature-flags.config';
import { createLogger } from '../logger/logger';
import { Service, Inject } from '../di/container';
import { IAuthService } from '../auth/auth.interface';
import { ICacheService } from '../cache/cache.interface';

const logger = createLogger('ModularApiClient');

@Service('ApiClient')
export class ModularApiClient implements IApiClient {
  private axiosInstance: AxiosInstance;
  private interceptors: IInterceptor[] = [];
  private defaultHeaders: Record<string, string> = {};

  constructor(
    @Inject('AuthService') private authService?: IAuthService,
    @Inject('CacheService') private cacheService?: ICacheService
  ) {
    this.axiosInstance = this.createAxiosInstance();
    this.setupDefaultInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    const config = getConfig();

    return axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      withCredentials: config.api.withCredentials,
      headers: {
        ...config.api.headers,
        ...this.defaultHeaders
      }
    });
  }

  private setupDefaultInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Apply custom interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.request?.onRequest) {
            const customConfig = await interceptor.request.onRequest(this.mapAxiosConfigToRequest(config));
            Object.assign(config, customConfig);
          }
        }

        // Add authentication if available
        if (this.authService && isFeatureEnabled(FEATURE_FLAGS.NEW_API_CLIENT)) {
          const token = await this.authService.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          const subject = await this.authService.getSubject();
          if (subject) {
            config.headers['X-Subject'] = subject;
          }
        }

        // Log request if debug mode
        if (isFeatureEnabled(FEATURE_FLAGS.DEBUG_MODE)) {
          logger.apiRequest(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
        }

        return config;
      },
      async (error) => {
        // Apply custom error interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.request?.onError) {
            error = await interceptor.request.onError(error);
          }
        }

        logger.error('Request interceptor error', error);
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      async (response) => {
        // Apply custom interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.response?.onResponse) {
            const customResponse = await interceptor.response.onResponse(this.mapAxiosResponse(response));
            if (customResponse) {
              Object.assign(response, customResponse);
            }
          }
        }

        // Log response if debug mode
        if (isFeatureEnabled(FEATURE_FLAGS.DEBUG_MODE)) {
          logger.apiResponse(
            response.config.method?.toUpperCase() || 'GET',
            response.config.url || '',
            response.status,
            response.data
          );
        }

        // Extract data from standard response format
        if (this.isStandardApiResponse(response.data)) {
          return { ...response, data: response.data.data };
        }

        return response;
      },
      async (error) => {
        // Apply custom error interceptors
        for (const interceptor of this.interceptors) {
          if (interceptor.response?.onError) {
            error = await interceptor.response.onError(this.handleError(error));
          }
        }

        const apiError = this.handleError(error);

        // Handle authentication errors
        if (apiError.status === 401 && this.authService) {
          if (isFeatureEnabled(FEATURE_FLAGS.AUTH_REFRESH_TOKEN)) {
            try {
              await this.authService.refreshToken();
              // Retry original request
              return this.axiosInstance.request(error.config);
            } catch (refreshError) {
              await this.authService.logout();
            }
          } else {
            await this.authService.logout();
          }
        }

        logger.error('Response interceptor error', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  async get<T = any>(url: string, config?: IRequestConfig): Promise<T> {
    // Check cache if enabled
    if (this.cacheService && isFeatureEnabled(FEATURE_FLAGS.API_CACHING)) {
      const cacheKey = this.getCacheKey('GET', url, config?.params);
      const cached = await this.cacheService.get<T>(cacheKey);
      if (cached !== null) {
        logger.debug('Cache hit', { url, cacheKey });
        return cached;
      }
    }

    const response = await this.request<T>('GET', url, undefined, config);

    // Store in cache if enabled
    if (this.cacheService && isFeatureEnabled(FEATURE_FLAGS.API_CACHING)) {
      const cacheKey = this.getCacheKey('GET', url, config?.params);
      const cacheTTL = getConfig().api.cacheTTL;
      await this.cacheService.set(cacheKey, response, cacheTTL);
    }

    return response;
  }

  async post<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: IRequestConfig): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T = any>(url: string, config?: IRequestConfig): Promise<T> {
    // Invalidate cache for this resource
    if (this.cacheService && isFeatureEnabled(FEATURE_FLAGS.API_CACHING)) {
      const cachePattern = `*${url}*`;
      await this.cacheService.invalidate(cachePattern);
    }

    return this.request<T>('DELETE', url, undefined, config);
  }

  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const config: IRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    };

    return this.post<T>(url, formData, config);
  }

  async download(url: string, filename?: string): Promise<void> {
    const response = await this.axiosInstance.get(url, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || this.extractFilenameFromUrl(url) || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  setHeader(name: string, value: string): void {
    this.defaultHeaders[name] = value;
    this.axiosInstance.defaults.headers.common[name] = value;
  }

  removeHeader(name: string): void {
    delete this.defaultHeaders[name];
    delete this.axiosInstance.defaults.headers.common[name];
  }

  setBaseURL(url: string): void {
    this.axiosInstance.defaults.baseURL = url;
  }

  addInterceptor(interceptor: IInterceptor): void {
    this.interceptors.push(interceptor);
  }

  removeInterceptor(interceptor: IInterceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: IRequestConfig
  ): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      data,
      ...this.mapRequestConfigToAxios(config)
    };

    // Implement retry logic if enabled
    if (isFeatureEnabled(FEATURE_FLAGS.API_RETRY)) {
      return this.requestWithRetry<T>(axiosConfig);
    }

    const response = await this.axiosInstance.request<T>(axiosConfig);
    return response.data;
  }

  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    attempt = 1
  ): Promise<T> {
    const maxAttempts = getConfig().api.retryAttempts;
    const retryDelay = getConfig().api.retryDelay;

    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      const apiError = this.handleError(error);

      // Don't retry client errors (except 429)
      if (apiError.status && apiError.status >= 400 && apiError.status < 500 && apiError.status !== 429) {
        throw apiError;
      }

      if (attempt >= maxAttempts) {
        throw apiError;
      }

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt - 1);
      logger.info(`Retrying request (attempt ${attempt + 1}/${maxAttempts}) after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.requestWithRetry<T>(config, attempt + 1);
    }
  }

  private mapRequestConfigToAxios(config?: IRequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
      withCredentials: config.withCredentials,
      signal: config.signal,
      responseType: config.responseType as any,
      validateStatus: config.validateStatus,
      onUploadProgress: config.onUploadProgress as any,
      onDownloadProgress: config.onDownloadProgress as any
    };
  }

  private mapAxiosConfigToRequest(config: AxiosRequestConfig): IRequestConfig {
    return {
      headers: config.headers as Record<string, string>,
      params: config.params,
      timeout: config.timeout,
      withCredentials: config.withCredentials,
      signal: config.signal,
      responseType: config.responseType as any,
      validateStatus: config.validateStatus,
      onUploadProgress: config.onUploadProgress as any,
      onDownloadProgress: config.onDownloadProgress as any
    };
  }

  private mapAxiosResponse<T>(response: AxiosResponse<T>): IApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      config: this.mapAxiosConfigToRequest(response.config)
    };
  }

  private handleError(error: any): IApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      return {
        message: axiosError.message,
        code: axiosError.code || 'UNKNOWN',
        status: axiosError.response?.status,
        response: axiosError.response ? this.mapAxiosResponse(axiosError.response) : undefined,
        request: axiosError.request,
        config: this.mapAxiosConfigToRequest(axiosError.config || {}),
        isNetworkError: !axiosError.response,
        isTimeout: axiosError.code === 'ECONNABORTED',
        isCancelled: axios.isCancel(error)
      };
    }

    return {
      message: error?.message || 'Unknown error',
      code: 'UNKNOWN',
      isNetworkError: false,
      isTimeout: false,
      isCancelled: false
    };
  }

  private isStandardApiResponse(data: any): data is IStandardApiResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'status' in data &&
      'message' in data &&
      'data' in data
    );
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${method}:${url}:${paramString}`;
  }

  private extractFilenameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || null;
    } catch {
      return null;
    }
  }
}