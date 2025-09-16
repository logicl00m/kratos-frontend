import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ApplicationTable from "@features/dashboard/components/ApplicationTable";
import { getStageColor } from "@shared/utils/colors";

describe("ApplicationTable", () => {
  const mockApplications = [
    {
      id: "1",
      applicant: "John Doe",
      product: "Personal Loan",
      amount: 10000,
      stage: "Review",
      assignee: "Jane Smith",
      sla: "24h",
      slaStatus: "ontime" as const,
      lastUpdate: "2023-01-01",
      flags: [],
      docs: 3
    },
    {
      id: "2",
      applicant: "Jane Doe",
      product: "Mortgage",
      amount: 200000,
      stage: "Approval",
      assignee: "John Smith",
      sla: "48h",
      slaStatus: "due" as const,
      lastUpdate: "2023-01-02",
      flags: ["warning"],
      docs: 5
    }
  ];

  it("renders without crashing", () => {
    expect(() => 
      render(
        <ApplicationTable
          applications={mockApplications}
          selectedRows={[]}
          activeRowId={null}
          onSelectAll={vi.fn()}
          onSelectRow={vi.fn()}
          onRowClick={vi.fn()}
          getStageColor={getStageColor}
        />
      )
    ).not.toThrow();
  });

  it("renders correct number of applications", () => {
    render(
      <ApplicationTable
        applications={mockApplications}
        selectedRows={[]}
        activeRowId={null}
        onSelectAll={vi.fn()}
        onSelectRow={vi.fn()}
        onRowClick={vi.fn()}
        getStageColor={getStageColor}
      />
    );
    
    expect(screen.getAllByRole("row")).toHaveLength(3); // 2 data rows + 1 header row
  });

  it("renders applicant names", () => {
    render(
      <ApplicationTable
        applications={mockApplications}
        selectedRows={[]}
        activeRowId={null}
        onSelectAll={vi.fn()}
        onSelectRow={vi.fn()}
        onRowClick={vi.fn()}
        getStageColor={getStageColor}
      />
    );
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders product names", () => {
    render(
      <ApplicationTable
        applications={mockApplications}
        selectedRows={[]}
        activeRowId={null}
        onSelectAll={vi.fn()}
        onSelectRow={vi.fn()}
        onRowClick={vi.fn()}
        getStageColor={getStageColor}
      />
    );
    
    expect(screen.getByText("Personal Loan")).toBeInTheDocument();
    expect(screen.getByText("Mortgage")).toBeInTheDocument();
  });

  it("renders stage badges with correct colors", () => {
    render(
      <ApplicationTable
        applications={mockApplications}
        selectedRows={[]}
        activeRowId={null}
        onSelectAll={vi.fn()}
        onSelectRow={vi.fn()}
        onRowClick={vi.fn()}
        getStageColor={getStageColor}
      />
    );
    
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Approval")).toBeInTheDocument();
  });

  it("renders checkboxes for row selection", () => {
    render(
      <ApplicationTable
        applications={mockApplications}
        selectedRows={[]}
        activeRowId={null}
        onSelectAll={vi.fn()}
        onSelectRow={vi.fn()}
        onRowClick={vi.fn()}
        getStageColor={getStageColor}
      />
    );
    
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3); // 1 select all + 2 row checkboxes
  });
});