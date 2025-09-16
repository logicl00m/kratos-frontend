import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import WorkflowProgress from "@features/application-details/components/WorkflowProgress";

describe("WorkflowProgress", () => {
  const mockStages = [
    { name: "Application", status: "completed" as const },
    { name: "Review", status: "completed" as const },
    { name: "Underwriting", status: "current" as const },
    { name: "Decision", status: "completed" as const },
    { name: "Disbursement", status: "completed" as const }
  ];

  it("renders without crashing", () => {
    expect(() => 
      render(<WorkflowProgress workflowStages={mockStages} />)
    ).not.toThrow();
  });

  it("renders correct number of stages", () => {
    render(<WorkflowProgress workflowStages={mockStages} />);
    
    // Check for the stage names to verify all are rendered
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Underwriting")).toBeInTheDocument();
    expect(screen.getByText("Decision")).toBeInTheDocument();
    expect(screen.getByText("Disbursement")).toBeInTheDocument();
  });

  it("renders stage names", () => {
    render(<WorkflowProgress workflowStages={mockStages} />);
    
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Underwriting")).toBeInTheDocument();
    expect(screen.getByText("Decision")).toBeInTheDocument();
    expect(screen.getByText("Disbursement")).toBeInTheDocument();
  });

  it("applies correct status classes", () => {
    render(<WorkflowProgress workflowStages={mockStages} />);
    
    // Check for elements with the correct status classes
    const completedStages = document.querySelectorAll('.workflow-bubble.completed');
    const currentStages = document.querySelectorAll('.workflow-bubble.current');
    
    expect(completedStages.length).toBe(4);
    expect(currentStages.length).toBe(1);
  });
});