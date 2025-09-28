# API Quick Reference Card

## 🚀 Import Everything You Need
```typescript
import { api, ApiError, auth } from '@/lib/api';
import { workflowInstanceApi, formApi, configurationApi, authApi } from '@/lib/api';
```

## 📡 Making Requests

### GET Request
```typescript
const users = await api.get<User[]>('/api/users');
```

### POST Request
```typescript
const newUser = await api.post<User>('/api/users', {
  name: 'John',
  email: 'john@example.com'
});
```

### PUT Request
```typescript
const updated = await api.put<User>(`/api/users/${id}`, userData);
```

### DELETE Request
```typescript
await api.delete(`/api/users/${id}`);
```

### File Upload
```typescript
await api.uploadFile('/api/upload', file, (progress) => {
  console.log(`${progress}%`);
});
```

## 🎯 Using Pre-built APIs

### Workflow Operations
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

### Form Operations
```typescript
// Get form
const form = await formApi.get('form-123');

// Create form
const newForm = await formApi.create(formData);

// Submit form
await formApi.submit('form-123', formValues);
```

### Dashboard Stats
```typescript
// Get dashboard stats
const stats = await dashboardApi.getStats();

// Get applications
const apps = await dashboardApi.getApplications({
  page: 1,
  status: 'pending'
});
```

## ⚡ With React Query

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

## ❌ Error Handling

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

## 🔐 Authentication

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

## 🎨 TypeScript Types

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

## 📝 Common Patterns

### Search with Debounce
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

### Pagination
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

### Optimistic Updates
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

### Request Cancellation
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

## 🏗️ Adding New Endpoints

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

## 🐛 Debug Tips

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

## 🚨 Common Gotchas

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