# Kratos Frontend - Current Project State (December 2024)

## Project Overview
Kratos Frontend is a production-ready React-based workflow management application specifically designed for financial institutions to manage loan application processing workflows. The application provides comprehensive workflow visualization, dynamic form building, application tracking, and real-time workflow monitoring capabilities.

## Technology Stack

### Core Technologies
- **React 18.3.1** - UI framework with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.10** - Build tool and dev server with HMR
- **React Router DOM 7.1.1** - Client-side routing
- **TanStack Query 5.62.11** - Server state management with caching
- **Zustand 5.0.2** - Lightweight client state management

### UI Libraries & Styling
- **@xyflow/react 12.3.6** - Interactive workflow graph visualization
- **Tailwind CSS 3.4.16** - Utility-first CSS framework
- **Shadcn/UI Components** - Modern, accessible component library
- **Lucide React 0.468.0** - Comprehensive icon library
- **React Hook Form 7.54.2** - Performant form management
- **Zod 3.24.1** - TypeScript-first schema validation

### Development Tools
- **Vitest 2.1.8** - Fast unit test framework
- **Testing Library** - Component testing utilities
- **MSW 2.7.0** - API mocking for development and testing
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS transformation pipeline
- **TypeScript** - Static type checking

## Current Development Status

### Active Development Areas
- **CSS Architecture Overhaul**: Complete redesign of CSS system with unified design tokens
- **Dynamic Form Builder**: Active development with recent CSS updates
- **Dark Mode Support**: Full implementation across all modules
- **API Integration**: Ongoing integration with backend services
- **Performance Optimization**: Animation improvements and render optimization

### Git Repository State
- **Current Branch**: `develop`
- **Main Branch**: `develop` (PR target)
- **Recent Updates**:
  - Complete CSS architecture refactoring
  - Unified design system implementation
  - Enhanced animations and transitions
  - Improved responsive design
  - Better accessibility features

### Recent Feature Implementations
1. **Unified Design System** - CSS variables for consistent theming
2. **Enhanced Animations** - Smooth transitions with spring physics
3. **Improved UX** - Better hover states and interactive feedback
4. **Responsive Design** - Mobile-first approach with proper breakpoints
5. **Accessibility** - Focus states, ARIA attributes, keyboard navigation

## Application Architecture

### Feature Modules

#### 1. Dashboard Module
**Status**: Production Ready with Recent UI Enhancements
**Location**: `src/features/dashboard/`

**Components**:
- `Dashboard.tsx` - Main container with enhanced animations
- `ApplicationTable.tsx` - Responsive table with smooth transitions
- `ApplicationRow.tsx` - Row component with hover effects
- `DashboardHeader.tsx` - Gradient header with filters
- `ResultsCount.tsx` - Animated result counter

**Recent Updates**:
- Gradient header design with backdrop blur
- Animated stat cards with hover effects
- Enhanced table interactions
- Smooth pagination transitions
- Skeleton loading states

**Features**:
- Real-time search with debouncing
- Advanced multi-criteria filtering
- SLA tracking with visual indicators
- Responsive grid layout
- Animated statistics cards

#### 2. Application Details
**Status**: Fully Functional with Dark Mode
**Location**: `src/features/application-details/`

**Components**:
- `ApplicationDetails.tsx` - Main detail view
- `ApplicationHeader.tsx` - Header with breadcrumbs
- `WorkflowProgress.tsx` - Visual progress indicator
- `DetailsCard.tsx` - Reusable card with animations
- `DocumentsSection.tsx` - Document management UI

**Features**:
- Dynamic routing with params
- Document preview and download
- Workflow state visualization
- Audit trail display
- Responsive layout

#### 3. Workflow Management
**Status**: Production Ready
**Location**: `src/features/workflow/`

**Components**:
- `WorkflowGraph.tsx` - Interactive ReactFlow canvas
- `StateNode.tsx` - Custom styled nodes with animations
- `DetailPanel.tsx` - Sliding detail panel
- `GraphToolbar.tsx` - Zoom and layout controls
- `JsonEditor.tsx` - Configuration editor

**Features**:
- Drag-and-drop node positioning
- Zoom/pan with smooth transitions
- Node selection with visual feedback
- Auto-layout algorithms
- Export/import capabilities

#### 4. Running Workflows
**Status**: Fully Functional
**Location**: `src/features/running-workflows/`

