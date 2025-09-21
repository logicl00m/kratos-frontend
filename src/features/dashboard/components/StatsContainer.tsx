// src/features/dashboard/components/StatsContainer.tsx
import React from "react";
import StatsCard from "./StatsCard";

interface StatsContainerProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

const StatsContainer: React.FC<StatsContainerProps> = ({ stats }) => {
  return (
    <div className="dashboard-stats-grid">
      <StatsCard title="Total Applications" value={stats.total} type="total" />
      <StatsCard title="Completed" value={stats.completed} type="completed" />
      <StatsCard title="In Progress" value={stats.pending} type="pending" />
      <StatsCard title="Overdue" value={stats.overdue} type="overdue" />
    </div>
  );
};

export default StatsContainer;