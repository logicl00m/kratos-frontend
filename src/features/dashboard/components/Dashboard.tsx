// src/features/dashboard/components/Dashboard.tsx
import React, { useState, useMemo } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardMain from "./DashboardMain";
import { useApplications } from "../hooks/useApplications";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { getStageColor, getStatusIcon } from "../utils/styleHelpers";
import type { LoanApplication, WorkflowData } from "../types/dashboard.types";
import { DASHBOARD_CONFIG } from "../config/dashboardConfig";
import "./Dashboard.css";

// Custom hook that matches the expected interface
const useDashboardApplications = () => {
  const { applications, isLoading, error } = useApplications();

  // Transform the data to match the expected structure
  const data = {
    data: applications,
  };

  return {
    data,
    loading: isLoading,
    error,
    isUsingFallback: DASHBOARD_CONFIG.useMockData, // Set to true if using mock data instead of real API
  };
};

const Dashboard: React.FC<{
  onApplicationClick?: (workflow: WorkflowData) => void;
  currentUserName?: string;
}> = ({ onApplicationClick, currentUserName = "Fahim Ahmed" }) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [myQueueOnly, setMyQueueOnly] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<string>("All Stages");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [selectedProduct, setSelectedProduct] =
    useState<string>("All Products");
  const [selectedOwner, setSelectedOwner] = useState<string>("All Owners");

  // Use real API data instead of mock data
  const {
    data: applicationsResponse,
    loading: applicationsLoading,
    isUsingFallback: applicationsUsingFallback,
  } = useDashboardApplications();
  const {
    data: statsData,
    loading: statsLoading,
  } = useDashboardStats();

  // Get applications from data source (either mock or API)
  // The data from the hook is already transformed to LoanApplication format
  const applications: LoanApplication[] = applicationsResponse?.data || [];

  const ownerOptions = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      if (app.assignee) set.add(app.assignee);
    });
    return [
      "All Owners",
      ...Array.from(set).sort((a, b) => a.localeCompare(b)),
    ];
  }, [applications]);

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term.length === 0 ||
      app.applicant.toLowerCase().includes(term) ||
      app.id.toLowerCase().includes(term);
    const matchesStage =
      selectedStage === "All Stages" || app.stage === selectedStage;
    const matchesStatus =
      selectedStatus === "All Status" ||
      (selectedStatus === "Overdue" && app.slaStatus === "overdue") ||
      (selectedStatus === "Due Soon" && app.slaStatus === "due") ||
      (selectedStatus === "On Time" && app.slaStatus === "ontime") ||
      (selectedStatus === "Completed" && app.slaStatus === "completed");
    const matchesProduct =
      selectedProduct === "All Products" || app.product === selectedProduct;
    const matchesOwner =
      selectedOwner === "All Owners" || app.assignee === selectedOwner;
    const matchesMyQueue = !myQueueOnly || app.assignee === currentUserName;
    return (
      matchesSearch &&
      matchesStage &&
      matchesStatus &&
      matchesProduct &&
      matchesOwner &&
      matchesMyQueue
    );
  });

  const handleToggleAllSelection = (checked: boolean) => {
    setSelectedRows(checked ? filteredApplications.map((a) => a.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApplicationClick = (app: LoanApplication) => {
    if (onApplicationClick) {
      // Create a WorkflowData object from the available data
      const workflow: WorkflowData = {
        workflow: {
          id: app.id,
          currentState: app.stage,
          currentStateEnteredAt: app.lastUpdate,
          forms: {},
          states: {},
        },
      };
      onApplicationClick(workflow);
    }
  };

  // Initialize stats with default values to prevent undefined property access
  const stats = {
    totalApplications: (statsData?.totalApplications || applications.length) || 0,
    pendingApplications: (statsData?.pendingApplications || 
                         applications.filter((a) => a.stage !== "Completed").length) || 0,
    approvedApplications: (statsData?.approvedApplications || 
                          applications.filter((a) => a.stage === "Completed").length) || 0,
    rejectedApplications: statsData?.rejectedApplications || 0,
    slaMetrics: statsData?.slaMetrics || {
      onTime: applications.filter((a) => a.slaStatus === "ontime").length,
      due: applications.filter((a) => a.slaStatus === "due").length,
      overdue: applications.filter((a) => a.slaStatus === "overdue").length,
      completed: applications.filter((a) => a.slaStatus === "completed").length,
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <DashboardHeader
          searchTerm={searchTerm}
          myQueueOnly={myQueueOnly}
          selectedStage={selectedStage}
          selectedStatus={selectedStatus}
          selectedProduct={selectedProduct}
          selectedOwner={selectedOwner}
          ownerOptions={ownerOptions}
          onSearchChange={setSearchTerm}
          onMyQueueToggle={setMyQueueOnly}
          onStageChange={setSelectedStage}
          onStatusChange={setSelectedStatus}
          onProductChange={setSelectedProduct}
          onOwnerChange={setSelectedOwner}
        />
      </div>
      <div className="dashboard-content">
        <div className="dashboard-main-content">
          <DashboardMain
            stats={stats}
            filteredApplications={filteredApplications}
            selectedRows={selectedRows}
            handleToggleAllSelection={handleToggleAllSelection}
            handleToggleRow={handleToggleRow}
            handleApplicationClick={handleApplicationClick}
            getStageColor={getStageColor}
            getStatusIcon={(s: string) =>
              getStatusIcon(s as unknown as LoanApplication["slaStatus"])
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
