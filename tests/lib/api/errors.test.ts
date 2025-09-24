import { describe, it, expect, vi } from 'vitest';
import type { AxiosError } from 'axios';
import { handleAxiosError, logApiError } from '@/lib/api/errors';

describe('API Error Handling', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleSpy.mockClear();
  });

  describe('handleAxiosError', () => {
    it('should handle response errors with custom message', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: {
            message: 'Validation failed',
            errors: ['Field required']
          },
          headers: {},
          config: {} as any
        },
        message: 'Request failed with status 400'
      };

      const error = handleAxiosError(axiosError as AxiosError);

      expect(error.status).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.details).toEqual({
        message: 'Validation failed',
        errors: ['Field required']
      });
    });

    it('should handle response errors without custom message', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: null,
          headers: {},
          config: {} as any
        },
        message: 'Request failed with status 500'
      };

      const error = handleAxiosError(axiosError as AxiosError);

      expect(error.status).toBe(500);
      expect(error.message).toBe('Request failed with status 500');
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should handle network errors (no response)', () => {
      const axiosError: Partial<AxiosError> = {
        request: {},
        message: 'Network Error'
      };

      const error = handleAxiosError(axiosError as AxiosError);

      expect(error.status).toBe(0);
      expect(error.message).toBe('Network error: Unable to reach the server');
      expect(error.code).toBe('NETWORK_ERROR');
    });

    it('should handle request setup errors', () => {
      const axiosError: Partial<AxiosError> = {
        message: 'Request configuration error'
      };

      const error = handleAxiosError(axiosError as AxiosError);

      expect(error.status).toBe(0);
      expect(error.message).toBe('Request configuration error');
      expect(error.code).toBe('REQUEST_ERROR');
    });

    it('should map common HTTP status codes', () => {
      const testCases = [
        { status: 400, code: 'BAD_REQUEST' },
        { status: 401, code: 'UNAUTHORIZED' },
        { status: 403, code: 'FORBIDDEN' },
        { status: 404, code: 'NOT_FOUND' },
        { status: 409, code: 'CONFLICT' },
        { status: 422, code: 'UNPROCESSABLE_ENTITY' },
        { status: 429, code: 'TOO_MANY_REQUESTS' },
        { status: 500, code: 'INTERNAL_SERVER_ERROR' },
        { status: 502, code: 'BAD_GATEWAY' },
        { status: 503, code: 'SERVICE_UNAVAILABLE' },
        { status: 504, code: 'GATEWAY_TIMEOUT' }
      ];

      testCases.forEach(({ status, code }) => {
        const axiosError: Partial<AxiosError> = {
          response: {
            status,
            statusText: '',
            data: null,
            headers: {},
            config: {} as any
          },
          message: `Error ${status}`
        };

        const error = handleAxiosError(axiosError as AxiosError);
        expect(error.code).toBe(code);
      });
    });

    it('should use UNKNOWN_ERROR for unmapped status codes', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          status: 418, // I'm a teapot
          statusText: "I'm a teapot",
          data: null,
          headers: {},
          config: {} as any
        },
        message: "I'm a teapot"
      };

      const error = handleAxiosError(axiosError as AxiosError);
      expect(error.code).toBe('UNKNOWN_ERROR');
    });

    it('should include isClientError and isServerError methods', () => {
      // Client error (4xx)
      const clientError: Partial<AxiosError> = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: null,
          headers: {},
          config: {} as any
        }
      };

      const error404 = handleAxiosError(clientError as AxiosError);
      expect(error404.isClientError()).toBe(true);
      expect(error404.isServerError()).toBe(false);

      // Server error (5xx)
      const serverError: Partial<AxiosError> = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: null,
          headers: {},
          config: {} as any
        }
      };

      const error500 = handleAxiosError(serverError as AxiosError);
      expect(error500.isClientError()).toBe(false);
      expect(error500.isServerError()).toBe(true);

      // Network error
      const networkError: Partial<AxiosError> = {
        request: {},
        message: 'Network Error'
      };

      const error0 = handleAxiosError(networkError as AxiosError);
      expect(error0.isClientError()).toBe(false);
      expect(error0.isServerError()).toBe(false);
    });
  });

  describe('logApiError', () => {
    it('should log error with context in development', () => {
      const originalEnv = import.meta.env.DEV;
      Object.defineProperty(import.meta.env, 'DEV', {
        value: true,
        writable: true
      });

      const error = {
        status: 403,
        message: 'Access denied',
        code: 'FORBIDDEN',
        details: { reason: 'Insufficient permissions' },
        timestamp: new Date().toISOString(),
        isClientError: () => true,
        isServerError: () => false
      };

      logApiError(error, 'Auth Check');

      expect(consoleSpy).toHaveBeenCalled();

      Object.defineProperty(import.meta.env, 'DEV', {
        value: originalEnv,
        writable: true
      });
    });

    it('should not log in production', () => {
      const originalEnv = import.meta.env.DEV;
      Object.defineProperty(import.meta.env, 'DEV', {
        value: false,
        writable: true
      });

      const error = {
        status: 500,
        message: 'Server error',
        code: 'INTERNAL_SERVER_ERROR',
        isClientError: () => false,
        isServerError: () => true
      };

      logApiError(error, 'Production Error');

      expect(consoleSpy).not.toHaveBeenCalled();

      Object.defineProperty(import.meta.env, 'DEV', {
        value: originalEnv,
        writable: true
      });
    });
  });
});