import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Node, Edge } from "reactflow";
import DetailPanel from "@features/workflow/components/DetailPanel";

describe("DetailPanel", () => {
  it("does not render when no node or edge is selected", () => {
    const { container } = render(
      <DetailPanel selectedNode={null} selectedEdge={null} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders state details when node is selected", () => {
    const mockNode: Node = {
      id: "test-node",
      position: { x: 0, y: 0 },
      data: {
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
      },
    };

    render(
      <DetailPanel
        selectedNode={mockNode}
        selectedEdge={null}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("State Details")).toBeInTheDocument();
    expect(screen.getByText("Test State")).toBeInTheDocument();
    expect(screen.getByText("Test Field")).toBeInTheDocument();
  });

  it("renders action details when edge is selected", () => {
    const mockEdge: Edge = {
      id: "e1-2",
      source: "source-state",
      target: "target-state",
      label: "Test Action",
      data: {
        operation: "Validate data, Save to database",
      },
    };

    render(
      <DetailPanel
        selectedNode={null}
        selectedEdge={mockEdge}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Action Details")).toBeInTheDocument();
    expect(screen.getByText("Test Action")).toBeInTheDocument();
    expect(screen.getByText("source-state")).toBeInTheDocument();
    expect(screen.getByText("target-state")).toBeInTheDocument();
  });

  it("renders close button", () => {
    const mockNode: Node = {
      id: "test-node",
      position: { x: 0, y: 0 },
      data: {
        label: "Test State",
        hasForm: false,
      },
    };

    render(
      <DetailPanel
        selectedNode={mockNode}
        selectedEdge={null}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Close details")).toBeInTheDocument();
  });
});
