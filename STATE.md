# Loan Workflow System - Architecture Document

## System Overview

A dynamic workflow management system for loan applications that:

- Parses JSON workflow definitions into interactive visual graphs
- Renders dynamic forms based on state configurations
- Tracks multiple loan applications through workflow stages
- Provides dashboard for queue management

## File Structure & Responsibilities

### Root Files

**`index.html`** - Main HTML entry point for the application
**`vite.config.ts`** - Vite configuration with path aliases
**`tsconfig.json`** - Base TypeScript configuration
**`tsconfig.app.json`** - Application-specific TypeScript configuration
**`tsconfig.node.json`** - Node-specific TypeScript configuration
**`eslint.config.mjs`** - ESLint configuration
**`package.json`** - Project dependencies and scripts
**`README.md`** - Project documentation and quick start guide
**`ARCHITECTURE.md`** - Project architecture guide with directory structure and conventions
**`QWEN.md`** - Project context for Qwen Code
**`STATE.md`** - This file (Architecture and state documentation)
**`CODE_REVIEW.md`** - Code review document with analysis and recommendations

### Source Directory Structure

```
src/
├── app/
│   ├── App.tsx - Main application orchestrator managing view modes
│   └── App.css - Global application styles
├── assets/ - Static assets (images, icons)
├── features/
│   ├── application-details/
│   │   └── components/
│   │       ├── ApplicationDetails.tsx - Main application details view
│   │       ├── ApplicationHeader.tsx - Header with back navigation and status
│   │       ├── WorkflowProgress.tsx - Visual workflow progress indicator
│   │       ├── ContactInfo.tsx - Applicant contact information
│   │       ├── FinancialDetails.tsx - Financial information display
│   │       ├── RiskSnapshot.tsx - Risk assessment summary
│   │       ├── DocumentsSection.tsx - Document management
│   │       └── AuditTrail.tsx - Application history tracking
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx - Main dashboard view with application queue
│   │   │   ├── DashboardHeader.tsx - Search and filtering controls
│   │   │   ├── ApplicationTable.tsx - Table display of loan applications
│   │   │   ├── ApplicationRow.tsx - Individual application row rendering
│   │   │   └── ResultsCount.tsx - Display of filtered results count
│   │   └── types/
│   │       └── dashboard.types.ts - Dashboard-specific TypeScript interfaces
│   ├── form/
│   │   └── components/
│   │       ├── FormViewer.tsx - Main form rendering component
│   │       └── FieldInput.tsx - Dynamic field input based on field type
│   └── workflow/
│       ├── components/
│       │   ├── WorkflowGraph.tsx - Main React Flow integration
│       │   ├── GraphToolbar.tsx - Toolbar for graph actions
│       │   ├── DetailPanel.tsx - Information panel for selected nodes/edges
│       │   ├── StateNode.tsx - Custom node component for workflow states
│       │   └── JsonEditor.tsx - JSON editor for workflow configuration
│       ├── types/
│       │   └── workflow.types.ts - Workflow-specific TypeScript interfaces
│       └── utils/
│           ├── graphParser.ts - Converts workflow JSON to React Flow nodes/edges
│           └── graphExport.ts - Export functionality for workflow graphs
├── pages/
│   └── NotFoundPage.tsx - 404 page component
├── shared/
│   ├── components/
│   │   └── layout/
│   │       └── TopBar.tsx - Shared header across major views
│   └── utils/
│       ├── colors.ts - Color utility functions for status indicators
│       └── download.ts - File download utility functions
├── main.tsx - React entrypoint (wraps App with ReactFlowProvider)
├── index.css - Global styles
└── vite-env.d.ts - Vite environment type definitions
```

### Core Types

**`features/dashboard/types/dashboard.types.ts`**

```typescript
interface LoanApplication {
  id: string;
  applicant: string;
  product: string;
  amount: number;
  stage: string;
  assignee: string;
  sla: string;
  slaStatus: "ontime" | "due" | "overdue";
  lastUpdate: string;
  flags: string[];
  docs?: number;
}
```

**`features/workflow/types/workflow.types.ts`**

