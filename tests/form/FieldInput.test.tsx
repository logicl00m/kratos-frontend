import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FieldInput, {
  type FieldInputField,
} from "@features/form/components/FieldInput";

describe("FieldInput", () => {
  const baseField: FieldInputField = {
    id: "test-field",
    name: "Test Field",
    type: "text",
  };

  const renderField = (
    field: FieldInputField,
    value: unknown = "",
    disabled = false
  ) =>
    render(
      <FieldInput field={field} value={value} disabled={disabled} onChange={vi.fn()} />
    );

  it("renders text input correctly", () => {
    renderField({ ...baseField, type: "text" });
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders number input correctly", () => {
    renderField({ ...baseField, type: "number" });
    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders select input correctly", () => {
    renderField({ ...baseField, type: "select" });
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders textarea correctly", () => {
    renderField({ ...baseField, type: "textarea" });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("renders file input correctly", () => {
    renderField({ ...baseField, type: "file" });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it("sets initial value correctly", () => {
    renderField({ ...baseField, type: "text" }, "Test Value");
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Test Value");
  });

  it("is disabled when disabled prop is true", () => {
    renderField({ ...baseField, type: "text" }, "", true);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("renders nothing for unknown field types", () => {
    const { container } = renderField({ ...baseField, type: "unknown" });
    expect(container).toBeEmptyDOMElement();
  });
});
