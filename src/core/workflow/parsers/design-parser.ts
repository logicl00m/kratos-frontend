/**
 * Design Workflow Parser
 *
 * Parser for static workflow configurations (design-time).
 * Used in workflow builder and viewer components.
 */

import type { Node } from 'reactflow';
import { BaseWorkflowParser } from './base-parser';
import type {
  WorkflowConfiguration,
  WorkflowState,
  StateNodeData,
  ProcessNodeData,
  DecisionNodeData,
  ParserOptions,
  WorkflowNodeData
} from '../types/unified-types';
import {
  extractStateFields,
  formatStateName,
  getEdgeHandles
} from '../utils/parser-utils';

/**
 * Parser for design-time workflow configurations
 */
export class DesignWorkflowParser extends BaseWorkflowParser<
  WorkflowConfiguration,
  StateNodeData | ProcessNodeData | DecisionNodeData
> {
  constructor(options: Partial<ParserOptions> = {}) {
    super(options);
  }

  /**
   * Gets the parser name
   */
  getName(): string {
    return 'DesignWorkflowParser';
  }

  /**
   * Checks if input can be parsed
   */
  canParse(input: unknown): input is WorkflowConfiguration {
    if (!input || typeof input !== 'object') return false;

    const data = input as any;

    // Must have states
    if (!data.states || typeof data.states !== 'object') return false;

    // Must have forms (can be empty)
    if (!data.forms || typeof data.forms !== 'object') return false;

    // Must not have runtime properties
    if ('currentState' in data || 'instanceId' in data) return false;

    return true;
  }

  /**
   * Creates a node from a workflow state
   */
  protected createNode(
    stateKey: string,
    state: WorkflowState,
    index: number,
    totalNodes: number
  ): Node<StateNodeData | ProcessNodeData | DecisionNodeData> {
    const position = this.calculatePosition(index, totalNodes);
    const nodeStyle = this.options.nodeStyle || 'detailed';

    switch (nodeStyle) {
      case 'process':
        return this.createProcessNode(stateKey, state, position);
      case 'simple':
        return this.createSimpleNode(stateKey, state, position);
      default:
        return this.createStateNode(stateKey, state, position);
    }
  }

  /**
   * Creates a state node (default style)
   */
  private createStateNode(
    stateKey: string,
    state: WorkflowState,
    position: { x: number; y: number }
  ): Node<StateNodeData> {
    const workflow = this.context.metadata.workflow as WorkflowConfiguration;
    const fields = this.options.features?.includeFormData
      ? extractStateFields(workflow?.forms || {}, state)
      : [];

    const nodeData: StateNodeData = {
      label: formatStateName(stateKey),
      internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, '_')}`,
      hasForm: fields.length > 0,
      fields,
      formCount: state.forms?.length || 0,
      actions: state.actions ? Object.keys(state.actions) : []
    };

    return {
      id: stateKey,
      type: 'stateNode',
      position,
      data: nodeData
    };
  }

  /**
   * Creates a process node (workflow builder style)
   */
  private createProcessNode(
    stateKey: string,
    state: WorkflowState,
    position: { x: number; y: number }
  ): Node<ProcessNodeData> {
    const nodeType = this.determineNodeType(state);

    if (nodeType === 'decision') {
      return this.createDecisionNode(stateKey, state, position);
    }

    const actions = this.mapStateActionsToProcessActions(state);
    const forms = state.forms?.map(f => f.formName) || [];

    const nodeData: ProcessNodeData = {
      label: formatStateName(stateKey),
      internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, '_')}`,
      assignees: [], // Can be extended with assignee data
      actions,
      forms
    };

    return {
      id: stateKey,
      type: 'process',
      position,
      data: nodeData
    };
  }

  /**
   * Creates a decision node
   */
  private createDecisionNode(
    stateKey: string,
    state: WorkflowState,
    position: { x: number; y: number }
  ): Node<DecisionNodeData> {
    const transitions = Object.entries(state.actions || {}).map(
      ([actionName, action]) => ({
        id: actionName,
        label: actionName,
        operation: action.operation,
        condition: action.conditions ? JSON.stringify(action.conditions) : undefined
      })
    );

    const nodeData: DecisionNodeData = {
      label: formatStateName(stateKey),
      internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, '_')}`,
      assignees: [],
      transitions
    };

    return {
      id: stateKey,
      type: 'decision',
      position,
      data: nodeData
    };
  }

  /**
   * Creates a simple node (basic style)
   */
  private createSimpleNode(
    stateKey: string,
    state: WorkflowState,
    position: { x: number; y: number }
  ): Node {
    return {
      id: stateKey,
      type: 'default',
      position,
      data: {
        label: formatStateName(stateKey)
      }
    };
  }

  /**
   * Determines if a state should be a decision node
   */
  private determineNodeType(state: WorkflowState): 'process' | 'decision' {
    const actions = Object.keys(state.actions || {});

    // Multiple distinct transitions suggest a decision node
    if (actions.length > 3) return 'decision';

    // Check for decision-like action names
    const hasDecisionActions = actions.some(action =>
      /branch|condition|check|evaluate|decide/i.test(action)
    );

    return hasDecisionActions ? 'decision' : 'process';
  }

  /**
   * Maps state actions to process node action format
   */
  private mapStateActionsToProcessActions(state: WorkflowState): ProcessNodeData['actions'] {
    const actions = Object.entries(state.actions || {});
    const result: ProcessNodeData['actions'] = {
      left: undefined,
      center: undefined,
      right: undefined
    };

    actions.forEach(([actionName, action]) => {
      const handles = getEdgeHandles(actionName);

      if (handles.sourceHandle === 'left') {
        result.left = { label: actionName, operation: action.operation };
      } else if (handles.sourceHandle === 'right') {
        result.right = { label: actionName, operation: action.operation };
      } else {
        result.center = { label: actionName, operation: action.operation };
      }
    });

    // Set defaults if no actions mapped
    if (!result.left && !result.center && !result.right) {
      if (actions.length > 0) {
        result.center = { label: actions[0][0], operation: actions[0][1].operation };
      }
    }

    return result;
  }

  /**
   * Override to store workflow in context for field extraction
   */
  protected normalizeInput(input: WorkflowConfiguration): WorkflowConfiguration {
    this.context.metadata.workflow = input;
    return input;
  }
}

/**
 * Backward compatibility export
 */
export function parseWorkflowToGraph(
  workflow: WorkflowConfiguration,
  options?: Partial<ParserOptions>
) {
  const parser = new DesignWorkflowParser(options);
  return parser.parse(workflow);
}

/**
 * Export workflow from graph back to JSON
 */
export function exportGraphToWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): WorkflowConfiguration {
  const states: Record<string, WorkflowState> = {};

  // Build states from nodes
  nodes.forEach(node => {
    const state: WorkflowState = {
      forms: [],
      actions: {}
    };

    // Add forms if present
    if ('forms' in node.data && Array.isArray(node.data.forms)) {
      state.forms = node.data.forms.map(formName => ({
        formName,
        visibility: 'visible' as const
      }));
    }

    // Build actions from edges
    const outgoingEdges = edges.filter(edge => edge.source === node.id);
    outgoingEdges.forEach(edge => {
      const actionName = edge.label || `action_${edge.id}`;
      state.actions![actionName] = {
        nextState: edge.target,
        operation: edge.data?.operation
      };
    });

    states[node.id] = state;
  });

  return {
    states,
    forms: {}
  };
}

// Import for Edge type
import type { Edge } from 'reactflow';