```typescript
interface FieldAction {
  Operation: string;
}

interface Field {
  ID: string;
  Name: string;
  Type: string;
  DataSource: string;
  FieldActions?: FieldAction[];
  Actions?: string[]; // Legacy support
}

interface StateAction {
  NextState: string;
  Operation: string;
}

interface State {
  Form?: {
    Fields: Field[];
  };
  Actions?: Record<string, StateAction>; // Actions are INSIDE each State
}

interface WorkflowConfig {
  Workflow: {
    States: Record<string, State>;
  };
}
```

### Feature Responsibilities

#### Application Details Feature

Located in `src/features/application-details/`

**`ApplicationDetails.tsx`** - Main view component that orchestrates all application details sections
**`ApplicationHeader.tsx`** - Header section with application metadata and back navigation
**`WorkflowProgress.tsx`** - Visual representation of workflow stages and current status
**`ContactInfo.tsx`** - Displays applicant contact information
**`FinancialDetails.tsx`** - Shows loan amount, term, and interest rate information
**`RiskSnapshot.tsx`** - Displays risk assessment information
**`DocumentsSection.tsx`** - Manages application documents with status indicators
**`AuditTrail.tsx`** - Displays application history and allows adding comments

#### Dashboard Feature

Located in `src/features/dashboard/`

**`Dashboard.tsx`** - Main dashboard component managing the application queue view
**`DashboardHeader.tsx`** - Search and filtering controls for the dashboard
**`ApplicationTable.tsx`** - Table display component for loan applications
**`ApplicationRow.tsx`** - Individual row component for each application in the table
**`ResultsCount.tsx`** - Component showing filtered vs total application counts
**`dashboard.types.ts`** - TypeScript interfaces for dashboard data

#### Form Feature

Located in `src/features/form/`

**`FormViewer.tsx`** - Main form rendering component that generates forms from workflow state definitions
**`FieldInput.tsx`** - Dynamic field input component that renders different input types based on field configuration

#### Workflow Feature

Located in `src/features/workflow/`

**`WorkflowGraph.tsx`** - Main React Flow integration component that renders the workflow visualization
**`GraphToolbar.tsx`** - Toolbar component with export and other graph actions
**`DetailPanel.tsx`** - Right-hand details panel for selected nodes/edges
**`StateNode.tsx`** - Custom React Flow node component representing workflow states
**`JsonEditor.tsx`** - JSON editor component for editing workflow definitions
**`workflow.types.ts`** - TypeScript interfaces for workflow data
**`graphParser.ts`** - Utility that converts workflow JSON to React Flow nodes/edges
**`graphExport.ts`** - Utility for exporting workflow graphs to JSON

#### Shared Components and Utilities

Located in `src/shared/`

**`TopBar.tsx`** - Shared header component used across different views
**`colors.ts`** - Utility functions for consistent color coding across the application
**`download.ts`** - Utility functions for handling file downloads

### Application Entry Point

**`main.tsx`** - React application entry point that wraps the App component with ReactFlowProvider

### Parser & Utilities

**`features/workflow/utils/graphParser.ts`**

- Converts workflow JSON → React Flow nodes/edges
- Creates nodes from States
- Creates edges from State.Actions
- Auto-layouts using grid positioning
- Handles implicit state connections

**`features/workflow/utils/graphExport.ts`**

- Centralized graph export helper for JSON export
- Uses shared download utility for file handling

### Components

**`app/App.tsx`** - Application Controller

- Manages view modes: dashboard | graph | form | details
- Handles workflow JSON updates
- Controls navigation between views
- Maintains current state selection
- Integrates all major features

**`features/dashboard/components/Dashboard.tsx`** - Queue Management

```
Features:
- Table view of loan applications
- Status indicators (Disbursement, Verification, etc.)
- Filtering by status/product/assignee
- Quick actions per application
```

# Loan Workflow System — Unified State & Architecture

This document combines the original architecture notes, README guidance, refactor summary, and findings from a recent code review into a single authoritative reference for the project.

## Purpose

Provide a single, developer-facing snapshot of:

- System architecture and responsibilities
- Key types and data shapes
- Component responsibilities and notable implementation details
- Recent refactors and quality improvements
- Known issues, risks, and recommended next steps

