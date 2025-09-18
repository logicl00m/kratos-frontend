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
      priority: "high",
      createdAt: "2025-01-10T09:00:00Z",
      updatedAt: "2025-01-14T16:45:00Z",
      dueDate: "2025-01-16T18:00:00Z",
      owner: {
        id: "u_arm_001",
        name: "John Doe",
        role: "ARM",
        email: "john.doe@company.com",
        department: "Credit Operations"
      },
      currentAssignee: {
        id: "u_rm_001",
        name: "Jane Smith",
        role: "RM",
        email: "jane.smith@company.com",
        department: "Relationship Management"
      },
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
          id: "evt_0001",
          timestamp: "2025-01-10T09:00:00Z",
          actor: {
            id: "u_arm_001",
            name: "John Doe",
            role: "ARM",
            email: "john.doe@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "SubmitToRM",
            from: "ARMDraft",
            to: "RMReview"
          },
          changes: [
            {
              fieldId: "proposal_details",
              fieldName: "Proposal Details",
              oldValue: null,
              newValue: "Business expansion loan for retail store chain. Amount: $500,000. Term: 5 years.",
              changeType: "CREATE"
            }
          ],
          validation: {
            passed: true,
            errors: []
          },
          notes: "Application submitted for RM review",
          metadata: {
            source: "UI"
          }
        },
        {
          id: "evt_0002",
          timestamp: "2025-01-14T16:45:00Z",
          actor: {
            id: "u_rm_001",
            name: "Jane Smith",
            role: "RM",
            email: "jane.smith@company.com"
          },
          event: {
            type: "COMMENT_ADDED"
          },
          notes: "Under review by relationship manager"
        }
      ],
      metrics: {
        totalDuration: 384300000,
        statesDuration: {
          "ARMDraft": 0,
          "RMReview": 384300000
        },
        revisitCount: {
          "ARMDraft": 1,
          "RMReview": 1
        }
      },
      context: {
        businessUnit: "Corporate Banking",
        category: "Business Expansion",
        tags: ["retail", "expansion", "high-value"],
        externalReferences: {
          crmId: "CRM-2025-001"
        }
      }
    },
    {
      id: "WF-2025-002",
      workflowName: "Loan Application Workflow",
      currentState: "BusinessReview",
      status: "active",
      priority: "medium",
      createdAt: "2025-01-08T10:30:00Z",
      updatedAt: "2025-01-13T14:20:00Z",
      owner: {
        id: "u_arm_002",
        name: "Alice Johnson",
        role: "ARM",
        email: "alice.johnson@company.com"
      },
      currentAssignee: {
        id: "u_bh_001",
        name: "Tom Brown",
        role: "Business Head",
        email: "tom.brown@company.com"
      },
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
          id: "evt_0001",
          timestamp: "2025-01-08T10:30:00Z",
          actor: {
            id: "u_arm_002",
            name: "Alice Johnson",
            role: "ARM",
            email: "alice.johnson@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "SubmitToRM",
            to: "RMReview"
          },
          notes: "Initial submission"
        },
        {
          id: "evt_0002",
          timestamp: "2025-01-12T11:00:00Z",
          actor: {
            id: "u_rm_002",
            name: "Bob Wilson",
            role: "RM",
            email: "bob.wilson@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "RMFinalize",
            from: "RMReview",
            to: "BusinessReview"
          },
          changes: [
            {
              fieldId: "rm_decision",
              fieldName: "RM Decision",
              oldValue: null,
              newValue: "Approved",
              changeType: "UPDATE"
            },
            {
              fieldId: "rm_remarks",
              fieldName: "RM Remarks",
              oldValue: null,
              newValue: "Strong financials, approved for business review",
              changeType: "UPDATE"
            }
          ],
          validation: {
            passed: true,
            errors: []
          },
          notes: "Approved and forwarded to business review"
        },
        {
          id: "evt_0003",
          timestamp: "2025-01-13T14:20:00Z",
          actor: {
            id: "u_bh_001",
            name: "Tom Brown",
            role: "Business Head",
            email: "tom.brown@company.com"
          },
          event: {
            type: "COMMENT_ADDED"
          },
          notes: "Business review in progress"
        }
      ],
      metrics: {
        totalDuration: 450600000,
        statesDuration: {
          "ARMDraft": 0,
          "RMReview": 345600000,
          "BusinessReview": 105000000
        }
      }
    },
    {
      id: "WF-2025-003",
      workflowName: "Loan Application Workflow",
      currentState: "Completed",
      status: "completed",
      priority: "low",
      createdAt: "2025-01-05T08:00:00Z",
      updatedAt: "2025-01-12T17:30:00Z",
      completedAt: "2025-01-12T17:30:00Z",
      owner: {
        id: "u_arm_003",
        name: "Sarah Davis",
        role: "ARM",
        email: "sarah.davis@company.com"
      },
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
          id: "evt_0001",
          timestamp: "2025-01-05T08:00:00Z",
          actor: {
            id: "u_arm_003",
            name: "Sarah Davis",
            role: "ARM",
            email: "sarah.davis@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "SubmitToRM",
            to: "RMReview"
          }
        },
        {
          id: "evt_0002",
          timestamp: "2025-01-09T10:00:00Z",
          actor: {
            id: "u_rm_003",
            name: "Mike Lee",
            role: "RM",
            email: "mike.lee@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "RMFinalize",
            from: "RMReview",
            to: "BusinessReview"
          },
          changes: [
            {
              fieldId: "rm_decision",
              oldValue: null,
              newValue: "Approved",
              changeType: "UPDATE"
            }
          ]
        },
        {
          id: "evt_0003",
          timestamp: "2025-01-12T17:30:00Z",
          actor: {
            id: "u_dir_001",
            name: "Director",
            role: "DIRECTOR",
            email: "director@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "THApprove",
            from: "BusinessReview",
            to: "Completed"
          },
          notes: "Final approval granted"
        },
        {
          id: "evt_0004",
          timestamp: "2025-01-12T17:30:00Z",
          actor: {
            id: "system",
            name: "System",
            role: "SYSTEM"
          },
          event: {
            type: "STATE_TRANSITION",
            to: "Completed"
          },
          notes: "Workflow completed successfully"
        }
      ]
    },
    {
      id: "WF-2025-004",
      workflowName: "Loan Application Workflow",
      currentState: "ARMDraft",
      status: "rejected",
      priority: "low",
      createdAt: "2025-01-11T13:00:00Z",
      updatedAt: "2025-01-14T10:00:00Z",
      owner: {
        id: "u_arm_004",
        name: "Peter Wong",
        role: "ARM",
        email: "peter.wong@company.com"
      },
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
          id: "evt_0001",
          timestamp: "2025-01-11T13:00:00Z",
          actor: {
            id: "u_arm_004",
            name: "Peter Wong",
            role: "ARM",
            email: "peter.wong@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "SubmitToRM",
            to: "RMReview"
          }
        },
        {
          id: "evt_0002",
          timestamp: "2025-01-14T10:00:00Z",
          actor: {
            id: "u_rm_001",
            name: "Jane Smith",
            role: "RM",
            email: "jane.smith@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "RMReject",
            from: "RMReview",
            to: "ARMDraft"
          },
          changes: [
            {
              fieldId: "rm_decision",
              newValue: "Rejected",
              oldValue: null,
              changeType: "UPDATE"
            }
          ],
          validation: {
            passed: false,
            errors: ["Insufficient documentation", "Credit score below threshold"]
          },
          notes: "Application rejected, sent back to ARM"
        },
        {
          id: "evt_0003",
          timestamp: "2025-01-14T10:00:00Z",
          actor: {
            id: "system",
            name: "System",
            role: "SYSTEM"
          },
          event: {
            type: "STATE_TRANSITION",
            to: "ARMDraft"
          },
          notes: "Returned for revision"
        }
      ]
    },
    {
      id: "WF-2025-005",
      workflowName: "Loan Application Workflow",
      currentState: "RMReview",
      status: "pending",
      priority: "critical",
      createdAt: "2025-01-13T15:00:00Z",
      updatedAt: "2025-01-14T09:00:00Z",
      dueDate: "2025-01-15T18:00:00Z",
      owner: {
        id: "u_arm_005",
        name: "Emma White",
        role: "ARM",
        email: "emma.white@company.com"
      },
      currentAssignee: {
        id: "u_srm_001",
        name: "Senior RM",
        role: "Senior RM",
        email: "senior.rm@company.com"
      },
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
          id: "evt_0001",
          timestamp: "2025-01-13T15:00:00Z",
          actor: {
            id: "u_arm_005",
            name: "Emma White",
            role: "ARM",
            email: "emma.white@company.com"
          },
          event: {
            type: "STATE_TRANSITION",
            action: "SubmitToRM",
            to: "RMReview"
          },
          notes: "High priority application submitted"
        },
        {
          id: "evt_0002",
          timestamp: "2025-01-14T09:00:00Z",
          actor: {
            id: "u_srm_001",
            name: "Senior RM",
            role: "Senior RM",
            email: "senior.rm@company.com"
          },
          event: {
            type: "COMMENT_ADDED"
          },
          notes: "Awaiting additional documentation from client"
        }
      ]
    }
  ]
};