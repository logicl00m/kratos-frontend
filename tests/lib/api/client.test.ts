import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  api,
  apiRequest,
  uploadFile,
  downloadFile,
  retryRequest,
  healthCheck,
  updateApiBaseUrl
} from '@/lib/api/client';
import * as auth from '@/lib/api/auth';
import * as responseParser from '@/lib/api/response-parser';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock auth module
vi.mock('@/lib/api/auth', () => ({
  getAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  isTokenExpired: vi.fn(),
  willTokenExpireSoon: vi.fn(),
  getSubject: vi.fn()
}));

// Mock response parser
vi.mock('@/lib/api/response-parser', () => ({
  extractResponseData: vi.fn(),
  logResponseParsing: vi.fn()
}));

describe('API Client', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      request: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      defaults: {
        baseURL: 'http://localhost:8080'
      },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };

    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
  });

  describe('API Request Methods', () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = {
      data: {
        status: 'S2000',
        message: 'Success',
        data: mockData
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    };

    beforeEach(() => {
      vi.mocked(responseParser.extractResponseData).mockReturnValue(mockData);
      mockAxiosInstance.request.mockResolvedValue(mockResponse);
    });

    it('should make GET request and return extracted data', async () => {
      const result = await api.get('/test');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test'
      });
      expect(responseParser.extractResponseData).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(mockData);
    });

    it('should make POST request with data', async () => {
      const postData = { title: 'New Item' };
      const result = await api.post('/test', postData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data: postData
      });
      expect(result).toEqual(mockData);
    });

    it('should make PUT request with data', async () => {
      const updateData = { name: 'Updated' };
      const result = await api.put('/test/1', updateData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/test/1',
        data: updateData
      });
      expect(result).toEqual(mockData);
    });

    it('should make PATCH request with data', async () => {
      const patchData = { status: 'active' };
      const result = await api.patch('/test/1', patchData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/test/1',
        data: patchData
      });
      expect(result).toEqual(mockData);
    });

    it('should make DELETE request', async () => {
      const result = await api.delete('/test/1');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/test/1'
      });
      expect(result).toEqual(mockData);
    });

    it('should pass custom config to requests', async () => {
      const customHeaders = { 'X-Custom-Header': 'value' };
      await api.get('/test', { headers: customHeaders });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        headers: customHeaders
      });
    });
  });

  describe('File Operations', () => {
    it('should upload file with progress tracking', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const progressCallback = vi.fn();
      const mockResponse = {
        data: { status: 'S2000', message: 'Upload successful', data: { fileId: '123' } },
        status: 200
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      vi.mocked(responseParser.extractResponseData).mockReturnValue({ fileId: '123' });

      const result = await uploadFile('/upload', file, progressCallback);

      const callArgs = mockAxiosInstance.request.mock.calls[0][0];
      expect(callArgs.method).toBe('POST');
      expect(callArgs.url).toBe('/upload');
      expect(callArgs.data).toBeInstanceOf(FormData);
      expect(callArgs.headers['Content-Type']).toBe('multipart/form-data');
      expect(callArgs.onUploadProgress).toBeDefined();

      // Simulate progress event
      const progressEvent = { loaded: 50, total: 100 };
      callArgs.onUploadProgress(progressEvent);
      expect(progressCallback).toHaveBeenCalledWith(50);

      expect(result).toEqual({ fileId: '123' });
    });

    it('should download file and create download link', async () => {
      const blob = new Blob(['file content']);
      const mockResponse = { data: blob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Mock DOM methods
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null);

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      createElementSpy.mockReturnValue(mockLink as any);

      // Mock URL methods
      const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
      const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL');

      await downloadFile('/download', 'output.pdf');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/download', {
        responseType: 'blob'
      });
      expect(mockLink.download).toBe('output.pdf');
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed requests up to max attempts', async () => {
      const requestFn = vi.fn()
        .mockRejectedValueOnce({
          status: 500,
          isClientError: () => false,
          isServerError: () => true
        })
        .mockRejectedValueOnce({
          status: 503,
          isClientError: () => false,
          isServerError: () => true
        })
        .mockResolvedValueOnce({ data: 'success' });

      const result = await retryRequest(requestFn, 3, 10);

      expect(requestFn).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    it('should not retry client errors except 429', async () => {
      const requestFn = vi.fn().mockRejectedValue({
        status: 400,
        isClientError: () => true,
        isServerError: () => false
      });

      await expect(retryRequest(requestFn, 3, 10)).rejects.toEqual({
        status: 400,
        isClientError: expect.any(Function),
        isServerError: expect.any(Function)
      });

      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on rate limit (429) errors', async () => {
      const requestFn = vi.fn()
        .mockRejectedValueOnce({
          status: 429,
          isClientError: () => true,
          isServerError: () => false
        })
        .mockResolvedValueOnce({ data: 'success' });

      const result = await retryRequest(requestFn, 3, 10);

      expect(requestFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: 'success' });
    });

    it('should throw after all retry attempts fail', async () => {
      const requestFn = vi.fn().mockRejectedValue({
        status: 500,
        isClientError: () => false,
        isServerError: () => true
      });

      await expect(retryRequest(requestFn, 2, 10)).rejects.toEqual({
        status: 500,
        isClientError: expect.any(Function),
        isServerError: expect.any(Function)
      });

      expect(requestFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Health Check', () => {
    it('should call health endpoint', async () => {
      const healthData = { status: 'healthy', timestamp: '2024-01-01T00:00:00Z' };
      mockAxiosInstance.request.mockResolvedValue({
        data: { status: 'S2000', message: 'Health check passed', data: healthData }
      });
      vi.mocked(responseParser.extractResponseData).mockReturnValue(healthData);

      const result = await healthCheck();

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/health'
      });
      expect(result).toEqual(healthData);
    });
  });

  describe('Base URL Management', () => {
    it('should update API base URL at runtime', () => {
      const newBaseURL = 'https://api.production.com';
      updateApiBaseUrl(newBaseURL);

      expect(mockAxiosInstance.defaults.baseURL).toBe(newBaseURL);
    });
  });
});