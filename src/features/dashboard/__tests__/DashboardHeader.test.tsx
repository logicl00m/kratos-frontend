import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardHeader from "@features/dashboard/components/DashboardHeader";

describe("DashboardHeader", () => {
  it("renders without crashing", () => {
    expect(() => 
      render(
        <DashboardHeader
          searchTerm=""
          myQueueOnly={false}
          onSearchChange={vi.fn()}
          onMyQueueToggle={vi.fn()}
        />
      )
    ).not.toThrow();
  });

  it("renders dashboard title", () => {
    render(
      <DashboardHeader
        searchTerm=""
        myQueueOnly={false}
        onSearchChange={vi.fn()}
        onMyQueueToggle={vi.fn()}
      />
    );
    
    expect(screen.getByText("Applications Queue")).toBeInTheDocument();
  });

  it("renders search input with correct placeholder", () => {
    render(
      <DashboardHeader
        searchTerm=""
        myQueueOnly={false}
        onSearchChange={vi.fn()}
        onMyQueueToggle={vi.fn()}
      />
    );
    
    const searchInput = screen.getByPlaceholderText("Search applications...");
    expect(searchInput).toBeInTheDocument();
  });

  it("renders search input with correct value", () => {
    render(
      <DashboardHeader
        searchTerm="test search"
        myQueueOnly={false}
        onSearchChange={vi.fn()}
        onMyQueueToggle={vi.fn()}
      />
    );
    
    const searchInput = screen.getByPlaceholderText("Search applications...");
    expect(searchInput).toHaveValue("test search");
  });

  it("renders filter select elements", () => {
    render(
      <DashboardHeader
        searchTerm=""
        myQueueOnly={false}
        onSearchChange={vi.fn()}
        onMyQueueToggle={vi.fn()}
      />
    );
    
    expect(screen.getByText("All Status")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("renders My Queue toggle", () => {
    render(
      <DashboardHeader
        searchTerm=""
        myQueueOnly={true}
        onSearchChange={vi.fn()}
        onMyQueueToggle={vi.fn()}
      />
    );
    
    const toggle = screen.getByText("My Queue");
    expect(toggle).toBeInTheDocument();
  });
});