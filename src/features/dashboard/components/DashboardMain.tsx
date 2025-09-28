// src/features/dashboard/components/DashboardMain.tsx
import React, { useState, useMemo } from "react";
import DashboardFilters from "./DashboardFilters";
import ResultsCount from "./ResultsCount";
import Pagination from "./Pagination";
import ApplicationTable from "./ApplicationTable";
import StatsContainer from "./StatsContainer";
import type { LoanApplication } from "../types/dashboard.types";
import "./DashboardMain.css";

interface DashboardMainProps {
  stats: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    slaMetrics: {
      onTime: number;
      due: number;
      overdue: number;
      completed: number;
    };
  };
  filteredApplications: LoanApplication[];
  selectedRows: string[];
  handleToggleAllSelection: (checked: boolean) => void;
  handleToggleRow: (id: string) => void;
  handleApplicationClick: (app: LoanApplication) => void;
  getStageColor: (stage: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterControls: React.ReactNode;
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
  searchTerm,
  onSearchChange,
  filterControls,
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
    document
      .querySelector(".dashboard-table-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dashboard-main">
      {/* Use filter controls passed from parent */}
      {filterControls && (
        <div className="dashboard-main-filters">
          {filterControls}
        </div>
      )}
      
      <div className="dashboard-main-content">
        <StatsContainer 
          stats={{
            total: stats.totalApplications,
            completed: stats.approvedApplications,
            pending: stats.pendingApplications,
            overdue: stats.slaMetrics.overdue
          }} 
        />
        
        <ResultsCount
          filteredCount={filteredApplications.length}
          totalCount={stats.totalApplications} 
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
    </div>
  );
};

export default DashboardMain;
