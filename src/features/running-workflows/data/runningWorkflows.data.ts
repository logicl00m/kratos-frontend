// src/features/running-workflows/data/runningWorkflows.data.ts

import type { RunningWorkflowsData, WorkflowData } from "../types/runningWorkflow.types";
import { transformWorkflowsToInstances } from "../utils/workflowTransformer";

// Import or define your workflow JSON data
const sampleWorkflowData: WorkflowData = {
  "workflow": {
    "id": "loan_workflow_v1",
    "version": 1,
    "initialState": "ARMDraft",
    "currentState": "RMReview",
    "currentStateEnteredAt": "2025-09-18T09:22:31+06:00",
    "forms": {
      "coreDetails": {
        "fields": [
          {
            "id": "applicantLegalName",
            "name": "Applicant Legal Name",
            "type": "text",
            "data": "ABC Textiles Ltd.",
            "fieldActions": [
              { "operation": "save" },
              { "operation": "validate" }
            ]
          },
          {
            "id": "requestedAmount",
            "name": "Requested Amount",
            "type": "number",
            "data": 50000000,
            "fieldActions": [
              { "operation": "save" },
              { "operation": "validate" }
            ]
          }
        ]
      },
      "proposalDocs": {
        "fields": [
          {
            "id": "proposalDetails",
            "name": "Proposal Details",
            "type": "textarea",
            "data": "Working capital enhancement for seasonal purchase of cotton. Expected turnover uplift 18% YoY.",
            "fieldActions": [
              { "operation": "save" },
              { "operation": "validate" }
            ]
          },
          {
            "id": "supportingDocuments",
            "name": "Supporting Documents",
            "type": "file",
            "data": [
              {
                "name": "audited_financials_2024.pdf",
                "uri": "s3://loan-docs/ABC/audited_financials_2024.pdf",
                "sha256": "b3a1..."
              },
              {
                "name": "trade_license.pdf",
                "uri": "s3://loan-docs/ABC/trade_license.pdf",
                "sha256": "9f2c..."
              }
            ],
            "fieldActions": [
              { "operation": "upload" },
              { "operation": "replace" },
              { "operation": "validate" }
            ]
          }
        ]
      },
      "rmSection": {
        "fields": [
          {
            "id": "rmDecision",
            "name": "RM Decision",
            "type": "select",
            "data": "RecommendApproval",
            "fieldActions": [
              { "operation": "validate" }
            ]
          },
          {
            "id": "rmRemarks",
            "name": "RM Remarks",
            "type": "textarea",
            "data": "Client has steady cashflows and clean track record.",
            "fieldActions": [
              { "operation": "save" }
            ]
          }
        ]
      },
      "cmSection": {
        "fields": [
          {
            "id": "cmDecision",
            "name": "Credit Manager Decision",
            "type": "select",
            "data": null,
            "fieldActions": [
              { "operation": "validate" }
            ]
          },
          {
            "id": "cmRemarks",
            "name": "CM Remarks/Observation",
            "type": "textarea",
            "data": null,
            "fieldActions": [
              { "operation": "save" }
            ]
          }
        ]
      }
    },
    "states": {
      "ARMDraft": {
        "assignees": [
          {
            "subjectId": "u_arm_102",
            "employeeName": "Sadia Rahman",
            "role": "ARM",
            "email": "sadia.rahman@example.com",
            "primary": true,
            "since": "2025-09-18T09:00:05+06:00"
          }
        ],
        "forms": [
          {
            "formName": "coreDetails",
            "fieldOverrides": {
              "applicantLegalName": { "status": "editable", "required": true },
              "requestedAmount": { "status": "editable", "required": true }
            }
          },
          {
            "formName": "proposalDocs",
            "fieldOverrides": {
              "proposalDetails": { "status": "editable", "required": true },
              "supportingDocuments": { "status": "actionable", "required": true }
            }
          },
          { "formName": "rmSection", "visibility": "hidden" },
          { "formName": "cmSection", "visibility": "hidden" }
        ],
        "actions": {
          "submitToRm": {
            "nextState": "RMReview",
            "operation": "Validate draft; save; notify RM",
            "allowedRoles": ["ARM"]
          }
        },
        "history": [
          {
            "id": "evt_0000",
            "at": "2025-09-18T09:00:05+06:00",
            "byUser": {
              "id": "system",
              "name": "Workflow Engine",
              "role": "SYSTEM"
            },
            "action": "enterState",
            "stateFrom": null,
            "stateTo": "ARMDraft"
          },
          {
            "id": "evt_0001",
            "at": "2025-09-18T09:00:05+06:00",
            "byUser": {
              "id": "u_arm_102",
              "name": "Sadia Rahman",
              "role": "ARM"
            },
            "action": "create",
            "stateFrom": null,
            "stateTo": "ARMDraft"
          },
          {
            "id": "evt_0002",
            "at": "2025-09-18T09:22:31+06:00",
            "byUser": {
              "id": "u_arm_102",
              "name": "Sadia Rahman",
              "role": "ARM"
            },
            "action": "submitToRm",
            "stateFrom": "ARMDraft",
            "stateTo": "RMReview"
          }
        ]
      },
      "RMReview": {
        "assignees": [
          {
            "subjectId": "u_rm_221",
            "employeeName": "Fahim Ahmed",
            "role": "RM",
            "email": "fahim.ahmed@example.com",
            "primary": true,
            "since": "2025-09-18T10:40:00+06:00"
          }
        ],
        "forms": [
          {
            "formName": "coreDetails",
            "fieldOverrides": {
              "applicantLegalName": { "status": "readonly" },
              "requestedAmount": { "status": "readonly" }
            }
          },
          {
            "formName": "proposalDocs",
            "fieldOverrides": {
              "proposalDetails": { "status": "readonly" },
              "supportingDocuments": { "status": "actionable" }
            }
          },
          {
            "formName": "rmSection",
            "fieldOverrides": {
              "rmDecision": { "status": "editable", "required": true },
              "rmRemarks": { "status": "editable" }
            }
          }
        ],
        "actions": {
          "rmReject": {
            "nextState": "ARMDraft",
            "operation": "Return to ARM with fields to correct",
            "allowedRoles": ["RM"]
          },
          "rmFinalize": {
            "nextState": "CMReview",
            "operation": "Finalize proposal",
            "allowedRoles": ["RM"]
          }
        },
        "history": [
          {
            "id": "evt_0003",
            "at": "2025-09-18T09:22:31+06:00",
            "byUser": {
              "id": "system",
              "name": "Workflow Engine",
              "role": "SYSTEM"
            },
            "action": "enterState",
            "stateFrom": "ARMDraft",
            "stateTo": "RMReview"
          },
          {
            "id": "evt_0004",
            "at": "2025-09-18T10:41:45+06:00",
            "byUser": {
              "id": "u_rm_221",
              "name": "Fahim Ahmed",
              "role": "RM"
            },
            "action": "updateFields",
            "stateFrom": "RMReview",
            "stateTo": "RMReview",
            "changes": [
              {
                "fieldId": "rmDecision",
                "old": null,
                "new": "RecommendApproval"
              },
              {
                "fieldId": "rmRemarks",
                "old": null,
                "new": "Client has steady cashflows and clean track record."
              }
            ]
          }
        ]
      },
      "CMReview": {
        "assigneePolicy": {
          "requiredRoles": ["CM"]
        },
        "assignees": [],
        "forms": [
          {
            "formName": "cmSection",
            "fieldOverrides": {
              "cmDecision": { "status": "editable", "required": true },
              "cmRemarks": { "status": "editable" }
            }
          }
        ],
        "actions": {
          "cmObservation": {
            "nextState": "RMResubmission",
            "operation": "Return to RM with observations",
            "allowedRoles": ["CM"]
          },
          "cmRecommend": {
            "nextState": "THCRMDecision",
            "operation": "Send to Team Head–CRM for decision",
            "allowedRoles": ["CM"]
          }
        },
        "history": []
      },
      "RMResubmission": {
        "assigneePolicy": {
          "requiredRoles": ["ARM"]
        },
        "assignees": [],
        "forms": [
          {
            "formName": "proposalDocs",
            "fieldOverrides": {
              "supportingDocuments": { "status": "actionable" }
            }
          }
        ],
        "actions": {
          "rmResubmit": {
            "nextState": "CMReview",
            "operation": "Resubmit corrected proposal to CM",
            "allowedRoles": ["ARM"]
          }
        },
        "history": []
      },
      "THCRMDecision": {
        "assigneePolicy": {
          "requiredRoles": ["TeamHeadCRM"]
        },
        "assignees": [],
        "forms": [],
        "actions": {
          "thcrmSendBack": {
            "nextState": "RMReview",
            "operation": "Send back to RM for correction",
            "allowedRoles": ["TeamHeadCRM"]
          },
          "thcrmApprove": {
            "nextState": "Completed",
            "operation": "Approve and finalize workflow",
            "allowedRoles": ["TeamHeadCRM"]
          }
        },
        "history": []
      },
      "Completed": {
        "assignees": [],
        "forms": [
          {
            "formName": "coreDetails",
            "fieldOverrides": {
              "applicantLegalName": { "status": "readonly" },
              "requestedAmount": { "status": "readonly" }
            }
          }
        ],
        "actions": {},
        "history": []
      }
    }
  }
};

