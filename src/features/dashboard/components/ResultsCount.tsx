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
  <div className="dashboard-results-count">
    Showing{" "}
    <span className="dashboard-results-count-highlight">
      {filteredCount}
    </span>{" "}
    of{" "}
    <span className="dashboard-results-count-highlight">
      {totalCount}
    </span>{" "}
    applications
  </div>
);

export default ResultsCount;
