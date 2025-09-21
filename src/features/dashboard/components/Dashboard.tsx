// src/features/dashboard/components/Dashboard.tsx
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { mockWorkflowData as mockWorkflowRawData } from "../data/mockWorkflowData";
import type { WorkflowData } from "@features/dashboard/types/dashboard.types";
import "./Dashboard.css";

// Local type for transformed application rows
type TransformedApp = {
  id: string;
  applicant: string;
  product: string;
  amount: number;
  stage: string;
  assignee: string;
  initiatedBy: string;
  sla: string;
  slaStatus: "overdue" | "due" | "ontime" | "completed";
  lastUpdate: string;
  docs: number;
};

// Transform function
function transformWorkflows(workflows: WorkflowData[]): TransformedApp[] {
  return workflows.map((w: WorkflowData) => {
    const workflow = w.workflow;

    // Extract amount with regex pattern matching
    let amount = 0;
    const forms: Record<string, any> = workflow.forms ?? {};
    Object.values(forms).forEach((form) => {
      (form.fields || []).forEach((field: any) => {
        if (
          field.id?.match(/amount/i) &&
          field.type === "number" &&
          field.data
        ) {
          amount = Math.max(amount, Number(field.data));
        }
      });
    });

    // Extract applicant name
    let applicant = "Unknown";
    Object.values(forms).forEach((form) => {
      (form.fields || []).forEach((field: any) => {
        if (
          field.id?.match(/applicant|name/i) &&
          field.type === "text" &&
          field.data
        ) {
          if (typeof field.data === "string") applicant = field.data;
          else if (typeof field.data === "number")
            applicant = String(field.data);
        }
      });
    });

    // Get current assignee
    const currentState = workflow.states[workflow.currentState];
    const assignee = currentState?.assignees?.[0]?.employeeName || "Unassigned";

    // Get initiated by (first assignee)
    let initiatedBy = "System";
    const states: Record<string, any> = workflow.states || {};
    Object.values(states).forEach((state) => {
      if (state.assignees?.[0] && (!initiatedBy || initiatedBy === "System")) {
        initiatedBy = state.assignees[0].employeeName;
      }
    });

    // Calculate SLA
    const enteredAt = new Date(workflow.currentStateEnteredAt);
    const now = new Date();
    const hoursElapsed =
      (now.getTime() - enteredAt.getTime()) / (1000 * 60 * 60);

    const stateSLAs: Record<string, number> = {
      ARMDraft: 24,
      RMReview: 48,
      CMReview: 36,
      RMResubmission: 24,
      THCRMDecision: 12,
      Completed: 999999,
    };

    const slaHours = stateSLAs[workflow.currentState] || 48;
    const remainingHours = slaHours - hoursElapsed;

    let sla: string, slaStatus: TransformedApp["slaStatus"];
    if (workflow.currentState === "Completed") {
      sla = "Completed";
      slaStatus = "completed";
    } else if (remainingHours < 0) {
      sla = `Overdue ${Math.abs(Math.round(remainingHours))}h`;
      slaStatus = "overdue";
    } else if (remainingHours < 12) {
      sla = `Due in ${Math.round(remainingHours)}h`;
      slaStatus = "due";
    } else {
      sla = `Due in ${Math.round(remainingHours)}h`;
      slaStatus = "ontime";
    }

    // Count documents
    let docs = 0;
    Object.values(forms).forEach((form) => {
      (form.fields || []).forEach((field: any) => {
        if (field.type === "file" && Array.isArray(field.data)) {
          docs += field.data.length;
        }
      });
    });

    return {
      id: workflow.id,
      applicant,
      product: "Business Loan",
      amount,
      stage: workflow.currentState,
      assignee,
      initiatedBy,
      sla,
      slaStatus,
      lastUpdate: new Date(workflow.currentStateEnteredAt).toLocaleDateString(
        "en-GB"
      ),
      docs,
    };
  });
}

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
    () => transformWorkflows(workflows),
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

  const filteredApplications = applications.filter((app: TransformedApp) => {
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
      checked ? filteredApplications.map((a: TransformedApp) => a.id) : []
    );
  };
  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const stats = {
    total: applications.length,
    completed: applications.filter((a) => a.stage === "Completed").length,
    pending: applications.filter((a) => a.stage !== "Completed").length,
    overdue: applications.filter((a) => a.slaStatus === "overdue").length,
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      ARMDraft: "bg-indigo-500",
      RMReview: "bg-blue-500",
      CMReview: "bg-purple-500",
      RMResubmission: "bg-amber-500",
      THCRMDecision: "bg-pink-500",
      Completed: "bg-emerald-500",
    };
    return colors[stage] || "bg-gray-500";
  };

  const getSlaColor = (status: TransformedApp["slaStatus"]) => {
    const colors: Record<TransformedApp["slaStatus"], string> = {
      overdue: "text-red-600 font-semibold",
      due: "text-amber-600 font-medium",
      ontime: "text-gray-600",
      completed: "text-emerald-600 font-medium",
    };
    return colors[status] || "text-gray-600";
  };

  const getStatusIcon = (status: TransformedApp["slaStatus"]) => {
    if (status === "overdue")
      return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === "due")
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    if (status === "completed")
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-top">
            <div className="dashboard-logo-container">
              <Activity className="w-7 h-7 text-indigo-600" />
              <h1 className="dashboard-title">
                Applications Queue
              </h1>
            </div>
            <div className="dashboard-header-actions">
              <button
                className="dashboard-view-button"
                aria-label="View options"
              >
                <Filter className="w-4 h-4 text-gray-600" />
                View
              </button>
              <button className="dashboard-admin-link">
                Admin
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="dashboard-filters-container">
            <div className="dashboard-search-container">
              <div className="dashboard-search-wrapper">
                <Search className="dashboard-search-icon" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="dashboard-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <label className="dashboard-my-queue-label">
                <input
                  type="checkbox"
                  className="dashboard-my-queue-checkbox"
                  checked={myQueueOnly}
                  onChange={(e) => setMyQueueOnly(e.target.checked)}
                />
                <span className="dashboard-my-queue-text">My Queue</span>
              </label>
            </div>

            <div className="dashboard-dropdowns-container">
              <select
                className="dashboard-dropdown"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option>All Stages</option>
                <option>ARMDraft</option>
                <option>RMReview</option>
                <option>CMReview</option>
                <option>RMResubmission</option>
                <option>THCRMDecision</option>
                <option>Completed</option>
              </select>
              <select
                className="dashboard-dropdown"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Overdue</option>
                <option>Due Soon</option>
                <option>On Time</option>
                <option>Completed</option>
              </select>
              <select
                className="dashboard-dropdown"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option>All Products</option>
                <option>Business Loan</option>
                <option>Personal Loan</option>
                <option>Mortgage</option>
              </select>
              <select
                className="dashboard-dropdown"
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
              >
                {ownerOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats-container">
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-text-container">
                <p className="dashboard-stat-label">Total Applications</p>
                <p className="dashboard-stat-value">
                  {stats.total}
                </p>
              </div>
              <div className="dashboard-stat-icon-container">
                <FileText className="dashboard-stat-icon-blue" />
              </div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-text-container">
                <p className="dashboard-stat-label">Completed</p>
                <p className="dashboard-stat-value dashboard-stat-value-completed">
                  {stats.completed}
                </p>
              </div>
              <div className="dashboard-stat-icon-completed">
                <CheckCircle className="dashboard-stat-icon-emerald" />
              </div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-text-container">
                <p className="dashboard-stat-label">In Progress</p>
                <p className="dashboard-stat-value dashboard-stat-value-pending">
                  {stats.pending}
                </p>
              </div>
              <div className="dashboard-stat-icon-pending">
                <Clock className="dashboard-stat-icon-amber" />
              </div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-content">
              <div className="dashboard-stat-text-container">
                <p className="dashboard-stat-label">Overdue</p>
                <p className="dashboard-stat-value dashboard-stat-value-overdue">
                  {stats.overdue}
                </p>
              </div>
              <div className="dashboard-stat-icon-overdue">
                <AlertCircle className="dashboard-stat-icon-red" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="dashboard-results-count">
          Showing{" "}
          <span className="dashboard-results-count-highlight">
            {filteredApplications.length}
          </span>{" "}
          of{" "}
          <span className="dashboard-results-count-highlight">
            {applications.length}
          </span>{" "}
          applications
        </div>

        {/* Table */}
        <div className="dashboard-table-container">
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead className="dashboard-table-header">
                <tr>
                  <th className="dashboard-table-header-cell">
                    <input
                      type="checkbox"
                      className="dashboard-table-header-checkbox"
                      onChange={(e) =>
                        handleToggleAllSelection(e.target.checked)
                      }
                      checked={
                        selectedRows.length === filteredApplications.length &&
                        filteredApplications.length > 0
                      }
                    />
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Application ID
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Applicant
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Amount
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Current Stage
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Assignee
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Initiated By
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    SLA Status
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Docs
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row">
                    Last Update
                  </th>
                  <th className="dashboard-table-header-cell dashboard-table-header-row text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="dashboard-table-body">
                {filteredApplications.map((app: TransformedApp) => (
                  <tr
                    key={app.id}
                    className="dashboard-table-row"
                  >
                    <td className="dashboard-table-cell">
                      <input
                        type="checkbox"
                        className="dashboard-table-checkbox"
                        checked={selectedRows.includes(app.id)}
                        onChange={() => handleToggleRow(app.id)}
                      />
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="text-sm font-medium text-gray-900">{app.id}</span>
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="dashboard-table-applicant">{app.applicant}</span>
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="dashboard-table-amount">
                        ৳{app.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="dashboard-table-cell">
                      <span
                        className={`dashboard-table-stage-badge ${getStageColor(
                          app.stage
                        )}`}
                      >
                        {app.stage}
                      </span>
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="text-sm text-gray-900">{app.assignee}</span>
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="text-sm text-gray-600">{app.initiatedBy}</span>
                    </td>
                    <td className="dashboard-table-cell">
                      <div className="dashboard-table-sla-container">
                        {getStatusIcon(app.slaStatus)}
                        <span
                          className={`text-sm ${getSlaColor(app.slaStatus)}`}
                        >
                          {app.sla}
                        </span>
                      </div>
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="dashboard-table-docs-badge">
                        {app.docs || 0}
                      </span>
                    </td>
                    <td className="dashboard-table-cell">
                      <span className="text-sm text-gray-600">{app.lastUpdate}</span>
                    </td>
                    <td className="dashboard-table-cell text-center">
                      <button
                        onClick={() => {
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
                        }}
                        className="dashboard-table-action-button"
                      >
                        <Eye className="dashboard-table-action-icon" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;