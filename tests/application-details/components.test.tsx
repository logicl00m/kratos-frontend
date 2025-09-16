import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import WorkflowProgress from "@features/application-details/components/WorkflowProgress";

describe("WorkflowProgress (smoke)", () => {
  it("mounts without crashing", () => {
    const stages = [
      { name: "Application", status: "completed" as const },
      { name: "Review", status: "current" as const },
    ];
    const { unmount, container } = render(
      <WorkflowProgress workflowStages={stages} />
    );
    unmount();
    expect(container.innerHTML).toBe("");
  });
});
