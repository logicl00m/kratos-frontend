# API Integration & Maintainability Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Making API Requests](#making-api-requests)
4. [Response Parsing](#response-parsing)
5. [Error Handling](#error-handling)
6. [Adding New API Endpoints](#adding-new-api-endpoints)
7. [Testing API Integrations](#testing-api-integrations)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The Kratos Frontend uses a **unified API client** architecture that provides:
- Single source of truth for all API communications
- Automatic authentication token management
- Consistent error handling
- Response data extraction
- Request/response logging in development
- TypeScript type safety throughout

### Key Files
- `src/lib/api/client-refactored.ts` - Main API client implementation
- `src/lib/api/auth-simple.ts` - Authentication utilities
- `src/lib/api/endpoints/` - Organized endpoint definitions
- `src/lib/api/types.ts` - TypeScript type definitions
- `src/lib/api/index.ts` - Public API exports

## Architecture

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

## Making API Requests

### Basic Usage

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

### Using Endpoint Functions

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

### With React Query

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

## Response Parsing

### How It Works

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

### Custom Response Handling

If you need the full response:

```typescript
import { apiClient } from '@/lib/api';

// Get the raw axios instance
const rawClient = apiClient.getRawClient();
const fullResponse = await rawClient.get('/api/endpoint');
console.log(fullResponse.data); // Full response with status, message, data
```

## Error Handling

### Error Types

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

### Global Error Handling

The API client automatically:
- Logs errors in development mode
- Handles 401 (Unauthorized) by clearing tokens
- Optionally redirects to login (based on env variable)
- Provides consistent error messages

## Adding New API Endpoints

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

## Best Practices

### 1. Always Use TypeScript Types

```typescript
// ❌ Bad
const data = await api.get('/api/users');

// ✅ Good
const data = await api.get<User[]>('/api/users');
```

### 2. Organize Endpoints by Domain

```
src/lib/api/endpoints/
├── auth.ts          # Authentication endpoints
├── workflow.ts      # Workflow management
├── form.ts          # Form operations
└── configuration.ts # System configuration
```

### 3. Use Consistent Naming

```typescript
// Pattern: [resource][Action]
getUserProfile()     // GET single resource
getUsers()          // GET list
createUser()        // POST new resource
updateUser()        // PUT/PATCH update
deleteUser()        // DELETE resource
searchUsers()       // POST search (or GET with params)
exportUsers()       // GET export/download
```

### 4. Handle Loading States

```typescript
function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users'),
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <UserList users={data} />;
}
```

### 5. Implement Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: (data) => api.post('/api/users', data),
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['users']);

    // Snapshot previous value
    const previousUsers = queryClient.getQueryData(['users']);

    // Optimistically update
    queryClient.setQueryData(['users'], old => [...old, newUser]);

    return { previousUsers };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['users'], context.previousUsers);
  },
});
```

### 6. Use Request Cancellation

```typescript
import { apiClient } from '@/lib/api';

function SearchComponent() {
  const [cancelToken, setCancelToken] = useState(null);

  const search = async (query: string) => {
    // Cancel previous request
    if (cancelToken) {
      cancelToken.cancel('New search initiated');
    }

    // Create new cancel token
    const source = apiClient.createCancelToken();
    setCancelToken(source);

    try {
      const results = await api.get('/api/search', {
        params: { q: query },
        cancelToken: source.token,
      });
      return results;
    } catch (error) {
      if (!apiClient.isCancel(error)) {
        throw error;
      }
    }
  };
}
```

### 7. Environment-Specific Configuration

```typescript
// .env.development
VITE_API_URL=http://localhost:8080
VITE_ENABLE_API_LOGGING=true

// .env.production
VITE_API_URL=https://api.kratos.com
VITE_ENABLE_API_LOGGING=false
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access to XMLHttpRequest at 'http://api.example.com' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution:** Ensure backend has proper CORS headers or use proxy in vite.config.ts

