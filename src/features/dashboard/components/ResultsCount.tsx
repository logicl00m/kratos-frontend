// src/features/dashboard/components/ResultsCount.tsx
import React from "react";

type ResultsCountProps = {
  filteredCount: number;
  totalCount: number;
};

const ResultsCount: React.FC<ResultsCountProps> = ({
  filteredCount,
  totalCount,
}) => (
  <div data-testid="results-count" className="mb-4 text-sm text-gray-600">
    Showing <span className="font-semibold text-gray-900">{filteredCount}</span>{" "}
    of <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
    applications
  </div>
);

export default ResultsCount;