This file should help maintainers onboard quickly and guide follow-up work.

## System Overview

The app converts JSON workflow definitions into an interactive visual graph and runtime UI for forms. Main capabilities:

- Parse workflow JSON → graph nodes/edges
- Render interactive React Flow canvas
- Show state details and dynamic forms driven by JSON
- Export graph and workflow definitions
- Dashboard for managing loan applications and navigating to workflows

## Core Types (summary)

Key types live in `src/features/workflow/types/workflow.types.ts` and represent the schema the app expects. Representative shapes:

```

FieldAction { Operation: string }

Field {
ID: string
Name: string
Type: string // text | number | select | textarea | file | date | checkbox
DataSource?: string
FieldActions?: FieldAction[] // preferred
Actions?: string[] // legacy
}

StateAction { NextState: string; Operation?: string }

State { Form?: { Fields: Field[] }; Actions?: Record<string, StateAction> }

WorkflowConfig { Workflow: { States: Record<string, State> } }

```

Notes:

- The codebase currently accepts both `Field.FieldActions` (preferred) and legacy `Field.Actions` (string[]). Consider migrating to a single canonical format (see recommendations).

## Files & Responsibilities

- `src/features/workflow/utils/graphParser.ts` — Converts workflow JSON into React Flow nodes and edges. Uses a grid-like auto-layout and annotates edges with operation metadata.
- `src/features/workflow/utils/graphExport.ts` — Centralized graph export helper for JSON/PNG export.
- `src/features/workflow/components/WorkflowGraph.tsx` — Canvas rendering using React Flow. Integrates the toolbar, node types, and `DetailPanel`.
- `src/features/workflow/components/DetailPanel.tsx` — Right-hand details view for selected node/edge. Lists fields and actions; provides "Form View" shortcut.
- `src/features/workflow/components/StateNode.tsx` — Visual node used by React Flow; shows state label and field count.
- `src/features/form/components/FormViewer.tsx` — Renders a state form from field definitions (read/edit modes).
- `src/features/form/components/FieldInput.tsx` — Reusable field renderer for common input types.
- `src/features/dashboard/components/ApplicationRow.tsx` — Row rendering for application table.
- `src/features/workflow/components/GraphToolbar.tsx` — Compact toolbar for export/controls in the graph view.
- `src/shared/components/layout/TopBar.tsx` — Shared top header across major views.

## Data Flow

1. Developer or user provides a workflow JSON in the JSON editor.
2. `graphParser` builds nodes and edges from `Workflow.States` and per-state `Actions`.
3. `WorkflowGraph` renders nodes & edges in React Flow.
4. User interactions: select node/edge → `DetailPanel` → open `FormViewer` → trigger actions.

## Recent Refactor Highlights

- Split large components into smaller, focused components (TopBar, GraphToolbar, ApplicationRow, FieldInput).
- Centralized export logic in `src/features/workflow/utils/graphExport.ts` to avoid duplicate code and to keep components small.
- Reworked `DetailPanel.tsx` to use explicit types (`NodeData` / `EdgeData`) and removed unsafe `any` casts.
- Consolidated color mapping into `src/shared/utils/colors.ts` (getStageColor) used across UI.
- Removed unused imports and replaced nested ternaries with clearer conditionals.

These changes improve maintainability, readability, and testability while preserving runtime behavior.

## Known Issues & Code Review Findings

The following items were flagged during a code review and should be considered for follow-up work:

1. Type safety

- Inconsistent handling of field actions (`Field.Actions` vs `Field.FieldActions`). Recommend migrating to a single shape or using a discriminated union.
- Add runtime validation of incoming workflow JSON (JSON Schema or zod) to avoid runtime errors.

2. Duplication & consistency

- Action extraction logic is duplicated in places (e.g., `DetailPanel` vs `StateNode`). Extract to a shared helper/hook.
- Field rendering inconsistencies: `FormViewer`/`FieldInput` should fully support documented field types (date, checkbox, etc.).

3. Performance

