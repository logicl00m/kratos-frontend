// src/features/application-details/components/ApplicationDetails.tsx
import React from "react";
import type {
  LoanApplication,
  WorkflowData,
} from "@features/dashboard/types/dashboard.types";
import { ApplicationHeader } from "./ApplicationHeader";
import WorkflowProgress from "./WorkflowProgress";
import ContactInfo from "./ContactInfo";
import FinancialDetails from "./FinancialDetails";
import RiskSnapshot from "./RiskSnapshot";
import DocumentsSection from "./DocumentsSection";
import AuditTrail from "./AuditTrail";
import "./ApplicationDetails.css";

interface AppDocument {
  name: string;
  filename: string;
  status: "complete" | "review" | "pending";
  required: boolean;
}

interface AuditEntry {
  user: string;
  action: "action" | "system";
  message: string;
  time: string;
}

interface WorkflowStage {
  name: string;
  status: "completed" | "current" | "pending";
}

interface ApplicationDetailsProps {
  // Backwards compatible: either receive a transformed `application` or the
  // raw `workflowData` object coming from the Dashboard.
  application?: LoanApplication;
  workflowData?: WorkflowData | null;
  onBack: () => void;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  workflowData,
  onBack,
}) => {
  // Derive a LoanApplication-like object from workflowData when needed
  const app: LoanApplication | null = React.useMemo(() => {
    if (application) return application;
    if (!workflowData) return null;

    const src = workflowData.workflow;
    let applicant = "Unknown";
    let amount = 0;
    try {
      Object.values(src.forms || {}).forEach((form: any) => {
        form.fields?.forEach((field: any) => {
          if (
            field.id?.toString().match(/applicant|name/i) &&
            String(field.type).toLowerCase() === "text" &&
            field.data
          ) {
            applicant = String(field.data);
          }
          if (
            field.id?.toString().match(/amount/i) &&
            String(field.type).toLowerCase() === "number" &&
            field.data
          ) {
            amount = Math.max(amount, Number(field.data));
          }
        });
      });
    } catch (err) {
      // ignore
    }

    return {
      id: src.id || "",
      applicant,
      product: "Business Loan",
      amount,
      stage: src.currentState || "",
      assignee:
        src.states?.[src.currentState]?.assignees?.[0]?.employeeName ||
        "Unassigned",
      initiatedBy: getInitiatedBy(src),
      sla: "",
      slaStatus: "ontime",
      lastUpdate: new Date(
        src.currentStateEnteredAt || Date.now()
      ).toLocaleDateString("en-GB"),
      flags: [],
      docs: 0,
    } as LoanApplication;
  }, [application, workflowData]);

  if (!app) {
    return (
      <div className="no-workflow-data">
        <h3 className="dark:text-slate-100">No workflow data available</h3>
      </div>
    );
  }

  const workflow = workflowData?.workflow ?? null;
  const applicantName = app.applicant;
  const amount = app.amount;
  const currentStateName = workflow?.currentState ?? app.stage;
  const currentStateObj = workflow?.states?.[currentStateName];

  // Create application object for header
  const applicationForHeader: LoanApplication = app;

  // Define workflow stages order and compute current index
  const stateOrder = [
    "ARMDraft",
    "RMReview",
    "CMReview",
    "THCRMDecision",
    "Completed",
  ];
  const currentIndex = workflow ? stateOrder.indexOf(currentStateName) : -1;

  const workflowStages: WorkflowStage[] = [
    {
      name: "Application",
      status: currentIndex >= 0 ? "completed" : "current",
    },
    {
      name: "Verification",
      status:
        currentIndex >= 1
          ? "completed"
          : currentIndex === 0
          ? "current"
          : "pending",
    },
    {
      name: "Underwriting",
      status:
        currentIndex >= 2
          ? "completed"
          : currentIndex === 1
          ? "current"
          : "pending",
    },
    {
      name: "Decision",
      status:
        currentIndex >= 3
          ? "completed"
          : currentIndex === 2 || currentIndex === 3
          ? "current"
          : "pending",
    },
    {
      name: "Disbursement",
      status:
        currentIndex >= 4
          ? "completed"
          : currentIndex === 4
          ? "current"
          : "pending",
    },
  ];

  // Extract supporting documents
  const supportingDocs: any[] = [];
  if (workflow) {
    Object.values(workflow.forms || {}).forEach((form: any) => {
      form.fields?.forEach((field: any) => {
        if (field.id === "supportingDocuments" && Array.isArray(field.data))
          supportingDocs.push(...field.data);
      });
    });
  }

  const documents: AppDocument[] = [
    {
      name: "Identity Verification",
      filename: "id_verification.pdf",
      status: "complete",
      required: true,
    },
    {
      name: "Income Proof",
      filename: "income_proof.pdf",
      status: "complete",
      required: true,
    },
    ...supportingDocs.map((doc) => ({
      name: formatDocumentName(doc.name),
      filename: doc.name,
      status: "complete" as const,
      required: true,
    })),
    {
      name: "Bank Statements",
      filename:
        workflow?.currentState === "Completed" ? "bank_statements.pdf" : "",
      status:
        workflow?.currentState === "Completed"
          ? "complete"
          : ("review" as const),
      required: true,
    },
  ];

  if (workflow?.currentState !== "Completed") {
    documents.push(
      {
        name: "Credit Report",
        filename: "",
        status: "pending",
        required: true,
      },
      {
        name: "Employment Letter",
        filename: "",
        status: "pending",
        required: false,
      }
    );
  }

  // Build audit trail
  let auditTrail: AuditEntry[] = [];
  if (workflow) {
    Object.entries(workflow.states || {}).forEach(([_, stateData]: any) => {
      if (stateData.history) {
        stateData.history.forEach((entry: any) => {
          auditTrail.push({
            user: entry.byUser.name,
            action: entry.byUser.role === "SYSTEM" ? "system" : "action",
            message: formatAuditMessage(entry.action, entry.stateTo),
            time: new Date(entry.at).toLocaleString("en-US", {
              dateStyle: "short",
              timeStyle: "medium",
            }),
          });
        });
      }
    });

    if (currentStateObj?.assignees?.[0]) {
      auditTrail.push({
        user: currentStateObj.assignees[0].employeeName,
        action: "action",
        message: `Assigned to ${mapStateToDisplayName(currentStateName)}`,
        time: new Date(
          currentStateObj.assignees[0].since || workflow.currentStateEnteredAt
        ).toLocaleString("en-US", { dateStyle: "short", timeStyle: "medium" }),
      });
    }

    auditTrail.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  } else {
    auditTrail = [
      {
        user: "System",
        action: "system",
        message: "Application submitted",
        time: new Date().toLocaleString(),
      },
    ];
  }

  return (
    <div className="application-details-container">
      <ApplicationHeader application={applicationForHeader} onBack={onBack} />
      <WorkflowProgress workflowStages={workflowStages} />
      <div className="application-details-content">
        <div className="application-details-grid">
          <ContactInfo applicant={applicantName} />
          <FinancialDetails amount={amount} />
          <RiskSnapshot />
        </div>

        <div className="application-details-documents-grid">
          <div className="application-details-section">
            <DocumentsSection documents={documents} />
          </div>
          <div className="application-details-section">
            <AuditTrail auditTrail={auditTrail.slice(0, 10)} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function mapStateToDisplayName(state: string): string {
  const stateMap: Record<string, string> = {
    ARMDraft: "Application",
    RMReview: "Review",
    CMReview: "Underwriting",
    RMResubmission: "Resubmission",
    THCRMDecision: "Decision",
    Completed: "Disbursement",
  };
  return stateMap[state] || state;
}

function formatDocumentName(filename: string): string {
  return filename
    .replace(/_/g, " ")
    .replace(".pdf", "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatAuditMessage(action: string, stateTo?: string | null): string {
  const messages: Record<string, string> = {
    create: "Application created",
    submitToRm: "Application submitted for RM review",
    rmFinalize: "RM finalized proposal",
    rmReject: "RM returned application for correction",
    cmRecommend: "CM recommended for approval",
    cmObservation: "CM returned with observations",
    thcrmApprove: "Application approved for full amount",
    thcrmSendBack: "Sent back for correction",
    updateFields: "Fields updated",
    enterState: stateTo
      ? `Moved to ${mapStateToDisplayName(stateTo)}`
      : "State changed",
  };
  return messages[action] || action.replace(/([A-Z])/g, " $1").toLowerCase();
}

function getInitiatedBy(workflow: any): string {
  // Check for creator in history
  for (const state of Object.values(workflow.states)) {
    const stateData = state as any;
    if (stateData.history) {
      const createEvent = stateData.history.find(
        (evt: any) =>
          evt.action === "create" && evt.byUser.name !== "Workflow Engine"
      );
      if (createEvent) return createEvent.byUser.name;
    }
  }

  // Fallback to first assignee
  for (const state of Object.values(workflow.states)) {
    const stateData = state as any;
    if (stateData.assignees?.[0]) return stateData.assignees[0].employeeName;
  }

  return "System";
}

export default ApplicationDetails;
