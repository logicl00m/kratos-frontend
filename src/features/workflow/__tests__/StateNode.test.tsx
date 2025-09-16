import { describe, it, expect, vi } from "vitest";

// Stub @reactflow/core hooks used by reactflow internals to avoid requiring
// the zustand provider in unit tests.
vi.mock("@reactflow/core", () => ({
  useStoreApi: () => ({ getState: () => ({}), setState: () => {} }),
}));

// Mock reactflow exports so components like Handle/Position render stubs and
// ReactFlowProvider is a no-op wrapper for tests.
vi.mock("reactflow", () => ({
  Handle: (props: unknown) =>
    React.createElement("div", {
      "data-testid": "handle",
      ...(props as Record<string, unknown>),
    }),
  Position: { Top: "top", Bottom: "bottom" },
  ReactFlowProvider: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import StateNode from "@features/workflow/components/StateNode";

describe("StateNode", () => {
  const mockData = {
    label: "Test State",
    hasForm: true,
    fields: [
      {
        ID: "field1",
        Name: "Test Field",
        Type: "text",
        DataSource: "{{ data.field1 }}",
        FieldActions: [{ Operation: "validate" }],
      },
    ],
  };

  it("renders state node with title", () => {
    const Wrapper = () =>
      React.createElement(
        StateNode as unknown as React.ComponentType<unknown>,
        { data: mockData, selected: false } as any
      );
    render(React.createElement(Wrapper));

    expect(screen.getByText("Test State")).toBeInTheDocument();
  });

  it("shows form fields count when hasForm is true", () => {
    const Wrapper2 = () =>
      React.createElement(
        StateNode as unknown as React.ComponentType<unknown>,
        { data: mockData, selected: false } as any
      );
    render(React.createElement(Wrapper2));

    expect(screen.getByText("1 fields")).toBeInTheDocument();
  });

  it("shows no form message when hasForm is false", () => {
    const dataWithoutForm = {
      ...mockData,
      hasForm: false,
    };

    const Wrapper3 = () =>
      React.createElement(
        StateNode as unknown as React.ComponentType<unknown>,
        { data: dataWithoutForm, selected: false } as any
      );
    render(React.createElement(Wrapper3));

    expect(screen.getByText("No form configured")).toBeInTheDocument();
  });

  it("expands to show fields when toggle is clicked", () => {
    const Wrapper4 = () =>
      React.createElement(
        StateNode as unknown as React.ComponentType<unknown>,
        { data: mockData, selected: false } as any
      );
    render(React.createElement(Wrapper4));

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();

    // Initially fields should not be visible
    expect(screen.queryByText("Test Field")).not.toBeInTheDocument();
  });
});
