import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ContactInfo from "@features/application-details/components/ContactInfo";

describe("ContactInfo", () => {
  it("renders without crashing", () => {
    expect(() => 
      render(<ContactInfo applicant="John Doe" />)
    ).not.toThrow();
  });

  it("renders applicant name", () => {
    render(<ContactInfo applicant="John Doe" />);
    
    // Check for the name in the formatted text
    expect(screen.getByText(/Name: John Doe/)).toBeInTheDocument();
  });

  it("renders contact information title", () => {
    render(<ContactInfo applicant="John Doe" />);
    
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });

  it("renders contact details", () => {
    render(<ContactInfo applicant="John Doe" />);
    
    // Check for the individual contact details
    expect(screen.getByText(/✉️/)).toBeInTheDocument();
    expect(screen.getByText(/📞/)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@email.com/)).toBeInTheDocument();
    expect(screen.getByText(/\(555\) 123-4567/)).toBeInTheDocument();
  });
});