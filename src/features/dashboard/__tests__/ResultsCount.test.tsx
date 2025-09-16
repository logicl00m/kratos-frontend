import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ResultsCount from "@features/dashboard/components/ResultsCount";

describe("ResultsCount", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<ResultsCount filteredCount={5} totalCount={10} />)
    ).not.toThrow();
  });

  it("displays correct count information", () => {
    render(<ResultsCount filteredCount={5} totalCount={10} />);
    const node = screen.getByTestId("results-count");
    const text = node.textContent?.replace(/\s+/g, " ").trim();
    expect(text).toMatch(/Showing 5 of 10 applications/);
  });

  it("handles singular count correctly", () => {
    render(<ResultsCount filteredCount={1} totalCount={1} />);
    const node1 = screen.getByTestId("results-count");
    const text1 = node1.textContent?.replace(/\s+/g, " ").trim();
    expect(text1).toMatch(/Showing 1 of 1 applications/);
  });

  it("handles zero count correctly", () => {
    render(<ResultsCount filteredCount={0} totalCount={10} />);
    const node0 = screen.getByTestId("results-count");
    const text0 = node0.textContent?.replace(/\s+/g, " ").trim();
    expect(text0).toMatch(/Showing 0 of 10 applications/);
  });
});
