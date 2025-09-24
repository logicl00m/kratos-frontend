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