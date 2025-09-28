# Project Structure Documentation

## Overview

The Kratos Frontend follows a modular, feature-based architecture that promotes maintainability, scalability, and code reusability. The structure is organized to separate concerns clearly and make the codebase intuitive for developers.

## Directory Structure

```
src/
├── app/                 # Application initialization and providers
│   ├── App.tsx         # Root application component
│   ├── providers/      # Global providers (Theme, Auth, etc.)
│   └── routes/         # Route definitions
│
├── assets/             # Static assets
│   ├── images/         # Images, icons, logos
│   ├── fonts/          # Custom fonts
│   └── styles/         # Global CSS/SCSS files
│
├── common/             # Shared/common components used across features
│   ├── components/     # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── Form/
│   ├── layouts/        # Layout components
│   │   ├── MainLayout/
│   │   ├── AuthLayout/
│   │   └── DashboardLayout/
│   └── hooks/          # Common hooks used across features
│       ├── useAuth.ts
│       ├── useDebounce.ts
│       └── useLocalStorage.ts
│
├── config/             # Application configuration
│   ├── api.config.ts   # API configuration
│   ├── app.config.ts   # App settings
│   └── constants.ts    # Global constants
│
├── core/               # Core application logic
│   ├── api/           # API client setup
│   ├── auth/          # Authentication core
│   ├── router/        # Routing logic
│   └── store/         # State management (if using Redux/Zustand)
│
├── features/           # Feature-based modules
│   ├── dashboard/
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── services/     # Feature-specific API services
│   │   ├── types/        # TypeScript types/interfaces
│   │   ├── utils/        # Feature-specific utilities
│   │   └── data/         # Mock data or constants
│   │
│   ├── workflow-builder/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   └── running-workflows/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
│
├── lib/                # Third-party library configurations
│   ├── api/           # API client implementation
│   ├── shadcn/        # Shadcn UI components
│   └── tanstack/      # React Query setup
│
├── pages/              # Page components (route endpoints)
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── WorkflowBuilder.tsx
│   └── NotFound.tsx
│
├── services/           # Global services (shared across features)
│   ├── api/           # Base API services
│   ├── auth/          # Authentication service
│   ├── notification/  # Notification service
│   └── storage/       # Local storage service
│
├── shared/             # Shared utilities and types
│   ├── components/     # Legacy shared components (migrate to common)
│   ├── types/         # Global TypeScript types
│   ├── utils/         # Utility functions
│   └── hooks/         # Legacy hooks (migrate to common/hooks)
│
├── utils/              # Global utility functions
│   ├── date.utils.ts   # Date formatting utilities
│   ├── string.utils.ts # String manipulation
│   ├── validation.ts   # Validation helpers
│   └── format.ts       # Formatting utilities
│
├── styles/             # Global styles
│   ├── index.css       # Main stylesheet
│   ├── variables.css   # CSS variables
│   └── tailwind.css    # Tailwind imports
│
└── main.tsx            # Application entry point
```

## Key Principles

### 1. Feature-Based Organization

Each feature is self-contained with its own:
- **Components**: UI components specific to the feature
- **Hooks**: Custom React hooks for the feature
- **Services**: API calls and business logic
- **Types**: TypeScript definitions
- **Utils**: Helper functions
- **Data**: Mock data or constants

### 2. Separation of Concerns

