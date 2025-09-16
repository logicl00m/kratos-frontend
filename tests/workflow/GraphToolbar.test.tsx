import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GraphToolbar from "@features/workflow/components/GraphToolbar";

describe("GraphToolbar", () => {
  it("renders without crashing", () => {
    expect(() => render(<GraphToolbar />)).not.toThrow();
  });

  it("renders export button when onExport is provided", () => {
    const mockExport = vi.fn();
    render(<GraphToolbar onExport={mockExport} />);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("does not render export button when onExport is not provided", () => {
    render(<GraphToolbar />);
    expect(screen.queryByText("Export")).not.toBeInTheDocument();
  });

  it("renders additional buttons when provided", () => {
    const additionalButton = <button>Additional Button</button>;
    render(<GraphToolbar right={additionalButton} />);
    expect(screen.getByText("Additional Button")).toBeInTheDocument();
  });
});
