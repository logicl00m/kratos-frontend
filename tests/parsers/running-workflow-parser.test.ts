import { describe, it, expect } from 'vitest';
import {
  parseRunningWorkflowToGraph,
  validateWorkflowData,
  normalizeWorkflowData,
  getWorkflowStatus,
  calculateProgress,
  getAllHistory,
  getWorkflowFormData,
  getCurrentAssignee,
  getWorkflowOwner
} from '@/features/running-workflows/utils/runningWorkflowParser';
import type { WorkflowData, WorkflowDataWrapper } from '@/features/running-workflows/types/runningWorkflow.types';

describe('Running Workflow Parser', () => {
  const createMockWorkflowData = (): WorkflowData => ({
    id: 'test-workflow',
    version: 1,
    initialState: 'Start',
    currentState: 'Review',
    currentStateEnteredAt: '2024-01-01T10:00:00Z',
    forms: {
      TestForm: {
        fields: [
          {
            id: 'field1',
            name: 'Field 1',
            type: 'text',
            data: 'test value',
            fieldActions: [{ operation: 'validate' }]
          }
        ]
      }
    },
    states: {
      Start: {
        assignees: [
          {
            subjectId: 'user1',
            employeeName: 'John Doe',
            role: 'RM',
            email: 'john@example.com',
            primary: true
          }
        ],
        forms: [{ formName: 'TestForm' }],
        actions: {
          Submit: { nextState: 'Review', operation: 'Submit for review' }
        },
        history: []
      },
      Review: {
        assignees: [
          {
            subjectId: 'user2',
            employeeName: 'Jane Smith',
            role: 'CM',
            email: 'jane@example.com'
          }
        ],
        forms: [],
        actions: {
          Approve: { nextState: 'Complete', operation: 'Approve' },
          Reject: { nextState: 'Start', operation: 'Reject' }
        },
        history: [
          {
            id: 'h1',
            at: '2024-01-01T09:00:00Z',
            byUser: { id: 'user1', name: 'John Doe', role: 'RM' },
            action: 'Submit',
            stateFrom: 'Start',
            stateTo: 'Review'
          }
        ]
      },
      Complete: {
        assignees: [],
        forms: [],
        actions: {},
        history: []
      }
    }
  });

  describe('validateWorkflowData', () => {
    it('should validate correct workflow data', () => {
      const data = createMockWorkflowData();
      expect(validateWorkflowData(data)).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(validateWorkflowData(null)).toBe(false);
      expect(validateWorkflowData({})).toBe(false);
      expect(validateWorkflowData({ id: 'test' })).toBe(false);
    });

    it('should require essential fields', () => {
      const data = createMockWorkflowData();
      delete (data as any).currentState;
      expect(validateWorkflowData(data)).toBe(false);
    });
  });

  describe('normalizeWorkflowData', () => {
    it('should wrap raw workflow data', () => {
      const data = createMockWorkflowData();
      const result = normalizeWorkflowData(data);

      expect(result.workflow).toBe(data);
    });

    it('should return already wrapped data unchanged', () => {
      const data = createMockWorkflowData();
      const wrapped: WorkflowDataWrapper = { workflow: data };
      const result = normalizeWorkflowData(wrapped);

      expect(result).toBe(wrapped);
    });
  });

  describe('parseRunningWorkflowToGraph', () => {
    it('should create nodes for all states', () => {
      const data = createMockWorkflowData();
      const result = parseRunningWorkflowToGraph(data);

      expect(result.nodes).toHaveLength(3);
      expect(result.nodes.map(n => n.id)).toEqual(['Start', 'Review', 'Complete']);
    });

    it('should mark current state correctly', () => {
      const data = createMockWorkflowData();
      const result = parseRunningWorkflowToGraph(data);

      const currentNode = result.nodes.find(n => n.id === 'Review');
      expect(currentNode?.data.status).toBe('current');
    });

    it('should mark visited states', () => {
      const data = createMockWorkflowData();
      const result = parseRunningWorkflowToGraph(data);

      const startNode = result.nodes.find(n => n.id === 'Start');
      expect(startNode?.data.status).toBe('visited');
    });

    it('should mark pending states', () => {
      const data = createMockWorkflowData();
      const result = parseRunningWorkflowToGraph(data);

      const completeNode = result.nodes.find(n => n.id === 'Complete');
      expect(completeNode?.data.status).toBe('pending');
    });

    it('should include performer information', () => {
      const data = createMockWorkflowData();
      const result = parseRunningWorkflowToGraph(data);

      const reviewNode = result.nodes.find(n => n.id === 'Review');
      expect(reviewNode?.data.performedBy).toBe('John Doe');
    });

    it('should create edges with execution status', () => {
      const data = createMockWorkflowData();
      const result = parseRunningWorkflowToGraph(data);

      const executedEdge = result.edges.find(e =>
        e.source === 'Start' && e.target === 'Review'
      );

      expect(executedEdge?.data?.executed).toBe(true);
      expect(executedEdge?.style?.strokeWidth).toBe(3);
    });

    it('should handle empty workflow', () => {
      const data: WorkflowData = {
        ...createMockWorkflowData(),
        states: {}
      };

      const result = parseRunningWorkflowToGraph(data);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });
  });

  describe('getWorkflowStatus', () => {
    it('should detect completed status', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Completed';

      const status = getWorkflowStatus(data);

      expect(status.status).toBe('completed');
      expect(status.color).toBe('#10b981');
    });

    it('should detect rejected status', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Rejected';

      const status = getWorkflowStatus(data);

      expect(status.status).toBe('rejected');
      expect(status.color).toBe('#ef4444');
    });

    it('should detect active status', () => {
      const data = createMockWorkflowData();

      const status = getWorkflowStatus(data);

      expect(status.status).toBe('active');
      expect(status.color).toBe('#3b82f6');
    });

    it('should default to pending with no history', () => {
      const data = createMockWorkflowData();
      data.states.Review.history = [];

      const status = getWorkflowStatus(data);

      expect(status.status).toBe('pending');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress based on visited states', () => {
      const data = createMockWorkflowData();

      const progress = calculateProgress(data);

      // 2 out of 3 states visited (Start and Review)
      expect(progress).toBe(67);
    });

    it('should return 0 for empty workflow', () => {
      const data = createMockWorkflowData();
      data.states = {};

      const progress = calculateProgress(data);

      expect(progress).toBe(0);
    });

    it('should not exceed 100%', () => {
      const data = createMockWorkflowData();
      // Add history for all states
      Object.values(data.states).forEach(state => {
        state.history.push({
          id: 'h',
          at: '2024-01-01T10:00:00Z',
          byUser: { id: 'u', name: 'User', role: 'RM' },
          action: 'Action',
          stateFrom: null,
          stateTo: 'Start'
        });
      });

      const progress = calculateProgress(data);

      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('getAllHistory', () => {
    it('should combine and sort history from all states', () => {
      const data = createMockWorkflowData();
      data.states.Start.history = [
        {
          id: 'h0',
          at: '2024-01-01T08:00:00Z',
          byUser: { id: 'u', name: 'User', role: 'RM' },
          action: 'Create',
          stateFrom: null,
          stateTo: 'Start'
        }
      ];

      const history = getAllHistory(data);

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe('h0'); // Earlier timestamp
      expect(history[1].id).toBe('h1');
    });

    it('should handle empty history', () => {
      const data = createMockWorkflowData();
      Object.values(data.states).forEach(state => {
        state.history = [];
      });

      const history = getAllHistory(data);

      expect(history).toHaveLength(0);
    });
  });

  describe('getWorkflowFormData', () => {
    it('should extract form data for current state', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Start';

      const formData = getWorkflowFormData(data);

      expect(formData.field1).toBe('test value');
    });

    it('should return empty object for state without forms', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Review';

      const formData = getWorkflowFormData(data);

      expect(formData).toEqual({});
    });

    it('should handle invalid current state', () => {
      const data = createMockWorkflowData();
      data.currentState = 'InvalidState';

      const formData = getWorkflowFormData(data);

      expect(formData).toEqual({});
    });
  });

  describe('getCurrentAssignee', () => {
    it('should return primary assignee', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Start';

      const assignee = getCurrentAssignee(data);

      expect(assignee?.employeeName).toBe('John Doe');
      expect(assignee?.primary).toBe(true);
    });

    it('should return first assignee if no primary', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Review';

      const assignee = getCurrentAssignee(data);

      expect(assignee?.employeeName).toBe('Jane Smith');
    });

    it('should return undefined for state without assignees', () => {
      const data = createMockWorkflowData();
      data.currentState = 'Complete';

      const assignee = getCurrentAssignee(data);

      expect(assignee).toBeUndefined();
    });
  });

  describe('getWorkflowOwner', () => {
    it('should return assignee from initial state', () => {
      const data = createMockWorkflowData();

      const owner = getWorkflowOwner(data);

      expect(owner?.employeeName).toBe('John Doe');
    });

    it('should return undefined if initial state has no assignees', () => {
      const data = createMockWorkflowData();
      data.states.Start.assignees = [];

      const owner = getWorkflowOwner(data);

      expect(owner).toBeUndefined();
    });
  });
});