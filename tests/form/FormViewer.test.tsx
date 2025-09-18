import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FormViewer from "@features/form/components/FormViewer";

describe("FormViewer", () => {
  const mockWorkflow = {
    workflow: {
      forms: {
        "test-form": {
          fields: [
            {
              id: "name",
              name: "Applicant Name",
              type: "text",
              data: "{{ data.applicant.name }}",
              fieldActions: [{ operation: "validate" }],
            },
            {
              id: "amount",
              name: "Loan Amount",
              type: "number",
              data: "{{ data.loan.amount }}",
              fieldActions: [{ operation: "validate" }],
            },
          ],
        },
      },
      states: {
        "test-state": {
          forms: [
            {
              formName: "test-form",
            },
          ],
          actions: {
            Save: {
              nextState: "next-state",
              operation: "save",
            },
            Submit: {
              nextState: "next-state",
              operation: "submit",
            },
            Reject: {
              nextState: "next-state",
              operation: "reject",
            },
            Approve: {
              nextState: "next-state",
              operation: "approve",
            },
          },
        },
        "finalized-state": {
          forms: [
            {
              formName: "test-form",
            },
          ],
          actions: {},
        },
      },
    },
  };

  const mockWorkflowWithoutState = {
    workflow: {
      forms: {
        "test-form": {
          fields: [
            {
              id: "name",
              name: "Applicant Name",
              type: "text",
              data: "{{ data.applicant.name }}",
              fieldActions: [{ operation: "validate" }],
            },
          ],
        },
      },
      states: {},
    },
  };

  const mockInvalidWorkflow = {
    workflow: {
      forms: null,
      states: null,
    },
  };

  it("renders without crashing", () => {
    expect(() =>
      render(
        <FormViewer
          stateName="Test State"
          workflow={mockWorkflow}
          currentState="test-state"
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
        workflow={mockWorkflow}
        currentState="test-state"
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
        workflow={mockWorkflow}
        currentState="test-state"
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
        workflow={mockWorkflow}
        currentState="test-state"
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
        workflow={mockWorkflow}
        currentState="test-state"
        onSubmit={vi.fn()}
        onReject={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("Back to Graph")).toBeInTheDocument();
  });

  it("shows state status badge", () => {
    render(
      <FormViewer
        stateName="Test State"
        workflow={mockWorkflow}
        currentState="test-state"
        onSubmit={vi.fn()}
        onReject={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("State: test-state")).toBeInTheDocument();
  });

  it("shows error message when workflow is invalid", () => {
    render(
      <FormViewer
        stateName="Test State"
        workflow={mockInvalidWorkflow}
        currentState="test-state"
        onSubmit={vi.fn()}
        onReject={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("Error: Invalid workflow configuration structure")).toBeInTheDocument();
  });

  it("shows error message when state is not found", () => {
    render(
      <FormViewer
        stateName="Test State"
        workflow={mockWorkflowWithoutState}
        currentState="non-existent-state"
        onSubmit={vi.fn()}
        onReject={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("Error: State 'non-existent-state' not found in workflow")).toBeInTheDocument();
  });

  it("shows fallback buttons when no state actions defined", () => {
    render(
      <FormViewer
        stateName="Test State"
        workflow={mockWorkflow}
        currentState="finalized-state"
        onSubmit={vi.fn()}
        onReject={vi.fn()}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });
});
