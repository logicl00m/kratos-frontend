import { describe, it, expect, vi } from 'vitest';
import type { AxiosResponse } from 'axios';
import {
  parseApiResponse,
  extractResponseData,
  createApiError,
  isApiError,
  isValidServerResponse,
  SUCCESS_STATUS_CODES
} from '@/lib/api/response-parser';

describe('Response Parser', () => {
  const createMockResponse = (data: any, status = 200): AxiosResponse => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any
  });

  describe('parseApiResponse', () => {
    it('should parse successful response with S2000 status', () => {
      const mockData = { id: 1, name: 'Test' };
      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: mockData
      });

      const parsed = parseApiResponse(response);

      expect(parsed.data).toEqual(mockData);
      expect(parsed.isSuccess).toBe(true);
      expect(parsed.message).toBe('Success');
      expect(parsed.httpStatus).toBe(200);
      expect(parsed.customStatus).toBe('S2000');
    });

    it('should throw error for non-2xx HTTP status', () => {
      const response = createMockResponse(
        { error: 'Server Error' },
        500
      );

      expect(() => parseApiResponse(response)).toThrow('HTTP 500: Request failed');
    });

    it('should throw error for invalid response format', () => {
      const response = createMockResponse('Invalid response');

      expect(() => parseApiResponse(response)).toThrow('Invalid response format: Expected object');
    });

    it('should throw error for non-success custom status', () => {
      const response = createMockResponse({
        status: 'E4001',
        message: 'Validation failed',
        data: null
      });

      expect(() => parseApiResponse(response)).toThrow('Server error: Validation failed');
    });

    it('should throw error when data field is missing', () => {
      const response = createMockResponse({
        status: 'S2000',
        message: 'Success'
        // data field missing
      });

      expect(() => parseApiResponse(response)).toThrow('Response missing data field');
    });

    it('should handle null data in successful response', () => {
      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: null
      });

      expect(() => parseApiResponse(response)).toThrow('Response missing data field');
    });

    it('should handle empty array data', () => {
      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: []
      });

      const parsed = parseApiResponse(response);
      expect(parsed.data).toEqual([]);
      expect(parsed.isSuccess).toBe(true);
    });

    it('should handle empty object data', () => {
      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: {}
      });

      const parsed = parseApiResponse(response);
      expect(parsed.data).toEqual({});
      expect(parsed.isSuccess).toBe(true);
    });
  });

  describe('extractResponseData', () => {
    it('should extract data from successful response', () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: mockData
      });

      const data = extractResponseData(response);
      expect(data).toEqual(mockData);
    });

    it('should handle complex nested data', () => {
      const complexData = {
        user: {
          id: '123',
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        permissions: ['read', 'write']
      };

      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: complexData
      });

      const data = extractResponseData(response);
      expect(data).toEqual(complexData);
    });

    it('should preserve data types', () => {
      const typedData = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        date: '2024-01-01T00:00:00Z'
      };

      const response = createMockResponse({
        status: 'S2000',
        message: 'Success',
        data: typedData
      });

      const data = extractResponseData<typeof typedData>(response);
      expect(data).toEqual(typedData);
      expect(typeof data.string).toBe('string');
      expect(typeof data.number).toBe('number');
      expect(typeof data.boolean).toBe('boolean');
      expect(data.null).toBeNull();
      expect(Array.isArray(data.array)).toBe(true);
    });
  });

  describe('createApiError', () => {
    it('should create API error with all fields', () => {
      const error = createApiError(
        404,
        'Resource not found',
        'RESOURCE_NOT_FOUND',
        { resource: 'user', id: '123' }
      );

      expect(error.status).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
      expect(error.details).toEqual({ resource: 'user', id: '123' });
      expect(error.timestamp).toBeDefined();
    });

    it('should create error without optional fields', () => {
      const error = createApiError(500, 'Internal server error');

      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('isApiError', () => {
    it('should identify valid API errors', () => {
      const apiError = createApiError(400, 'Bad request');
      expect(isApiError(apiError)).toBe(true);
    });

    it('should reject non-API errors', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
      expect(isApiError({})).toBe(false);
      expect(isApiError({ message: 'Error' })).toBe(false);
      expect(isApiError(new Error('Standard error'))).toBe(false);
    });
  });

  describe('isValidServerResponse', () => {
    it('should validate correct server response format', () => {
      const validResponse = {
        status: 'S2000',
        message: 'Success',
        data: { id: 1 }
      };

      expect(isValidServerResponse(validResponse)).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidServerResponse(null)).toBe(false);
      expect(isValidServerResponse(undefined)).toBe(false);
      expect(isValidServerResponse({})).toBe(false);
      expect(isValidServerResponse({ status: 'S2000' })).toBe(false);
      expect(isValidServerResponse({ message: 'Success', data: {} })).toBe(false);
      expect(isValidServerResponse('string')).toBe(false);
      expect(isValidServerResponse(123)).toBe(false);
    });

    it('should validate with null data', () => {
      const response = {
        status: 'S2000',
        message: 'Success',
        data: null
      };

      expect(isValidServerResponse(response)).toBe(true);
    });
  });

  describe('SUCCESS_STATUS_CODES', () => {
    it('should contain S2000 as success code', () => {
      expect(SUCCESS_STATUS_CODES).toContain('S2000');
    });

    it('should be a readonly tuple', () => {
      // TypeScript's `as const` creates a readonly tuple
      // This test validates that the constant is properly typed
      const originalLength = SUCCESS_STATUS_CODES.length;
      expect(originalLength).toBeGreaterThan(0);
      expect(Array.isArray(SUCCESS_STATUS_CODES)).toBe(true);

      // The type system prevents mutations at compile time
      // Runtime mutations would work but are prevented by TypeScript
      // @ts-expect-error Testing that TypeScript prevents mutations
      const testMutation = () => SUCCESS_STATUS_CODES[0] = 'MODIFIED';

      // Verify original values are unchanged
      expect(SUCCESS_STATUS_CODES[0]).toBe('S2000');
    });
  });
});