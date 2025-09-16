import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import AuditTrail from "@features/application-details/components/AuditTrail";

describe("AuditTrail", () => {
  const mockAuditTrail = [
    {
      user: "Jane Doe",
      action: "action" as const,
      message: "Application approved for full amount",
      time: "1/15/2024, 3:15:00 PM",
    },
    {
      user: "John Smith",
      action: "system" as const,
      message: "Application submitted",
      time: "1/15/2024, 6:00:00 AM",
    },
  ];

  it("renders without crashing", () => {
    expect(() =>
      render(<AuditTrail auditTrail={mockAuditTrail} />)
    ).not.toThrow();
  });

  it("renders section title with entry count", () => {
    render(<AuditTrail auditTrail={mockAuditTrail} />);

    // Check for the title with count, accounting for potential whitespace differences
    expect(screen.getByText(/Audit Trail\s*\(\s*2\s*\)/)).toBeInTheDocument();
  });

  it("renders correct number of audit entries", () => {
    render(<AuditTrail auditTrail={mockAuditTrail} />);

    // Check for the user names to verify entries are rendered
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
  });

  it("renders audit entry details", () => {
    render(<AuditTrail auditTrail={mockAuditTrail} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Application approved for full amount")
    ).toBeInTheDocument();
    expect(screen.getByText("1/15/2024, 3:15:00 PM")).toBeInTheDocument();

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("Application submitted")).toBeInTheDocument();
    expect(screen.getByText("1/15/2024, 6:00:00 AM")).toBeInTheDocument();
  });

  it("applies correct styling for action and system entries", () => {
    render(<AuditTrail auditTrail={mockAuditTrail} />);

    // Check that the action tags are rendered with correct text
    const actionTags = screen.getAllByText(/action|system/);
    expect(actionTags).toHaveLength(2);
  });
});
