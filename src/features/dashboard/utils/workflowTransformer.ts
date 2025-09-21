// src/features/dashboard/utils/workflowTransformer.ts
import type { WorkflowData, LoanApplication } from "@features/dashboard/types/dashboard.types";

function extractAmount(workflow: WorkflowData): number {
  // Search through all form fields for amount-related fields using regex
  const forms = workflow.workflow.forms;
  let amount = 0;
  
  Object.values(forms).forEach(form => {
    form.fields.forEach(field => {
      // Match any field containing 'amount' in its id
      if (field.id.match(/amount/i) && 
          field.type === 'number' && 
          field.data) {
        amount = Math.max(amount, Number(field.data));
      }
    });
  });
  
  return amount;
}

function extractApplicantName(workflow: WorkflowData): string {
  // Search for applicant name in form fields
  const forms = workflow.workflow.forms;
  
  for (const form of Object.values(forms)) {
    for (const field of form.fields) {
      if ((field.id.match(/applicant|name/i)) && 
          field.type === 'text' && 
          field.data) {
        return String(field.data);
      }
    }
  }
  
  return 'Unknown Applicant';
}

function extractProduct(workflow: WorkflowData): string {
  // Map workflow ID or extract from form fields
  const workflowId = workflow.workflow.id.toLowerCase();
  
  if (workflowId.includes('loan')) {
    return 'Business Loan';
  }
  
  // Try to find product type in form fields
  const forms = workflow.workflow.forms;
  for (const form of Object.values(forms)) {
    for (const field of form.fields) {
      if (field.id.toLowerCase().includes('product') && field.data) {
        return String(field.data);
      }
    }
  }
  
  return 'Loan Application';
}

function getCurrentAssignee(workflow: WorkflowData): string {
  const currentState = workflow.workflow.currentState;
  const stateData = workflow.workflow.states[currentState];
  
  if (stateData?.assignees && stateData.assignees.length > 0) {
    return stateData.assignees[0].employeeName;
  }
  
  return 'Unassigned';
}

function getInitiatedBy(workflow: WorkflowData): string {
  // Find the first assignee from any state
  const states = workflow.workflow.states;
  
  // Check first state's history for creator
  for (const state of Object.values(states)) {
    if (state.history && state.history.length > 0) {
      const firstEvent = state.history.find(evt => 
        evt.action === 'create' && evt.byUser.name !== 'Workflow Engine'
      );
      if (firstEvent) {
        return firstEvent.byUser.name;
      }
    }
  }
  
  // Fallback to first assignee found
  for (const state of Object.values(states)) {
    if (state.assignees && state.assignees.length > 0) {
      return state.assignees[0].employeeName;
    }
  }
  
  return 'System';
}

function calculateSLA(workflow: WorkflowData): { 
  sla: string; 
  slaStatus: 'ontime' | 'due' | 'overdue' | 'completed' 
} {
  const enteredAt = new Date(workflow.workflow.currentStateEnteredAt);
  const now = new Date();
  const hoursElapsed = (now.getTime() - enteredAt.getTime()) / (1000 * 60 * 60);
  
  // Define SLA hours for each state
  const stateSLAs: Record<string, number> = {
    'ARMDraft': 24,
    'RMReview': 48,
    'CMReview': 36,
    'RMResubmission': 24,
    'THCRMDecision': 12,
    'Completed': 999999
  };
  
  const slaHours = stateSLAs[workflow.workflow.currentState] || 48;
  const remainingHours = slaHours - hoursElapsed;
  
  if (workflow.workflow.currentState === 'Completed') {
    return { sla: 'Completed', slaStatus: 'completed' };
  }
  
  if (remainingHours < 0) {
    return { 
      sla: `Overdue ${Math.abs(Math.round(remainingHours))}h`, 
      slaStatus: 'overdue' 
    };
  } else if (remainingHours < 12) {
    return { 
      sla: `Due in ${Math.round(remainingHours)}h`, 
      slaStatus: 'due' 
    };
  } else {
    return { 
      sla: `Due in ${Math.round(remainingHours)}h`, 
      slaStatus: 'ontime' 
    };
  }
}

function getDocumentCount(workflow: WorkflowData): number {
  let docCount = 0;
  const forms = workflow.workflow.forms;
  
  Object.values(forms).forEach(form => {
    form.fields.forEach(field => {
      if (field.type === 'file' && Array.isArray(field.data)) {
        docCount += field.data.length;
      }
    });
  });
  
  return docCount;
}

function transformWorkflowToApplication(workflow: WorkflowData): LoanApplication {
  const { sla, slaStatus } = calculateSLA(workflow);
  
  return {
    id: workflow.workflow.id,
    applicant: extractApplicantName(workflow),
    product: extractProduct(workflow),
    amount: extractAmount(workflow),
    stage: workflow.workflow.currentState,
    assignee: getCurrentAssignee(workflow),
    initiatedBy: getInitiatedBy(workflow),
    sla,
    slaStatus,
    lastUpdate: new Date(workflow.workflow.currentStateEnteredAt).toLocaleDateString('en-GB'),
    flags: [],
    docs: getDocumentCount(workflow)
  };
}

export function transformWorkflowsToApplications(workflows: WorkflowData[]): LoanApplication[] {
  return workflows.map(transformWorkflowToApplication);
}