- Grid auto-layout in `graphParser` is simplistic and may overlap nodes for large workflows. Consider integrating a layout engine (elkjs is a dependency and can be used for better layouts).
- Avoid heavy data transformation during render of `DetailPanel` by precomputing derived data.

4. State management

- Current app state is mostly local. For complex flows, consider a lightweight global store (Zustand) or React Context with selectors.

5. Accessibility & UX

- Improve ARIA attributes and keyboard navigation in interactive components.
- Enhance error reporting in the JSON editor to show helpful validation messages.

6. Security

- Sanitize any HTML or user-provided content before rendering. Avoid `dangerouslySetInnerHTML` or sanitize inputs if necessary.

## Application Details Feature Bugs

After reviewing the application details feature, several bugs and issues were identified:

### Type Safety Issues

1. **Duplicate Interface Definitions**: Interfaces like `AppDocument`, `AuditEntry`, and `WorkflowStage` are defined in multiple files instead of being in a shared types file.
2. **Inconsistent Type Definitions**: The `WorkflowStage` interface is duplicated in both `ApplicationDetails.tsx` and `WorkflowProgress.tsx`.

### Data Handling Bugs

1. **Hardcoded Data**: All components in the application details feature use hardcoded data instead of properly handling data passed from props.
2. **Missing Data Properties**: The `LoanApplication` interface doesn't include all the properties needed by the components.

### Logic Bugs

1. **Incorrect Email Generation**: The email generation in `ContactInfo.tsx` is overly simplistic and will break with many real names.
2. **Hardcoded Interest Rate**: The interest rate in `FinancialDetails.tsx` is hardcoded instead of being configurable.
3. **Incomplete Comment Functionality**: Comments in `AuditTrail.tsx` are never actually added to the audit trail - they just clear the input.

### UI/UX Issues

1. **Inconsistent Styling**: Extensive use of inline styles makes it difficult to maintain consistent styling.
2. **Missing Error Handling**: No error handling for operations like downloading documents or adding comments.
3. **Accessibility Issues**: Missing proper ARIA attributes, potential color contrast issues, and no keyboard navigation support.

### Security Issues

1. **Potential XSS Vulnerabilities**: User-generated content in the audit trail is displayed directly without sanitization.

### Missing Features

1. **Incomplete Document Functionality**: Document upload and download buttons don't actually perform any actions.
2. **Missing API Integration**: All data is hardcoded with no actual backend integration.

For a detailed list of bugs and recommendations, see [APPLICATION_DETAILS_BUGS.md](APPLICATION_DETAILS_BUGS.md).

## Recent Improvements

Since the last review, several significant improvements have been made:

1. **Enhanced Type Safety**

   - Improved type handling in `DetailPanel.tsx` with explicit `NodeData` and `EdgeData` types
   - Better field action handling with proper type checking in `getFieldActions` function
   - Consistent use of TypeScript interfaces throughout the application

2. **Comprehensive Testing Coverage**

   - Added extensive test suite with Vitest and React Testing Library
   - Tests for all major components including Dashboard, Workflow, Form, and Application Details features
   - Proper test setup with MSW for API mocking and jsdom environment

3. **Component Structure Improvements**

   - Improved component composition with better separation of concerns
   - Cleaner prop handling and more consistent component interfaces
   - Better error handling and validation in components

4. **Testing Infrastructure**
   - Comprehensive test coverage with unit and integration tests
   - Proper test setup with MSW for API mocking
   - Test utilities for consistent testing patterns

## Recommendations & Next Steps

Short-term (low risk):

- Add a small runtime validator for workflow JSON (zod or ajv) and surface errors in the JSON editor.
- Extract field action parsing into `src/utils/fieldActions.ts` and reuse from `DetailPanel` and `StateNode`.
- Complete `FieldInput` coverage for all documented field types and remove hardcoded options.
- Implement proper API integration to replace hardcoded mock data.

Medium-term:

- Replace grid layout with an ELK-powered layout (uses `elkjs` already in dependencies). This will improve node placement for complex workflows.
- Add unit tests for `graphParser` and `graphExport`.
- Introduce a lightweight global store for shared app state (Zustand or Context + selectors).
- Implement file upload functionality in the form components.

