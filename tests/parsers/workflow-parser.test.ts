import { describe, it, expect } from 'vitest';
import { parseWorkflowToGraph, getStateFields, getDefaultWorkflow } from '@/features/workflow/utils/graphParser';
import type { WorkflowConfig } from '@/features/workflow/types/workflow.types';

describe('Workflow Graph Parser', () => {
  describe('parseWorkflowToGraph', () => {
    it('should handle empty workflow', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {}
        }
      };

      const result = parseWorkflowToGraph(workflow);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should create nodes for each state', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {
            Start: { actions: { Submit: { nextState: 'Review', operation: 'Submit for review' } } },
            Review: { actions: { Approve: { nextState: 'Complete', operation: 'Approve' } } },
            Complete: { actions: {} }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      expect(result.nodes).toHaveLength(3);
      expect(result.nodes.map(n => n.id)).toEqual(['Start', 'Review', 'Complete']);
    });

    it('should create edges from actions', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {
            Start: {
              actions: {
                Submit: { nextState: 'Review', operation: 'Submit for review' }
              }
            },
            Review: {
              actions: {
                Approve: { nextState: 'Complete', operation: 'Approve' },
                Reject: { nextState: 'Start', operation: 'Send back' }
              }
            },
            Complete: { actions: {} }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      expect(result.edges).toHaveLength(3);
      expect(result.edges[0].source).toBe('Start');
      expect(result.edges[0].target).toBe('Review');
      expect(result.edges[1].source).toBe('Review');
      expect(result.edges[2].source).toBe('Review');
    });

    it('should handle self-loops', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {
            Review: {
              actions: {
                SaveDraft: { nextState: 'Review', operation: 'Save draft' }
              }
            }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe('Review');
      expect(result.edges[0].target).toBe('Review');
      expect(result.edges[0].type).toBe('bezier');
    });

    it('should apply correct edge styles based on action names', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {
            Review: {
              actions: {
                Approve: { nextState: 'Complete', operation: 'Approve' },
                Reject: { nextState: 'Start', operation: 'Reject' }
              }
            },
            Complete: { actions: {} },
            Start: { actions: {} }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      const approveEdge = result.edges.find(e => e.label === 'Approve');
      const rejectEdge = result.edges.find(e => e.label === 'Reject');

      expect(approveEdge?.style?.stroke).toBe('#10b981'); // Green
      expect(approveEdge?.animated).toBe(true);
      expect(rejectEdge?.style?.stroke).toBe('#ef4444'); // Red
    });

    it('should include form data in nodes', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          forms: {
            BasicForm: {
              fields: [
                { id: 'name', name: 'Name', type: 'text', data: '' }
              ]
            }
          },
          states: {
            Start: {
              forms: [
                { formName: 'BasicForm', visibility: 'visible' }
              ],
              actions: {}
            }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      expect(result.nodes[0].data.hasForm).toBe(true);
      expect(result.nodes[0].data.fields).toHaveLength(1);
      expect(result.nodes[0].data.fields[0].id).toBe('name');
    });

    it('should handle field overrides', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          forms: {
            BasicForm: {
              fields: [
                { id: 'name', name: 'Name', type: 'text', data: '' },
                { id: 'email', name: 'Email', type: 'text', data: '' }
              ]
            }
          },
          states: {
            Start: {
              forms: [
                {
                  formName: 'BasicForm',
                  fieldOverrides: {
                    email: { status: 'hidden' }
                  }
                }
              ],
              actions: {}
            }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      // Email field should be hidden and not included
      expect(result.nodes[0].data.fields).toHaveLength(1);
      expect(result.nodes[0].data.fields[0].id).toBe('name');
    });

    it('should calculate node positions correctly', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {
            S1: { actions: {} },
            S2: { actions: {} },
            S3: { actions: {} },
            S4: { actions: {} }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      // Check grid layout (3 columns)
      expect(result.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(result.nodes[1].position).toEqual({ x: 500, y: 0 });
      expect(result.nodes[2].position).toEqual({ x: 1000, y: 0 });
      expect(result.nodes[3].position).toEqual({ x: 0, y: 350 });
    });

    it('should handle bidirectional edges', () => {
      const workflow: WorkflowConfig = {
        workflow: {
          states: {
            A: { actions: { GoToB: { nextState: 'B', operation: 'Go to B' } } },
            B: { actions: { GoToA: { nextState: 'A', operation: 'Go to A' } } }
          }
        }
      };

      const result = parseWorkflowToGraph(workflow);

      expect(result.edges).toHaveLength(2);
      // Check that edges have different curve properties
      const edge1 = result.edges.find(e => e.source === 'A');
      const edge2 = result.edges.find(e => e.source === 'B');
      expect(edge1?.data?.curvature).toBeDefined();
    });
  });

  describe('getStateFields', () => {
    it('should extract fields from forms', () => {
      const forms = {
        TestForm: {
          fields: [
            { id: 'field1', name: 'Field 1', type: 'text', data: 'value1' },
            { id: 'field2', name: 'Field 2', type: 'number', data: '123' }
          ]
        }
      };

      const state = {
        forms: [
          { formName: 'TestForm', visibility: 'visible' as const }
        ]
      };

      const fields = getStateFields(forms, state);

      expect(fields).toHaveLength(2);
      expect(fields[0].id).toBe('field1');
      expect(fields[0].formName).toBe('TestForm');
      expect(fields[0].stateConfig?.status).toBe('readonly');
    });

    it('should respect field overrides', () => {
      const forms = {
        TestForm: {
          fields: [
            { id: 'field1', name: 'Field 1', type: 'text', data: '' }
          ]
        }
      };

      const state = {
        forms: [
          {
            formName: 'TestForm',
            fieldOverrides: {
              field1: { status: 'editable' as const, required: true }
            }
          }
        ]
      };

      const fields = getStateFields(forms, state);

      expect(fields[0].stateConfig?.status).toBe('editable');
      expect(fields[0].stateConfig?.required).toBe(true);
    });

    it('should hide fields with hidden status', () => {
      const forms = {
        TestForm: {
          fields: [
            { id: 'field1', name: 'Field 1', type: 'text', data: '' },
            { id: 'field2', name: 'Field 2', type: 'text', data: '' }
          ]
        }
      };

      const state = {
        forms: [
          {
            formName: 'TestForm',
            fieldOverrides: {
              field2: { status: 'hidden' as const }
            }
          }
        ]
      };

      const fields = getStateFields(forms, state);

      expect(fields).toHaveLength(1);
      expect(fields[0].id).toBe('field1');
    });

    it('should hide entire forms with hidden visibility', () => {
      const forms = {
        TestForm: {
          fields: [
            { id: 'field1', name: 'Field 1', type: 'text', data: '' }
          ]
        }
      };

      const state = {
        forms: [
          { formName: 'TestForm', visibility: 'hidden' as const }
        ]
      };

      const fields = getStateFields(forms, state);

      expect(fields).toHaveLength(0);
    });
  });

  describe('getDefaultWorkflow', () => {
    it('should return a valid default workflow', () => {
      const workflow = getDefaultWorkflow();

      expect(workflow.workflow).toBeDefined();
      expect(workflow.workflow.states).toBeDefined();
      expect(workflow.workflow.forms).toBeDefined();
      expect(Object.keys(workflow.workflow.states).length).toBeGreaterThan(0);
    });

    it('should have valid state transitions', () => {
      const workflow = getDefaultWorkflow();
      const states = Object.keys(workflow.workflow.states);

      // Check that all nextState references are valid
      Object.values(workflow.workflow.states).forEach(state => {
        if (state.actions) {
          Object.values(state.actions).forEach(action => {
            if (action.nextState) {
              expect(states).toContain(action.nextState);
            }
          });
        }
      });
    });

    it('should have valid form references', () => {
      const workflow = getDefaultWorkflow();
      const formNames = Object.keys(workflow.workflow.forms || {});

      // Check that all form references are valid
      Object.values(workflow.workflow.states).forEach(state => {
        if (state.forms) {
          state.forms.forEach(form => {
            expect(formNames).toContain(form.formName);
          });
        }
      });
    });
  });
});