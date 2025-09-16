# Project Architecture Guide

This document describes the current code structure, path aliases, and conventions for adding new features and extensions.

## Directory structure

Root

- `src/`
  - `app/`
    - `App.tsx` – Main application orchestrator
    - `App.css` – App-level styles
  - `assets/` – Static assets (images, svgs)
  - `components/` (removed)
  - `features/` – Feature-based code
    - `application-details/`
      - `components/`
        - `ApplicationDetails.tsx`
        - `ApplicationHeader.tsx`
        - `WorkflowProgress.tsx`
        - `ContactInfo.tsx`
        - `FinancialDetails.tsx`
        - `RiskSnapshot.tsx`
        - `DocumentsSection.tsx`
        - `AuditTrail.tsx`
    - `dashboard/`
      - `components/`
        - `Dashboard.tsx`
        - `DashboardHeader.tsx`
        - `ApplicationTable.tsx`
        - `ApplicationRow.tsx`
        - `ResultsCount.tsx`
      - `types/`
        - `dashboard.types.ts`
    - `form/`
      - `components/`
        - `FormViewer.tsx`
        - `FieldInput.tsx`
    - `workflow/`
      - `components/`
        - `WorkflowGraph.tsx`
        - `GraphToolbar.tsx`
        - `DetailPanel.tsx`
        - `StateNode.tsx`
        - `JsonEditor.tsx`
      - `types/`
        - `workflow.types.ts`
      - `utils/`
        - `graphParser.ts`
        - `graphExport.ts`
  - `pages/`
    - `NotFoundPage.tsx`
  - `shared/`
    - `components/`
      - `layout/`
        - `TopBar.tsx`
    - `utils/`
      - `colors.ts`
      - `download.ts`
  - `types/` (removed)
  - `utils/` (removed)
  - `index.css` – global styles
  - `main.tsx` – React entrypoint (wraps App with ReactFlowProvider)

Non-src

- `public/` – Static served files (index.html, vite.svg)
- `data/` – Sample JSON and mock data
- `vite.config.ts` – Vite configuration, including path aliases
- `tsconfig.app.json` – TypeScript compiler options and path aliases

## Path aliases

Configured in `vite.config.ts` and `tsconfig.app.json`:

- `@/…` → `src/…`
- `@features/…` → `src/features/…`
- `@shared/…` → `src/shared/…`
- `@pages/…` → `src/pages/…`

Example imports:

- `import App from '@/app/App'`
- `import { WorkflowGraph } from '@features/workflow/components/WorkflowGraph'`
- `import { getStageColor } from '@shared/utils/colors'`

## Conventions

- Feature-first organization: each feature contains its own components, types, and utils.
- Keep shared, generic building blocks under `src/shared`.
- Prefer colocated types (`features/<feature>/types`) over global types.
- Keep pages minimal; put logic in feature components.
- Use semantic, stable keys in lists (avoid array index keys).
- Keep components small and focused; extract utilities to `utils/` within the feature or to `src/shared/utils` when cross-cutting.
- Use the configured path aliases for imports.

### Barrel exports (recommended)

To simplify imports, add `index.ts` files that re-export public modules:

- `features/<feature>/components/index.ts`
- `features/<feature>/types/index.ts`
- `shared/components/index.ts`, etc.

Example barrel for `features/workflow/components/index.ts`:

```ts
export { default as WorkflowGraph } from "./WorkflowGraph";
export { default as GraphToolbar } from "./GraphToolbar";
export { default as DetailPanel } from "./DetailPanel";
export { default as StateNode } from "./StateNode";
export { default as JsonEditor } from "./JsonEditor";
```

Then import via:

```ts
import { WorkflowGraph } from "@features/workflow/components";
```

## Adding a new feature

1. Create the feature folders

   - `src/features/<feature-name>/components`
   - `src/features/<feature-name>/types` (optional)
   - `src/features/<feature-name>/utils` (optional)

2. Build your components

   - Place UI in `components/`; keep files small and focused.
   - Prefer local types under `types/` and local helpers under `utils/`.

3. Expose via barrels (optional but recommended)

   - Add `index.ts` in `components` and `types` to re-export public parts.

4. Import using aliases

   - `import { Thing } from '@features/<feature-name>/components'`

5. Write minimal docs (optional)
   - Consider adding a short `README.md` inside your feature folder describing its purpose and public API.

## Legacy folders

- On Sep 16, 2025, legacy folders `src/components`, `src/utils`, and `src/types` were removed to avoid confusion.
- All active code now lives under `src/features` and `src/shared`.

## Notes

- React Flow provider is set up in `src/main.tsx`. Components requiring React Flow context should render under `App`.
- Export helpers:
  - Workflow graph export lives at `@features/workflow/utils/graphExport` and uses `@shared/utils/download`.
- Colors: `getStageColor` in `@shared/utils/colors` centralizes stage color mapping.
- ESLint: config file renamed to `eslint.config.mjs` for ESM; `eslint.config.js` was removed.

## Testing

All unit and component tests are centralized under the `tests/` folder at the project root. Tests use Vitest with jsdom and React Testing Library. Network calls are mocked via MSW, and a minimal `ResizeObserver` polyfill is installed for components relying on React Flow.

### Location and structure

Root

- `tests/`
  - `setup.ts` – Global test setup
    - Registers `@testing-library/jest-dom`
    - Sets up MSW server lifecycle with handlers from `tests/mocks/handlers.ts`
    - Installs a minimal `ResizeObserver` polyfill required by React Flow
  - `test-utils.tsx` – Shared helpers
    - `renderWithProviders`/`renderWithReactFlow` wrappers
    - `createMockLoanApplication()` factory
    - Mocks `@shared/utils/colors` for stable, deterministic colors
  - `mocks/`
    - `handlers.ts` – MSW handlers for API routes used during tests
  - `application-details/` – Tests covering Application Details feature
  - `dashboard/` – Tests covering Dashboard feature
  - `workflow/` – Tests covering Workflow graph and related components
  - `form/` – Tests covering form rendering components
  - `api.test.tsx` – High-level API-driven Dashboard tests

Tests mirror feature areas rather than living alongside source files to keep the production source tree clean.

### Configuration

- `vitest.config.ts`
  - Resolves path aliases via `vite-tsconfig-paths`
  - Uses `environment: 'jsdom'`
  - Includes tests via `include: ['tests/**/*.test.{ts,tsx}']`
  - Registers global setup using `setupFiles: ['./tests/setup.ts']`
- `tsconfig.app.json`
  - Includes both `src` and `tests` in the TypeScript program
  - Defines test alias `@test/*` → `./tests/*`

Common path aliases available in tests:

- `@features/*` → `src/features/*`
- `@shared/*` → `src/shared/*`
- `@pages/*` → `src/pages/*`
- `@test/*` → `tests/*`

### How to run

- Run all tests in watch mode:

  npm test

- Run with UI:

  npm run test:ui

- One-off run with coverage:

  npm run test:coverage

### Notes on React Flow in tests

- Components relying on React Flow context should be wrapped using the helpers in `tests/test-utils.tsx` (e.g., `renderWithReactFlow`).
- The `ResizeObserver` polyfill defined in `tests/setup.ts` ensures React Flow works under jsdom.
