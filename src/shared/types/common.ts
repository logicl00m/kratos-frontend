/**
 * Common TypeScript type definitions used across the application
 */

// Generic types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// Function types
export type AsyncFunction<T = void, R = void> = (arg: T) => Promise<R>;
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;

// API types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string | number;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
  dirty?: boolean;
  validating?: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// UI types
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  onClick?: VoidFunction;
  children?: MenuItem[];
  disabled?: boolean;
  visible?: boolean;
}

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface DataState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Event types
export type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type SubmitEvent = React.FormEvent<HTMLFormElement>;
export type ClickEvent = React.MouseEvent<HTMLElement>;
export type KeyboardEvent = React.KeyboardEvent<HTMLElement>;

// Date types
export type DateRange = {
  start: Date | null;
  end: Date | null;
};

export type TimeRange = {
  start: string;
  end: string;
};

// Filter types
export interface FilterValue {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
}

export interface SortValue {
  field: string;
  order: 'asc' | 'desc';
}

// Workflow types
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: { x: number; y: number; zoom: number };
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  address?: Address;
  preferences?: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone: string;
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Permission types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// Validation types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp | string;
  custom?: (value: unknown) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

// Type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;
export const isArray = <T = unknown>(value: unknown): value is T[] => Array.isArray(value);
export const isFunction = (value: unknown): value is Function => typeof value === 'function';
export const isNull = (value: unknown): value is null => value === null;
export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isNullOrUndefined = (value: unknown): value is null | undefined => value == null;

// Type assertions
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export function assertDefined<T>(value: T | null | undefined, message = 'Value is not defined'): T {
  if (value == null) {
    throw new Error(message);
  }
  return value;
}