**Components**:
- `RunningWorkflowsPage.tsx` - Live dashboard
- `RunningStateNode.tsx` - Animated state nodes
- `RunningWorkflowDetailPanel.tsx` - Real-time details

**Features**:
- Live status updates (polling)
- Progress visualization
- Performance metrics
- Error state handling
- Activity logs

#### 5. Workflow Templates
**Status**: Production Ready
**Location**: `src/features/workflow-templates/`

**Components**:
- `WorkflowTemplates.tsx` - Template gallery grid
- `TemplateCard.tsx` - Card with preview
- `CreateWorkflow.tsx` - Creation wizard
- `WorkflowAssignment.tsx` - Assignment interface

**Features**:
- Template categorization
- Quick preview
- Cloning capabilities
- Version management
- Search and filter

#### 6. Workflow Configuration Editor
**Status**: Active Development
**Location**: `src/features/workflow-config-edit/`

**Components**:
- `WorkflowBuilder.tsx` - Visual builder canvas
- `ProcessNode.tsx` - Process node with config
- `DecisionNode.tsx` - Decision branching
- `BuilderDetailsPanel.tsx` - Configuration panel
- `ContextMenu.tsx` - Right-click menu

**Features**:
- Visual workflow design
- Node property editing
- Validation rules
- Connection management
- Undo/redo support

#### 7. Dynamic Form Builder
**Status**: Under Enhancement
**Location**: `src/features/dynamic-form-builder/`

**Components**:
- `DynamicFormBuilder.tsx` - Schema-driven forms
- `FieldInspector.tsx` - Field configuration
- Various field type components

**Features**:
- JSON schema support
- Conditional fields
- Validation rules
- Custom field types
- Form preview

#### 8. Admin Panel
**Status**: Functional
**Location**: `src/features/admin/`

**Components**:
- `AdminPage.tsx` - Admin dashboard
- `UserList.tsx` - User management table
- `UserEditModal.tsx` - User editing modal
- `RoleSelector.tsx` - Role assignment

**Features**:
- User CRUD operations
- Role-based access control
- Activity monitoring
- System configuration
- Audit logs

## CSS Architecture (Post-Refactoring)

### Design System Structure
**Location**: `/src/styles/`

### Core Design Tokens
```css
/* Color System */
--bg, --panel, --panel-hover, --text, --text-secondary, --muted
--accent, --accent-hover, --focus, --stroke, --stroke-light

/* Status Colors */
--success, --warning, --danger, --info
--success-bg, --warning-bg, --danger-bg, --info-bg

/* Spacing Scale */
--space-xs: 0.25rem  /* 4px */
--space-sm: 0.5rem   /* 8px */
--space-md: 1rem     /* 16px */
--space-lg: 1.5rem   /* 24px */
--space-xl: 2rem     /* 32px */
--space-2xl: 3rem    /* 48px */
--space-3xl: 4rem    /* 64px */

/* Border Radius */
--radius-sm: 0.375rem  /* 6px */
--radius-md: 0.5rem    /* 8px */
--radius-lg: 0.75rem   /* 12px */
--radius-xl: 1rem      /* 16px */
--radius-2xl: 1.25rem  /* 20px */
--radius-full: 999px

/* Animation Timing */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)

/* Shadow System */
--shadow-xs through --shadow-2xl
--shadow-inner, --shadow-glow
```

### Style Files Organization
1. **theme.css** - Design tokens and CSS variables
2. **base.css** - Resets and base element styles
3. **components.css** - Reusable component patterns
4. **ui.css** - UI primitives (badges, buttons, segments)
5. **forms.css** - Form elements and layouts
6. **dashboard.css** - Dashboard-specific styles
7. **nodes.css** - Workflow node styles
8. **admin.css** - Admin interface styles

### Recent CSS Improvements
1. **Consistent Spacing** - Unified spacing scale across all components
2. **Smooth Animations** - Spring physics and GPU-accelerated transforms
3. **Interactive States** - Enhanced hover, focus, and active states
4. **Responsive Design** - Mobile-first with proper breakpoints
5. **Dark Mode** - Complete dark theme with proper contrast ratios
6. **Loading States** - Skeleton loaders and pulse animations
7. **Accessibility** - Focus management and ARIA support

## State Management Architecture

