import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiClient } from '@/services/base/ApiClientNew';
import * as responseParser from '@/lib/api/response-parser';

vi.mock('axios');
vi.mock('@/lib/api/response-parser', () => ({
  extractResponseData: vi.fn(),
  logResponseParsing: vi.fn()
}));

describe('ApiClientNew', () => {
  let apiClient: ApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock axios instance
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

    apiClient = new ApiClient({
      baseURL: 'http://test-api.com',
      timeout: 10000
    });
  });

  describe('Constructor and Configuration', () => {
    it('should create axios instance with provided config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://test-api.com',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
    });

    it('should use default values when config is not provided', () => {
      new ApiClient();

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
    });

    it('should setup interceptors on initialization', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('HTTP Methods', () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse: AxiosResponse = {
      data: { status: 'S2000', message: 'Success', data: mockData },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as AxiosRequestConfig
    };

    beforeEach(() => {
      vi.mocked(responseParser.extractResponseData).mockReturnValue(mockData);
    });

    it('should make GET request and extract data', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(responseParser.extractResponseData).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockData);
    });

    it('should make POST request with data', async () => {
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      const postData = { title: 'New Item' };

      const result = await apiClient.post('/test', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make PUT request with data', async () => {
      mockAxiosInstance.put.mockResolvedValue(mockResponse);
      const updateData = { name: 'Updated' };

      const result = await apiClient.put('/test/1', updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', updateData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make PATCH request with data', async () => {
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);
      const patchData = { status: 'active' };

      const result = await apiClient.patch('/test/1', patchData);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', patchData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make DELETE request', async () => {
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('/test/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('Interceptors', () => {
    let requestInterceptor: Function;
    let requestErrorInterceptor: Function;
    let responseInterceptor: Function;
    let responseErrorInterceptor: Function;

    beforeEach(() => {
      // Capture interceptors
      const requestUse = mockAxiosInstance.interceptors.request.use.mock.calls[0];
      requestInterceptor = requestUse[0];
      requestErrorInterceptor = requestUse[1];

      const responseUse = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      responseInterceptor = responseUse[0];
      responseErrorInterceptor = responseUse[1];
    });

    it('should add custom request interceptor', async () => {
      const customInterceptor = {
        onRequest: vi.fn((config) => ({
          ...config,
          headers: { ...config.headers, 'X-Custom': 'header' }
        }))
      };

      apiClient.addRequestInterceptor(customInterceptor);

      const config = { url: '/test' };
      await requestInterceptor(config);

      expect(customInterceptor.onRequest).toHaveBeenCalledWith(config);
    });

    it('should add custom response interceptor', async () => {
      const customInterceptor = {
        onResponse: vi.fn((response) => response)
      };

      apiClient.addResponseInterceptor(customInterceptor);

      const response = { data: 'test', status: 200 };
      await responseInterceptor(response);

      expect(customInterceptor.onResponse).toHaveBeenCalledWith(response);
    });

    it('should handle request errors', async () => {
      const error = new Error('Request failed');

      await expect(requestErrorInterceptor(error)).rejects.toThrow('Request failed: Request failed');
    });

    it('should handle response errors', async () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' },
          headers: {},
          config: {} as AxiosRequestConfig
        }
      };

      await expect(responseErrorInterceptor(axiosError)).rejects.toThrow('Resource not found');
    });

    it('should handle network errors', async () => {
      const axiosError: Partial<AxiosError> = {
        request: {},
        message: 'Network Error'
      };

      await expect(responseErrorInterceptor(axiosError)).rejects.toThrow(
        'No response from server. Please check your connection.'
      );
    });
  });

  describe('File Operations', () => {
    it('should upload file with progress tracking', async () => {
      const formData = new FormData();
      formData.append('file', new File(['content'], 'test.txt'));
      const progressCallback = vi.fn();

      const mockResponse = {
        data: { status: 'S2000', message: 'Upload successful', data: { fileId: '123' } }
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      vi.mocked(responseParser.extractResponseData).mockReturnValue({ fileId: '123' });

      const result = await apiClient.upload('/upload', formData, progressCallback);

      const callConfig = mockAxiosInstance.post.mock.calls[0][2];
      expect(callConfig.headers['Content-Type']).toBe('multipart/form-data');
      expect(callConfig.onUploadProgress).toBeDefined();

      // Simulate progress
      callConfig.onUploadProgress({ loaded: 50, total: 100 });
      expect(progressCallback).toHaveBeenCalledWith(50);

      expect(result).toEqual({ fileId: '123' });
    });

    it('should download file', async () => {
      const blob = new Blob(['file content']);
      mockAxiosInstance.get.mockResolvedValue({ data: blob });

      // Mock DOM methods
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn()
      };
      createElementSpy.mockReturnValue(mockLink as any);

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null);
      const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
      const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL');

      await apiClient.download('/download', 'output.pdf');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/download', {
        responseType: 'blob'
      });
      expect(mockLink.download).toBe('output.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('Cancel Token', () => {
    it('should create cancel token', () => {
      const mockSource = { token: 'token', cancel: vi.fn() };
      axios.CancelToken = { source: vi.fn().mockReturnValue(mockSource) } as any;

      const source = apiClient.createCancelToken();

      expect(source).toEqual(mockSource);
    });

    it('should check if error is cancel error', () => {
      const mockIsCancel = vi.fn().mockReturnValue(true);
      axios.isCancel = mockIsCancel;

      const error = new Error('Cancelled');
      const result = apiClient.isCancel(error);

      expect(mockIsCancel).toHaveBeenCalledWith(error);
      expect(result).toBe(true);
    });
  });
});