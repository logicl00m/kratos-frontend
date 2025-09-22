import { AxiosError } from 'axios';
import type { ApiError as ApiErrorType } from './types';

/**
 * Custom API Error class that extends the standard Error
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert to a plain object for serialization
   */
  toJSON(): ApiErrorType {
    return {
      status: this.status,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }

  /**
   * Check if this is a specific HTTP status code
   */
  isStatus(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if this is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if this is a network error
   */
  isNetworkError(): boolean {
    return this.status === 0 || this.code === 'NETWORK_ERROR';
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.status === 422 || this.code === 'VALIDATION_ERROR';
  }
}

/**
 * Handle Axios errors and convert them to our custom ApiError
 */
export const handleAxiosError = (error: AxiosError): ApiError => {
  // Network error (no response received)
  if (!error.response) {
    return new ApiError(
      0,
      error.message || 'Network error occurred',
      'NETWORK_ERROR',
      {
        originalError: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        },
      }
    );
  }

  // Server responded with error status
  const { status, data } = error.response;
  const message = (data as { message?: string })?.message || 
                  (data as { error?: string })?.error || 
                  error.message || 
                  `HTTP ${status} Error`;

  const code = (data as { code?: string })?.code || 
               (data as { type?: string })?.type;

  return new ApiError(
    status,
    message,
    code,
    {
      responseData: data,
      url: error.config?.url,
      method: error.config?.method,
    }
  );
};

/**
 * Handle general errors and convert them to ApiError if not already
 */
export const handleApiError = (error: unknown): ApiError => {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Axios error
  if (error instanceof Error && 'isAxiosError' in error) {
    return handleAxiosError(error as AxiosError);
  }

  // Generic error
  if (error instanceof Error) {
    return new ApiError(
      500,
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error.name }
    );
  }

  // Unknown error type
  return new ApiError(
    500,
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    { originalError: String(error) }
  );
};

/**
 * Log API errors in a consistent format
 */
export const logApiError = (error: ApiError, context?: string): void => {
  const logData = {
    context,
    status: error.status,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    details: error.details,
  };

  if (error.isServerError()) {
    console.error('API Server Error:', logData);
  } else if (error.isClientError()) {
    console.warn('API Client Error:', logData);
  } else if (error.isNetworkError()) {
    console.error('API Network Error:', logData);
  } else {
    console.error('API Error:', logData);
  }
};

/**
 * Get user-friendly error message for display
 */
export const getErrorMessage = (error: ApiError): string => {
  // Custom error messages for common scenarios
  switch (error.status) {
    case 0:
      return 'Unable to connect to the server. Please check your internet connection.';
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 422:
      return 'Please check your input and correct any validation errors.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Check if an error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  // Network errors are retryable
  if (error.isNetworkError()) {
    return true;
  }

  // Server errors (5xx) are generally retryable
  if (error.isServerError()) {
    return true;
  }

  // Rate limiting is retryable
  if (error.status === 429) {
    return true;
  }

  // Timeout errors are retryable
  if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
    return true;
  }

  return false;
};

/**
 * Create a standardized error response for consistent API responses
 */
export const createErrorResponse = (error: ApiError) => {
  return {
    success: false,
    error: error.message,
    status: error.status,
    code: error.code,
    timestamp: error.timestamp,
  };
};

/**
 * Utility to extract validation errors from API response
 */
export const extractValidationErrors = (error: ApiError): Record<string, string[]> => {
  if (!error.isValidationError() || !error.details?.responseData) {
    return {};
  }

  const data = error.details.responseData as Record<string, unknown>;
  
  // Try different common validation error formats
  if (data.errors && typeof data.errors === 'object') {
    return data.errors as Record<string, string[]>;
  }

  if (data.fieldErrors && typeof data.fieldErrors === 'object') {
    return data.fieldErrors as Record<string, string[]>;
  }

  if (data.validationErrors && typeof data.validationErrors === 'object') {
    return data.validationErrors as Record<string, string[]>;
  }

  return {};
};