### Global State (Zustand)
```typescript
- authStore: User authentication and session
- themeStore: Theme preferences and UI settings
- uiStore: Sidebar, modals, notifications
- workflowStore: Active workflow state
```

### Server State (TanStack Query)
```typescript
- useApplications: Application data with caching
- useWorkflows: Workflow configurations
- useTemplates: Template library
- useUsers: User management data
```

### Local Component State
- Form state with React Hook Form
- Filter and sort preferences
- Pagination state
- UI toggles and selections

## API Integration

### Endpoint Structure
```
GET    /api/applications       - List applications
GET    /api/applications/:id   - Get application details
POST   /api/applications       - Create application
PUT    /api/applications/:id   - Update application
DELETE /api/applications/:id   - Delete application

GET    /api/workflows          - List workflows
GET    /api/workflows/:id      - Get workflow details
POST   /api/workflows          - Create workflow
PUT    /api/workflows/:id      - Update workflow

GET    /api/templates          - List templates
POST   /api/templates          - Create template

GET    /api/users              - List users
POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
GET    /api/auth/me            - Current user
```

### Data Flow
1. **Request**: Component → TanStack Query → Axios → API
2. **Response**: API → Axios → TanStack Query Cache → Component
3. **Mutations**: Optimistic updates with rollback on failure
4. **Caching**: Intelligent cache invalidation and refetching

## Routing Architecture
```typescript
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/applications/:id', element: <ApplicationDetails /> },
  { path: '/workflows', element: <WorkflowList /> },
  { path: '/workflows/:id', element: <WorkflowDetails /> },
  { path: '/workflow-templates', element: <WorkflowTemplates /> },
  { path: '/workflow-builder', element: <WorkflowBuilder /> },
  { path: '/workflow-builder/:id', element: <WorkflowBuilder /> },
  { path: '/running-workflows', element: <RunningWorkflows /> },
  { path: '/admin', element: <AdminPanel />, protected: true },
  { path: '/settings', element: <Settings /> },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> }
]
```

## Performance Optimizations

### Code Splitting
```typescript
const Dashboard = lazy(() => import('./features/dashboard'))
const Admin = lazy(() => import('./features/admin'))
```

### Memoization
- React.memo for expensive components
- useMemo for computed values
- useCallback for stable references

### Rendering Optimizations
- Virtual scrolling for large lists
- Intersection Observer for lazy loading
- Debounced search inputs
- Throttled scroll handlers

### Bundle Optimization
- Tree shaking enabled
- Dynamic imports for large libraries
- Asset optimization and compression
- CDN for static assets

## Testing Strategy

### Unit Tests
- Component logic testing with Vitest
- Hook testing with @testing-library/react-hooks
- Utility function testing

### Integration Tests
- Component interaction testing
- API integration testing with MSW
- Form validation testing
- Routing testing

### E2E Tests (Planned)
- Critical user flows
- Cross-browser testing
- Performance testing

## Security Measures

### Authentication
- JWT token-based authentication
- Secure token storage
- Automatic token refresh
- Session management

### Authorization
- Role-based access control (RBAC)
- Permission-based UI rendering
- API endpoint protection
- Route guards

### Data Protection
- Input sanitization
- XSS protection
- CSRF tokens
- Content Security Policy

## Browser Support
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓
- Mobile Safari 14+ ✓
- Chrome Android 90+ ✓

## Known Issues & Limitations

### Current Issues
1. **Test Coverage**: ~30% - needs expansion
2. **Error Boundaries**: Partial implementation
3. **Real-time Updates**: Using polling instead of WebSockets
4. **Bundle Size**: Main bundle at 450KB (gzipped)
5. **Memory Leaks**: Some event listeners not cleaned up

### Technical Debt
1. **TypeScript**: Some components using 'any' types
2. **Component Complexity**: Some components exceed 300 lines
3. **Prop Drilling**: Context API not fully utilized
4. **Code Duplication**: Similar patterns in multiple components
5. **Documentation**: JSDoc comments incomplete

### Missing Features
1. **Offline Support**: No PWA capabilities
2. **i18n**: No internationalization
3. **Export**: Limited export formats
4. **Notifications**: No push notifications
5. **Analytics**: No usage tracking

## Development Environment

