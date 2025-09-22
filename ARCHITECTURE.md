# Kratos Frontend - System Architecture Documentation

## Executive Summary
Kratos Frontend is a modern, scalable React application built with TypeScript, designed for enterprise-grade workflow management in financial institutions. The architecture emphasizes modularity, maintainability, and performance through a feature-based structure with clear separation of concerns.

## Architectural Principles

### Core Design Principles
1. **Feature-First Architecture** - Organized by business domains for better scalability
2. **Component Composition** - Small, reusable components following DRY principles
3. **Type Safety** - TypeScript throughout for compile-time safety
4. **State Separation** - Clear distinction between server and client state
5. **Performance First** - Optimized rendering, code splitting, lazy loading
6. **Accessibility** - WCAG 2.1 AA compliance target
7. **Developer Experience** - Fast builds, hot reloading, clear patterns

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                 │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │   React     │ │  TypeScript  │ │   Tailwind CSS  │ │
│  │  Components │ │    Types     │ │    + Custom     │ │
│  └─────────────┘ └──────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  State Management Layer                 │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │   Zustand   │ │ TanStack     │ │   React Hook    │ │
│  │ (Client)    │ │ Query(Server)│ │   Form          │ │
│  └─────────────┘ └──────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                        │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │   API       │ │   Auth       │ │   Validation    │ │
│  │  Client     │ │   Service    │ │    (Zod)        │ │
│  └─────────────┘ └──────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure                        │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │    Vite     │ │   Vitest     │ │      MSW        │ │
│  │   Builder   │ │   Testing    │ │    Mocking      │ │
│  └─────────────┘ └──────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Component-Driven Development
- **Atomic Design**: Small, reusable UI components in `src/components/ui/`
- **Feature Components**: Complex, feature-specific components within feature modules
- **Composition Over Inheritance**: Components are composed rather than extended

### 3. Type Safety First
- **TypeScript Strict Mode**: Full type coverage with strict null checks
- **Type Definitions**: Comprehensive interfaces and types for all data structures
- **Runtime Validation**: Zod schemas for data validation at boundaries

### 4. Unidirectional Data Flow
- **Props Down, Events Up**: Classic React data flow pattern
- **Local State Management**: useState for component state
- **Context for Cross-Cutting Concerns**: Theme context for global UI state

## Application Layers

### Presentation Layer

#### Component Architecture
```
Component Types:
├── Page Components       (Route-level components)
├── Layout Components     (MainLayout, Sidebar, TopBar)
├── Feature Components    (Complex business components)
├── UI Components        (Reusable presentational components)
└── Utility Components   (HOCs, Providers)
```

#### Component Structure Pattern
```typescript
// Standard component structure
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

### Business Logic Layer

#### Feature Module Structure
```
feature/
├── components/          # Feature-specific React components
├── types/              # TypeScript type definitions
├── utils/              # Business logic and helpers
├── data/               # Mock data and constants
├── services/           # API services (when implemented)
├── hooks/              # Custom React hooks
├── styles/             # Feature-specific styles
└── index.ts            # Public API exports
```

#### State Management Architecture
```
State Management Hierarchy:
├── Component State      (useState for local state)
├── Context State       (React Context for cross-cutting state)
├── URL State          (React Router for navigation state)
└── Form State         (React Hook Form for form management)
```

### Data Layer

#### Current Data Architecture (Mock Implementation)
```
Data Sources:
├── Static Mock Files    (*.data.ts files)
├── Mock Services       (Simulated API responses)
├── Local Storage       (Theme preferences)
└── Session Storage     (Temporary UI state)
```

#### Future Data Architecture (With Backend)
```
Data Flow:
Client → API Client → Backend API → Database
       ↓
    Cache Layer
       ↓
    State Store
       ↓
    Components
