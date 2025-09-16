import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import FormViewer from "@features/form/components/FormViewer";

describe("FormViewer", () => {
  const mockState = {
    Form: {
      Fields: [
        {
          ID: "name",
          Name: "Applicant Name",
          Type: "text",
          DataSource: "{{ data.applicant.name }}",
          FieldActions: [{ Operation: "validate" }]
        },
        {
          ID: "amount",
          Name: "Loan Amount",
          Type: "number",
          DataSource: "{{ data.loan.amount }}",
          FieldActions: [{ Operation: "validate" }]
        }
      ]
    }
  };

  it("renders without crashing", () => {
    expect(() => 
      render(
        <FormViewer 
          stateName="Test State" 
          state={mockState} 
          onSubmit={vi.fn()} 
          onReject={vi.fn()} 
          onBack={vi.fn()} 
        />
      )
    ).not.toThrow();
  });

  it("renders state name", () => {
    render(
      <FormViewer 
        stateName="Test State" 
        state={mockState} 
        onSubmit={vi.fn()} 
        onReject={vi.fn()} 
        onBack={vi.fn()} 
      />
    );
    
    expect(screen.getByText("Test State")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(
      <FormViewer 
        stateName="Test State" 
        state={mockState} 
        onSubmit={vi.fn()} 
        onReject={vi.fn()} 
        onBack={vi.fn()} 
      />
    );
    
    expect(screen.getByText("Applicant Name")).toBeInTheDocument();
    expect(screen.getByText("Loan Amount")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(
      <FormViewer 
        stateName="Test State" 
        state={mockState} 
        onSubmit={vi.fn()} 
        onReject={vi.fn()} 
        onBack={vi.fn()} 
      />
    );
    
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText("Approve")).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(
      <FormViewer 
        stateName="Test State" 
        state={mockState} 
        onSubmit={vi.fn()} 
        onReject={vi.fn()} 
        onBack={vi.fn()} 
      />
    );
    
    expect(screen.getByText("Back to Graph")).toBeInTheDocument();
  });

  it("shows 'Finalized' status badge", () => {
    render(
      <FormViewer 
        stateName="Test State" 
        state={mockState} 
        onSubmit={vi.fn()} 
        onReject={vi.fn()} 
        onBack={vi.fn()} 
      />
    );
    
    expect(screen.getByText("Finalized")).toBeInTheDocument();
  });
});