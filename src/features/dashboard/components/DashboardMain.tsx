// src/features/dashboard/components/DashboardMain.tsx
import React, { useState, useMemo } from "react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";
import StatsContainer from "./StatsContainer";
import ResultsCount from "./ResultsCount";
import ApplicationTable from "./ApplicationTable";
import Pagination from "./Pagination";

interface DashboardMainProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  filteredApplications: LoanApplication[];
  selectedRows: string[];
  handleToggleAllSelection: (checked: boolean) => void;
  handleToggleRow: (id: string) => void;
  handleApplicationClick: (app: LoanApplication) => void;
  getStageColor: (stage: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const DashboardMain: React.FC<DashboardMainProps> = ({
  stats,
  filteredApplications,
  selectedRows,
  handleToggleAllSelection,
  handleToggleRow,
  handleApplicationClick,
  getStageColor,
  getStatusIcon,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredApplications.length]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when changing pages
    document.querySelector('.dashboard-table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dashboard-stats-container">
      <StatsContainer stats={stats} />
      
      <ResultsCount 
        filteredCount={filteredApplications.length} 
        totalCount={stats.total} 
      />

      <div className="dashboard-table-container">
        <div className="dashboard-table-wrapper">
          <ApplicationTable
            applications={paginatedApplications}
            selectedRows={selectedRows}
            onSelectAll={handleToggleAllSelection}
            onSelectRow={handleToggleRow}
            onRowClick={handleApplicationClick}
            getStageColor={getStageColor}
            getStatusIcon={getStatusIcon}
          />
        </div>
        
        {/* Table Footer with Pagination */}
        <div className="dashboard-table-footer">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredApplications.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;