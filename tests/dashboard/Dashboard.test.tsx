import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Dashboard from "@features/dashboard/components/Dashboard";

describe("Dashboard (smoke)", () => {
  it("mounts and unmounts without crashing", () => {
    const { unmount, container } = render(<Dashboard />);
    unmount();
    expect(container.innerHTML).toBe("");
  });
});
