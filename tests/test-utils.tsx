import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { ReactFlowProvider } from "reactflow";
import { vi } from "vitest";
import type { RenderOptions } from "@testing-library/react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <ReactFlowProvider>{children}</ReactFlowProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};
export const renderWithReactFlow = renderWithProviders;

export const createMockLoanApplication = (
  overrides: Partial<LoanApplication> = {}
): LoanApplication => ({
  id: "LN-2024-001",
  applicant: "John Doe",
  product: "Personal Loan",
  amount: 25000,
  stage: "Disbursement",
  assignee: "Jane Smith",
  lastUpdate: "2024-01-15",
  sla: "Due in 24h",
  slaStatus: "ontime",
  docs: 3,
  flags: [],
  ...overrides,
});

export const createMockDocument = (
  overrides?: Partial<Record<string, unknown>>
) => ({
  name: "Test Document",
  filename: "test.pdf",
  status: "complete",
  required: true,
  ...overrides,
});

export const createMockAuditEntry = (
  overrides?: Partial<Record<string, unknown>>
) => ({
  user: "Test User",
  action: "action",
  message: "Test action performed",
  time: "2024-01-15 10:00 AM",
  ...overrides,
});

const mockColors = vi.hoisted(() => ({
  getStageColor: vi.fn((stage: string) => {
    const colors: Record<string, string> = {
      Disbursement: "#3b82f6",
      Verification: "#f59e0b",
    };
    return colors[stage] || "#6b7280";
  }),
}));

vi.mock("@shared/utils/colors", () => mockColors);
