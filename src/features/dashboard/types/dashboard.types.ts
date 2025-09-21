
// src/features/dashboard/types/dashboard.types.ts
export interface LoanApplication {
  id: string;
  applicant: string;
  product: string;
  amount: number;
  stage: string;
  assignee: string;
  initiatedBy: string;
  sla: string;
  slaStatus: "ontime" | "due" | "overdue" | "completed";
  lastUpdate: string;
  flags: string[];
  docs?: number;
}

export interface WorkflowState {
  assignees?: Array<{
    subjectId?: string;
    employeeName: string;
    role: string;
    email?: string;
    primary?: boolean;
    since?: string;
  }>;
  forms?: any[];
  actions?: Record<string, any>;
  history?: Array<{
    id?: string;
    at: string;
    byUser: {
      id?: string;
      name: string;
      role: string;
    };
    action: string;
    stateFrom?: string | null;
    stateTo?: string;
    changes?: any[];
  }>;
}

export interface WorkflowData {
  workflow: {
    id: string;
    version?: number;
    initialState?: string;
    currentState: string;
    currentStateEnteredAt: string;
    forms: Record<string, {
      fields: Array<{
        id: string;
        name: string;
        type: string;
        data: any;
        fieldActions?: Array<{ operation: string }>;
      }>;
    }>;
    states: Record<string, WorkflowState>;
  };
}