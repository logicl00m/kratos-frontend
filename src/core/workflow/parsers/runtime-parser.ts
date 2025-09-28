/**
 * Runtime Workflow Parser
 *
 * Parser for active/running workflow instances.
 * Includes history, assignees, and execution status.
 */

import type { Node, Edge } from 'reactflow';
import { BaseWorkflowParser } from './base-parser';
import type {
  RuntimeWorkflowConfiguration,
  RuntimeWorkflowState,
  RuntimeNodeData,
  WorkflowHistoryEntry,
  WorkflowAssignee,
  ParserOptions,
  WorkflowStatus
} from '../types/unified-types';
import {
  formatStateName,
  determineWorkflowStatus,
  getStatusInfo,
  createStyledEdge,
  buildFieldLookup
} from '../utils/parser-utils';

/**
 * Parser for runtime workflow instances
 */
export class RuntimeWorkflowParser extends BaseWorkflowParser<
  RuntimeWorkflowConfiguration,
  RuntimeNodeData
> {
  private visitedStates: Set<string> = new Set();
  private stateEntryInfo: Map<string, { timestamp: string; actor: string }> = new Map();
  private executedTransitions: Set<string> = new Set();
  private transitionLabels: Map<string, string> = new Map();

  constructor(options: Partial<ParserOptions> = {}) {
    // Enable runtime features by default
    super({
      ...options,
      features: {
        includeHistory: true,
        includeAssignees: true,
        includeMetrics: true,
        ...options.features
      }
    });
  }

  /**
   * Gets the parser name
   */
  getName(): string {
    return 'RuntimeWorkflowParser';
  }

  /**
   * Checks if input can be parsed
   */
  canParse(input: unknown): input is RuntimeWorkflowConfiguration {
    if (!input || typeof input !== 'object') return false;

    const data = input as any;

    // Must have runtime properties
    if (!data.currentState || typeof data.currentState !== 'string') return false;
    if (!data.instanceId || typeof data.instanceId !== 'string') return false;
    if (!data.status) return false;

    // Must have states
    if (!data.states || typeof data.states !== 'object') return false;

    return true;
  }

  /**
   * Creates nodes with runtime information
   */
  protected createNodes(workflow: RuntimeWorkflowConfiguration): Node<RuntimeNodeData>[] {
    // Process history first to determine visited states
    this.processHistory(workflow);

    return super.createNodes(workflow);
  }

  /**
   * Creates a runtime node with execution status
   */
  protected createNode(
    stateKey: string,
    state: RuntimeWorkflowState,
    index: number,
    totalNodes: number
  ): Node<RuntimeNodeData> {
    const position = this.calculatePosition(index, totalNodes);

    // Determine node status
    let status: RuntimeNodeData['status'] = 'pending';
    let visitedAt: string | undefined;
    let performedBy: string | undefined;
    let duration: number | undefined;

    if (stateKey === (this.context.metadata.workflow as RuntimeWorkflowConfiguration).currentState) {
      status = 'current';
      const info = this.stateEntryInfo.get(stateKey);
      visitedAt = info?.timestamp || state.enteredAt;
      performedBy = info?.actor;
    } else if (this.visitedStates.has(stateKey)) {
      status = 'visited';
      const info = this.stateEntryInfo.get(stateKey);
      visitedAt = info?.timestamp || state.enteredAt;
      performedBy = info?.actor;

      // Calculate duration if we have exit time
      if (state.exitedAt && state.enteredAt) {
        duration = new Date(state.exitedAt).getTime() - new Date(state.enteredAt).getTime();
      }
    } else if (this.shouldSkipState(stateKey, workflow)) {
      status = 'skipped';
    }

    // Get current form data if this is the current state
    let data: Record<string, unknown> | undefined;
    if (status === 'current' && this.options.features?.includeFormData) {
      data = this.extractCurrentStateData(workflow);
    }

    const nodeData: RuntimeNodeData = {
      label: formatStateName(stateKey),
      internalId: `state_${stateKey.toLowerCase().replace(/\s+/g, '_')}`,
      status,
      visitedAt,
      performedBy,
      duration,
      data
    };

    return {
      id: stateKey,
      type: 'runningStateNode',
      position,
      data: nodeData
    };
  }

  /**
   * Creates edges with execution status
   */
  protected createEdge(
    source: string,
    target: string,
    actionName: string,
    action: any,
    options: {
      isSelfLoop?: boolean;
      hasReverseEdge?: boolean;
      edgeCount?: number;
    }
  ): Edge {
    const transitionKey = `${source}-${target}`;
    const isExecuted = this.executedTransitions.has(transitionKey);
    const executedLabel = this.transitionLabels.get(transitionKey) || actionName;

    return createStyledEdge(
      source,
      target,
      action,
      executedLabel,
      {
        ...options,
        isExecuted
      }
    );
  }

  /**
   * Process workflow history to extract execution information
   */
  private processHistory(workflow: RuntimeWorkflowConfiguration): void {
    // Clear previous state
    this.visitedStates.clear();
    this.stateEntryInfo.clear();
    this.executedTransitions.clear();
    this.transitionLabels.clear();

    // Collect all history entries
    const allHistory = this.getAllHistory(workflow);

    // Process history entries
    allHistory.forEach(entry => {
      // Track visited states
      if (entry.stateFrom) {
        this.visitedStates.add(entry.stateFrom);
      }
      if (entry.stateTo) {
        this.visitedStates.add(entry.stateTo);

        // Track entry info for the state
        if (!this.stateEntryInfo.has(entry.stateTo)) {
          this.stateEntryInfo.set(entry.stateTo, {
            timestamp: entry.timestamp,
            actor: entry.actor.name || entry.actor.email || entry.actor.id || 'System'
          });
        }
      }

      // Track executed transitions
      if (entry.stateFrom && entry.stateTo) {
        const transitionKey = `${entry.stateFrom}-${entry.stateTo}`;
        this.executedTransitions.add(transitionKey);

        if (entry.action) {
          this.transitionLabels.set(transitionKey, entry.action);
        }
      }
    });

    // Add current state to visited
    this.visitedStates.add(workflow.currentState);
  }

  /**
   * Collects all history entries from all states
   */
  private getAllHistory(workflow: RuntimeWorkflowConfiguration): WorkflowHistoryEntry[] {
    const history: WorkflowHistoryEntry[] = [];

    Object.values(workflow.states).forEach(state => {
      if (state.history) {
        history.push(...state.history);
      }
    });

    // Sort by timestamp
    return history.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Determines if a state should be marked as skipped
   */
  private shouldSkipState(stateKey: string, workflow: RuntimeWorkflowConfiguration): boolean {
    // A state is skipped if it's unreachable from visited states
    // This is a simplified heuristic - could be enhanced with more complex logic
    return false;
  }

  /**
   * Extracts current state form data
   */
  private extractCurrentStateData(workflow: RuntimeWorkflowConfiguration): Record<string, unknown> {
    const currentState = workflow.states[workflow.currentState];
    const formData: Record<string, unknown> = {};

    if (!currentState || !currentState.forms) {
      return formData;
    }

    // Extract data from forms
    currentState.forms.forEach(formRef => {
      const form = workflow.forms[formRef.formName];
      if (!form) return;

      form.fields.forEach(field => {
        if (field.data !== undefined) {
          formData[field.id] = field.data;
        }
      });
    });

    // Add state-specific data if available
    if (currentState.data) {
      Object.assign(formData, currentState.data);
    }

    return formData;
  }

  /**
   * Override to store workflow in context
   */
  protected normalizeInput(input: RuntimeWorkflowConfiguration): RuntimeWorkflowConfiguration {
    this.context.metadata.workflow = input;
    return input;
  }
}

// ============================================================================
// Utility Functions for Runtime Workflows
// ============================================================================

/**
 * Gets workflow status information
 */
export function getWorkflowStatus(workflow: RuntimeWorkflowConfiguration): {
  status: WorkflowStatus;
  label: string;
  color: string;
} {
  return getStatusInfo(workflow.status);
}

/**
 * Calculates workflow progress percentage
 */
export function calculateProgress(workflow: RuntimeWorkflowConfiguration): number {
  const parser = new RuntimeWorkflowParser();

  // Use parser's internal processing
  (parser as any).processHistory(workflow);
  const visitedStates = (parser as any).visitedStates as Set<string>;

  const totalStates = Object.keys(workflow.states).length;
  if (totalStates === 0) return 0;

  const visitedCount = visitedStates.size;
  return Math.min(100, Math.round((visitedCount / totalStates) * 100));
}

/**
 * Gets the current assignee
 */
export function getCurrentAssignee(workflow: RuntimeWorkflowConfiguration): WorkflowAssignee | undefined {
  const currentState = workflow.states[workflow.currentState];
  if (!currentState?.assignees || currentState.assignees.length === 0) {
    return undefined;
  }

  // Return primary assignee or first one
  return currentState.assignees.find(a => a.primary) || currentState.assignees[0];
}

/**
 * Gets the workflow owner (initial assignee)
 */
export function getWorkflowOwner(workflow: RuntimeWorkflowConfiguration): WorkflowAssignee | undefined {
  // Try to find initial state
  let initialState = workflow.states[workflow.startState || ''];

  // If no explicit start state, use first state with assignees
  if (!initialState) {
    for (const state of Object.values(workflow.states)) {
      if (state.assignees && state.assignees.length > 0) {
        initialState = state;
        break;
      }
    }
  }

  if (!initialState?.assignees || initialState.assignees.length === 0) {
    return undefined;
  }

  return initialState.assignees.find(a => a.primary) || initialState.assignees[0];
}

/**
 * Backward compatibility wrapper
 */
export function parseRunningWorkflowToGraph(
  workflow: RuntimeWorkflowConfiguration,
  options?: Partial<ParserOptions>
) {
  const parser = new RuntimeWorkflowParser(options);
  return parser.parse(workflow);
}

/**
 * Validates workflow data with lenient rules
 */
export function validateWorkflowData(data: unknown): data is RuntimeWorkflowConfiguration {
  const parser = new RuntimeWorkflowParser();
  return parser.canParse(data);
}

/**
 * Normalizes workflow data to ensure consistency
 */
export function normalizeWorkflowData(
  data: RuntimeWorkflowConfiguration | { workflow: RuntimeWorkflowConfiguration }
): RuntimeWorkflowConfiguration {
  if ('workflow' in data) {
    return data.workflow;
  }
  return data;
}