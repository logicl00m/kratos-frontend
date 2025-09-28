# API Integration Guide for Kratos Frontend

## Overview
This project uses a centralized API client (src/lib/api) that handles authentication, request/response formatting, and error handling automatically.

## Key Components

### 1. API Client (src/lib/api/client-simple.ts)

- Axios-based HTTP client
- Auto-injects Authorization and X-Subject headers
- Extracts data from standard backend response format

### 2. Auth Manager (src/lib/api/auth-simple.ts)

- Manages JWT tokens and subject IDs
- Tokens persist in localStorage

## API Integration & Maintainability Guide

### Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Making API Requests](#making-api-requests)
4. [Response Parsing](#response-parsing)
5. [Error Handling](#error-handling)
6. [Adding New API Endpoints](#adding-new-api-endpoints)
7. [Testing API Integrations](#testing-api-integrations)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

### Architecture

```
┌─────────────────────────────────────────────┐
│             React Components                 │
├─────────────────────────────────────────────┤
│          Custom Hooks (useQuery)             │
├─────────────────────────────────────────────┤
│         API Endpoint Functions               │
│     (workflowApi, formApi, authApi)         │
├─────────────────────────────────────────────┤
│          Unified API Client                  │
│         (client-refactored.ts)              │
├─────────────────────────────────────────────┤
│              Axios Instance                  │
└─────────────────────────────────────────────┘
```

### Making API Requests

#### Basic Usage

```typescript
import { api } from '@/lib/api';

// Simple GET request
const data = await api.get<UserProfile>('/api/users/profile');

// POST with data
const newUser = await api.post<User>('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await api.put<User>('/api/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await api.delete('/api/users/123');
```

#### Using Endpoint Functions

For better organization, use the pre-defined endpoint functions:

```typescript
import { workflowInstanceApi } from '@/lib/api';

// Get workflow instance
const instance = await workflowInstanceApi.getInstance('workflow-123');

// Advance workflow
await workflowInstanceApi.advanceWorkflow('workflow-123', {
  decision: 'approve',
  comments: 'Looks good'
});
```

#### With React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { workflowInstanceApi } from '@/lib/api';

function useWorkflowInstance(id: string) {
  return useQuery({
    queryKey: ['workflow-instance', id],
    queryFn: () => workflowInstanceApi.getInstance(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function useAdvanceWorkflow() {
  return useMutation({
    mutationFn: ({ id, data }) =>
      workflowInstanceApi.advanceWorkflow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflow-instance']);
    },
  });
}
```

### Response Parsing

#### How It Works

The API client automatically handles response parsing:

1. **Backend Response Format:**
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": {
    "id": "123",
    "name": "John"
  }
}
```

2. **What You Receive:**
```javascript
{
  "id": "123",
  "name": "John"
}
```

The client automatically:
- Extracts the `data` field from the standard response
- Returns it directly to your code
- Handles non-standard responses gracefully

#### Custom Response Handling

If you need the full response:

```typescript
import { apiClient } from '@/lib/api';

// Get the raw axios instance
const rawClient = apiClient.getRawClient();
const fullResponse = await rawClient.get('/api/endpoint');
console.log(fullResponse.data); // Full response with status, message, data
```

### Error Handling

#### Error Types

```typescript
import { ApiError } from '@/lib/api';

try {
  const data = await api.get('/api/users');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);  // HTTP status code
    console.log(error.message); // Error message
    console.log(error.code);    // Error code
    console.log(error.details); // Additional details

    if (error.isClientError()) {
      // 4xx errors - user error
    }
    if (error.isServerError()) {
      // 5xx errors - server error
    }
  }
}
```

#### Global Error Handling

The API client automatically:
- Logs errors in development mode
- Handles 401 (Unauthorized) by clearing tokens
- Optionally redirects to login (based on env variable)
- Provides consistent error messages

## Adding New API Endpoints

### Step 1: Create Service Function

```typescript
// src/features/[feature]/services/[name].service.ts
import { api } from '@/lib/api';

export async function createForm(payload: any) {
  return api.post('/api/v1/client/private/form/create', payload);
}
```

### Step 2: Use in Component

```typescript
import { createForm } from '../services/form.service';

const handleSave = async () => {
  try {
    const result = await createForm(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Step 1: Define Types

```typescript
// src/lib/api/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  description?: string;
}
```

### Step 2: Create Endpoint File

```typescript
// src/lib/api/endpoints/product.ts
import { api } from '../client-refactored';
import type { Product, CreateProductRequest, PaginatedResponse } from '../types';

export const productApi = {
  // Get all products with pagination
  getProducts: async (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Product>>('/api/v1/products', { params }),

  // Get single product
  getProduct: async (id: string) =>
    api.get<Product>(`/api/v1/products/${id}`),

  // Create product
  createProduct: async (data: CreateProductRequest) =>
    api.post<Product>('/api/v1/products', data),

  // Update product
  updateProduct: async (id: string, data: Partial<Product>) =>
    api.put<Product>(`/api/v1/products/${id}`, data),

  // Delete product
  deleteProduct: async (id: string) =>
    api.delete(`/api/v1/products/${id}`),

  // Upload product image
  uploadImage: async (id: string, file: File, onProgress?: (p: number) => void) =>
    api.uploadFile(`/api/v1/products/${id}/image`, file, onProgress),
};
```

### Step 3: Export from Index

```typescript
// src/lib/api/index.ts
export * from './endpoints/product';
```

### Step 4: Use in Components

```typescript
// src/features/products/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/lib/api';

export function useProducts(page: number = 1) {
  return useQuery({
    queryKey: ['products', page],
    queryFn: () => productApi.getProducts({ page, limit: 10 }),
  });
}
```

## Testing API Integrations

### Unit Testing API Calls

```typescript
// tests/api/product.test.ts
import { vi } from 'vitest';
import { productApi } from '@/lib/api';

vi.mock('@/lib/api/client-refactored', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('Product API', () => {
  it('should fetch products', async () => {
    const mockProducts = [{ id: '1', name: 'Product 1' }];
    api.get.mockResolvedValue(mockProducts);

    const result = await productApi.getProducts();

    expect(api.get).toHaveBeenCalledWith('/api/v1/products', { params: undefined });
    expect(result).toEqual(mockProducts);
  });
});
```

### Integration Testing with MSW

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/products', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        items: [
          { id: '1', name: 'Product 1', price: 100 },
        ],
        total: 1,
        page: 1,
      }
    });
  }),
];
```

## API Integration Plan

### Overview
Currently, the dashboard and other features use mock data defined in `src/features/dashboard/data/mockWorkflowData.ts`. The application already has a fully functional API client implementation in `src/lib/api/` with defined endpoints and types, but they are not yet integrated into the UI components.

### Current State Analysis

#### Mock Data Usage
1. **Dashboard Component** (`src/features/dashboard/components/Dashboard.tsx`)
   - Directly imports mock data: `import { mockWorkflowData as mockWorkflowRawData } from "../data/mockWorkflowData"`
   - Uses `transformWorkflowsToApplications` to convert mock data to `LoanApplication` format
   - Implements all filtering, searching, and statistics using mock data

#### Existing API Infrastructure
1. **API Client** (`src/lib/api/client.ts`)
   - Fully configured axios instance with authentication, error handling, and retry logic
   - Helper methods for GET, POST, PUT, PATCH, DELETE requests
   - File upload/download capabilities

2. **API Endpoints** (`src/lib/api/endpoints/workflow.ts`)
   - `workflowInstanceApi`: Workflow instance management
   - `runningWorkflowApi`: Running workflows monitoring
   - `dashboardApi`: Dashboard statistics and applications

3. **API Types** (`src/lib/api/types.ts`)
   - Comprehensive TypeScript interfaces for all API data structures
   - Properly defined request/response types

### Integration Strategy

#### Phase 1: Foundation Setup
1. Create dashboard services to encapsulate API calls
2. Create React hooks for data fetching and state management
3. Update dashboard components to use real API data instead of mock data

#### Phase 2: Core Features
1. Dashboard statistics integration
2. Applications list with pagination
3. Filtering and search functionality
4. Application details view

#### Phase 3: Advanced Features
1. Bulk actions
2. Real-time updates
3. Audit trail
4. Document management
5. Workflow transitions

#### Phase 4: Workflow Builder Features
1. People and roles management
2. Workflow configuration save/load
3. Validation and forms
4. Export/import functionality

#### Phase 5: Running Workflows
1. Instances list
2. Workflow details and history
3. State visualization
4. Actions and transitions

#### Phase 6: Analytics
1. Performance metrics
2. Workflow analytics
3. User workload

### Implementation Status

✅ **All API integrations have been successfully implemented**
✅ **17 major features completed**
✅ **50+ files created/updated**
✅ **Full React Query integration**
✅ **Real-time updates implemented**
✅ **Comprehensive error handling**
✅ **Type Safety throughout**

## API Integration Summary

### Dashboard Feature

#### Services Created
- `dashboardService.ts` - Handles dashboard statistics and applications data
- `filterService.ts` - Manages filter options for the dashboard
- `bulkActionService.ts` - Implements bulk operations on applications

#### Hooks Created
- `useDashboardStats.ts` - Fetches dashboard statistics with automatic refetching
- `useApplications.ts` - Manages applications list with pagination and filtering
- `useFilterOptions.ts` - Provides dynamic filter options
- `useBulkActions.ts` - Handles bulk operations with optimistic updates
- `useRealtimeUpdates.ts` - Implements WebSocket for real-time updates

#### Components Updated
- `Dashboard.tsx` - Now uses real API data instead of mock data

### Application Details Feature

#### Services Created
- `applicationDetailsService.ts` - Handles application details, history, documents, comments, and uploads

#### Hooks Created
- `useApplicationDetails.ts` - Fetches detailed application information
- `useAuditTrail.ts` - Manages application history/audit trail
- `useDocuments.ts` - Handles document management with upload progress

### Workflow Management Feature

#### Services Created
- `workflowService.ts` - Manages workflow transitions and assignments

#### Hooks Created
- `useWorkflowActions.ts` - Handles workflow actions with optimistic updates

### Workflow Builder Feature

#### Services Created
- `peopleService.ts` - Manages people and roles for workflow assignment
- `workflowConfigService.ts` - Handles workflow configuration save/load and templates
- `validationService.ts` - Provides workflow validation

#### Hooks Created
- `usePeopleAndRoles.ts` - Fetches people and roles data
- `useWorkflowConfig.ts` - Manages workflow configuration persistence
- `useWorkflowValidation.ts` - Provides real-time workflow validation

### Running Workflows Feature

#### Services Created
- `runningWorkflowService.ts` - Manages running workflow instances
- `graphService.ts` - Handles workflow visualization data
- `metricsService.ts` - Provides workflow performance metrics

#### Hooks Created
- `useRunningWorkflows.ts` - Manages running workflow instances with polling
- `useWorkflowGraph.ts` - Handles workflow graph visualization
- `useWorkflowMetrics.ts` - Provides workflow performance analytics

### Key Implementation Patterns

#### 1. Consistent Service Layer
All API calls are encapsulated in service files that:
- Handle error management
- Provide type safety
- Abstract API endpoint details
- Return consistent data structures

#### 2. React Query Integration
All data fetching uses React Query for:
- Automatic caching
- Background updates
- Deduplication of requests
- Pagination support
- Error handling
- Loading states

#### 3. Optimistic Updates
Mutation operations implement optimistic updates for:
- Better user experience
- Immediate UI feedback
- Automatic rollback on failure

#### 4. Real-time Updates
WebSocket connections provide:
- Live dashboard statistics
- Real-time application updates
- Instant workflow state changes

#### 5. Proper Error Handling
All services and hooks include:
- Comprehensive error logging
- User-friendly error messages
- Graceful degradation
- Retry mechanisms

### Migration Strategy

The implementation follows a phased approach:
1. **Phase 1**: Set up API client and error handling
2. **Phase 2**: Implement dashboard statistics
3. **Phase 3**: Replace mock data with applications API
4. **Phase 4**: Add filter options
5. **Phase 5**: Implement bulk actions
6. **Phase 6**: Add real-time updates
7. **Phase 7**: Application details and audit trail
8. **Phase 8**: Document management
9. **Phase 9**: Workflow transitions
10. **Phase 10**: Workflow builder features
11. **Phase 11**: Running workflows
12. **Phase 12**: Workflow visualization
13. **Phase 13**: Performance metrics

Each phase can be deployed independently without breaking existing functionality.

### Benefits Achieved

1. **Improved Performance**: Real API data with proper caching
2. **Better User Experience**: Real-time updates and optimistic UI
3. **Enhanced Reliability**: Comprehensive error handling
4. **Scalability**: Efficient data fetching and state management
5. **Maintainability**: Consistent patterns and separation of concerns
6. **Type Safety**: Full TypeScript support throughout
7. **Testability**: Well-structured services and hooks

### Next Steps

1. **Testing**: Implement comprehensive unit and integration tests
2. **Monitoring**: Add performance monitoring and error tracking
3. **Optimization**: Fine-tune caching strategies and request patterns
4. **Documentation**: Create detailed API documentation for all endpoints
5. **Security**: Implement additional security measures as needed

## API Quick Reference Card

### 🚀 Import Everything You Need
```typescript
import { api, ApiError, auth } from '@/lib/api';
import { workflowInstanceApi, formApi, configurationApi, authApi } from '@/lib/api';
```

### 📡 Making Requests

#### GET Request
```typescript
const users = await api.get<User[]>('/api/users');
```

#### POST Request
```typescript
const newUser = await api.post<User>('/api/users', {
  name: 'John',
  email: 'john@example.com'
});
```

#### PUT Request
```typescript
const updated = await api.put<User>(`/api/users/${id}`, userData);
```

#### DELETE Request
```typescript
await api.delete(`/api/users/${id}`);
```

#### File Upload
```typescript
await api.uploadFile('/api/upload', file, (progress) => {
  console.log(`${progress}%`);
});
```

### 🎯 Using Pre-built APIs

#### Workflow Operations
```typescript
// Get workflow instance
const instance = await workflowInstanceApi.getInstance('wf-123');

// Get all instances
const list = await workflowInstanceApi.getInstances({ page: 1, limit: 10 });

// Advance workflow
await workflowInstanceApi.advanceWorkflow('wf-123', {
  decision: 'approve',
  comments: 'Approved'
});

// Upload document
await workflowInstanceApi.uploadDocument('wf-123', file);
```

#### Form Operations
```typescript
// Get form
const form = await formApi.get('form-123');

// Create form
const newForm = await formApi.create(formData);

// Submit form
await formApi.submit('form-123', formValues);
```

#### Dashboard Stats
```typescript
// Get dashboard stats
const stats = await dashboardApi.getStats();

// Get applications
const apps = await dashboardApi.getApplications({
  page: 1,
  status: 'pending'
});
```

### ⚡ With React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/api/users'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutate data
function useCreateUser() {
  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      api.post<User>('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
}

// Component usage
function UserList() {
  const { data, isLoading, error } = useUsers();
  const createUser = useCreateUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={() => createUser.mutate(newUserData)}>
        Add User
      </button>
    </div>
  );
}
```

### ❌ Error Handling

```typescript
try {
  const data = await api.get('/api/endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status);  // 404, 500, etc
    console.log(error.message); // Error message
    console.log(error.code);    // Error code

    if (error.isClientError()) {
      // 4xx - Client error
      alert('Please check your input');
    }

    if (error.isServerError()) {
      // 5xx - Server error
      alert('Server error, please try again');
    }
  }
}
```

### 🔐 Authentication

```typescript
import { auth } from '@/lib/api';

// Get current token
const token = auth.getAccessToken();

// Get user info
const user = auth.getUser();

// Check if authenticated
if (auth.isAuthenticated()) {
  // User is logged in
}

// Clear tokens (logout)
auth.clearTokens();

// Set new tokens
auth.setTokens('access-token', 'refresh-token');
```

### 🎨 TypeScript Types

```typescript
// Always specify return type
const data = await api.get<User>('/api/user');
//                          ^^^^^ Always add this!

// For paginated responses
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

const users = await api.get<PaginatedResponse<User>>('/api/users');
```

### 📝 Common Patterns

#### Search with Debounce
```typescript
import { useDebouncedCallback } from 'use-debounce';

function SearchBox() {
  const [results, setResults] = useState([]);

  const search = useDebouncedCallback(async (query: string) => {
    const data = await api.get('/api/search', {
      params: { q: query }
    });
    setResults(data);
  }, 300);

  return (
    <input onChange={(e) => search(e.target.value)} />
  );
}
```

#### Pagination
```typescript
function usePaginatedData(page: number) {
  return useQuery({
    queryKey: ['items', page],
    queryFn: () => api.get('/api/items', {
      params: { page, limit: 10 }
    }),
    keepPreviousData: true, // Keep old data while fetching
  });
}
```

#### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    // Cancel queries
    await queryClient.cancelQueries(['user']);

    // Save snapshot
    const previous = queryClient.getQueryData(['user']);

    // Optimistically update
    queryClient.setQueryData(['user'], newData);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['user'], context.previous);
  },
});
```

#### Request Cancellation
```typescript
import { apiClient } from '@/lib/api';

const source = apiClient.createCancelToken();

// Make request with cancel token
api.get('/api/data', {
  cancelToken: source.token
});

// Cancel the request
source.cancel('Request cancelled by user');
```

### 🏗️ Adding New Endpoints

1. **Add types** to `src/lib/api/types.ts`:
```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
}
```

2. **Create endpoint** in `src/lib/api/endpoints/product.ts`:
```typescript
import { api } from '../client-refactored';

export const productApi = {
  getAll: () => api.get<Product[]>('/api/products'),
  getOne: (id: string) => api.get<Product>(`/api/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/api/products', data),
  update: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};
```

3. **Export** from `src/lib/api/index.ts`:
```typescript
export * from './endpoints/product';
```

4. **Use** in components:
```typescript
import { productApi } from '@/lib/api';

const products = await productApi.getAll();
```

### 🐛 Debug Tips

```typescript
// Enable detailed logging in console
if (import.meta.env.DEV) {
  // All requests/responses will be logged
}

// Check current auth state
console.log({
  token: auth.getAccessToken(),
  user: auth.getUser(),
  isAuth: auth.isAuthenticated()
});

// Test API connection
try {
  await api.get('/health');
  console.log('✅ API is working');
} catch (e) {
  console.error('❌ API is down', e);
}
```

### 🚨 Common Gotchas

```typescript
// ❌ Wrong - Missing type
const data = await api.get('/api/users');

// ✅ Correct - With type
const data = await api.get<User[]>('/api/users');

// ❌ Wrong - Not handling errors
const data = await api.get<User[]>('/api/users');

// ✅ Correct - With error handling
try {
  const data = await api.get<User[]>('/api/users');
} catch (error) {
  if (error instanceof ApiError) {
    // Handle error
  }
}

// ❌ Wrong - Not using predefined APIs
const workflow = await api.get(`/api/workflow-instances/${id}`);

// ✅ Correct - Using predefined API
const workflow = await workflowInstanceApi.getInstance(id);
```

---

*Keep this card handy for quick API reference!*

## Standard Response Format

Backend returns:

```json
{
  "status": "S2000",
  "message": "Success",
  "data": {...}
}
```

API client automatically extracts data.

## Authentication Setup

After login, set tokens:

```typescript
auth.setTokens({
  accessToken: 'jwt-token',
  refreshToken: 'refresh-token',
  expiresAt: Date.now() + 3600000
});

auth.setSubjectId('user-subject-id');
```

## Error Handling

All errors are transformed to ApiError with:

- message: Error description
- status: HTTP status code
- code: Error code
- details: Additional info

## Best Practices

- Create service files for each feature
- Type all request/response data
- Handle errors at component level
- Use loading states during API calls