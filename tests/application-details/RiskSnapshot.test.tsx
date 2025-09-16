import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RiskSnapshot from "@features/application-details/components/RiskSnapshot";

describe("RiskSnapshot", () => {
  it("renders without crashing", () => {
    expect(() => render(<RiskSnapshot />)).not.toThrow();
  });

  it("renders risk snapshot title", () => {
    render(<RiskSnapshot />);
    expect(screen.getByText(/Risk\s*Snapshot/)).toBeInTheDocument();
  });

  it("renders risk metrics", () => {
    render(<RiskSnapshot />);
    expect(screen.getAllByText(/Risk\s*Score/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Debt-to-Income/)).toBeInTheDocument();
    expect(screen.getByText("720")).toBeInTheDocument();
    expect(screen.getByText("28%")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });
});