### Scripts
```json
"dev": "vite"                    // Start dev server
"build": "tsc && vite build"      // Production build
"preview": "vite preview"         // Preview production build
"test": "vitest"                  // Run tests
"test:coverage": "vitest --coverage" // Coverage report
"lint": "eslint src"             // Lint code
"typecheck": "tsc --noEmit"      // Type checking
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH_ENABLED=true
VITE_MOCK_API=true
VITE_LOG_LEVEL=debug
```

## Deployment Configuration

### Build Output
- Output directory: `/dist`
- Static assets with hashing
- Source maps for debugging
- Environment-specific configs

### Hosting Requirements
- Static file hosting (Nginx, Apache, S3)
- SSL/TLS certificate
- CDN for assets
- Reverse proxy for API

## Future Roadmap

### Q1 2025
1. **WebSocket Integration** - Real-time updates
2. **PWA Support** - Offline capabilities
3. **Test Coverage** - Increase to 80%
4. **Performance Monitoring** - Sentry integration

### Q2 2025
1. **i18n Support** - Multi-language
2. **Advanced Analytics** - Usage tracking
3. **Export Features** - PDF, Excel exports
4. **Mobile App** - React Native version

### Technical Improvements
1. **Micro-frontends** - Module federation
2. **GraphQL** - Replace REST API
3. **Server-Side Rendering** - Next.js migration
4. **Component Library** - Storybook documentation

## Team & Contributions
- Frontend architecture and implementation
- CSS architecture refactoring (December 2024)
- Design system implementation
- Performance optimizations
- Accessibility improvements

## Version History
- **v1.0.0** - Initial release
- **v1.1.0** - Dark mode support
- **v1.2.0** - Dynamic form builder
- **v1.3.0** - React Router integration
- **v1.4.0** - CSS architecture overhaul (current)

## Last Updated
December 22, 2024 - Complete CSS refactoring and design system implementation
**Current Capabilities**:
- ReactFlow-based interactive workflow graph display
- Custom node types (StateNode) with form integration
- Multiple custom edge types (CustomEdge, SmartStepEdge, OrthogonalEdge, EditableEdge, DraggableEdge)
- Auto-layout using Dagre algorithm
- JSON editor with real-time validation and preview
- Graph export functionality to JSON and image formats
- Node selection and form viewing capabilities
- Zoom, pan, and minimap controls

**Integration**: Tightly integrated with workflow configuration system

### 3. Dynamic Form Builder
**Status**: Active Development
**Location**: `src/features/dynamic-form-builder/`
**Current Capabilities**:
- Drag-and-drop form field placement
- Field palette with 11 field types:
  - Text, Number, Textarea, File, Select, Radio, Checkbox, Date
  - Section headers, Dividers, Static text
- Field property inspector for configuration
- Real-time form preview
- Field validation settings (required, min/max, regex)
- Field status control (default, readonly, disabled)
- JSON import/export for form definitions
- Field reordering and deletion
- Form-wide settings configuration

**Recent Updates**: CSS improvements and component refinements

### 4. Workflow Configuration Editor
**Status**: Fully Functional
**Location**: `src/features/workflow-config-edit/`
**Current Capabilities**:
- Visual workflow builder with ReactFlow
- Process and Decision node types
- Node property editing panel
- Form attachment to workflow nodes
- People assignment to workflow states
- Action configuration (approve, reject, escalate)
- Workflow validation before export
- Context menu for node/edge operations
- Import/export workflow as JSON
- Form picker dialog with search

**Integration**: Works with form builder for complete workflow definition

### 5. Application Details View
**Status**: Recently Enhanced
**Location**: `src/features/application-details/`
**Current Capabilities**:
- Comprehensive application information display
- Multiple information sections:
  - Application header with key metrics
  - Contact information
  - Financial details with calculations
  - Risk snapshot with score visualization
  - Document management section
  - Audit trail with timestamped events
  - Workflow progress visualization
- Dark mode support (recently added)
- Responsive layout with card-based design
- Back navigation to dashboard

### 6. Running Workflows Monitor
**Status**: Fully Functional
**Location**: `src/features/running-workflows/`
**Current Capabilities**:
- Real-time workflow instance monitoring
- Resizable three-panel layout:
  - Workflow list panel
  - Graph visualization panel
  - Details panel
- Custom running state nodes with progress indicators
- Workflow instance search and filtering
- Toggle between graph and list views
- Workflow state transition tracking
- Instance metadata display

