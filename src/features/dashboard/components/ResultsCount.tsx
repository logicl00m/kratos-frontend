// src/features/dashboard/components/ResultsCount.tsx
import React from "react";

type Props = { filteredCount: number; totalCount: number };

const ResultsCount: React.FC<Props> = ({ filteredCount, totalCount }) => (
  <div
    data-testid="results-count"
    style={{ padding: "12px 24px", color: "#6b7280", fontSize: "12px" }}
  >
    Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong>{" "}
    applications
  </div>
);

export default ResultsCount;
