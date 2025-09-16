import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@features/dashboard/components/Dashboard";

describe("Dashboard Component", () => {
  it("renders dashboard with applications", async () => {
    render(<Dashboard />);
    expect(screen.getByText("Applications Queue")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    });
  });

  it("renders filter controls", () => {
    render(<Dashboard />);
    expect(
      screen.getByPlaceholderText("Search applications...")
    ).toBeInTheDocument();
    expect(screen.getByText("All Status")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });
});