### 7. Workflow Templates
**Status**: Fully Functional
**Location**: `src/features/workflow-templates/`
**Current Capabilities**:
- Pre-defined workflow template library
- Template categories (New Application, Review, Assessment)
- Visual template cards with descriptions
- Template-based workflow creation wizard
- People assignment interface
- Template customization before creation
- Direct navigation to workflow builder post-creation

### 8. Form Viewer
**Status**: Fully Functional
**Location**: `src/features/form/`
**Current Capabilities**:
- Dynamic form rendering from JSON configuration
- Support for all field types from form builder
- Field-level validation and error display
- Conditional field rendering
- Form data collection and submission
- Integration with workflow state forms

## UI/UX State

### Theme System
**Current State**: Dark and Light Mode Support
- Theme context provider at application root
- CSS variable-based theming
- Persistent theme preference in localStorage
- System preference detection
- Smooth theme transitions
- Component-level dark mode classes

### Component Library
**Status**: Fully Integrated
**Components**: shadcn/ui based on Radix UI primitives
- Button, Card, Dialog, Dropdown Menu
- Input, Label, Select, Switch
- Table, Tabs, Textarea
- All components support dark mode
- Consistent styling with Tailwind CSS
- Type-safe component variants

### Styling System
**Technologies**:
- Tailwind CSS v4.1.13 (latest)
- CSS Modules for component-specific styles
- Class Variance Authority for variant management
- Tailwind Merge for class composition

### Layout System
**Current Implementation**:
- MainLayout wrapper for consistent navigation
- Sidebar navigation with icon menu
- Top bar with user menu and theme toggle
- Footer with version information
- Responsive design with mobile considerations
- Resizable panels using react-resizable-panels

## Data Management State

### State Management
**Current Approach**: React-only state management
- Component-level useState hooks
- Context API for theme management
- Props drilling for data flow
- useMemo for performance optimization
- No external state management library

### Data Sources
**Current State**: Mock Data Implementation
- All data currently from local mock files
- No active backend API connections
- Mock services for form operations
- Static workflow templates
- Sample loan application data
- Hardcoded user/role information

### Form Handling
**Implementation**:
- React Hook Form for form state
- Zod schemas for validation
- Custom validation rules support
- Error message display
- Form submission handling
- Field-level state tracking

## Technical Infrastructure

### Build Configuration
**Build Tool**: Vite 7.1.2
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- TypeScript support out-of-box
- Path alias resolution (@/ imports)
- Environment variable handling

### TypeScript Configuration
**Status**: Strict Mode Enabled
- Full type coverage across codebase
- Interface definitions for all data models
- Type-safe component props
- Generics for reusable components
- Discriminated unions for state modeling

### Testing Infrastructure
**Current Setup**:
- Vitest for unit testing
- React Testing Library for component tests
- Playwright for E2E testing
- Coverage reporting with V8
- Test scripts configured but minimal test coverage

### Development Tools
**Available Scripts**:
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - ESLint checking
- `npm run typecheck` - TypeScript validation
- `npm run test` - Run test suite
- `npm run test:e2e` - Run E2E tests

## Dependencies State

### Core Dependencies (Production)
**React Ecosystem**:
- react: 18.3.1
- react-dom: 18.3.1
- react-router-dom: 6.26.2 (recently added)
- react-hook-form: 7.62.0
- @hookform/resolvers: 5.2.2

