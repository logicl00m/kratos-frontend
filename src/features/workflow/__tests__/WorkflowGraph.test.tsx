import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "reactflow";
import WorkflowGraph from "@features/workflow/components/WorkflowGraph";
import { parseWorkflowToGraph, getDefaultWorkflow } from "@features/workflow/utils/graphParser";

// Mock the DetailPanel component since it's not relevant for this test
vi.mock("@features/workflow/components/DetailPanel", () => ({
  default: () => <div data-testid="detail-panel">Detail Panel</div>
}));

// Mock the GraphToolbar component
vi.mock("@features/workflow/components/GraphToolbar", () => ({
  default: () => <div data-testid="graph-toolbar">Graph Toolbar</div>
}));

// Mock the StateNode component
vi.mock("@features/workflow/components/StateNode", () => ({
  default: ({ data }: { data: any }) => (
    <div data-testid="state-node" data-label={data.label}>
      {data.label}
    </div>
  )
}));

const renderWithReactFlow = (component: React.ReactNode) => {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
};

describe("WorkflowGraph", () => {
  it("renders without crashing", () => {
    const workflow = getDefaultWorkflow();
    const { nodes, edges } = parseWorkflowToGraph(workflow);
    
    expect(() => 
      renderWithReactFlow(
        <WorkflowGraph nodes={nodes} edges={edges} />
      )
    ).not.toThrow();
  });

  it("renders correct number of nodes", () => {
    const workflow = getDefaultWorkflow();
    const { nodes, edges } = parseWorkflowToGraph(workflow);
    
    renderWithReactFlow(
      <WorkflowGraph nodes={nodes} edges={edges} />
    );
    
    // Should render 3 nodes: Start, Review, Complete
    const stateNodes = screen.getAllByTestId("state-node");
    expect(stateNodes).toHaveLength(3);
  });

  it("renders correct number of edges", () => {
    const workflow = getDefaultWorkflow();
    const { nodes, edges } = parseWorkflowToGraph(workflow);
    
    renderWithReactFlow(
      <WorkflowGraph nodes={nodes} edges={edges} />
    );
    
    // Should render 3 edges: Start->Review, Review->Complete, Review->Start
    expect(edges).toHaveLength(3);
  });

  it("renders toolbar and detail panel", () => {
    const workflow = getDefaultWorkflow();
    const { nodes, edges } = parseWorkflowToGraph(workflow);
    
    renderWithReactFlow(
      <WorkflowGraph nodes={nodes} edges={edges} />
    );
    
    expect(screen.getByTestId("graph-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("detail-panel")).toBeInTheDocument();
  });
});