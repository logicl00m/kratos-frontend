/**
 * Simplified API Module
 * Clean, simple API for all backend communication
 */

// Primary exports - Simple and clean
export { auth } from './auth-simple';
export { api, apiClient, ApiError } from './client-simple';

// Type exports for TypeScript support
export type {
  ApiResponse,
  ApiConfig,
  AuthToken,
  User,
  PaginatedRequest,
  PaginatedResponse,
} from './types';