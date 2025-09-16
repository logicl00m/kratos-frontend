import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import FinancialDetails from "@features/application-details/components/FinancialDetails";

describe("FinancialDetails", () => {
  it("renders without crashing", () => {
    expect(() => render(<FinancialDetails amount={25000} />)).not.toThrow();
  });

  it("renders formatted amount", () => {
    render(<FinancialDetails amount={25000} />);

    expect(screen.getByText("$25,000")).toBeInTheDocument();
  });

  it("renders financial details title", () => {
    render(<FinancialDetails amount={25000} />);

    expect(screen.getByText(/Financial\s*Details/)).toBeInTheDocument();
  });

  it("renders financial information", () => {
    render(<FinancialDetails amount={25000} />);

    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Estimated EMI")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });
});
