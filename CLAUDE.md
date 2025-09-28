# CLAUDE.md - AI Assistant Guide for Kratos Frontend

This document provides essential context and guidelines for AI assistants working on the Kratos Frontend codebase. It ensures consistent, maintainable, and high-quality code contributions.

## Project Overview

**Kratos Frontend** is a React/TypeScript application for workflow visualization and form rendering, specifically designed for loan approval workflows. It transforms JSON workflow specifications into interactive visual graphs and dynamic forms for business process automation.

### Core Technologies
- **React 18.3** with TypeScript 5.8
- **Vite** for build tooling
- **React Flow** (@xyflow/react) for graph visualization
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Tailwind CSS** with Shadcn UI components
- **MSW** for API mocking in tests
- **Vitest** for unit/integration testing

## Project Structure

```
src/
├── app/                      # Application bootstrap and main component
├── features/                 # Feature-based modules (main business logic)
│   ├── dashboard/           # Loan applications dashboard
│   ├── application-details/ # Individual application management
│   ├── workflow/            # Workflow visualization
│   ├── form/               # Dynamic form rendering
│   ├── workflow-config-edit/ # Workflow builder/editor
│   └── running-workflows/   # Active workflow monitoring
├── services/                # Service layer for API communication
│   ├── base/               # Base API client
│   ├── auth/               # Authentication service
│   └── application/        # Application-specific services
├── shared/                  # Shared resources across features
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── lib/                     # External library configurations
│   └── api/                # API client and endpoints
├── common/                  # Common layouts and hooks
│   ├── layouts/            # App layouts (MainLayout, Sidebar, etc.)
│   └── hooks/              # Common hooks (debounce, localStorage, etc.)
├── components/              # Shadcn UI components
│   └── ui/                 # Base UI components
├── styles/                  # Global styles and design tokens
└── tests/                   # Test files and utilities
    ├── mocks/              # MSW handlers and mock data
    ├── setup.ts            # Test setup configuration
    └── test-utils.tsx      # Testing utilities
```

## Code Style and Standards

### TypeScript Guidelines
1. **Strict Type Safety**
   - NO `any` types - use `unknown` or proper interfaces
   - Enable strict null checks
   - Use discriminated unions for state management
   - Implement type guards for runtime safety

2. **Interface Naming**
   ```typescript
   // Components props: suffix with Props
   interface DashboardProps { }

   // API types: descriptive names
   interface LoanApplication { }
   interface WorkflowInstance { }

   // Generic types: prefix with T
   type TPaginatedResponse<T> = { }
   ```

3. **File Naming**
   - Components: PascalCase (e.g., `Dashboard.tsx`)
   - Hooks: camelCase with 'use' prefix (e.g., `useApplications.ts`)
   - Services: PascalCase with 'Service' suffix (e.g., `ApplicationService.ts`)
   - Utils: camelCase (e.g., `graphParser.ts`)
   - Types: camelCase with '.types.ts' extension

### React Best Practices

1. **Component Structure**
   ```tsx
   // Functional components with explicit return types
   export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
     // Hooks at the top
     const [state, setState] = useState<Type>();

     // Derived values with useMemo
     const derivedValue = useMemo(() => compute(state), [state]);

     // Callbacks with useCallback
     const handleClick = useCallback(() => {}, [dependency]);

     // Early returns for loading/error states
     if (loading) return <LoadingState />;
     if (error) return <ErrorState />;

     return <div>{/* JSX */}</div>;
   };
   ```

2. **Custom Hooks Pattern**
   ```typescript
   // Always return an object for extensibility
   export function useCustomHook() {
     return {
       data,
       loading,
       error,
       refetch,
     };
   }
   ```

3. **Error Boundaries**
   - Use at page, section, and component levels
   - Implement graceful fallbacks
   - Log errors for monitoring

### State Management

1. **Server State**: TanStack Query
   ```typescript
   // Use consistent query keys
   const QUERY_KEYS = {
     applications: ['applications'],
     applicationDetail: (id: string) => ['application', id],
   };
   ```

2. **Client State**: Zustand for global state
3. **Local State**: useState/useReducer for component state

### API Integration Pattern

```typescript
// Service layer pattern
class ApplicationService extends ApiClient {
  async getApplications(params: GetApplicationsParams): Promise<PaginatedResponse<Application>> {
    return this.get('/api/applications', { params });
  }
}

// Hook pattern with React Query
export function useApplications(params: GetApplicationsParams) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationService.getApplications(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Component usage
const { data, loading, error } = useApplications({ page: 1 });
```

### Testing Requirements

1. **Test File Location**
   - Place tests in `/tests/` directory
   - Mirror source structure

2. **Test Coverage**
   - Critical business logic: 80%+ coverage
   - Utility functions: 100% coverage
   - UI components: Integration tests for user flows

3. **Testing Pattern**
   ```typescript
   describe('ComponentName', () => {
     it('should render correctly', () => {
       render(<Component />);
       expect(screen.getByRole('button')).toBeInTheDocument();
     });

     it('should handle user interaction', async () => {
       const user = userEvent.setup();
       render(<Component />);
       await user.click(screen.getByRole('button'));
       expect(mockFn).toHaveBeenCalled();
     });
   });
   ```

## Key Features Implementation Guide

### 1. Workflow Visualization
- **Parser**: `src/features/workflow/utils/graphParser.ts`
- Transforms JSON workflow to React Flow nodes/edges
- Use deterministic IDs for stable rendering
- Layout algorithm: Currently grid-based, extensible for dagre/elk

