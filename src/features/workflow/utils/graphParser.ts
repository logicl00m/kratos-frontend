// src/features/workflow/utils/graphParser.ts
/**
 * BACKWARD COMPATIBILITY WRAPPER
 *
 * This file now uses the refactored parser system from @core/workflow
 * while maintaining the same API for existing components.
 */

import type { Node, Edge } from "reactflow";
import type { WorkflowConfig, StateFormField, Form, StateForm, FieldOverride } from "@features/workflow/types/workflow.types";
import {
  DesignWorkflowParser,
  exportGraphToWorkflow as exportGraph,
  extractStateFields
} from "@core/workflow";

export function parseWorkflowToGraph(workflow: WorkflowConfig): {
  nodes: Node[];
  edges: Edge[];
} {
  // Handle empty workflow
  if (!workflow?.workflow?.states) {
    return { nodes: [], edges: [] };
  }

  // Use the original implementation for edges to ensure compatibility
  const states = workflow.workflow.states;
  const forms = workflow.workflow.forms;
  const stateKeys = Object.keys(states);

  // Create nodes using the new parser for consistency
  const parser = new DesignWorkflowParser({
    nodeStyle: 'detailed',
    layout: {
      algorithm: 'grid',
      direction: 'horizontal',
      spacing: {
        horizontal: 500,  // Match original spacing
        vertical: 350
      }
    },
    features: {
      includeFormData: true,
      includeValidation: false
    }
  });

  // Map to new format for node creation
  const normalizedWorkflow = {
    states: states || {},
    forms: forms || {}
  };

  let nodes: Node[] = [];
  try {
    const result = parser.parse(normalizedWorkflow);
    // Map nodes back to original stateNode type
    nodes = result.nodes.map(node => ({
      ...node,
      type: 'stateNode'  // Keep original node type
    }));
  } catch (error) {
    console.error('Error parsing nodes:', error);
  }

  // Create edges using the original logic for full compatibility
  const edges: Edge[] = [];
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
          const hasReverseEdge = directedEdgeMap.has(reverseKey);
          const directedCount = directedEdgeMap.get(directedKey) || 0;
          directedEdgeMap.set(directedKey, directedCount + 1);

          let edgeType = "step";
          const edgeStyle: any = {
            stroke,
            strokeWidth,
          };

          // Handle self-loops
          if (stateKey === actionData.nextState) {
            edgeType = "bezier";
            edgeStyle.strokeDasharray = "3 3";
          } else if (hasReverseEdge || directedCount > 0) {
            edgeType = "step";
            if (directedCount > 0) {
              edgeStyle.strokeDasharray = directedCount > 1 ? "5 5" : "10 5";
            }
          }

          // Calculate curvature for better edge separation
          let curvature = 0;
          let offset = 0;
          let labelOffset = 0;

          if (stateKey === actionData.nextState) {
            curvature = 0.8;
          } else if (hasReverseEdge) {
            curvature = 0.5;
            offset = 40;
            labelOffset = 30;
          }

          if (directedCount > 0) {
            offset = (directedCount - 1) * 30;
            labelOffset = directedCount * 40;
            curvature += directedCount * 0.2;
          }

          // Determine source handle based on action type
          let sourceHandle = "other";
          const targetHandle = "input";

          if (actionName.toLowerCase().includes("reject")) {
            sourceHandle = "reject";
          } else if (
            actionName.toLowerCase().includes("approve") ||
            actionName.toLowerCase().includes("finalize") ||
            actionName.toLowerCase().includes("accept")
          ) {
            sourceHandle = "approve";
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

  // Use refactored utility
  return extractStateFields(forms || {}, state);
}

// Re-export the default workflow for backward compatibility
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