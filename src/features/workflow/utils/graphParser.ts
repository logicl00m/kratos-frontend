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
        x: 500 * (index % 3),  // Much wider spacing
        y: 350 * Math.floor(index / 3),  // Much taller spacing
      },
      data: {
        label: stateKey,
        hasForm,
        fields: stateFields,
      },
    });
  });

  // Create edges from actions with better routing for loops
  const edgeCountMap = new Map<string, number>();
  const directedEdgeMap = new Map<string, number>();

  stateKeys.forEach((stateKey) => {
    const state = states[stateKey];
    if (state?.actions && typeof state.actions === "object") {
      Object.entries(state.actions).forEach(([actionName, actionData]) => {
        if (actionData?.nextState && states[actionData.nextState]) {
          let stroke = "#6b7280";
          let strokeWidth = 2;
          if (actionName.includes("Reject")) {
            stroke = "#ef4444";
          } else if (actionName.includes("Approve") || actionName.includes("Finalize")) {
            stroke = "#10b981";
          }

          // Track directed edges (A->B is different from B->A)
          const directedKey = `${stateKey}->${actionData.nextState}`;
          const reverseKey = `${actionData.nextState}->${stateKey}`;

          // Check if reverse edge exists (for loops)
          const hasReverseEdge = directedEdgeMap.has(reverseKey);

          // Count edges for this specific direction
          const directedCount = directedEdgeMap.get(directedKey) || 0;
          directedEdgeMap.set(directedKey, directedCount + 1);

          let edgeType = "step"; // Use step edges by default for node avoidance
          const edgeStyle: any = {
            stroke,
            strokeWidth,
          };

          // Handle self-loops (node pointing to itself)
          if (stateKey === actionData.nextState) {
            edgeType = "bezier";
            edgeStyle.strokeDasharray = "3 3";
            curvature = 0.8; // High curvature for self-loops
          }
          // Handle bidirectional edges (loops between different nodes)
          else if (hasReverseEdge || directedCount > 0) {
            // Use step edge for better control and no overlap
            edgeType = "step";

            // Add curvature offset for bidirectional edges
            if (hasReverseEdge) {
              // First edge of a bidirectional pair gets positive curvature
              edgeStyle.stroke = stroke;
            }

            // Multiple edges in same direction
            if (directedCount > 0) {
              edgeStyle.strokeDasharray = directedCount > 1 ? "5 5" : "10 5";
            }
          }

          // Calculate curvature and offsets for better edge separation
          let curvature = 0;
          let offset = 0;
          let labelOffset = 0;

          if (hasReverseEdge) {
            // Offset edges that form loops
            curvature = 0.5;
            offset = 40;
            labelOffset = 30;
          }

          if (directedCount > 0) {
            // Further offset for multiple edges in same direction
            offset = (directedCount - 1) * 30;
            labelOffset = directedCount * 40;
            curvature += directedCount * 0.2;
          }

          // Determine source handle based on action type
          let sourceHandle = "other"; // default to bottom center
          const targetHandle = "input"; // always use top input

          if (actionName.toLowerCase().includes("reject")) {
            sourceHandle = "reject"; // left handle
          } else if (actionName.toLowerCase().includes("approve") ||
                     actionName.toLowerCase().includes("finalize") ||
                     actionName.toLowerCase().includes("accept")) {
            sourceHandle = "approve"; // right handle
          }

          edges.push({
            id: `${stateKey}-${actionName}-${actionData.nextState}-${directedCount}`,
            source: stateKey,
            target: actionData.nextState,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            label: actionName,
            type: edgeType,
            animated: actionName.includes("Approve") || actionName.includes("Finalize"),
            updatable: 'target',
            style: edgeStyle,
            labelStyle: {
              fill: '#1f2937',
              fontWeight: 600,
              fontSize: 14,
            },
            labelBgStyle: {
              fill: '#ffffff',
              fillOpacity: 1,
              padding: 4,
              borderRadius: 3,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            },
            labelShowBg: true,
            markerEnd: {
              type: "arrowclosed" as any,
              color: stroke,
            },
            data: {
              operation: actionData.operation,
              curvature: curvature,
              offset: offset,
              edgeIndex: directedCount,
              labelOffset: labelOffset,
            },
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