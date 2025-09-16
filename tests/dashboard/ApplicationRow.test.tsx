import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ApplicationRow from "@features/dashboard/components/ApplicationRow";
import { getStageColor } from "@shared/utils/colors";

describe("ApplicationRow", () => {
  const mockApplication = {
    id: "1",
    applicant: "John Doe",
    product: "Personal Loan",
    amount: 10000,
    stage: "Review",
    assignee: "Jane Smith",
    sla: "24h",
    slaStatus: "ontime" as const,
    lastUpdate: "2023-01-01",
    flags: [],
    docs: 3,
  };

  it("renders without crashing", () => {
    expect(() =>
      render(
        <table>
          <tbody>
            <ApplicationRow
              app={mockApplication}
              isActive={false}
              selected={false}
              onSelect={vi.fn()}
              onClick={vi.fn()}
              getStageColor={getStageColor}
            />
          </tbody>
        </table>
      )
    ).not.toThrow();
  });

  it("renders applicant name", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders product name", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Personal Loan")).toBeInTheDocument();
  });

  it("renders formatted amount", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("$10,000")).toBeInTheDocument();
  });

  it("renders stage badge", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("renders assignee name", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders SLA information", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("24h")).toBeInTheDocument();
  });

  it("renders document count", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders checkbox", () => {
    render(
      <table>
        <tbody>
          <ApplicationRow
            app={mockApplication}
            isActive={false}
            selected={false}
            onSelect={vi.fn()}
            onClick={vi.fn()}
            getStageColor={getStageColor}
          />
        </tbody>
      </table>
    );

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});
