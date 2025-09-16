import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ApplicationHeader } from "@features/application-details/components/ApplicationHeader";
import { getStageColor } from "@shared/utils/colors";

describe("ApplicationHeader", () => {
  const mockApplication = {
    id: "LN-2024-001",
    applicant: "John Doe",
    product: "Personal Loan",
    amount: 25000,
    stage: "Disbursement",
    assignee: "Jane Smith",
    lastUpdate: "2024-01-15",
    sla: "Due in 24h",
    slaStatus: "ontime" as const,
    docs: { complete: 2, pending: 2 },
    flags: [],
    age: 5,
  };

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

    // pick the stage badge span specifically (there's also a button with same text)
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

  it("renders back button", () => {
    render(
      <ApplicationHeader application={mockApplication} onBack={vi.fn()} />
    );

    expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
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
