import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import handlers from './mocks/handlers';

// Minimal ResizeObserver polyfill for jsdom environment used in tests.
// React Flow expects ResizeObserver to exist in the global scope.
if (typeof (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
  // Minimal implementation: jsdom doesn't provide ResizeObserver and React Flow
  // expects it to exist. Provide a lightweight no-op polyfill for tests.
  // Use a minimal class and assign via unknown to avoid using `any` in typings.
  const RO = class {
    observe(): void {
      // no-op
    }
    unobserve(): void {
      // no-op
    }
    disconnect(): void {
      // no-op
    }
  };
  (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver = RO as unknown as
    | typeof ResizeObserver
    | undefined;
}

// Setup MSW server with our handlers
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  vi.clearAllMocks();
});
afterAll(() => server.close());
