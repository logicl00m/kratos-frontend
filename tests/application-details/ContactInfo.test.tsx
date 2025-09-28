import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactInfo from "@features/application-details/components/ContactInfo";

describe("ContactInfo", () => {
  it("renders without crashing", () => {
    expect(() => render(<ContactInfo applicant="John Doe" />)).not.toThrow();
  });

  it("renders applicant name", () => {
    render(<ContactInfo applicant="John Doe" />);
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders contact information title", () => {
    render(<ContactInfo applicant="John Doe" />);
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });

  it("renders contact details", () => {
    render(<ContactInfo applicant="John Doe" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("john.doe@email.com")).toBeInTheDocument();
    expect(screen.getByText("(555) 123-4567")).toBeInTheDocument();
  });
});
