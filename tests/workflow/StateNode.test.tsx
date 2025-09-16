import { describe, it, expect, vi } from "vitest";

vi.mock("@reactflow/core", () => ({
  useStoreApi: () => ({ getState: () => ({}), setState: () => {} }),
}));

vi.mock("reactflow", () => ({
  Handle: (props: Record<string, unknown>) =>
    React.createElement("div", {
      "data-testid": "handle",
      ...props,
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

  const makeWrapper = (data: typeof mockData) => () =>
    React.createElement(
      StateNode as unknown as React.ComponentType<unknown>,
      {
        data,
        selected: false,
      } as unknown as Record<string, unknown>
    );

  it("renders state node with title", () => {
    const Wrapper = makeWrapper(mockData);
    render(React.createElement(Wrapper));
    expect(screen.getByText("Test State")).toBeInTheDocument();
  });

  it("shows form fields count when hasForm is true", () => {
    const Wrapper2 = makeWrapper(mockData);
    render(React.createElement(Wrapper2));
    expect(screen.getByText("1 fields")).toBeInTheDocument();
  });

  it("shows no form message when hasForm is false", () => {
    const dataWithoutForm = {
      ...mockData,
      hasForm: false,
    };

    const Wrapper3 = makeWrapper(dataWithoutForm);
    render(React.createElement(Wrapper3));
    expect(screen.getByText("No form configured")).toBeInTheDocument();
  });

  it("expands to show fields when toggle is clicked", () => {
    const Wrapper4 = makeWrapper(mockData);
    render(React.createElement(Wrapper4));

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();
    expect(screen.queryByText("Test Field")).not.toBeInTheDocument();
  });
});
