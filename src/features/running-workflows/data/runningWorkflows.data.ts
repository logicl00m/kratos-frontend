// src/features/running-workflows/data/runningWorkflows.data.ts

import type { RunningWorkflowsData } from "../types/runningWorkflow.types";

export const runningWorkflowsData: RunningWorkflowsData = {
  lastUpdated: "2025-01-15T10:30:00Z",
  instances: [
    {
      id: "WF-2025-001",
      workflowName: "Loan Application Workflow",
      currentState: "RMReview",
      status: "active",
      createdAt: "2025-01-10T09:00:00Z",
      updatedAt: "2025-01-14T16:45:00Z",
      owner: "john.doe@company.com",
      data: {
        proposal_details: "Business expansion loan for retail store chain. Amount: $500,000. Term: 5 years.",
        supporting_documents: ["business_plan.pdf", "financial_statements.xlsx", "collateral_docs.pdf"],
        loan_amount: 500000,
        loan_term_months: 60,
        applicant_name: "ABC Retail Corp",
        application_date: "2025-01-10",
        arm_comments: "Initial review completed. Documents verified.",
      },
      history: [
        {
          state: "ARMDraft",
          action: "SubmitToRM",
          timestamp: "2025-01-10T09:00:00Z",
          performedBy: "john.doe@company.com",
          comments: "Application submitted for RM review",
          data: {
            proposal_details: "Business expansion loan for retail store chain. Amount: $500,000. Term: 5 years.",
          }
        },
        {
          state: "RMReview",
          timestamp: "2025-01-14T16:45:00Z",
          performedBy: "jane.smith@company.com",
          comments: "Under review by relationship manager"
        }
      ]
    },
    {
      id: "WF-2025-002",
      workflowName: "Loan Application Workflow",
      currentState: "BusinessReview",
      status: "active",
      createdAt: "2025-01-08T10:30:00Z",
      updatedAt: "2025-01-13T14:20:00Z",
      owner: "alice.johnson@company.com",
      data: {
        proposal_details: "Equipment financing for manufacturing unit. Amount: $250,000. Term: 3 years.",
        supporting_documents: ["equipment_quote.pdf", "purchase_order.pdf"],
        loan_amount: 250000,
        loan_term_months: 36,
        applicant_name: "XYZ Manufacturing Ltd",
        application_date: "2025-01-08",
        rm_decision: "Approved",
        rm_remarks: "Strong financials, approved for business review",
        arm_comments: "All documents verified and complete",
      },
      history: [
        {
          state: "ARMDraft",
          action: "SubmitToRM",
          timestamp: "2025-01-08T10:30:00Z",
          performedBy: "alice.johnson@company.com",
          comments: "Initial submission"
        },
        {
          state: "RMReview",
          action: "RMFinalize",
          timestamp: "2025-01-12T11:00:00Z",
          performedBy: "bob.wilson@company.com",
          comments: "Approved and forwarded to business review",
          data: {
            rm_decision: "Approved",
            rm_remarks: "Strong financials, approved for business review"
          }
        },
        {
          state: "BusinessReview",
          timestamp: "2025-01-13T14:20:00Z",
          performedBy: "tom.brown@company.com",
          comments: "Business review in progress"
        }
      ]
    },
    {
      id: "WF-2025-003",
      workflowName: "Loan Application Workflow",
      currentState: "Completed",
      status: "completed",
      createdAt: "2025-01-05T08:00:00Z",
      updatedAt: "2025-01-12T17:30:00Z",
      owner: "sarah.davis@company.com",
      data: {
        proposal_details: "Working capital loan. Amount: $100,000. Term: 2 years.",
        supporting_documents: ["cash_flow.pdf", "bank_statements.pdf"],
        loan_amount: 100000,
        loan_term_months: 24,
        applicant_name: "Quick Mart Stores",
        application_date: "2025-01-05",
        rm_decision: "Approved",
        rm_remarks: "Good credit history, approved",
        business_approval: "Approved",
        final_amount: 100000,
        interest_rate: 8.5,
      },
      history: [
        {
          state: "ARMDraft",
          action: "SubmitToRM",
          timestamp: "2025-01-05T08:00:00Z",
          performedBy: "sarah.davis@company.com"
        },
        {
          state: "RMReview",
          action: "RMFinalize",
          timestamp: "2025-01-09T10:00:00Z",
          performedBy: "mike.lee@company.com",
          data: {
            rm_decision: "Approved",
            rm_remarks: "Good credit history, approved"
          }
        },
        {
          state: "BusinessReview",
          action: "THApprove",
          timestamp: "2025-01-12T17:30:00Z",
          performedBy: "director@company.com",
          comments: "Final approval granted"
        },
        {
          state: "Completed",
          timestamp: "2025-01-12T17:30:00Z",
          performedBy: "system",
          comments: "Workflow completed successfully"
        }
      ]
    },
    {
      id: "WF-2025-004",
      workflowName: "Loan Application Workflow",
      currentState: "ARMDraft",
      status: "rejected",
      createdAt: "2025-01-11T13:00:00Z",
      updatedAt: "2025-01-14T10:00:00Z",
      owner: "peter.wong@company.com",
      data: {
        proposal_details: "Personal loan for home renovation. Amount: $75,000.",
        supporting_documents: ["income_proof.pdf"],
        loan_amount: 75000,
        applicant_name: "John Customer",
        application_date: "2025-01-11",
        rm_decision: "Rejected",
        rm_remarks: "Insufficient documentation and credit score below threshold",
      },
      history: [
        {
          state: "ARMDraft",
          action: "SubmitToRM",
          timestamp: "2025-01-11T13:00:00Z",
          performedBy: "peter.wong@company.com"
        },
        {
          state: "RMReview",
          action: "RMReject",
          timestamp: "2025-01-14T10:00:00Z",
          performedBy: "jane.smith@company.com",
          comments: "Application rejected, sent back to ARM",
          data: {
            rm_decision: "Rejected",
            rm_remarks: "Insufficient documentation and credit score below threshold"
          }
        },
        {
          state: "ARMDraft",
          timestamp: "2025-01-14T10:00:00Z",
          performedBy: "system",
          comments: "Returned for revision"
        }
      ]
    },
    {
      id: "WF-2025-005",
      workflowName: "Loan Application Workflow",
      currentState: "RMReview",
      status: "pending",
      createdAt: "2025-01-13T15:00:00Z",
      updatedAt: "2025-01-14T09:00:00Z",
      owner: "emma.white@company.com",
      data: {
        proposal_details: "Construction loan for commercial property. Amount: $1,200,000. Term: 7 years.",
        supporting_documents: ["construction_plan.pdf", "permits.pdf", "contractor_quotes.pdf"],
        loan_amount: 1200000,
        loan_term_months: 84,
        applicant_name: "Prime Developers Inc",
        application_date: "2025-01-13",
        arm_comments: "Large loan amount, requires detailed review",
        priority: "high",
      },
      history: [
        {
          state: "ARMDraft",
          action: "SubmitToRM",
          timestamp: "2025-01-13T15:00:00Z",
          performedBy: "emma.white@company.com",
          comments: "High priority application submitted"
        },
        {
          state: "RMReview",
          timestamp: "2025-01-14T09:00:00Z",
          performedBy: "senior.rm@company.com",
          comments: "Awaiting additional documentation from client"
        }
      ]
    }
  ]
};