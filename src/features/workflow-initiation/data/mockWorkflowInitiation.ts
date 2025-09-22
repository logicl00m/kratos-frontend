// src/features/workflow-initiation/data/mockWorkflowInitiation.ts

export type WorkflowTemplateInfo = {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  lastUsed?: string;
  usageCount: number;
  status: 'active' | 'inactive' | 'deprecated';
  requiredFields: string[];
};

export const mockAvailableWorkflows: WorkflowTemplateInfo[] = [
  {
    id: "loan-approval",
    name: "Loan Approval Process",
    description: "Standard loan application and approval workflow for credit processing",
    category: "Credit",
    estimatedTime: "3-5 days",
    lastUsed: "2025-09-20T10:30:00+06:00",
    usageCount: 145,
    status: 'active',
    requiredFields: ["borrower_name", "loan_amount", "loan_purpose"]
  },
  {
    id: "account-opening",
    name: "Account Opening",
    description: "New customer account opening with KYC verification process",
    category: "Onboarding",
    estimatedTime: "1-2 days",
    lastUsed: "2025-09-21T14:15:00+06:00",
    usageCount: 89,
    status: 'active',
    requiredFields: ["customer_name", "id_document"]
  },
  {
    id: "document-verification",
    name: "Document Verification",
    description: "Document review and verification for compliance",
    category: "Operations",
    estimatedTime: "1 day",
    lastUsed: "2025-09-19T16:45:00+06:00",
    usageCount: 234,
    status: 'active',
    requiredFields: ["document_type", "document_file"]
  },
  {
    id: "credit-card-application",
    name: "Credit Card Application",
    description: "Process credit card applications with risk assessment",
    category: "Credit",
    estimatedTime: "2-3 days",
    lastUsed: "2025-09-18T11:20:00+06:00",
    usageCount: 67,
    status: 'active',
    requiredFields: ["applicant_name", "income", "employment_status"]
  },
  {
    id: "mortgage-application",
    name: "Mortgage Application",
    description: "Home loan application with property evaluation",
    category: "Credit",
    estimatedTime: "7-10 days",
    lastUsed: "2025-09-17T09:00:00+06:00",
    usageCount: 34,
    status: 'active',
    requiredFields: ["property_value", "down_payment", "income_proof"]
  },
  {
    id: "dispute-resolution",
    name: "Dispute Resolution",
    description: "Handle customer disputes and complaints",
    category: "Customer Service",
    estimatedTime: "3-5 days",
    lastUsed: "2025-09-21T08:30:00+06:00",
    usageCount: 56,
    status: 'active',
    requiredFields: ["dispute_type", "transaction_id", "customer_statement"]
  },
  {
    id: "vendor-onboarding",
    name: "Vendor Onboarding",
    description: "New vendor registration and compliance check",
    category: "Operations",
    estimatedTime: "5-7 days",
    lastUsed: "2025-09-15T13:45:00+06:00",
    usageCount: 23,
    status: 'active',
    requiredFields: ["vendor_name", "business_license", "tax_id"]
  },
  {
    id: "insurance-claim",
    name: "Insurance Claim Processing",
    description: "Process and evaluate insurance claims",
    category: "Insurance",
    estimatedTime: "5-10 days",
    lastUsed: "2025-09-16T15:30:00+06:00",
    usageCount: 78,
    status: 'active',
    requiredFields: ["policy_number", "claim_amount", "incident_report"]
  },
  {
    id: "risk-assessment",
    name: "Risk Assessment",
    description: "Comprehensive risk evaluation for high-value transactions",
    category: "Risk Management",
    estimatedTime: "2-4 days",
    usageCount: 12,
    status: 'inactive',
    requiredFields: ["transaction_value", "risk_factors", "mitigation_plan"]
  },
  {
    id: "legacy-loan-process",
    name: "Legacy Loan Process",
    description: "Old loan processing workflow (being phased out)",
    category: "Credit",
    estimatedTime: "5-7 days",
    usageCount: 5,
    status: 'deprecated',
    requiredFields: ["applicant_name", "loan_amount"]
  }
];

export type WorkflowInitiationResponse = {
  success: boolean;
  workflowId?: string;
  message: string;
  redirectUrl?: string;
};