```

## Module Architecture

### Core Modules

#### 1. Application Shell (`src/app/`)
**Responsibility**: Application bootstrap and routing configuration

**Components**:
- `App.tsx`: Root component with route definitions
- Route configuration and navigation logic
- Global providers setup

**Dependencies**:
- React Router for navigation
- Feature modules for route components
- Layout components for consistent UI

#### 2. Dashboard Module (`src/features/dashboard/`)
**Responsibility**: Application overview and navigation hub

**Architecture Pattern**: Container-Presenter
```
Dashboard (Container)
├── DashboardHeader (Presenter)
├── DashboardFilters (Presenter)
├── ApplicationTable (Container)
│   └── ApplicationRow (Presenter)
└── StatsContainer (Container)
    └── StatsCard (Presenter)
```

**Data Flow**:
1. Mock data loaded from `mockWorkflowData.ts`
2. Transformed via `workflowTransformer.ts`
3. Filtered and sorted in component state
4. Rendered through presenter components

#### 3. Workflow Visualization (`src/features/workflow/`)
**Responsibility**: Graph-based workflow display and editing

**Architecture Pattern**: Custom Renderer with ReactFlow
```
WorkflowGraph (Controller)
├── ReactFlow Instance
├── Custom Nodes
│   ├── StateNode
│   └── Custom renderers
├── Custom Edges
│   ├── SmartStepEdge
│   ├── OrthogonalEdge
│   └── Other edge types
└── Graph Controls
    ├── Toolbar
    └── Minimap
```

**Key Design Decisions**:
- ReactFlow for graph rendering
- Custom node/edge components for domain-specific visualization
- Dagre for automatic layout calculation
- Separation of graph data from visualization logic

#### 4. Dynamic Form Builder (`src/features/dynamic-form-builder/`)
**Responsibility**: Visual form design and configuration

**Architecture Pattern**: Drag-and-Drop Builder
```
DynamicFormBuilder (Orchestrator)
├── FieldPalette (Source)
├── FieldList (Target/Canvas)
├── FieldInspector (Editor)
└── Form Preview (Renderer)
```

**State Management**:
- Local state for form definition
- Drag-and-drop state for UI interactions
- Validation state for field rules

#### 5. Workflow Configuration (`src/features/workflow-config-edit/`)
**Responsibility**: Visual workflow design and configuration

**Architecture Pattern**: Node-Based Editor
```
WorkflowBuilder (Main Controller)
├── ReactFlow Canvas
├── Node Types
│   ├── ProcessNode
│   └── DecisionNode
├── BuilderDetailsPanel (Property Editor)
├── FormPickerDialog (Form Selection)
└── Context Menu (Operations)
```

**Integration Points**:
- Form Builder for form attachment
- Workflow types for data model
- Export to JSON for persistence

### Supporting Modules

#### Theme System (`src/contexts/ThemeContext.tsx`)
**Architecture**: Context-based global state
```typescript
ThemeContext
├── Theme Provider (Root level)
├── Theme Hook (useTheme)
├── CSS Variables (Dynamic theming)
└── Local Storage (Persistence)
```

#### Layout System (`src/shared/components/layout/`)
**Architecture**: Compositional layout
```
MainLayout
├── Sidebar (Navigation)
├── TopBar (User controls)
├── Content Area (Dynamic)
└── Footer (Information)
```

#### UI Component Library (`src/components/ui/`)
**Architecture**: Atomic design with shadcn/ui
```
Base Components (Radix UI Primitives)
├── Styled with Tailwind CSS
├── Variant system (CVA)
├── Type-safe props
└── Dark mode support
```

## Data Flow Architecture

### Current Data Flow (Mock Implementation)
```
User Interaction
    ↓
Component Event Handler
    ↓
Local State Update
    ↓
Mock Data Transformation
    ↓
UI Re-render
```

### Component Communication Patterns

#### 1. Parent-Child Communication
```typescript
// Props down
<ChildComponent data={parentData} onUpdate={handleUpdate} />

// Events up
const handleUpdate = (newData) => {
  setParentState(newData);
}
```

#### 2. Cross-Component Communication
```typescript
// Via Context
<ThemeContext.Provider value={theme}>
  <ComponentA /> // Can access theme
  <ComponentB /> // Can access theme
</ThemeContext.Provider>

