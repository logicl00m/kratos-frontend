// src/features/dashboard/data/mockWorkflowData.ts
import type { WorkflowData } from "@features/dashboard/types/dashboard.types";

export const mockWorkflowData: WorkflowData[] = [
  {
    workflow: {
      id: "LN-2025-001",
      currentState: "RMReview",
      currentStateEnteredAt: "2025-09-21T09:22:31+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "ABC Textiles Ltd.",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 50000000,
            }
          ]
        },
        proposalDocs: {
          fields: [
            {
              id: "supportingDocuments",
              name: "Supporting Documents",
              type: "file",
              data: [
                { name: "audited_financials_2024.pdf" },
                { name: "trade_license.pdf" },
                { name: "bank_statement.pdf" }
              ]
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Sadia Rahman",
              role: "ARM",
              since: "2025-09-21T09:00:05+06:00"
            }
          ]
        },
        RMReview: {
          assignees: [
            {
              employeeName: "Fahim Ahmed",
              role: "RM",
              since: "2025-09-21T10:40:00+06:00"
            }
          ]
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-002",
      currentState: "CMReview",
      currentStateEnteredAt: "2025-09-20T14:30:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "XYZ Manufacturing Ltd.",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 25000000,
            }
          ]
        },
        proposalDocs: {
          fields: [
            {
              id: "supportingDocuments",
              name: "Supporting Documents",
              type: "file",
              data: [
                { name: "financial_report.pdf" },
                { name: "collateral_docs.pdf" }
              ]
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Nasir Ahmed",
              role: "ARM",
            }
          ]
        },
        CMReview: {
          assignees: [
            {
              employeeName: "Rafiq Khan",
              role: "CM",
              since: "2025-09-20T14:30:00+06:00"
            }
          ]
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-003",
      currentState: "Completed",
      currentStateEnteredAt: "2025-09-17T16:45:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "Quick Mart Stores",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 10000000,
            }
          ]
        },
        proposalDocs: {
          fields: [
            {
              id: "supportingDocuments",
              name: "Supporting Documents",
              type: "file",
              data: [
                { name: "doc1.pdf" }, 
                { name: "doc2.pdf" }, 
                { name: "doc3.pdf" },
                { name: "doc4.pdf" }
              ]
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Mariam Begum",
              role: "ARM",
            }
          ]
        },
        Completed: {
          assignees: []
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-004",
      currentState: "THCRMDecision",
      currentStateEnteredAt: "2025-09-21T02:15:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "Green Agriculture Co.",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 75000000,
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Karim Sheikh",
              role: "ARM",
            }
          ]
        },
        THCRMDecision: {
          assignees: [
            {
              employeeName: "Rahman Chowdhury",
              role: "TeamHeadCRM",
            }
          ]
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-005",
      currentState: "RMResubmission",
      currentStateEnteredAt: "2025-09-21T08:30:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "Tech Solutions Ltd.",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 35000000,
            }
          ]
        },
        proposalDocs: {
          fields: [
            {
              id: "supportingDocuments",
              name: "Supporting Documents",
              type: "file",
              data: [{ name: "revised_proposal.pdf" }]
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Rahul Das",
              role: "ARM",
            }
          ]
        },
        RMResubmission: {
          assignees: [
            {
              employeeName: "Sohel Rahman",
              role: "ARM",
            }
          ]
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-006",
      currentState: "ARMDraft",
      currentStateEnteredAt: "2025-09-21T11:00:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "Fashion House BD",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 15000000,
            }
          ]
        },
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Nusrat Jahan",
              role: "ARM",
            }
          ]
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-007",
      currentState: "RMReview",
      currentStateEnteredAt: "2025-09-19T15:45:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "Steel Works Industries",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 90000000,
            }
          ]
        },
        proposalDocs: {
          fields: [
            {
              id: "supportingDocuments",
              name: "Supporting Documents",
              type: "file",
              data: [
                { name: "project_plan.pdf" },
                { name: "environmental_clearance.pdf" },
                { name: "machinery_quotes.pdf" },
                { name: "export_orders.pdf" },
                { name: "audited_accounts.pdf" }
              ]
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Imran Hossain",
              role: "ARM",
            }
          ]
        },
        RMReview: {
          assignees: [
            {
              employeeName: "Zakir Hassan",
              role: "RM",
            }
          ]
        }
      }
    }
  },
  {
    workflow: {
      id: "LN-2025-008",
      currentState: "CMReview",
      currentStateEnteredAt: "2025-09-18T09:20:00+06:00",
      forms: {
        coreDetails: {
          fields: [
            {
              id: "applicantName",
              name: "Applicant Name",
              type: "text",
              data: "Pharma Solutions Ltd.",
            },
            {
              id: "loanAmount",
              name: "Loan Amount",
              type: "number",
              data: 120000000,
            }
          ]
        },
      },
      states: {
        ARMDraft: {
          assignees: [
            {
              employeeName: "Salma Khatun",
              role: "ARM",
            }
          ]
        },
        CMReview: {
          assignees: [
            {
              employeeName: "Abdul Malik",
              role: "CM",
            }
          ]
        }
      }
    }
  }
];