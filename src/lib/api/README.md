# Kratos API Client - Usage Guide

This document explains how to use the unified API client in your Kratos Frontend application.

## Quick Start

```typescript
import { kratoApi, configurationApi, ApiError } from "@/lib/api";

// Simple usage with the convenience API
const stats = await kratoApi.dashboard.getStats();

// Direct endpoint usage
const configurations = await configurationApi.list();
```

## Installation and Setup

The API client is already installed and configured. Make sure you have the environment variables set up:

1. Copy `.env.example` to `.env.local`
2. Update the `VITE_API_URL` to point to your API server
3. Set `VITE_USE_MOCK=true` for development with mock data

## Authentication

### Login

```typescript
import { authApi, setAuthToken, setUser } from "@/lib/api";

const handleLogin = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const response = await authApi.login(credentials);

    // Store auth data
    setAuthToken(response.data);
    setUser(response.data.user);

    // Redirect to dashboard
    navigate("/dashboard");
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message);
    }
  }
};
```

### Logout

```typescript
import { logout } from "@/lib/api";

const handleLogout = async () => {
  await logout(); // Clears tokens and redirects to login
};
```

### Check Authentication Status

```typescript
import { isAuthenticated, getUser } from "@/lib/api";

const MyComponent = () => {
  const [user, setUser] = useState(getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Check auth status on component mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  // ...
};
```

## Configuration Management

### Create Configuration

```typescript
import { configurationApi, ApiError } from "@/lib/api";
import type { ConfigurationPayload } from "@/lib/api";

const handleCreateConfiguration = async (configData: ConfigurationPayload) => {
  try {
    const response = await configurationApi.create(configData);
    console.log("Configuration created:", response.data.id);
    return response.data.id;
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to create configuration: ${error.message}`);
    }
    throw error;
  }
};
```

### Update Configuration

```typescript
const handleUpdateConfiguration = async (
  id: string,
  updates: Partial<ConfigurationPayload>
) => {
  try {
    const response = await configurationApi.update(id, updates);
    toast.success("Configuration updated successfully");
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isValidationError()) {
        const validationErrors = extractValidationErrors(error);
        console.log("Validation errors:", validationErrors);
      }
      toast.error(getErrorMessage(error));
    }
  }
};
```

## Workflow Management

### Start Workflow Instance

```typescript
import { workflowInstanceApi } from "@/lib/api";

const startWorkflow = async (
  workflowId: string,
  initialData: Record<string, unknown>
) => {
  try {
    const response = await workflowInstanceApi.start({
      workflowId,
      initialData,
      priority: "medium",
    });
    return response.data.instanceId;
  } catch (error) {
    console.error("Failed to start workflow:", error);
  }
};
```

### Advance Workflow

```typescript
const advanceWorkflow = async (
  instanceId: string,
  targetState: string,
  data?: Record<string, unknown>
) => {
  try {
    await workflowInstanceApi.advance(instanceId, {
      targetState,
      data,
      comment: "Moving to next state",
    });
    toast.success("Workflow advanced successfully");
  } catch (error) {
    toast.error("Failed to advance workflow");
  }
};
```

## Form Management

### Create Form

```typescript
import { formApi } from "@/lib/api";
import type { FormDefinition } from "@/lib/api";

const createForm = async (formData: FormDefinition) => {
  try {
    const response = await formApi.create(formData);
    return response.data.id;
  } catch (error) {
    if (error instanceof ApiError && error.isValidationError()) {
      // Handle validation errors
      const errors = extractValidationErrors(error);
      Object.entries(errors).forEach(([field, messages]) => {
        console.error(`${field}: ${messages.join(", ")}`);
      });
    }
  }
};
```

### Submit Form Data

```typescript
import { formSubmissionApi } from "@/lib/api";

const submitForm = async (
  formId: string,
  formData: Record<string, unknown>,
  instanceId?: string
) => {
  try {
    const response = await formSubmissionApi.submit(
      formId,
      formData,
      instanceId
    );
    toast.success("Form submitted successfully");
    return response.data.submissionId;
  } catch (error) {
    toast.error("Failed to submit form");
  }
};
```

## Dashboard and Analytics

### Get Dashboard Stats

```typescript
import { dashboardApi } from "@/lib/api";
import type { FilterOptions } from "@/lib/api";

