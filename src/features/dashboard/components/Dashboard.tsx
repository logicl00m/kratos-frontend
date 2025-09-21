// src/features/dashboard/components/Dashboard.tsx
import React, { useState, useMemo } from "react";
import { mockWorkflowData as mockWorkflowRawData } from "../data/mockWorkflowData";
import type { WorkflowData, LoanApplication } from "@features/dashboard/types/dashboard.types";
import { transformWorkflowsToApplications } from "@features/dashboard/utils/workflowTransformer";
import { getStageColor, getSlaColor, getStatusIcon } from "@features/dashboard/utils/styleHelpers";
import DashboardHeader from "./DashboardHeader";
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

  // Keep a reference to the original raw workflows so we can pass the
  // untransformed data to details view when requested.
  const workflows = mockWorkflowRawData;
  const applications = useMemo(
    () => transformWorkflowsToApplications(workflows),
    [workflows]
  );

  // Owners list derived from current data
  const ownerOptions = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.assignee && a.assignee !== "Unassigned") set.add(a.assignee);
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

  // Handlers to reduce nested lambdas in JSX
  const handleToggleAllSelection = (checked: boolean) => {
    setSelectedRows(
      checked ? filteredApplications.map((a) => a.id) : []
    );
  };
  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApplicationClick = (app: LoanApplication) => {
    // Find the original raw workflow object by id and pass
    // it to the parent. ApplicationDetails expects the raw
    // workflow data (workflowData) rather than the
    // transformed `app` object.
    const workflow = workflows.find(
      (w) => w.workflow.id === app.id
    );
    if (workflow && onApplicationClick) {
      onApplicationClick(workflow);
    }
  };

  const stats = {
    total: applications.length,
    completed: applications.filter((a) => a.stage === "Completed").length,
    pending: applications.filter((a) => a.stage !== "Completed").length,
    overdue: applications.filter((a) => a.slaStatus === "overdue").length,
  };

  return (
    <div className="dashboard-container">
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
      
      {/* Main Content */}
      <div className="dashboard-main-content">
        <DashboardMain
          stats={stats}
          filteredApplications={filteredApplications}
          selectedRows={selectedRows}
          handleToggleAllSelection={handleToggleAllSelection}
          handleToggleRow={handleToggleRow}
          handleApplicationClick={handleApplicationClick}
          getStageColor={getStageColor}
          getSlaColor={getSlaColor}
          getStatusIcon={getStatusIcon}
        />
      </div>
    </div>
  );
};

export default Dashboard;