Long-term:

- Add E2E tests (Playwright) for the main user flows: dashboard → graph → form → action.
- Implement CI with typecheck, eslint, and build on PRs.
- Add comprehensive accessibility features and ARIA attributes.
- Implement theming support for light/dark mode.

## Developer Quick Start

1. Install dependencies

```powershell
npm ci
```

2. Run dev server

```powershell
npm run dev
```

3. Typecheck & lint

```powershell
npm run typecheck
npm run lint
```

4. Run tests

```powershell
npm test
```

5. Build

```powershell
npm run build
```

## Project Status & Verification

- Refactor: Core modularization and typing improvements are completed (key files: `DetailPanel`, `FormViewer`, `WorkflowGraph`, `graphExport`, `FieldInput`).
- Testing: Comprehensive test coverage has been added across all features with Vitest and React Testing Library.
- Performance: Optimizations implemented for better rendering and state management.
- Lint/type checks: File-level fixes applied; full project-level typecheck/lint/build should be run in an environment with Node/npm installed to confirm.

## Files to Inspect First (for maintainers)

- `src/features/workflow/types/workflow.types.ts` — canonical shapes and suggested type improvements.
- `src/features/workflow/utils/graphParser.ts` — conversion rules and layout logic.
- `src/features/workflow/components/DetailPanel.tsx` — recently refactored; ensures safe rendering of fields/actions.
- `src/features/form/components/FieldInput.tsx` — central input renderer; extend to cover missing field types.

## Appendix: Example Workflow JSON

```json
{
  "Workflow": {
    "States": {
      "Application": {
        "Form": {
          "Fields": [
            {
              "ID": "loan_amount",
              "Name": "Requested Amount",
              "Type": "number",
              "DataSource": "{{ data.loan.amount }}",
              "Actions": ["validate", "calculate"]
            }
          ]
        }
      },
      "Review": {
        "Form": {
          "Fields": [
            {
              "ID": "decision",
              "Name": "Approval Decision",
              "Type": "select",
              "DataSource": "{{ data.review.decision }}",
              "Actions": ["validate"]
            }
          ]
        }
      },
      "Completed": {}
    }
  }
}
```

---

Maintainers: update this document as the codebase evolves. It is intended to be the single source of truth for architecture and short-term roadmap.

## Current State (Sep 16, 2025)

- Tests: All unit and component tests have been centralized under a top-level `tests/` folder. The `vitest` configuration and TypeScript app config were updated to include `tests/` and a `@test/*` path alias. A minimal `ResizeObserver` polyfill and MSW-based mocks are included in `tests/setup.ts`.
- Duplicate test files that previously lived in `src/features/**/__tests__` have been removed to avoid test duplication and confusion. The canonical location for tests is now `tests/`.
- Test status: The full test suite was run after the reorganization and reported all tests passing (21 test files, 92 tests). If you see failures locally, run `npm ci` then `npm test` to reproduce.
- Code review: The code review findings and prioritized recommendations were added to `CODE_REVIEW.md`. Key topics: type-safety improvements, JSON validation, extracting duplicated logic, and adding CI for checks on PRs.

## Quick verification steps

1. Install dependencies (clean install):

```powershell
npm ci
```

2. Run tests (watch):

```powershell
npm test
```

3. Run a single test run with coverage (CI-like):

```powershell
npm run test:coverage
```

If tests fail on your machine after a fresh `npm ci`, check that Node version matches the project's `.nvmrc` (if present) and that no global packages are interfering.

## Notes for Maintainers

- When adding new tests prefer the `tests/` top-level layout. Group tests by feature (e.g., `tests/dashboard`, `tests/workflow`, `tests/application-details`).
- Keep MSW handlers under `tests/mocks` and add new API routes there when components need them.
- Use `tests/test-utils.tsx` helpers (`renderWithProviders`, `createMockLoanApplication`) to ensure consistent test behavior (React Flow provider + deterministic color mocks).

## Follow-ups

- Add a CI pipeline that runs `npm ci`, `npm run typecheck`, `npm run lint`, and `npm test` on pull requests.
- Consider adding E2E tests (Playwright) for the primary flows.
