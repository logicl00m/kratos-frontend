import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormViewer from "@features/form/components/FormViewer";

type FormViewerProps = React.ComponentProps<typeof FormViewer>;

const reviewWorkflow = {
  workflow: {
    forms: {
      reviewForm: {
        fields: [
          {
            id: "applicantName",
            name: "Applicant Name",
            type: "text",
            data: "{{ data.applicant.name }}",
            fieldActions: [{ operation: "validate" }],
          },
          {
            id: "loanAmount",
            name: "Loan Amount",
            type: "number",
            data: "{{ data.loan.amount }}",
          },
          {
            id: "decisionStatus",
            name: "Decision Status",
            type: "select",
            data: "{{ data.decision.status }}",
          },
          {
            id: "miscInfo",
            name: "Misc Info",
            type: "text",
            data: "{{ data.review.miscInfo }}",
            fieldActions: [{ operation: "" }],
          },
          {
            id: "reviewNotes",
            name: "Review Notes",
            type: "textarea",
            data: "{{ data.review.notes }}",
          },
        ],
      },
      supplementalForm: {
        fields: [
          {
            id: "supplementalField",
            name: "Hidden Field",
            type: "text",
            data: "{{ data.hidden }}",
          },
        ],
      },
    },
    states: {
      review: {
        forms: [
          {
            formName: "reviewForm",
            fieldOverrides: {
              applicantName: { status: "readonly" },
              loanAmount: { status: "editable", required: true },
              decisionStatus: { status: "actionable" },
              miscInfo: {},
              reviewNotes: { status: "hidden" },
            },
          },
          {
            formName: "supplementalForm",
            visibility: "hidden",
          },
        ],
        actions: {
          RequestChanges: { nextState: "revisions", operation: "request_changes" },
          ApproveApplication: { nextState: "approved", operation: "approve" },
        },
      },
      fallback: {
        forms: [
          {
            formName: "reviewForm",
          },
        ],
        actions: {},
      },
    },
  },
} satisfies FormViewerProps["workflow"];

