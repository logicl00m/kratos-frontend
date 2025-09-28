/**
 * Base Workflow Parser
 *
 * Abstract base class for all workflow parsers.
 * Provides common functionality and enforces consistent interface.
 */

import type { Node, Edge } from 'reactflow';
import type {
  WorkflowConfiguration,
  RuntimeWorkflowConfiguration,
  WorkflowState,
  RuntimeWorkflowState,
  WorkflowNodeData,
  ParserOptions,
  ParserContext,
  ParsedWorkflow,
  WorkflowValidationResult,
  WorkflowInput,
  DEFAULT_PARSER_OPTIONS
} from '../types/unified-types';
import {
  validateWorkflowStructure,
  calculateNodePosition,
  createStyledEdge,
  extractStateFields,
  calculateWorkflowMetrics,
  formatStateName
} from '../utils/parser-utils';

/**
 * Abstract base class for workflow parsers
 */
export abstract class BaseWorkflowParser<
  TInput extends WorkflowInput = WorkflowConfiguration,
  TNodeData extends WorkflowNodeData = WorkflowNodeData
> {
  protected options: ParserOptions;
  protected context: ParserContext;

  constructor(options: Partial<ParserOptions> = {}) {
    this.options = this.mergeOptions(options);
    this.context = {
      options: this.options,
      errors: [],
      warnings: [],
      metadata: {}
    };
  }

  // ============================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ============================================================================

  /**
   * Creates a node from a workflow state
   */
  protected abstract createNode(
    stateKey: string,
    state: WorkflowState | RuntimeWorkflowState,
    index: number,
    totalNodes: number
  ): Node<TNodeData>;

  /**
   * Determines if the parser can handle the given input
   */
  abstract canParse(input: unknown): input is TInput;

  /**
   * Gets the parser name for identification
   */
  abstract getName(): string;

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Main parsing method
   */
  public parse(input: TInput): ParsedWorkflow {
    // Reset context for new parse
    this.resetContext();

    try {
      // Validate input
      if (!this.canParse(input)) {
        throw new Error(`Invalid input for ${this.getName()} parser`);
      }

      // Extract workflow data
      const workflow = this.normalizeInput(input);

      // Validate structure
      if (this.options.features?.includeValidation) {
        const validation = this.validateInput(workflow);
        this.context.errors.push(...validation.errors);
        this.context.warnings.push(...validation.warnings);
      }

      // Create nodes
      const nodes = this.createNodes(workflow);

      // Create edges
      const edges = this.createEdges(workflow, nodes);

      // Calculate metrics if requested
      let metrics;
      if (this.options.features?.includeMetrics) {
        metrics = calculateWorkflowMetrics(nodes, edges);
      }

      // Build result
      const result: ParsedWorkflow = {
        nodes,
        edges,
        metadata: workflow.metadata,
        validation: {
          valid: this.context.errors.length === 0,
          errors: this.context.errors,
          warnings: this.context.warnings
        }
      };

      if (metrics) {
        result.metrics = metrics;
      }

      return result;
    } catch (error) {
      // Handle parsing errors
      this.context.errors.push(error instanceof Error ? error.message : 'Unknown parsing error');

      return {
        nodes: [],
        edges: [],
        validation: {
          valid: false,
          errors: this.context.errors,
          warnings: this.context.warnings
        }
      };
    }
  }

  /**
   * Validates the input without parsing
   */
  public validate(input: TInput): WorkflowValidationResult {
    this.resetContext();

    if (!this.canParse(input)) {
      return {
        valid: false,
        errors: [`Invalid input for ${this.getName()} parser`],
        warnings: []
      };
    }

    const workflow = this.normalizeInput(input);
    const validation = this.validateInput(workflow);

    return {
      valid: validation.errors.length === 0,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestions: this.generateSuggestions(workflow, validation)
    };
  }

  /**
   * Updates parser options
   */
  public setOptions(options: Partial<ParserOptions>): void {
    this.options = this.mergeOptions(options);
    this.context.options = this.options;
  }

  /**
   * Gets current parser options
   */
  public getOptions(): ParserOptions {
    return { ...this.options };
  }

  // ============================================================================
  // Protected Methods (can be overridden by subclasses)
  // ============================================================================

  /**
   * Normalizes input to a consistent format
   */
  protected normalizeInput(input: TInput): WorkflowConfiguration {
    // Default implementation assumes WorkflowConfiguration
    return input as WorkflowConfiguration;
  }

  /**
   * Creates all nodes from the workflow
   */
  protected createNodes(workflow: WorkflowConfiguration): Node<TNodeData>[] {
    const nodes: Node<TNodeData>[] = [];
    const states = workflow.states;
    const stateKeys = Object.keys(states);
    const totalNodes = stateKeys.length;

    stateKeys.forEach((stateKey, index) => {
      const state = states[stateKey];
      const node = this.createNode(stateKey, state, index, totalNodes);
      nodes.push(node);
    });

    return nodes;
  }

  /**
   * Creates all edges from the workflow
   */
  protected createEdges(
    workflow: WorkflowConfiguration,
    nodes: Node<TNodeData>[]
  ): Edge[] {
    const edges: Edge[] = [];
    const states = workflow.states;
    const nodeIds = new Set(nodes.map(n => n.id));

    // Track edge counts for duplicate detection
    const edgeCountMap = new Map<string, number>();
    const directedEdgeMap = new Map<string, number>();

    Object.entries(states).forEach(([stateKey, state]) => {
      if (!state.actions) return;

      Object.entries(state.actions).forEach(([actionName, action]) => {
        // Validate target state exists
        if (!action.nextState || !nodeIds.has(action.nextState)) {
          this.context.warnings.push(
            `Action "${actionName}" in state "${stateKey}" references non-existent state "${action.nextState}"`
          );
          return;
        }

        // Track directed edges for bidirectional detection
        const directedKey = `${stateKey}->${action.nextState}`;
        const reverseKey = `${action.nextState}->${stateKey}`;
        const hasReverseEdge = directedEdgeMap.has(reverseKey);
        const edgeCount = (directedEdgeMap.get(directedKey) || 0) + 1;
        directedEdgeMap.set(directedKey, edgeCount);

        // Create the edge
        const edge = this.createEdge(
          stateKey,
          action.nextState,
          actionName,
          action,
          {
            isSelfLoop: stateKey === action.nextState,
            hasReverseEdge,
            edgeCount
          }
        );

        edges.push(edge);
      });
    });

    return edges;
  }

  /**
   * Creates a single edge
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
    return createStyledEdge(source, target, action, actionName, options);
  }

  /**
   * Validates the workflow structure
   */
  protected validateInput(workflow: WorkflowConfiguration): {
    errors: string[];
    warnings: string[];
  } {
    return validateWorkflowStructure(workflow.states, workflow.forms);
  }

  /**
   * Generates suggestions for fixing validation issues
   */
  protected generateSuggestions(
    workflow: WorkflowConfiguration,
    validation: { errors: string[]; warnings: string[] }
  ): string[] {
    const suggestions: string[] = [];

    // Suggest adding states if empty
    if (Object.keys(workflow.states).length === 0) {
      suggestions.push('Add at least one state to your workflow');
    }

    // Suggest adding terminal state if missing
    const hasTerminalState = Object.values(workflow.states).some(
      state => !state.actions || Object.keys(state.actions).length === 0
    );
    if (!hasTerminalState) {
      suggestions.push('Consider adding a terminal state (a state with no outgoing actions)');
    }

    // Suggest fixing unreachable states
    if (validation.warnings.some(w => w.includes('Unreachable'))) {
      suggestions.push('Connect all states to ensure they are reachable from the start state');
    }

    return suggestions;
  }

  /**
   * Calculates node position
   */
  protected calculatePosition(index: number, totalNodes: number): { x: number; y: number } {
    if (!this.options.layout) {
      return { x: 0, y: 0 };
    }

    return calculateNodePosition(index, totalNodes, this.options.layout);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Merges options with defaults
   */
  private mergeOptions(options: Partial<ParserOptions>): ParserOptions {
    const defaultOptions: ParserOptions = {
      nodeStyle: 'detailed',
      layout: {
        algorithm: 'grid',
        direction: 'horizontal',
        spacing: {
          horizontal: 300,
          vertical: 200
        }
      },
      features: {
        includeFormData: true,
        includeAssignees: false,
        includeHistory: false,
        includeMetrics: false,
        includeValidation: true
      },
      visual: {
        edgeStyle: 'smooth',
        animateTransitions: false,
        showLabels: true,
        colorScheme: 'default'
      }
    };

    return {
      ...defaultOptions,
      ...options,
      layout: {
        ...defaultOptions.layout,
        ...options.layout,
        spacing: {
          ...defaultOptions.layout?.spacing,
          ...options.layout?.spacing
        }
      },
      features: {
        ...defaultOptions.features,
        ...options.features
      },
      visual: {
        ...defaultOptions.visual,
        ...options.visual
      }
    };
  }

  /**
   * Resets the parser context
   */
  private resetContext(): void {
    this.context = {
      options: this.options,
      errors: [],
      warnings: [],
      metadata: {}
    };
  }
}

/**
 * Plugin interface for extending parsers
 */
export interface ParserPlugin<T = any> {
  name: string;
  version: string;

  /**
   * Called before parsing begins
   */
  beforeParse?(input: T, context: ParserContext): T | Promise<T>;

  /**
   * Called to transform a node
   */
  transformNode?(node: Node, context: ParserContext): Node | Promise<Node>;

  /**
   * Called to transform an edge
   */
  transformEdge?(edge: Edge, context: ParserContext): Edge | Promise<Edge>;

  /**
   * Called after parsing completes
   */
  afterParse?(result: ParsedWorkflow, context: ParserContext): ParsedWorkflow | Promise<ParsedWorkflow>;
}

/**
 * Base class with plugin support
 */
export abstract class PluggableWorkflowParser<
  TInput extends WorkflowInput = WorkflowConfiguration,
  TNodeData extends WorkflowNodeData = WorkflowNodeData
> extends BaseWorkflowParser<TInput, TNodeData> {
  private plugins: ParserPlugin[] = [];

  /**
   * Adds a plugin to the parser
   */
  public use(plugin: ParserPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  /**
   * Removes a plugin from the parser
   */
  public removePlugin(pluginName: string): this {
    this.plugins = this.plugins.filter(p => p.name !== pluginName);
    return this;
  }

  /**
   * Gets all installed plugins
   */
  public getPlugins(): ParserPlugin[] {
    return [...this.plugins];
  }

  /**
   * Enhanced parse method with plugin support
   */
  public async parseAsync(input: TInput): Promise<ParsedWorkflow> {
    // Apply beforeParse plugins
    let processedInput = input;
    for (const plugin of this.plugins) {
      if (plugin.beforeParse) {
        processedInput = await plugin.beforeParse(processedInput, this.context);
      }
    }

    // Run base parser
    const result = this.parse(processedInput);

    // Apply node transform plugins
    if (this.plugins.some(p => p.transformNode)) {
      for (let i = 0; i < result.nodes.length; i++) {
        for (const plugin of this.plugins) {
          if (plugin.transformNode) {
            result.nodes[i] = await plugin.transformNode(result.nodes[i], this.context);
          }
        }
      }
    }

    // Apply edge transform plugins
    if (this.plugins.some(p => p.transformEdge)) {
      for (let i = 0; i < result.edges.length; i++) {
        for (const plugin of this.plugins) {
          if (plugin.transformEdge) {
            result.edges[i] = await plugin.transformEdge(result.edges[i], this.context);
          }
        }
      }
    }

    // Apply afterParse plugins
    let finalResult = result;
    for (const plugin of this.plugins) {
      if (plugin.afterParse) {
        finalResult = await plugin.afterParse(finalResult, this.context);
      }
    }

    return finalResult;
  }
}