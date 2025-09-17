# Workflow Visualizer & Form Renderer - Project Context for Qwen

This document provides essential context about the Workflow Visualizer & Form Renderer project for Qwen.

## Project Overview

A web application that transforms JSON workflow specifications into interactive visual graphs and dynamic forms for business process automation, specifically designed for loan approval workflows.

## Core Features

### Phase 1: Graph Visualization (Implemented)
- JSON-to-Graph Conversion: Parses workflow specifications and generates visual flow diagrams
- Interactive Nodes: Displays states with expandable form field information
- Dynamic Edges: Shows actions/transitions between states with operations
- Real-time Editing: Live JSON editor with instant graph updates
- Detail Panel: Click nodes/edges to view detailed properties
- Export Capabilities: Export workflow graphs to JSON

### Phase 2: Form Rendering (Implemented)
- Dynamic Form Generation: Renders forms based on state field definitions
- Field Type Support: Text, number, select, textarea, file uploads
- Data Binding: Connects to data sources via template syntax (`{{ data.field }}`)
- Action Handlers: Executes field-level actions (validate, calculate, fetch)
- State Transitions: Navigate between forms following workflow logic

### Phase 3: Application Management (Implemented)
- Dashboard View: Queue management for loan applications with filtering and search
- Application Details: Detailed view of loan applications with progress tracking
- Document Management: Upload, view, and manage application documents
- Audit Trail: Track all actions and comments on applications
- Workflow Navigation: Move between different workflow states

## Technical Architecture

### Core Data Types
```typescript
interface FieldAction {
  Operation: string; // validate, calculate, fetch, autofill, upload, notify
}

interface Field {
  ID: string;
  Name: string;
  Type: string; // text, number, select, textarea, file, date, checkbox
  DataSource: string; // Template syntax for data binding
  FieldActions: FieldAction[];
}

interface StateAction {
  NextState: string;
  Operation: string; // Business logic to execute
}

interface State {
  Form?: { Fields: Field[] };
  Actions?: Record<string, StateAction>; // State transitions
}

interface Workflow {
  States: Record<string, State>;
}
```

### Key Components
- `App.tsx` - Application Controller managing view modes
- `Dashboard.tsx` - Queue management for loan applications
- `WorkflowGraph.tsx` - Visual workflow rendering with React Flow
- `StateNode.tsx` - Node component for workflow states
- `DetailPanel.tsx` - Information panel for selected nodes/edges
- `FormViewer.tsx` - Dynamic form rendering component
- `JsonEditor.tsx` - Configuration editor for workflow JSON
- `ApplicationHeader.tsx` - Header component for application details view
- `ApplicationDetails.tsx` - Main component for displaying application details
- `WorkflowProgress.tsx` - Component for displaying workflow progress
- `ContactInfo.tsx` - Component for displaying contact information
- `FinancialDetails.tsx` - Component for displaying financial details
- `RiskSnapshot.tsx` - Component for displaying risk snapshot
- `DocumentsSection.tsx` - Component for managing documents
- `AuditTrail.tsx` - Component for displaying audit trail
- `utils/graphParser.ts` - Converts workflow JSON to React Flow nodes/edges

### Data Flow
1. JSON Definition (States + Actions)
2. Parser creates graph structure
3. React Flow renders visual workflow
4. User interactions:
   - Click node → Detail panel → Form view
   - Dashboard → Select application → View state
   - Form actions → Trigger state transitions

## File Structure
```
kratos-frontend/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── pages/
│   ├── shared/
│   └── styles/
├── data/
└── ...
```

*Note: The project has been refactored to a feature-based structure as documented in [ARCHITECTURE.md](ARCHITECTURE.md).*

## Views & Navigation

### Dashboard View
- Lists all loan applications
- Shows current state/assignee
- Quick status overview
- Bulk operations

### Graph View
- Visual workflow representation
- Interactive nodes/edges
- Click navigation to forms
- Export capabilities

### Form View
- Dynamic field rendering
- Validation based on FieldActions
- State-specific action buttons
- Progress through workflow

## Workflow Execution

1. Application starts at first state (ApplicationRequest)
2. User fills form with required fields
3. Actions trigger state transitions
4. Each transition executes operations (notify, validate, assign)
5. Application moves through states until Completed

## Supported Use Cases
- Loan approval workflows
- Multi-level approval processes
- Document review systems
- Any state-based business process

## Technology Stack
- React + TypeScript
- React Flow (graph visualization)
- JSON-based configuration
- Export capabilities (JSON, PNG)

## Path Aliases
- `@/…` → `src/…`
- `@features/…` → `src/features/…`
- `@shared/…` → `src/shared/…`
- `@pages/…` → `src/pages/…`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run end-to-end tests

## Project Architecture
The project follows a feature-based architecture where each feature contains its own components, types, and utilities. This structure promotes modularity and maintainability.

### Feature Organization
- `application-details/` - Components for displaying detailed loan application information
- `dashboard/` - Components for the loan application dashboard and queue management
- `form/` - Components for dynamic form rendering and field input handling
- `workflow/` - Components for workflow visualization and JSON editing

### Shared Components
- `shared/components/layout/` - Layout components like TopBar
- `shared/utils/` - Utility functions like color mapping and file download helpers

### Conventions
- Feature-first organization: each feature contains its own components, types, and utils
- Keep shared, generic building blocks under `src/shared`
- Prefer colocated types (`features/<feature>/types`) over global types
- Use semantic, stable keys in lists (avoid array index keys)
- Keep components small and focused
- Use the configured path aliases for imports

### Legacy Structure
- On Sep 16, 2025, legacy folders `src/components`, `src/utils`, and `src/types` were removed to avoid confusion
- All active code now lives under `src/features` and `src/shared`

## Workflow JSON Specification

### Input Format
```json
{
  "Workflow": {
    "States": {
      "StateName": {
        "Form": {
          "Fields": [...]
        }
      }
    },
    "Actions": {
      "ActionName": {
        "NextState": "TargetState",
        "Operation": "Operations list"
      }
    }
  }
}
```

### Field Properties
- **ID**: Unique identifier for backend processing
- **Name**: Display label for users
- **Type**: Input control type (text, textarea, number, select, file, date, checkbox)
- **DataSource**: Template binding for data population (`{{ data.path.to.field }}`)
- **Actions**: Field-level operations (validate, calculate, fetch, autofill, upload, notify)

### Action Properties
- **NextState**: Target state after action execution
- **Operation**: Business logic executed during transition