describe("FormViewer", () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onReject: ReturnType<typeof vi.fn>;
  let onBack: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn();
    onReject = vi.fn();
    onBack = vi.fn();
  });

  const renderViewer = (props: Partial<FormViewerProps> = {}) =>
    render(
      <FormViewer
        stateName="Review Application"
        workflow={reviewWorkflow}
        currentState="review"
        onSubmit={onSubmit}
        onReject={onReject}
        onBack={onBack}
        {...props}
      />
    );

  it("renders workflow fields and field actions metadata", () => {
    renderViewer();

    expect(screen.getByText("Applicant Name")).toBeInTheDocument();
    expect(screen.getByText("Loan Amount")).toBeInTheDocument();
    expect(screen.getByText("Decision Status")).toBeInTheDocument();
    expect(screen.getByText("State: review")).toBeInTheDocument();
    expect(screen.getByText("validate")).toBeInTheDocument();
    expect(screen.getByText("Read only")).toBeInTheDocument();
  });

  it("hides forms and fields marked as hidden", () => {
    renderViewer();

    expect(screen.queryByText("Hidden Field")).not.toBeInTheDocument();
    expect(screen.queryByText("Review Notes")).not.toBeInTheDocument();
  });

  it("displays required status cues and updates them when values change", async () => {
    const user = userEvent.setup();
    renderViewer();

    expect(screen.getByText("Required")).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: "Edit" });
    const amountInput = screen.getByRole("spinbutton");
    expect(amountInput).toBeDisabled();

    await act(async () => {
      await user.click(editButton);
    });

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(amountInput).not.toBeDisabled();

    await act(async () => {
      await user.clear(amountInput);
      await user.type(amountInput, "5000");
    });

    expect(await screen.findByText("Editable")).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: "Save" });

    await act(async () => {
      await user.click(saveButton);
    });

    expect(await screen.findByText("Ready for edit")).toBeInTheDocument();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("renders actionable fields with prompts and keeps them enabled", () => {
    renderViewer();

    expect(screen.getByText("Action required")).toBeInTheDocument();

    const decisionSelect = screen.getByRole("combobox");
    expect(decisionSelect).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("submits collected form data when workflow action buttons are clicked", async () => {
    const user = userEvent.setup();
    renderViewer();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Edit" }));
    });

    const amountInput = screen.getByRole("spinbutton");

    await act(async () => {
      await user.clear(amountInput);
      await user.type(amountInput, "25000");
    });

    const decisionSelect = screen.getByRole("combobox");

    await act(async () => {
      await user.selectOptions(decisionSelect, "approved");
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Request Changes" }));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      loanAmount: 25000,
      decisionStatus: "approved",
    });
    expect(Object.keys(payload).sort()).toEqual(["decisionStatus", "loanAmount"]);
  });

  it("falls back to default footer buttons when no workflow actions are configured", async () => {
    const user = userEvent.setup();
    renderViewer({ currentState: "fallback" });

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    const rejectButton = screen.getByRole("button", { name: "Reject" });

    await act(async () => {
      await user.click(rejectButton);
    });

    expect(onReject).toHaveBeenCalledWith({});
  });

  it("invokes onBack when the back button is clicked", async () => {
    const user = userEvent.setup();
    renderViewer();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Back to Graph" }));
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("formats action button labels and class names", () => {
    renderViewer();

    const requestChanges = screen.getByRole("button", { name: "Request Changes" });
    const approveApplication = screen.getByRole("button", { name: "Approve Application" });

    expect(requestChanges.className).toContain("btn-requestchanges");
    expect(approveApplication.className).toContain("btn-approveapplication");
  });

  it("supports rendering legacy workflow states", async () => {
    const user = userEvent.setup();
    const legacyState = {
      Form: {
        Fields: [
          {
            ID: "legacy-1",
            Name: "Legacy Field",
            Type: "text",
            DataSource: "{{ legacy.value }}",
            FieldActions: [{ Operation: "legacy-operation" }],
          },
        ],
      },
    };

    renderViewer({
      workflow: undefined,
      currentState: undefined,
      state: legacyState,
      stateName: "Legacy State",
    });

    expect(screen.getByText("Legacy Field")).toBeInTheDocument();
    expect(screen.getByText("Finalized")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Submit" }));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders a configuration error when no workflow definition is provided", () => {
    renderViewer({ workflow: undefined });

    expect(
      screen.getByText("Error: Invalid workflow configuration structure")
    ).toBeInTheDocument();
  });

  it("renders a configuration error when forms are missing", () => {
    const workflowWithoutForms: FormViewerProps["workflow"] = {
      workflow: {
        states: {
          review: {
            forms: [],
          },
        },
      },
    };

    renderViewer({ workflow: workflowWithoutForms });

    expect(
      screen.getByText("Error: Invalid workflow configuration structure")
    ).toBeInTheDocument();
  });

  it("renders an error when the requested state cannot be found", () => {
    const workflowWithoutState: FormViewerProps["workflow"] = {
      workflow: {
        forms: reviewWorkflow.workflow.forms,
        states: {},
      },
    };

    renderViewer({ workflow: workflowWithoutState, currentState: "missing-state" });

    expect(
      screen.getByText("Error: State 'missing-state' not found in workflow")
    ).toBeInTheDocument();
  });
  it("defaults to read-only when override lacks status metadata", () => {
    renderViewer();

    const miscLabel = screen.getByText("Misc Info");
    const fieldGroup = miscLabel.closest(".form-group");
    expect(fieldGroup).not.toBeNull();
    const group = fieldGroup as HTMLElement;

    const miscInput = within(group).getByRole("textbox");
    expect(miscInput).toBeDisabled();

    const statusElement = group.querySelector(".field-status");
    expect(statusElement?.textContent?.trim()).toBe("");

    const actionTags = group.querySelectorAll(".action-tag");
    expect(Array.from(actionTags).some((tag) => tag.textContent === "")).toBe(true);
  });

  it("reports missing state when both stateName and currentState are empty", () => {
    renderViewer({ stateName: "", currentState: "" });

    expect(
      screen.getByText("Error: State '' not found in workflow")
    ).toBeInTheDocument();
  });

  it("handles legacy states when fields data is not an array", () => {
    renderViewer({
      workflow: undefined,
      currentState: undefined,
      stateName: "Legacy State",
      state: {
        Form: { Fields: {} as unknown as [] },
      },
    });

    expect(screen.getByText("Finalized")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

});
