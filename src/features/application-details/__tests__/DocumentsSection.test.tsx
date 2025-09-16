import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import DocumentsSection from "@features/application-details/components/DocumentsSection";

describe("DocumentsSection", () => {
  const mockDocuments = [
    {
      name: "Identity Verification",
      filename: "id_verification.pdf",
      status: "complete" as const,
      required: true,
    },
    {
      name: "Income Proof",
      filename: "pay_stub.pdf",
      status: "review" as const,
      required: true,
    },
    {
      name: "Bank Statements",
      filename: "",
      status: "pending" as const,
      required: false,
    },
  ];

  it("renders without crashing", () => {
    expect(() =>
      render(<DocumentsSection documents={mockDocuments} />)
    ).not.toThrow();
  });

  it("renders section title with document counts", () => {
    render(<DocumentsSection documents={mockDocuments} />);

    // Check for the document count in the title (allow for emoji and spacing)
    expect(
      screen.getByText(/Documents\s*\(\s*1\s*\/\s*2\s*\)/)
    ).toBeInTheDocument();
  });

  it("renders document names", () => {
    render(<DocumentsSection documents={mockDocuments} />);

    expect(screen.getByText("Identity Verification")).toBeInTheDocument();
    expect(screen.getByText("Income Proof")).toBeInTheDocument();
    expect(screen.getByText("Bank Statements")).toBeInTheDocument();
  });

  it("renders document statuses", () => {
    render(<DocumentsSection documents={mockDocuments} />);

    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
    // The pending document has an Upload button instead of status text; there may be multiple Upload buttons
    expect(screen.getAllByText("Upload")).toBeTruthy();
  });

  it("renders required indicators", () => {
    render(<DocumentsSection documents={mockDocuments} />);

    // Check for required indicators (the asterisk)
    const requiredIndicators = screen.getAllByText("*");
    expect(requiredIndicators).toHaveLength(2);
  });
});
