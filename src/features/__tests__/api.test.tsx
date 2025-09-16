import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@features/dashboard/components/Dashboard";

describe("Dashboard Component", () => {
  it("renders dashboard with applications", async () => {
    render(<Dashboard />);

    // Check that the dashboard title is rendered
    expect(screen.getByText("Applications Queue")).toBeInTheDocument();

    // Check that at least one application is rendered
    await waitFor(() => {
      expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
    });
  });

  it("renders filter controls", () => {
    render(<Dashboard />);

    // Check that filter controls are rendered
    expect(
      screen.getByPlaceholderText("Search applications...")
    ).toBeInTheDocument();
    expect(screen.getByText("All Status")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });
});