#### 2. 401 Unauthorized
```
ApiError: Unauthorized access
```
**Solution:** Check if token is present and valid:
```typescript
import { auth } from '@/lib/api';
console.log(auth.getAccessToken()); // Should show token
```

#### 3. Network Errors
```
ApiError: Network error. Please check your connection.
```
**Solution:** Verify API URL and network connectivity

#### 4. Type Mismatches
```
Type 'unknown' is not assignable to type 'User'
```
**Solution:** Always specify generic type:
```typescript
const user = await api.get<User>('/api/user');
```

### Debug Mode

Enable detailed logging:

```typescript
// In your component or app initialization
if (import.meta.env.DEV) {
  window.DEBUG_API = true;
}
```

This will log:
- All requests with params and data
- All responses with status and data
- Error details with stack traces

### API Health Check

```typescript
import { api } from '@/lib/api';

async function checkApiHealth() {
  try {
    const health = await api.get('/health');
    console.log('API is healthy:', health);
  } catch (error) {
    console.error('API is down:', error);
  }
}
```

## Migration Guide

### From Old API Client

```typescript
// Old way
import { ApiClient } from '@/services/base/ApiClient';
const client = new ApiClient();
const response = await client.get('/api/users');
const users = response.data;

// New way
import { api } from '@/lib/api';
const users = await api.get<User[]>('/api/users');
// Data is automatically extracted!
```

### From Direct Axios

```typescript
// Old way
import axios from 'axios';
const response = await axios.get('/api/users', {
  headers: { Authorization: `Bearer ${token}` }
});
const users = response.data.data;

// New way
import { api } from '@/lib/api';
const users = await api.get<User[]>('/api/users');
// Token is automatically added!
// Data is automatically extracted!
```

## Security Considerations

1. **Never hardcode sensitive data** in API calls
2. **Use environment variables** for API URLs and keys
3. **Sanitize user input** before sending to API
4. **Validate API responses** before using in UI
5. **Implement rate limiting** for user-triggered requests
6. **Use HTTPS** in production always
7. **Store tokens securely** (httpOnly cookies preferred)

## Performance Optimization

1. **Implement caching** with React Query's staleTime
2. **Use pagination** for large datasets
3. **Implement infinite scrolling** for lists
4. **Batch API requests** when possible
5. **Use request debouncing** for search inputs
6. **Cancel redundant requests** when component unmounts
7. **Compress request payloads** for large data

## Monitoring & Analytics

Track API performance:

```typescript
// src/lib/api/monitoring.ts
import { apiClient } from './client-refactored';

// Add request timing
let requestStart: number;

apiClient.getRawClient().interceptors.request.use(config => {
  requestStart = Date.now();
  return config;
});

apiClient.getRawClient().interceptors.response.use(response => {
  const duration = Date.now() - requestStart;

  // Send to analytics
  analytics.track('api_request', {
    url: response.config.url,
    method: response.config.method,
    status: response.status,
    duration,
  });

  return response;
});
```

---

## Quick Reference

### Import
```typescript
import { api, ApiError, auth } from '@/lib/api';
```

### Common Operations
```typescript
// GET
const data = await api.get<Type>('/endpoint');

// POST
const result = await api.post<Type>('/endpoint', data);

// PUT
const updated = await api.put<Type>('/endpoint', data);

// DELETE
await api.delete('/endpoint');

// Upload
await api.uploadFile('/upload', file, (progress) => {
  console.log(`${progress}% uploaded`);
});

// Download
await api.downloadFile('/download', 'filename.pdf');
```

### Error Handling
```typescript
try {
  const data = await api.get('/endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      // Handle not found
    }
  }
}
```

### Authentication
```typescript
import { auth } from '@/lib/api';

// Get current token
const token = auth.getAccessToken();

// Check if authenticated
const isAuth = auth.isAuthenticated();

// Clear tokens (logout)
auth.clearTokens();
```

---

*Last updated: December 2024*
*Maintained by: Kratos Frontend Team*