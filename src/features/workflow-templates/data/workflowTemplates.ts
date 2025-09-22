// src/features/workflow-templates/data/workflowTemplates.ts
import type { WorkflowTemplate } from "../types/template.types";

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "loan-approval",
    name: "Loan Approval Process",
    description: "Standard loan application and approval workflow",
    category: "Credit",
    icon: "💰",
    estimatedTime: "3-5 days",
    workflow: {
      id: "loan_approval_template",
      version: 1,
      forms: {
        ApplicationForm: {
          fields: [
            {
              id: "borrower_name",
              name: "Borrower Name",
              type: "text",
              data: "{{ data.borrower.name }}",
              fieldActions: [{ operation: "validate" }],
            },
            {
              id: "loan_amount",
              name: "Loan Amount",
              type: "number",
              data: "{{ data.loan.amount }}",
              fieldActions: [{ operation: "validate" }],
            },
            {
              id: "loan_purpose",
              name: "Loan Purpose",
              type: "textarea",
              data: "{{ data.loan.purpose }}",
              fieldActions: [{ operation: "save" }],
            },
          ],
        },
        CreditReview: {
          fields: [
            {
              id: "credit_score",
              name: "Credit Score",
              type: "number",
              data: "{{ data.credit.score }}",
              fieldActions: [{ operation: "fetch" }],
            },
            {
              id: "risk_assessment",
              name: "Risk Assessment",
              type: "select",
              data: "{{ data.credit.risk }}",
              fieldActions: [{ operation: "calculate" }],
            },
          ],
        },
        ApprovalForm: {
          fields: [
            {
              id: "approval_decision",
              name: "Decision",
              type: "select",
              data: "{{ data.approval.decision }}",
              fieldActions: [{ operation: "save" }],
            },
            {
              id: "approval_notes",
              name: "Approval Notes",
              type: "textarea",
              data: "{{ data.approval.notes }}",
              fieldActions: [{ operation: "save" }],
            },
          ],
        },
      },
      states: {
        ApplicationDraft: {
          name: "Application Draft",
          type: "process",
          assignees: [], // Empty - to be filled by user
          forms: [
            {
              formName: "ApplicationForm",
              fieldOverrides: {
                borrower_name: { status: "editable", required: true },
                loan_amount: { status: "editable", required: true },
                loan_purpose: { status: "editable" },
              },
            },
          ],
          actions: {
            submit: {
              label: "Submit for Review",
              nextState: "InitialReview",
              operation: "Validate and submit application",
              handle: "center",
            },
          },
        },
        InitialReview: {
          name: "Initial Review",
          type: "process",
          assignees: [],
          forms: [
            {
              formName: "ApplicationForm",
              fieldOverrides: {
                borrower_name: { status: "readonly" },
                loan_amount: { status: "readonly" },
                loan_purpose: { status: "readonly" },
              },
            },
          ],
          actions: {
            reject: {
              label: "Reject",
              nextState: "ApplicationDraft",
              operation: "Return to applicant",
              handle: "left",
            },
            proceed: {
              label: "Proceed",
              nextState: "CreditCheck",
              operation: "Send for credit review",
              handle: "right",
            },
          },
        },
        CreditCheck: {
          name: "Credit Check",
          type: "decision",
          assignees: [],
          forms: [
            {
              formName: "CreditReview",
              fieldOverrides: {
                credit_score: { status: "actionable" },
                risk_assessment: { status: "editable", required: true },
              },
            },
          ],
          transitions: [
            {
              id: "high-risk",
              label: "High Risk",
              nextState: "ManualReview",
              operation: "Escalate to senior reviewer",
            },
            {
              id: "low-risk",
              label: "Low Risk",
              nextState: "FinalApproval",
              operation: "Auto-approve for final sign-off",
            },
          ],
        },
        ManualReview: {
          name: "Manual Review",
          type: "process",
          assignees: [],
          forms: [
            {
              formName: "ApplicationForm",
              fieldOverrides: {
                borrower_name: { status: "readonly" },
                loan_amount: { status: "readonly" },
                loan_purpose: { status: "readonly" },
              },
            },
            {
              formName: "CreditReview",
              fieldOverrides: {
                credit_score: { status: "readonly" },
                risk_assessment: { status: "readonly" },
              },
            },
          ],
          actions: {
            reject: {
              label: "Reject Application",
              nextState: "Rejected",
              operation: "Reject with reason",
              handle: "left",
            },
            approve: {
              label: "Override & Approve",
              nextState: "FinalApproval",
              operation: "Approve with override",
              handle: "right",
            },
          },
        },
        FinalApproval: {
          name: "Final Approval",
          type: "process",
          assignees: [],
          forms: [
            {
              formName: "ApprovalForm",
              fieldOverrides: {
                approval_decision: { status: "editable", required: true },
                approval_notes: { status: "editable" },
              },
            },
          ],
          actions: {
            approve: {
              label: "Approve Loan",
              nextState: "Approved",
              operation: "Finalize approval",
              handle: "center",
            },
          },
        },
        Approved: {
          name: "Approved",
          type: "process",
          assignees: [],
          forms: [],
          actions: {},
        },
        Rejected: {
          name: "Rejected",
          type: "process",
          assignees: [],
          forms: [],
          actions: {},
        },
      },
    },
  },
  {
    id: "account-opening",
    name: "Account Opening",
    description: "New customer account opening and KYC process",
    category: "Onboarding",
    icon: "📋",
    estimatedTime: "1-2 days",
    workflow: {
      id: "account_opening_template",
      version: 1,
      forms: {
        CustomerInfo: {
          fields: [
            {
              id: "customer_name",
              name: "Customer Name",
              type: "text",
              data: "{{ data.customer.name }}",
              fieldActions: [{ operation: "validate" }],
            },
            {
              id: "id_document",
              name: "ID Document",
              type: "file",
              data: "{{ data.customer.id }}",
              fieldActions: [{ operation: "upload" }],
            },
          ],
        },
        KYCForm: {
          fields: [
            {
              id: "kyc_status",
              name: "KYC Status",
              type: "select",
              data: "{{ data.kyc.status }}",
              fieldActions: [{ operation: "verify" }],
            },
          ],
        },
      },
      states: {
        CustomerApplication: {
          name: "Customer Application",
          type: "process",
          assignees: [],
          forms: [
            {
              formName: "CustomerInfo",
              fieldOverrides: {
                customer_name: { status: "editable", required: true },
                id_document: { status: "actionable", required: true },
              },
            },
          ],
          actions: {
            submit: {
              label: "Submit",
              nextState: "KYCVerification",
              operation: "Submit for KYC",
              handle: "center",
            },
          },
        },
        KYCVerification: {
          name: "KYC Verification",
          type: "decision",
          assignees: [],
          forms: [
            {
              formName: "KYCForm",
              fieldOverrides: {
                kyc_status: { status: "editable", required: true },
              },
            },
          ],
          transitions: [
            {
              id: "kyc-pass",
              label: "KYC Passed",
              nextState: "AccountCreation",
              operation: "Proceed to account creation",
            },
            {
              id: "kyc-fail",
              label: "KYC Failed",
              nextState: "CustomerApplication",
              operation: "Request additional documents",
            },
          ],
        },
        AccountCreation: {
          name: "Account Creation",
          type: "process",
          assignees: [],
          forms: [],
          actions: {
            create: {
              label: "Create Account",
              nextState: "AccountActive",
              operation: "Create and activate account",
              handle: "center",
            },
          },
        },
        AccountActive: {
          name: "Account Active",
          type: "process",
          assignees: [],
          forms: [],
          actions: {},
        },
      },
    },
  },
  {
    id: "document-verification",
    name: "Document Verification",
    description: "Document review and verification workflow",
    category: "Operations",
    icon: "📄",
    estimatedTime: "1 day",
    workflow: {
      id: "document_verification_template",
      version: 1,
      forms: {
        DocumentUpload: {
          fields: [
            {
              id: "document_type",
              name: "Document Type",
              type: "select",
              data: "{{ data.document.type }}",
              fieldActions: [],
            },
            {
              id: "document_file",
              name: "Document File",
              type: "file",
              data: "{{ data.document.file }}",
              fieldActions: [{ operation: "upload" }],
            },
          ],
        },
      },
      states: {
        DocumentSubmission: {
          name: "Document Submission",
          type: "process",
          assignees: [],
          forms: [
            {
              formName: "DocumentUpload",
              fieldOverrides: {
                document_type: { status: "editable", required: true },
                document_file: { status: "actionable", required: true },
              },
            },
          ],
          actions: {
            submit: {
              label: "Submit for Review",
              nextState: "DocumentReview",
              operation: "Submit document",
              handle: "center",
            },
          },
        },
        DocumentReview: {
          name: "Document Review",
          type: "decision",
          assignees: [],
          forms: [],
          transitions: [
            {
              id: "doc-valid",
              label: "Valid",
              nextState: "Verified",
              operation: "Mark as verified",
            },
            {
              id: "doc-invalid",
              label: "Invalid",
              nextState: "DocumentSubmission",
              operation: "Request resubmission",
            },
          ],
        },
        Verified: {
          name: "Verified",
          type: "process",
          assignees: [],
          forms: [],
          actions: {},
        },
      },
    },
  },
];
