import type { AxiosResponse } from 'axios';
import type { ServerResponse, ParsedApiResponse, ApiError } from './types';

/**
 * Success status codes that indicate the operation was successful
 */
export const SUCCESS_STATUS_CODES = ['S2000'] as const;

/**
 * Parse and validate API response according to the standardized format:
 * {
 *   "status": "S2000",
 *   "message": "operation successful", 
 *   "data": [...] // array or object
 * }
 */
export function parseApiResponse<T = unknown>(
  response: AxiosResponse
): ParsedApiResponse<T> {
  const httpStatus = response.status;
  const responseBody = response.data;

  // First check HTTP status code
  if (httpStatus < 200 || httpStatus >= 300) {
    throw createApiError(
      httpStatus,
      `HTTP ${httpStatus}: Request failed`,
      'HTTP_ERROR',
      responseBody
    );
  }

  // Validate response body structure
  if (!responseBody || typeof responseBody !== 'object') {
    throw createApiError(
      httpStatus,
      'Invalid response format: Expected object',
      'INVALID_RESPONSE_FORMAT',
      responseBody
    );
  }

  const serverResponse = responseBody as ServerResponse<T>;
  const customStatus = serverResponse.status;
  const message = serverResponse.message || 'No message provided';
  const data = serverResponse.data;

  // Check custom status code
  const isSuccess = SUCCESS_STATUS_CODES.includes(customStatus as typeof SUCCESS_STATUS_CODES[number]);
  
  if (!isSuccess) {
    throw createApiError(
      httpStatus,
      `Server error: ${message}`,
      customStatus,
      serverResponse
    );
  }

  // Validate that data field exists
  if (data === undefined || data === null) {
    throw createApiError(
      httpStatus,
      'Response missing data field',
      'MISSING_DATA_FIELD',
      serverResponse
    );
  }

  return {
    data,
    isSuccess,
    message,
    httpStatus,
    customStatus
  };
}

/**
 * Extract only the data portion from the parsed response
 * This is what feature services should receive
 */
export function extractResponseData<T = unknown>(
  response: AxiosResponse
): T {
  const parsed = parseApiResponse<T>(response);
  return parsed.data;
}

/**
 * Create a standardized API error object
 */
export function createApiError(
  status: number,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    status,
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

/**
 * Utility to validate server response format
 */
export function isValidServerResponse(data: unknown): data is ServerResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'message' in data &&
    'data' in data
  );
}

/**
 * Log response parsing for debugging in development
 */
export function logResponseParsing(
  url: string,
  method: string,
  response: AxiosResponse,
  parsed?: ParsedApiResponse<unknown>
): void {
  if (import.meta.env.DEV) {
    console.group(`📥 API Response Parser: ${method.toUpperCase()} ${url}`);
    console.log('HTTP Status:', response.status);
    console.log('Response Body:', response.data);
    if (parsed) {
      console.log('Custom Status:', parsed.customStatus);
      console.log('Success:', parsed.isSuccess);
      console.log('Extracted Data:', parsed.data);
      console.log('Message:', parsed.message);
    }
    console.groupEnd();
  }
}