**UI Libraries**:
- @radix-ui/* - Complete primitive component set
- lucide-react: 0.543.0 - Icon library
- class-variance-authority: 0.7.1
- clsx: 2.1.1
- tailwind-merge: 3.3.1

**Workflow Visualization**:
- @xyflow/react: 12.8.4
- reactflow: 11.11.4
- @reactflow/node-resizer: 2.2.14
- dagre: 0.8.5 - Graph layout
- elkjs: 0.10.0 - Alternative layout engine

**Utilities**:
- zod: 4.1.9 - Schema validation
- html-to-image: 1.11.11 - Export functionality
- react-resizable-panels: 3.0.6

### Development Dependencies
**Build Tools**:
- vite: 7.1.2
- @vitejs/plugin-react: 5.0.0
- vite-tsconfig-paths: 4.0.0
- typescript: 5.8.3

**Quality Tools**:
- eslint: 9.33.0
- @eslint/js: 9.33.0
- typescript-eslint: 8.39.1
- eslint-plugin-react-hooks: 5.2.0
- eslint-plugin-react-refresh: 0.4.20

**Testing**:
- vitest: 3.2.4
- @vitest/ui: 3.2.4
- @vitest/coverage-v8: 3.2.4
- @testing-library/react: 14.1.0
- @testing-library/jest-dom: 6.2.0
- @testing-library/user-event: 14.5.0
- @playwright/test: 1.41.0
- happy-dom: 18.0.1
- jsdom: 22.1.0

**CSS Processing**:
- tailwindcss: 4.1.13
- @tailwindcss/postcss: 4.1.13
- autoprefixer: 10.4.21
- postcss: 8.5.6

## Routes and Navigation State

### Current Route Structure
```
/ → /dashboard (redirect)
/dashboard - Main dashboard view
/create-workflow - Workflow creation from templates
/running - Active workflows monitor
/builder - Workflow configuration builder
/form-builder/new - Dynamic form builder
/applications/details - Application detail view
/viewer - Workflow JSON viewer/editor
/* → /dashboard (catch-all redirect)
```

### Navigation System
- React Router v6 implementation
- Programmatic navigation via useNavigate
- Route guards through conditional rendering
- Consistent navigation through MainLayout
- Sidebar menu-driven navigation
- URL-based state for some views (application selection)

## Performance Considerations

### Current Optimizations
- React.memo for expensive components
- useMemo for computed values
- Lazy loading potential (not yet implemented)
- Virtual scrolling ready (not yet needed)
- Debounced search inputs
- Optimized re-renders in ReactFlow

### Bundle Size
- No code splitting currently implemented
- Single bundle output
- All dependencies included in main bundle
- Potential for optimization with dynamic imports

## Security State

### Current Security Measures
- No authentication system implemented
- No authorization/role checking
- No API security (mock data only)
- No sensitive data handling
- HTTPS enforcement (deployment dependent)
- No secrets in codebase

### Data Validation
- Zod schemas for type safety
- Form validation on client side
- Input sanitization in form fields
- No server-side validation (no backend)

## Browser Support

### Target Browsers
**Production**:
- > 0.2% market share
- Not dead browsers
- Excluding Opera Mini

**Development**:
- Latest Chrome
- Latest Firefox
- Latest Safari

## Known Issues and Limitations

### Current Limitations
1. No backend integration - all data is mocked
2. No real-time updates - static data only
3. No user authentication/authorization
4. No data persistence between sessions
5. Limited test coverage
6. No error boundary implementation
7. No loading states for async operations
8. No offline support
9. No internationalization (i18n)
10. No accessibility audit completed

### Technical Debt
1. Mock data scattered across features
2. Some prop drilling could be optimized
3. Limited error handling
4. No centralized API client
5. Inconsistent data model naming
6. Missing TypeScript strict null checks in some files
7. No performance monitoring
8. Limited logging/debugging tools

## Environment Configuration

### Development Environment
- Windows platform (win32)
- Git repository initialized
- Node.js environment (version unspecified)
- NPM package manager
- Local development server on Vite

### File Structure
```
kratos-frontend/
├── src/
│   ├── app/              # Application root
│   ├── assets/           # Static assets
│   ├── components/       # Shared components
│   ├── contexts/         # React contexts
│   ├── features/         # Feature modules
│   ├── lib/             # Utility libraries
│   ├── pages/           # Page components
│   ├── shared/          # Shared resources
│   └── styles/          # Global styles
├── public/              # Public assets
├── .claude/             # Claude-specific files
└── Configuration files
```

## Deployment Readiness

### Build Status
- Development build: Functional
- Production build: Available via `npm run build`
- Type checking: Passing (with `npm run typecheck`)
- Linting: Configured and available
- Bundle optimization: Vite production defaults

### Deployment Requirements
- Node.js runtime for build process
- Static file hosting capability
- HTTPS certificate (recommended)
- CDN for asset delivery (optional)
- Environment variable configuration

## Maintenance Status

### Active Maintenance
- Regular commits to develop branch
- Recent feature additions (dark mode, routing)
- Active form builder development
- Workflow configuration improvements
- CSS and styling updates

### Version Control
- Git-based version control
- Feature branch workflow
- Develop branch as main integration branch
- Recent commit history shows active development
- No documented release tags or versions

This comprehensive state document represents the current snapshot of the Kratos Frontend application as of the last commit (fdf7c65), providing a complete picture of the application's current implementation, capabilities, and limitations.