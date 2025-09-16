import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ApplicationDetails from "@features/application-details/components/ApplicationDetails";
import { createMockLoanApplication } from "@test/test-utils";

describe("ApplicationDetails (smoke)", () => {
  it("mounts and unmounts without crashing", () => {
    const app = createMockLoanApplication({ applicant: "Sarah Johnson" });
    const { unmount, container } = render(
      <ApplicationDetails application={app as any} onBack={() => {}} />
    );
    unmount();
    expect(container.innerHTML).toBe("");
  });
});