// Additional sample workflows with different states
const additionalSamples: WorkflowData[] = [
  {
    ...sampleWorkflowData,
    workflow: {
      ...sampleWorkflowData.workflow,
      id: "loan_workflow_v2",
      currentState: "CMReview",
      currentStateEnteredAt: "2025-09-19T14:30:00+06:00",
      forms: {
        ...sampleWorkflowData.workflow.forms,
        coreDetails: {
          fields: [
            {
              "id": "applicantLegalName",
              "name": "Applicant Legal Name",
              "type": "text",
              "data": "XYZ Manufacturing Ltd.",
              "fieldActions": [
                { "operation": "save" },
                { "operation": "validate" }
              ]
            },
            {
              "id": "requestedAmount",
              "name": "Requested Amount",
              "type": "number",
              "data": 25000000,
              "fieldActions": [
                { "operation": "save" },
                { "operation": "validate" }
              ]
            }
          ]
        }
      },
      states: {
        ...sampleWorkflowData.workflow.states,
        CMReview: {
          ...sampleWorkflowData.workflow.states.CMReview,
          assignees: [
            {
              "subjectId": "u_cm_301",
              "employeeName": "Rafiq Khan",
              "role": "CM",
              "email": "rafiq.khan@example.com",
              "primary": true,
              "since": "2025-09-19T14:30:00+06:00"
            }
          ],
          history: [
            {
              "id": "evt_cm_001",
              "at": "2025-09-19T14:30:00+06:00",
              "byUser": {
                "id": "system",
                "name": "Workflow Engine",
                "role": "SYSTEM"
              },
              "action": "enterState",
              "stateFrom": "RMReview",
              "stateTo": "CMReview"
            }
          ]
        }
      }
    }
  },
  {
    ...sampleWorkflowData,
    workflow: {
      ...sampleWorkflowData.workflow,
      id: "loan_workflow_v3",
      currentState: "Completed",
      currentStateEnteredAt: "2025-09-17T16:45:00+06:00",
      forms: {
        ...sampleWorkflowData.workflow.forms,
        coreDetails: {
          fields: [
            {
              "id": "applicantLegalName",
              "name": "Applicant Legal Name",
              "type": "text",
              "data": "Quick Mart Stores",
              "fieldActions": [
                { "operation": "save" },
                { "operation": "validate" }
              ]
            },
            {
              "id": "requestedAmount",
              "name": "Requested Amount",
              "type": "number",
              "data": 10000000,
              "fieldActions": [
                { "operation": "save" },
                { "operation": "validate" }
              ]
            }
          ]
        }
      },
      states: {
        ...sampleWorkflowData.workflow.states,
        Completed: {
          ...sampleWorkflowData.workflow.states.Completed,
          history: [
            {
              "id": "evt_comp_001",
              "at": "2025-09-17T16:45:00+06:00",
              "byUser": {
                "id": "u_thcrm_610",
                "name": "Rahat Iqbal",
                "role": "TeamHeadCRM"
              },
              "action": "thcrmApprove",
              "stateFrom": "THCRMDecision",
              "stateTo": "Completed"
            }
          ]
        }
      }
    }
  }
];

// Transform the workflow data to instances
export const allWorkflows: WorkflowData[] = [
  sampleWorkflowData,
  ...additionalSamples
];

const transformedInstances = transformWorkflowsToInstances(allWorkflows);

export const runningWorkflowsData: RunningWorkflowsData = {
  lastUpdated: new Date().toISOString(),
  instances: transformedInstances
};

