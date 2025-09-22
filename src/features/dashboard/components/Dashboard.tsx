// src/features/dashboard/components/Dashboard.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDashboardApplications,
  useDashboardStats,
} from "../../../lib/hooks/useApiWithFallback";
import type {
  WorkflowData,
  LoanApplication,
} from "@features/dashboard/types/dashboard.types";
import {
  getStageColor,
  getStatusIcon,
} from "@features/dashboard/utils/styleHelpers";
import DashboardFilters from "./DashboardFilters";
import DashboardMain from "./DashboardMain";
import "./Dashboard.css";

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
    isUsingFallback: statsUsingFallback,
  } = useDashboardStats();

  // Get applications from API data
  const rawApplications = applicationsResponse?.data || [];

  // Transform API ApplicationInstance data to LoanApplication format
  const applications: LoanApplication[] = rawApplications.map((app: any) => ({
    id: app.id,
    applicant:
      app.data?.firstName && app.data?.lastName
        ? `${app.data.firstName} ${app.data.lastName}`
        : app.data?.applicantName || "Unknown Applicant",
    amount: parseFloat(
      app.data?.loanAmount?.toString()?.replace(/[^0-9.]/g, "") || "50000"
    ),
    product: app.data?.productType || "Personal Loan",
    stage: app.currentState || "Application",
    assignee: app.assignee || "Unassigned",
    initiatedBy: app.data?.submittedBy || "System",
    sla: "5 days",
    slaStatus: (app.metadata?.slaStatus ||
      "ontime") as LoanApplication["slaStatus"],
    lastUpdate: app.metadata?.updatedAt || new Date().toISOString(),
    flags: [],
  }));

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
          states: {}
        }
      };
      onApplicationClick(workflow);
    }
  };

  // Use real stats data when available
  const stats = statsData || {
    totalApplications: applications.length,
    pendingApplications: applications.filter((a) => a.stage !== "Completed")
      .length,
    approvedApplications: applications.filter((a) => a.stage === "Completed")
      .length,
    rejectedApplications: 0,
    slaMetrics: {
      onTime: applications.filter((a) => a.slaStatus === "ontime").length,
      due: applications.filter((a) => a.slaStatus === "due").length,
      overdue: applications.filter((a) => a.slaStatus === "overdue").length,
      completed: applications.filter((a) => a.slaStatus === "completed").length,
    },
  };

  const filterControls = (
    <DashboardFilters
      myQueueOnly={myQueueOnly}
      selectedStage={selectedStage}
      selectedStatus={selectedStatus}
      selectedProduct={selectedProduct}
      selectedOwner={selectedOwner}
      ownerOptions={ownerOptions}
      onMyQueueToggle={setMyQueueOnly}
      onStageChange={setSelectedStage}
      onStatusChange={setSelectedStatus}
      onProductChange={setSelectedProduct}
      onOwnerChange={setSelectedOwner}
    />
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl">
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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterControls={filterControls}
      />
    </div>
  );
};

export default Dashboard;
