// src/features/dashboard/utils/apiTransformer.ts
import type { ApplicationInstance } from "@lib/api/types";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";

/**
 * Transform API ApplicationInstance to LoanApplication format
 */
export function transformApiApplicationToLoanApplication(
  app: ApplicationInstance
): LoanApplication {
  // Extract applicant name from data
  const applicantName = 
    (app.data.applicantName as string) || 
    (app.data.customerName as string) || 
    (app.data.clientName as string) || 
    "Unknown Applicant";

  // Extract product type
  const product = 
    (app.data.productType as string) || 
    (app.data.loanType as string) || 
    "Loan Application";

  // Extract amount
  const amount = 
    (app.data.amount as number) || 
    (app.data.loanAmount as number) || 
    (app.data.requestedAmount as number) || 
    0;

  // Determine SLA status based on metadata
  let slaStatus: "ontime" | "due" | "overdue" | "completed" = "ontime";
  if (app.metadata.slaStatus === "overdue") {
    slaStatus = "overdue";
  } else if (app.metadata.slaStatus === "due") {
    slaStatus = "due";
  } else if (app.metadata.slaStatus === "completed") {
    slaStatus = "completed";
  }

  // Calculate SLA text
  let sla = "";
  const createdAt = new Date(app.metadata.createdAt);
  const now = new Date();
  const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  if (app.status === "completed") {
    sla = "Completed";
  } else {
    // Default SLA calculation - can be enhanced based on business rules
    const slaHours = 48; // Default 48 hours
    const remainingHours = slaHours - hoursElapsed;
    
    if (remainingHours < 0) {
      sla = `Overdue ${Math.abs(Math.round(remainingHours))}h`;
    } else if (remainingHours < 12) {
      sla = `Due in ${Math.round(remainingHours)}h`;
    } else {
      sla = `Due in ${Math.round(remainingHours)}h`;
    }
  }

  return {
    id: app.id,
    applicant: applicantName,
    product: product,
    amount: amount,
    stage: app.currentState,
    assignee: app.assignee || "Unassigned",
    initiatedBy: app.metadata.createdBy || "System",
    sla: sla,
    slaStatus: slaStatus,
    lastUpdate: new Date(app.metadata.updatedAt || app.metadata.createdAt).toLocaleDateString("en-GB"),
    flags: [], // TODO: Extract flags from app data or history
    docs: 0 // TODO: Calculate document count from app data
  };
}

/**
 * Transform array of API ApplicationInstances to LoanApplications
 */
export function transformApiApplicationsToLoanApplications(
  apps: ApplicationInstance[]
): LoanApplication[] {
  return apps.map(transformApiApplicationToLoanApplication);
}