// src/features/workflow/utils/graphParser.ts
import type { Node, Edge } from "reactflow";
import type { WorkflowConfig, StateFormField, Form, StateForm, FieldOverride } from "@features/workflow/types/workflow.types";

export function parseWorkflowToGraph(workflow: WorkflowConfig): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!workflow?.workflow?.states) {
    return { nodes, edges };
  }

  const states = workflow.workflow.states;
  const forms = workflow.workflow.forms;
  const stateKeys = Object.keys(states);

  // Create nodes
  stateKeys.forEach((stateKey, index) => {
    const state = states[stateKey];
    
    // Get all fields for this state from referenced forms
    const stateFields = getStateFields(forms, state);
    const hasForm = stateFields.length > 0;

    nodes.push({
      id: stateKey,
      type: "stateNode",
      position: {
        x: 250 * (index % 3),
        y: 200 * Math.floor(index / 3),
      },
      data: {
        label: stateKey,
        hasForm,
        fields: stateFields,
      },
    });
  });

  // Create edges from actions
  stateKeys.forEach((stateKey) => {
    const state = states[stateKey];
    if (state?.actions && typeof state.actions === "object") {
      Object.entries(state.actions).forEach(([actionName, actionData]) => {
        if (actionData?.nextState && states[actionData.nextState]) {
          let stroke = "#6b7280";
          if (actionName.includes("Reject")) {
            stroke = "#ef4444";
          } else if (actionName.includes("Approve") || actionName.includes("Finalize")) {
            stroke = "#10b981";
          }
          edges.push({
            id: `${stateKey}-${actionName}-${actionData.nextState}`,
            source: stateKey,
            target: actionData.nextState,
            label: actionName,
            type: "smoothstep",
            animated: true,
            style: { stroke },
            data: { operation: actionData.operation },
          });
        }
      });
    }
  });

  return { nodes, edges };
}

export function getStateFields(
  forms: WorkflowConfig["workflow"]["forms"],
  state: WorkflowConfig["workflow"]["states"][string]
): StateFormField[] {
  if (!forms || !state.forms) return [];
  
  const allFields: StateFormField[] = [];
  
  // Process each form referenced by this state
  state.forms.forEach((stateForm: StateForm) => {
    // Skip if entire form is hidden
    if (stateForm.visibility === "hidden") return;
    
    const form = forms[stateForm.formName];
    if (!form?.fields) return;
    
    // Process each field in the form
    form.fields.forEach(field => {
      const fieldOverride: FieldOverride = stateForm.fieldOverrides?.[field.id] || {};
      
      // Skip hidden fields
      if (fieldOverride.status === "hidden") return;
      
      // Default to readonly if not specified
      const status = fieldOverride.status || "readonly";
      
      allFields.push({
        ...field,
        formName: stateForm.formName,
        stateConfig: {
          status,
          required: fieldOverride.required,
        },
      });
    });
  });
  
  return allFields;
}

// Updated default workflow using the new format
export function getDefaultWorkflow(): WorkflowConfig {
  return {
    workflow: {
      forms: {
        CoreDetails: {
          fields: [
            { 
              id: "applicant_legal_name", 
              name: "Applicant Legal Name", 
              type: "text", 
              data: "{{ data.borrower.legalName }}",
              fieldActions: [{ operation: "save" }, { operation: "validate" }]
            },
            { 
              id: "requested_amount", 
              name: "Requested Amount", 
              type: "number", 
              data: "{{ data.facility.requestedAmount }}",
              fieldActions: [{ operation: "save" }, { operation: "validate" }]
            },
            { 
              id: "proposal_details", 
              name: "Proposal Details", 
              type: "textarea", 
              data: "{{ data.proposal.details }}",
              fieldActions: [{ operation: "save" }, { operation: "validate" }]
            },
            { 
              id: "supporting_documents", 
              name: "Supporting Documents", 
              type: "file", 
              data: "{{ data.documents }}",
              fieldActions: [{ operation: "upload" }, { operation: "replace" }, { operation: "validate" }]
            }
          ]
        },
        ReviewOutputs: {
          fields: [
            { 
              id: "rm_decision", 
              name: "RM Decision", 
              type: "select", 
              data: "{{ data.rm.decision }}",
              fieldActions: [{ operation: "validate" }]
            },
            { 
              id: "final_memo", 
              name: "Credit Memo", 
              type: "file", 
              data: "{{ data.outputs.creditMemo }}",
              fieldActions: [{ operation: "download" }]
            }
          ]
        }
      },
      states: {
        ARMDraft: {
          forms: [
            {
              formName: "CoreDetails",
              fieldOverrides: {
                applicant_legal_name: { status: "editable", required: true },
                requested_amount: { status: "editable", required: true },
                proposal_details: { status: "editable", required: true },
                supporting_documents: { status: "actionable", required: true }
              }
            },
            {
              formName: "ReviewOutputs",
              visibility: "hidden"
            }
          ],
          actions: {
            SubmitToRM: {
              nextState: "RMReview",
              operation: "Validate draft; save; notify RM"
            }
          }
        },
        RMReview: {
          forms: [
            {
              formName: "CoreDetails",
              fieldOverrides: {
                applicant_legal_name: { status: "readonly" },
                requested_amount: { status: "readonly" },
                proposal_details: { status: "readonly" },
                supporting_documents: { status: "actionable" }
              }
            },
            {
              formName: "ReviewOutputs",
              fieldOverrides: {
                rm_decision: { status: "editable", required: true },
                final_memo: { status: "hidden" }
              }
            }
          ],
          actions: {
            RMReject: {
              nextState: "ARMDraft",
              operation: "Return to ARM with fields to correct"
            },
            RMFinalize: {
              nextState: "Completed",
              operation: "Finalize proposal"
            }
          }
        },
        Completed: {
          forms: [
            {
              formName: "CoreDetails",
              fieldOverrides: {
                applicant_legal_name: { status: "readonly" },
                requested_amount: { status: "readonly" },
                proposal_details: { status: "readonly" },
                supporting_documents: { status: "readonly" }
              }
            },
            {
              formName: "ReviewOutputs",
              fieldOverrides: {
                rm_decision: { status: "readonly" },
                final_memo: { status: "actionable" }
              }
            }
          ],
          actions: {}
        }
      }
    }
  };
}