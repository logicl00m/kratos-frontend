import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationHeader } from "@features/application-details/components/ApplicationHeader";
import { getStageColor } from "@shared/utils/colors";
import { createMockLoanApplication } from "@test/test-utils";

describe("ApplicationHeader", () => {
  const mockApplication = createMockLoanApplication({ applicant: "John Doe" });

  it("renders without crashing", () => {
    expect(() =>
      render(
        <ApplicationHeader application={mockApplication} onBack={vi.fn()} />
      )
    ).not.toThrow();
  });

  it("renders applicant name", () => {
    render(
      <ApplicationHeader application={mockApplication} onBack={vi.fn()} />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders stage badge", () => {
    render(
      <ApplicationHeader application={mockApplication} onBack={vi.fn()} />
    );

    const matches = screen.getAllByText(/Disbursement/);
    const stageBadge = matches.find(
      (el) => el.classList && el.classList.contains("stage-badge")
    );
    expect(stageBadge).toBeTruthy();
  });

  it("renders product and amount", () => {
    render(
      <ApplicationHeader application={mockApplication} onBack={vi.fn()} />
    );

    expect(screen.getByText("Personal Loan • $25,000")).toBeInTheDocument();
  });

  it("applies correct stage color", () => {
    render(
      <ApplicationHeader application={mockApplication} onBack={vi.fn()} />
    );

    const matches = screen.getAllByText(/Disbursement/);
    const stageBadge = matches.find(
      (el) => el.classList && el.classList.contains("stage-badge")
    ) as HTMLElement | undefined;
    expect(stageBadge).toBeTruthy();
    const color = getStageColor(mockApplication.stage);
    expect(stageBadge).toHaveStyle(`background: ${color}`);
  });
});