### 2. Dynamic Form Rendering
- **Components**: `FormViewer.tsx`, `FieldInput.tsx`
- Supports: text, number, select, textarea, file, date, checkbox
- Field actions: validate, calculate, fetch, autofill
- Data binding via template syntax: `{{ data.field }}`

### 3. Dashboard Features
- Applications list with pagination
- Real-time statistics
- Advanced filtering and search
- Bulk operations support
- Export functionality

### 4. Application Management
- Document upload/download
- Audit trail tracking
- Workflow state transitions
- Comments and annotations
- SLA monitoring

## Performance Guidelines

1. **Component Optimization**
   - Use React.memo for expensive components
   - Implement virtual scrolling for large lists
   - Debounce search inputs (300ms)
   - Throttle scroll handlers (100ms)

2. **Bundle Optimization**
   - Code splitting by route
   - Lazy load heavy components
   - Tree-shake unused code

3. **API Optimization**
   - Implement proper caching strategies
   - Use pagination for large datasets
   - Batch API requests when possible
   - Cancel pending requests on unmount

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs
   - Validate against schema (Zod)
   - Prevent XSS attacks

2. **Authentication**
   - JWT token management
   - Automatic token refresh
   - Secure storage (httpOnly cookies preferred)

3. **Authorization**
   - Role-based access control
   - Feature flags for permissions
   - Server-side validation

## Accessibility Requirements

1. **ARIA Labels**: All interactive elements
2. **Keyboard Navigation**: Full support
3. **Screen Readers**: Proper semantic HTML
4. **Focus Management**: Logical tab order
5. **Color Contrast**: WCAG AA compliance

## Common Pitfalls to Avoid

1. **Don't modify `node_modules`** - Use patches or forks
2. **Avoid direct DOM manipulation** - Use React refs
3. **Don't mutate state directly** - Use immutable updates
4. **Avoid inline styles** - Use Tailwind classes
5. **Don't commit sensitive data** - Use environment variables
6. **Avoid deep component nesting** - Extract to separate components
7. **Don't ignore TypeScript errors** - Fix or properly type
8. **Avoid synchronous expensive operations** - Use Web Workers or defer

## Development Workflow

### Setup
```bash
npm ci                    # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
```

### Before Committing
```bash
npm run typecheck        # Check TypeScript
npm run lint            # Check linting
npm test                # Run tests
npm run build:dev       # Verify build
```

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:ui         # Vitest UI
```

## API Endpoints Reference

The application uses a comprehensive API structure:
- `/api/applications` - Dashboard and application management
- `/api/workflows` - Workflow definitions and templates
- `/api/workflow-instances` - Running workflow instances
- `/api/documents` - Document management
- `/api/auth` - Authentication endpoints

## Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development
VITE_ENABLE_MOCKING=true
```

## Debugging Tips

1. **React DevTools**: Inspect component props and state
2. **Network Tab**: Monitor API calls and responses
3. **Console Logging**: Use structured logging
   ```typescript
   console.log('[Dashboard]', 'Loading applications', { params });
   ```
4. **Source Maps**: Available in dev mode for debugging

## Migration and Refactoring Status

### Completed
- ✅ Service layer architecture
- ✅ Error boundary system
- ✅ Custom hooks library
- ✅ TypeScript type system
- ✅ API integration for dashboard
- ✅ CSS design system

### In Progress
- 🔄 Component refactoring for better modularity
- 🔄 Test coverage improvement

### Planned
- 📋 Storybook integration
- 📋 E2E tests with Playwright
- 📋 Performance monitoring
- 📋 Internationalization

## Contributing Guidelines

1. **Feature Development**
   - Create feature branch from `develop`
   - Follow naming: `feature/description`
   - Write tests for new features
   - Update documentation

2. **Bug Fixes**
   - Branch from `develop`
   - Follow naming: `fix/description`
   - Include test to prevent regression

3. **Code Review Checklist**
   - TypeScript types correct?
   - Tests included/updated?
   - Error handling adequate?
   - Performance considered?
   - Accessibility maintained?

## Resources and References

### Internal Documentation
- [Project README](./README.md) - General project information
- **[API Integration Guide](./API_GUIDE.md) - Comprehensive API documentation**
- **[API Quick Reference](./API_QUICK_REFERENCE.md) - Quick API reference card**
- [Study Guide](./study.md) - Deep technical knowledge
- [API Integration Plan](./API_INTEGRATION_PLAN.md) - API implementation details
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Recent improvements

### External Documentation
- [React Flow Docs](https://reactflow.dev/)
- [TanStack Query Docs](https://tanstack.com/query)
- [Shadcn UI Docs](https://ui.shadcn.com/)

## AI Assistant Specific Guidelines

When making changes to this codebase:

1. **Always check existing patterns** before implementing new solutions
2. **Maintain consistency** with established code style
3. **Write comprehensive tests** for any new functionality
4. **Update type definitions** when changing data structures
5. **Consider performance impact** for UI changes
6. **Ensure accessibility** is not compromised
7. **Document complex logic** with clear comments
8. **Use existing utilities** from shared/utils and shared/hooks
9. **Follow the service layer pattern** for API calls
10. **Respect the feature-based architecture** - keep related code together

### Quick Command Reference

```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm run preview         # Preview production build

# Quality Checks
npm run typecheck       # TypeScript validation
npm run lint           # ESLint checks
npm test               # Run tests
npm run test:coverage  # Test coverage

# Utilities
npm run test:ui        # Vitest UI for debugging tests
```

---

*This document is maintained to help AI assistants understand and work effectively with the Kratos Frontend codebase. Keep it updated as the project evolves.*