const DashboardComponent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats(filters);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // ...
};
```

### Search Applications

```typescript
const searchApplications = async (
  searchTerm: string,
  filters?: FilterOptions
) => {
  try {
    const response = await dashboardApi.searchApplications({
      term: searchTerm,
      filters,
    });
    return response.data;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};
```

## File Upload and Download

### Upload File to Workflow Instance

```typescript
import { workflowInstanceApi } from "@/lib/api";

const handleFileUpload = async (instanceId: string, file: File) => {
  try {
    const response = await workflowInstanceApi.uploadDocument(
      instanceId,
      file,
      "invoice"
    );
    toast.success("File uploaded successfully");
    return response.data.documentId;
  } catch (error) {
    toast.error("Failed to upload file");
  }
};
```

### Download File

```typescript
const handleFileDownload = async (
  instanceId: string,
  documentId: string,
  filename: string
) => {
  try {
    const blob = await workflowInstanceApi.downloadDocument(
      instanceId,
      documentId
    );

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast.error("Failed to download file");
  }
};
```

## Error Handling

### Basic Error Handling

```typescript
import { ApiError, getErrorMessage, isRetryableError } from "@/lib/api";

const handleApiCall = async () => {
  try {
    const result = await configurationApi.get("some-id");
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      // User-friendly error message
      const message = getErrorMessage(error);
      toast.error(message);

      // Check if error is retryable
      if (isRetryableError(error)) {
        console.log("This error can be retried");
      }

      // Handle specific error types
      if (error.isAuthError()) {
        // Redirect to login
        navigate("/login");
      } else if (error.isValidationError()) {
        // Handle validation errors
        const validationErrors = extractValidationErrors(error);
        console.log("Validation errors:", validationErrors);
      }
    }
  }
};
```

### Retry Failed Requests

```typescript
import { retryRequest } from "@/lib/api";

const handleRetryableOperation = async () => {
  try {
    const result = await retryRequest(
      () => configurationApi.get("some-id"),
      3, // max attempts
      2000 // delay between attempts
    );
    return result.data;
  } catch (error) {
    console.error("All retry attempts failed:", error);
  }
};
```

## React Hooks for API Integration

### Custom Hook for API Data

```typescript
import { useState, useEffect } from "react";
import { configurationApi, ApiError } from "@/lib/api";

export const useConfiguration = (id: string) => {
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await configurationApi.get(id);
        setConfiguration(response.data);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadConfiguration();
    }
  }, [id]);

  return { configuration, loading, error };
};
```

### Custom Hook for Form Submission

```typescript
import { useState } from "react";
import { formSubmissionApi, ApiError } from "@/lib/api";

export const useFormSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const submitForm = async (formId: string, data: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await formSubmissionApi.submit(formId, data);
      return response.data.submissionId;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitForm, submitting, error };
};
```

## Migration from Mock Data

The API client includes a feature flag to switch between mock and real API calls:

```typescript
// In your component
import { kratoApi } from "@/lib/api";

const MyComponent = () => {
  // The API client will automatically use mock data if VITE_USE_MOCK=true
  // No code changes needed - just update the environment variable

  const loadData = async () => {
    // This will use mock data or real API based on VITE_USE_MOCK
    const data = await kratoApi.dashboard.getStats();
    return data;
  };

  // ...
};
```

## Type Safety

All API responses are fully typed:

```typescript
import type {
  ConfigurationPayload,
  WorkflowDefinition,
  ApplicationInstance,
  DashboardStats,
} from "@/lib/api";

// TypeScript will provide full intellisense and type checking
const handleConfiguration = async (config: ConfigurationPayload) => {
  // config.name is typed as string
  // config.workflow is typed as WorkflowDefinition
  // etc.
};
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use the convenience API**: Use `kratoApi` for simpler calls
3. **Type your data**: Import types from `@/lib/api`
4. **Check authentication**: Use `isAuthenticated()` before making authenticated calls
5. **Handle loading states**: Show loading indicators during API calls
6. **Use custom hooks**: Create reusable hooks for common API patterns
7. **Log errors appropriately**: Use the built-in error logging
8. **Handle validation errors**: Extract and display validation errors properly

## Configuration

The API client can be configured through environment variables:

- `VITE_API_URL`: Base API URL
- `VITE_API_TIMEOUT`: Request timeout
- `VITE_USE_MOCK`: Use mock data instead of real API
- `VITE_DEBUG_LOGGING`: Enable debug logging

See `.env.example` for all available configuration options.
