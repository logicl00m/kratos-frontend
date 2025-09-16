import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import JsonEditor from "@features/workflow/components/JsonEditor";

describe("JsonEditor", () => {
  const mockProps = {
    value: '{"test": "value"}',
    onChange: vi.fn(),
    onApply: vi.fn(),
    error: null
  };

  it("renders without crashing", () => {
    expect(() => 
      render(<JsonEditor {...mockProps} />)
    ).not.toThrow();
  });

  it("renders title and apply button", () => {
    render(<JsonEditor {...mockProps} />);
    
    expect(screen.getByText("Workflow JSON")).toBeInTheDocument();
    expect(screen.getByText("Apply Changes")).toBeInTheDocument();
  });

  it("renders textarea with correct value", () => {
    render(<JsonEditor {...mockProps} />);
    
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('{"test": "value"}');
  });

  it("shows error message when error is provided", () => {
    const propsWithError = {
      ...mockProps,
      error: "Test error message"
    };
    
    render(<JsonEditor {...propsWithError} />);
    
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("disables apply button when JSON is invalid", () => {
    const propsWithInvalidJson = {
      ...mockProps,
      value: '{"test": "value"' // Invalid JSON
    };
    
    render(<JsonEditor {...propsWithInvalidJson} />);
    
    const applyButton = screen.getByText("Apply Changes");
    expect(applyButton).toBeDisabled();
  });
});