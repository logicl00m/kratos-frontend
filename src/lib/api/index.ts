/**
 * Unified API Module
 * Single source of truth for all API communication
 */

// Primary exports - Unified client
export { auth } from './auth-simple';
export { api, apiClient, ApiError } from './client-refactored';

// Endpoint exports
export * from './endpoints/workflow-updated';
export * from './endpoints/form';
export * from './endpoints/configuration';
export * from './endpoints/auth';

// Type exports for TypeScript support
export type {
  ApiResponse,
  ApiConfig,
  AuthToken,
  User,
  PaginatedRequest,
  PaginatedResponse,
  ApplicationInstance,
  ApplicationEvent,
  FormDefinition,
  WorkflowConfig,
  RunningWorkflow,
} from './types';