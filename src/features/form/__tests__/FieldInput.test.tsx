import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FieldInput from "@features/form/components/FieldInput";

describe("FieldInput", () => {
  const baseField = {
    ID: "test-field",
    Name: "Test Field",
    Type: "text",
    DataSource: "{{ data.test }}",
  };

  it("renders text input correctly", () => {
    const field = { ...baseField, Type: "text" };

    render(<FieldInput field={field} value="" onChange={vi.fn()} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders number input correctly", () => {
    const field = { ...baseField, Type: "number" };

    render(<FieldInput field={field} value="" onChange={vi.fn()} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders select input correctly", () => {
    const field = { ...baseField, Type: "select" };

    render(<FieldInput field={field} value="" onChange={vi.fn()} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    // native <select> elements don't have a 'type' attribute
    expect(select.getAttribute("type")).toBeNull();
  });

  it("renders textarea correctly", () => {
    const field = { ...baseField, Type: "textarea" };

    render(<FieldInput field={field} value="" onChange={vi.fn()} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("renders file input correctly", () => {
    const field = { ...baseField, Type: "file" };

    render(<FieldInput field={field} value="" onChange={vi.fn()} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it("sets initial value correctly", () => {
    const field = { ...baseField, Type: "text" };

    render(<FieldInput field={field} value="Test Value" onChange={vi.fn()} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Test Value");
  });

  it("is disabled when disabled prop is true", () => {
    const field = { ...baseField, Type: "text" };

    render(
      <FieldInput field={field} value="" onChange={vi.fn()} disabled={true} />
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("renders nothing for unknown field types", () => {
    const field = { ...baseField, Type: "unknown" };
    const { container } = render(
      <FieldInput field={field} value="" onChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