- **common/**: Reusable components used across multiple features
- **core/**: Core application setup and configuration
- **features/**: Feature-specific code
- **services/**: Global services shared across features
- **utils/**: Pure utility functions

### 3. Import Paths

Use absolute imports with path aliases:

```typescript
// Good
import { Button } from '@/common/components/Button';
import { useAuth } from '@/common/hooks/useAuth';
import { api } from '@/lib/api';
import { formatDate } from '@/utils/date.utils';

// Avoid relative imports for cross-feature dependencies
// Bad
import { Button } from '../../../common/components/Button';
```

### 4. File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useUserData.ts`)
- **Services**: camelCase with '.service' suffix (e.g., `user.service.ts`)
- **Types**: camelCase with '.types' suffix (e.g., `user.types.ts`)
- **Utils**: camelCase with '.utils' suffix (e.g., `date.utils.ts`)
- **Constants**: UPPER_SNAKE_CASE in files (e.g., `API_ENDPOINTS`)

### 5. Component Structure

Each component folder should follow:

```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.css       # Styles (if not using Tailwind)
├── ComponentName.test.tsx  # Tests
├── index.ts               # Export barrel
└── types.ts              # Component-specific types
```

## Migration Strategy

### Current → Target Structure

1. **shared/ → common/**
   - Move shared components to `common/components`
   - Move shared hooks to `common/hooks`

2. **Consolidate Services**
   - Keep feature-specific services in `features/*/services`
   - Move global services to `services/`

3. **Organize Utilities**
   - Move scattered utils to `utils/`
   - Keep feature-specific utils in `features/*/utils`

4. **Standardize Features**
   - Ensure each feature follows the same structure
   - Add missing folders (hooks, services, types, etc.)

## Feature Module Template

When creating a new feature, use this template:

```
features/
└── new-feature/
    ├── components/
    │   ├── FeatureMain.tsx
    │   └── FeatureDetails.tsx
    ├── hooks/
    │   └── useFeatureData.ts
    ├── services/
    │   └── feature.service.ts
    ├── types/
    │   └── feature.types.ts
    ├── utils/
    │   └── feature.utils.ts
    ├── data/
    │   └── mockData.ts
    └── index.ts  # Feature exports
```

## Best Practices

### 1. Component Organization

- Keep components small and focused
- Use composition over inheritance
- Extract business logic into hooks
- Keep styling consistent (prefer Tailwind)

### 2. Service Layer

- All API calls go through services
- Services return typed responses
- Handle errors at the service level
- Use React Query for data fetching

### 3. Type Safety

- Define types for all data structures
- Use strict TypeScript configuration
- Avoid `any` types
- Export types from feature modules

### 4. Testing

- Unit tests for utilities
- Component tests for UI components
- Integration tests for features
- E2E tests for critical user flows

### 5. Code Splitting

- Lazy load feature modules
- Split vendor bundles
- Use dynamic imports for large components

## Common Patterns

### API Service Pattern

```typescript
// services/user.service.ts
import { api } from '@/lib/api';
import type { User } from '@/types';

class UserService {
  async getUsers(): Promise<User[]> {
    return api.get('/users');
  }

  async createUser(data: Partial<User>): Promise<User> {
    return api.post('/users', data);
  }
}

export const userService = new UserService();
```

### Custom Hook Pattern

```typescript
// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });
};
```

### Feature Export Pattern

```typescript
// features/users/index.ts
export { UsersPage } from './components/UsersPage';
export { useUsers } from './hooks/useUsers';
export type { User } from './types/user.types';
```

## Dependencies Between Modules

```
main.tsx
    ↓
   app/
    ↓
  pages/ ←→ features/
    ↓         ↓
 common/  services/
    ↓         ↓
  lib/     utils/
```

- Pages import from features
- Features import from common, services, and utils
- Common components are standalone
- Utils are pure functions with no dependencies
- Services depend only on lib/api

## Maintenance Guidelines

1. **Regular Cleanup**
   - Remove unused imports and files
   - Update deprecated dependencies
   - Refactor duplicate code

2. **Documentation**
   - Keep README files in complex features
   - Document API services
   - Add JSDoc comments for utilities

3. **Performance**
   - Monitor bundle size
   - Use code splitting
   - Optimize re-renders

4. **Security**
   - Never commit secrets
   - Validate all inputs
   - Sanitize user-generated content

---

*Last Updated: September 2025*
*Version: 1.0.0*