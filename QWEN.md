# Workflow Visualizer & Form Renderer - Project Context for Qwen

This document provides essential context about the Workflow Visualizer & Form Renderer project for Qwen.

## Project Overview

A web application that transforms JSON workflow specifications into interactive visual graphs and dynamic forms for business process automation, specifically designed for loan approval workflows. The application now includes a full routing system and supports both light and dark themes.

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

### Phase 4: Workflow Editor (Planned)
- Visual Workflow Design: Drag-and-drop interface for creating and modifying workflows
- Dual Node Types: Process nodes (rectangles) with three connection points and Decision nodes (diamonds) with multiple transitions
- Advanced Connection System: Color-coded connections (red=reject, black=submit, green=approve) with user-defined labels
- Configuration Interface: Details panel for node/edge configuration and assignee management
- Context Menus: Right-click menus for quick actions with full keyboard accessibility
- Validation Engine: Comprehensive validation with visual error indicators
- Export Functionality: Standardized JSON export compatible with existing system

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

// New types for workflow builder
interface Person {
  id: string;
  name: string;
  type: 'user' | 'role';
}

interface FormRef {
  /** unique id of the form */
  id: string;
  /** human-readable name */
  name: string;
  /** version number of the form */
  version: number;
  /** binding to determine whether to pin to version or track latest */
  binding: 'pinned' | 'latest';
}

interface ProcessNodeData {
  label: string;
  internalId?: string;
  assignees: Person[];
  actions: {
    left: { label: string; operation?: string };
    center: { label: string; operation?: string };
    right: { label: string; operation?: string };
  };
  /** deprecated: legacy list of names */
  forms?: string[];
  /** attached form reference */
  form?: FormRef;
  /** if true, transitions are blocked until form submission is valid */
  requireFormToTransition?: boolean;
  /** UI-only: handler injected by WorkflowBuilder to open Form config */
  onOpenFormConfig?: (nodeId: string) => void;
}

interface DecisionNodeData {
  label: string;
  internalId?: string;
  assignees: Person[];
  transitions: Array<{
    id: string;
    label: string;
    operation?: string;
  }>;
  forms?: string[];
}

type BuilderNodeData = ProcessNodeData | DecisionNodeData;

interface BuilderNode {
  id: string;
  type: 'process' | 'decision';
  position: { x: number; y: number };
  data: BuilderNodeData;
}

interface BuilderEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label: string;
  operation?: string;
}

interface WorkflowBuilderConfig {
  workflow: {
    forms: Record<string, unknown>;
    states: Record<string, {
      forms?: Array<{
        formName: string;
        visibility?: 'visible' | 'hidden';
        fieldOverrides?: Record<string, unknown>;
      }>;
      actions?: Record<string, {
        nextState: string;
        operation?: string;
      }>;
    }>;
    startState?: string;
  };
}

interface WorkflowValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  coverage: { withForms: number; totalProcessNodes: number };
}

// New types for dynamic form builder
interface FormBuilderFieldAction {
  value: string;
  label: string;
}

interface FormBuilderField {
  id: string;
  name: string;
  type:
    | 'text'
    | 'number'
    | 'textarea'
    | 'file'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'section'
    | 'divider';
  status: 'default' | 'readonly' | 'disabled';
  data: string;
  fieldActions: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    regex?: string;
  };
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
}

interface FormConfig {
  [formName: string]: {
    fields: FormBuilderField[];
  };
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
- `DynamicFormBuilder.tsx` - Visual interface for building dynamic forms
- `WorkflowBuilder.tsx` - Visual interface for building workflows
- `RunningWorkflowsPage.tsx` - Page for managing active workflow instances
- `ApplicationTable.tsx` - Table component for displaying loan applications in the dashboard
- `DashboardMain.tsx` - Main component for the dashboard view
- `RunningStateNode.tsx` - Node component for running workflow states
- `FormBuilderPage.tsx` - Main page component for the form builder
- `RunningWorkflowDetailPanel.tsx` - Detail panel for running workflow instances

### Workflow Editor Components (Planned)
- `WorkflowEditor.tsx` - Main editor component orchestrating all functionality
- `ProcessNode.tsx` - Enhanced process node with three connection points (left/center/right)
- `DecisionNode.tsx` - Decision node with diamond shape and multiple connection points
- `WorkflowEdge.tsx` - Custom edge component with enhanced labeling
- `DetailsPanel.tsx` - Enhanced configuration panel for nodes and edges
- `ContextMenu.tsx` - Right-click context menu with keyboard accessibility
- `EditorToolbar.tsx` - Toolbar with editor-specific controls
- `ValidationEngine.tsx` - Workflow validation system
- `BuilderDetailsPanel.tsx` - Details panel for the workflow builder
- `FormPickerDialog.tsx` - Dialog for selecting forms to attach to nodes
- `WorkflowBuilder.tsx` - Main component for building workflows

### Dynamic Form Builder Components
- `DynamicFormBuilder.tsx` - Main component for building dynamic forms
- `FieldInspector.tsx` - Component for inspecting and configuring field properties
- `FieldList.tsx` - Component for displaying and managing the list of form fields
- `FormBuilderPage.tsx` - Main page component for the form builder
- `FieldPalette.tsx` - Component for selecting field types to add to the form

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
│   ├── contexts/
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
- Vite (build tool)
- Tailwind CSS (styling)

## Path Aliases
- `@/…` → `src/…`
- `@features/…` → `src/features/…`
- `@shared/…` → `src/shared/…`
- `@pages/…` → `src/pages/…`
- `@contexts/…` → `src/contexts/…`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
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
- `dynamic-form-builder/` - Components for building dynamic forms with a visual interface
- `form/` - Components for dynamic form rendering and field input handling
- `running-workflows/` - Components for managing and monitoring active workflow instances
- `workflow/` - Components for workflow visualization and JSON editing
- `workflow-config-edit/` - Components for editing workflow configurations
- `workflow-templates/` - Components for managing workflow templates
- `workflow-editor/` - Components for visual workflow design and editing (Planned)

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
- On Sep 22, 2025, legacy folders `src/utils`, and `src/types` were removed to avoid confusion
- The `src/components` folder still exists but is only used for UI component libraries (shadcn/ui components)
- All active application code now lives under `src/features` and `src/shared`

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

## Important Notes for Qwen

1. **Do not run `npm run dev`**: This command should not be executed during development sessions.
2. **Layout Components**: All layout components (MainLayout, TopBar, Sidebar, Footer) have been updated to use Tailwind CSS classes for consistent styling.
3. **Sidebar Positioning**: The sidebar has been fixed to properly handle both desktop and mobile views with correct positioning and z-index stacking.
4. **Responsive Design**: Layout components now properly adapt to different screen sizes.
5. **Routing**: The application now uses React Router for navigation between different views. The main routes include:
   - `/dashboard` - Main dashboard view
   - `/create-workflow` - Workflow template creation
   - `/running` - Running workflows management
   - `/builder` - Workflow builder
   - `/form-builder/new` - Dynamic form builder
   - `/applications/details` - Application details view
   - `/viewer` - Workflow visualizer
6. **Dark Mode**: The application now supports dark mode through a ThemeContext. The theme preference is stored in localStorage and respects system preferences by default.