// Via URL State
navigate('/dashboard', { state: { filter: 'active' } });
```

#### 3. Form Data Management
```typescript
// React Hook Form pattern
const { register, handleSubmit, control } = useForm({
  resolver: zodResolver(schema)
});
```

## Routing Architecture

### Route Structure
```
Application Routes:
├── / (Root)
│   └── Redirect to /dashboard
├── /dashboard
│   └── Dashboard feature
├── /create-workflow
│   └── Template selection
├── /running
│   └── Active workflows
├── /builder
│   └── Workflow builder
├── /form-builder/new
│   └── Form designer
├── /applications/details
│   └── Application details
├── /viewer
│   └── Workflow viewer
└── /* (Catch-all)
    └── Redirect to /dashboard
```

### Navigation Patterns
1. **Programmatic Navigation**: `useNavigate()` hook
2. **Declarative Navigation**: `<Route>` components
3. **Protected Routes**: Conditional rendering
4. **Route Parameters**: Via component state

## Build and Bundle Architecture

### Build Pipeline
```
Source Code (TypeScript + JSX)
    ↓
Vite Build System
    ↓
TypeScript Compilation
    ↓
Bundle Generation
    ↓
Asset Optimization
    ↓
Production Build
```

### Module Resolution
```
Path Aliases:
@/ → src/
@features/ → src/features/
@components/ → src/components/
@shared/ → src/shared/
```

### Asset Management
- **Static Assets**: Public directory
- **Dynamic Imports**: Potential for code splitting
- **CSS Processing**: PostCSS with Tailwind
- **Image Optimization**: Build-time processing

## Development Architecture

### Development Workflow
```
Development Server (Vite)
├── Hot Module Replacement
├── TypeScript Watch Mode
├── CSS Processing
└── Source Maps
```

### Testing Architecture
```
Testing Stack:
├── Unit Tests (Vitest)
│   ├── Component testing
│   └── Utility testing
├── Integration Tests (Testing Library)
│   └── Feature testing
└── E2E Tests (Playwright)
    └── User flow testing
```

### Code Quality Architecture
```
Quality Gates:
├── TypeScript Compiler
├── ESLint (Linting)
├── Prettier (Formatting)
└── Pre-commit Hooks (Future)
```

## Security Architecture

### Current Security Model
```
Client-Side Security:
├── Input Validation (Zod)
├── XSS Prevention (React defaults)
├── No sensitive data storage
└── HTTPS enforcement (deployment)
```

### Future Security Considerations
```
Enhanced Security:
├── Authentication Layer
├── Authorization (RBAC)
├── API Security (JWT/OAuth)
├── CORS Configuration
└── Security Headers
```

## Performance Architecture

### Rendering Optimization
```
Performance Strategies:
├── React.memo (Prevent re-renders)
├── useMemo (Expensive computations)
├── useCallback (Stable references)
└── Virtual DOM (React default)
```

### Bundle Optimization
```
Optimization Techniques:
├── Tree Shaking (Vite default)
├── Minification (Production build)
├── Compression (gzip/brotli)
└── Code Splitting (Future)
```

### Runtime Performance
```
Runtime Optimizations:
├── Lazy Loading (Components)
├── Debouncing (User inputs)
├── Throttling (Scroll events)
└── Web Workers (Heavy computation)
```

## Scalability Architecture

### Horizontal Scalability
```
Feature Modules:
- Independent development
- Isolated testing
- Parallel development teams
- Feature flags ready
```

### Vertical Scalability
```
Component Hierarchy:
- Reusable components
- Compositional patterns
- Shared utilities
- Centralized types
```

### State Scalability
```
State Management Evolution:
Current: Local State + Context
Future Options:
├── Redux (Complex state)
├── Zustand (Simpler alternative)
├── Jotai (Atomic state)
└── TanStack Query (Server state)
```

## Integration Architecture

### Current Integrations
```
Third-Party Libraries:
├── ReactFlow (Workflow visualization)
├── Radix UI (Component primitives)
├── Tailwind CSS (Styling)
├── React Hook Form (Forms)
└── Zod (Validation)
```

### Future Integration Points
```
Backend Integration:
├── REST API Client
├── WebSocket (Real-time)
├── GraphQL (Alternative)
└── Server-Sent Events
```

### External System Integration
```
Integration Patterns:
├── API Gateway Pattern
├── Adapter Pattern (Data transformation)
├── Facade Pattern (Simplified interface)
└── Repository Pattern (Data access)
```

## Deployment Architecture

### Static Deployment
```
Build Output:
dist/
├── index.html
├── assets/
│   ├── *.js (Bundled JavaScript)
│   ├── *.css (Processed CSS)
│   └── images/ (Static assets)
└── favicon.ico
```

### Deployment Targets
```
Deployment Options:
├── Static Hosting (Netlify, Vercel)
├── CDN Distribution (CloudFront)
├── Container (Docker + nginx)
└── Traditional Server (Apache/nginx)
```

### Environment Configuration
```
Environment Variables:
├── VITE_API_URL (Backend URL)
├── VITE_ENV (Environment name)
├── VITE_VERSION (App version)
└── Feature flags (Future)
```

## Error Handling Architecture

### Error Boundaries (Future Implementation)
```typescript
class ErrorBoundary extends Component {
  // Catch React component errors
  // Log to error service
  // Display fallback UI
}
```

### Error Recovery Patterns
```
Error Handling Strategy:
├── Try-Catch (Async operations)
├── Error Boundaries (Component trees)
├── Fallback UI (Graceful degradation)
└── User Notification (Toast/Alert)
```

## Monitoring and Observability (Future)

### Application Monitoring
```
Monitoring Stack:
├── Performance Monitoring
├── Error Tracking
├── User Analytics
└── Custom Metrics
```

### Logging Architecture
```
Logging Levels:
├── Debug (Development only)
├── Info (General information)
├── Warning (Potential issues)
└── Error (Failures)
```

## Architecture Decision Records (ADRs)

### ADR-001: React as UI Framework
**Decision**: Use React for UI development
**Rationale**: Component-based architecture, large ecosystem, team expertise

### ADR-002: TypeScript for Type Safety
**Decision**: Use TypeScript throughout
**Rationale**: Type safety, better IDE support, refactoring confidence

### ADR-003: Feature-Based Organization
**Decision**: Organize code by features
**Rationale**: Scalability, team autonomy, clear boundaries

### ADR-004: Tailwind CSS for Styling
**Decision**: Use Tailwind CSS with shadcn/ui
**Rationale**: Utility-first CSS, consistent design, rapid development

### ADR-005: ReactFlow for Workflows
**Decision**: Use ReactFlow for workflow visualization
**Rationale**: Flexible, well-maintained, extensive features

### ADR-006: Vite as Build Tool
**Decision**: Use Vite instead of Create React App
**Rationale**: Faster builds, better DX, modern tooling

### ADR-007: Local State Management
**Decision**: Start with React state, no Redux initially
**Rationale**: Simplicity, adequate for current needs, can evolve

### ADR-008: Mock Data First
**Decision**: Develop with mock data before backend
**Rationale**: Parallel development, UI-first approach, faster iteration

## Architecture Evolution Path

### Phase 1: Current State (Complete)
- Static mock data
- Local state management
- Feature modules
- Basic routing

### Phase 2: Backend Integration (Next)
- API client implementation
- Authentication system
- Real data sources
- Error boundaries

### Phase 3: Enhanced State Management
- Global state solution
- Cache management
- Optimistic updates
- Real-time synchronization

### Phase 4: Performance Optimization
- Code splitting
- Lazy loading
- Service workers
- Progressive Web App

### Phase 5: Enterprise Features
- Multi-tenancy
- Role-based access
- Audit logging
- Advanced analytics

## Conclusion

The Kratos Frontend architecture is designed for maintainability, scalability, and developer productivity. The modular structure allows for independent feature development while maintaining consistency through shared components and patterns. The architecture supports gradual enhancement and can evolve from its current mock-data implementation to a full-featured enterprise application without major restructuring.