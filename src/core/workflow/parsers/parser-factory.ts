/**
 * Workflow Parser Factory
 *
 * Factory for creating and managing workflow parsers.
 * Provides a single entry point for all parsing needs.
 */

import type { ParserOptions, WorkflowInput, ParsedWorkflow } from '../types/unified-types';
import { BaseWorkflowParser } from './base-parser';
import { DesignWorkflowParser } from './design-parser';
import { RuntimeWorkflowParser } from './runtime-parser';

/**
 * Parser types supported by the factory
 */
export type ParserType = 'design' | 'runtime' | 'auto';

/**
 * Parser factory for creating workflow parsers
 */
export class WorkflowParserFactory {
  private static instance: WorkflowParserFactory;
  private parsers: Map<string, BaseWorkflowParser> = new Map();
  private defaultOptions: Partial<ParserOptions> = {};

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Register default parsers
    this.registerParser('design', new DesignWorkflowParser());
    this.registerParser('runtime', new RuntimeWorkflowParser());
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): WorkflowParserFactory {
    if (!WorkflowParserFactory.instance) {
      WorkflowParserFactory.instance = new WorkflowParserFactory();
    }
    return WorkflowParserFactory.instance;
  }

  /**
   * Creates a parser of the specified type
   */
  createParser(type: ParserType, options?: Partial<ParserOptions>): BaseWorkflowParser {
    const mergedOptions = { ...this.defaultOptions, ...options };

    switch (type) {
      case 'design':
        return new DesignWorkflowParser(mergedOptions);

      case 'runtime':
        return new RuntimeWorkflowParser(mergedOptions);

      case 'auto':
        // Auto detection will be handled by parse method
        return new AutoDetectParser(mergedOptions, this);

      default:
        throw new Error(`Unknown parser type: ${type}`);
    }
  }

  /**
   * Registers a custom parser
   */
  registerParser(name: string, parser: BaseWorkflowParser): void {
    this.parsers.set(name, parser);
  }

  /**
   * Gets a registered parser
   */
  getParser(name: string): BaseWorkflowParser | undefined {
    return this.parsers.get(name);
  }

  /**
   * Sets default options for all parsers
   */
  setDefaultOptions(options: Partial<ParserOptions>): void {
    this.defaultOptions = options;
  }

  /**
   * Parses workflow with automatic parser detection
   */
  parse(input: WorkflowInput, options?: Partial<ParserOptions>): ParsedWorkflow {
    const parser = this.detectParser(input);

    if (!parser) {
      throw new Error('No suitable parser found for input');
    }

    if (options) {
      parser.setOptions(options);
    }

    return parser.parse(input);
  }

  /**
   * Validates workflow with automatic parser detection
   */
  validate(input: WorkflowInput) {
    const parser = this.detectParser(input);

    if (!parser) {
      return {
        valid: false,
        errors: ['No suitable parser found for input'],
        warnings: []
      };
    }

    return parser.validate(input);
  }

  /**
   * Detects the appropriate parser for the input
   */
  private detectParser(input: WorkflowInput): BaseWorkflowParser | null {
    // Try registered parsers first
    for (const parser of this.parsers.values()) {
      if (parser.canParse(input)) {
        return parser;
      }
    }

    return null;
  }

  /**
   * Gets all registered parser names
   */
  getParserNames(): string[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * Clears all registered parsers (useful for testing)
   */
  clearParsers(): void {
    this.parsers.clear();
  }

  /**
   * Resets to default parsers
   */
  reset(): void {
    this.clearParsers();
    this.registerParser('design', new DesignWorkflowParser());
    this.registerParser('runtime', new RuntimeWorkflowParser());
    this.defaultOptions = {};
  }
}

/**
 * Auto-detect parser that delegates to appropriate parser
 */
class AutoDetectParser extends BaseWorkflowParser {
  constructor(
    options: Partial<ParserOptions>,
    private factory: WorkflowParserFactory
  ) {
    super(options);
  }

  getName(): string {
    return 'AutoDetectParser';
  }

  canParse(input: unknown): input is WorkflowInput {
    // Can parse if any registered parser can handle it
    const parser = this.factory['detectParser'](input as WorkflowInput);
    return parser !== null;
  }

  parse(input: WorkflowInput): ParsedWorkflow {
    const parser = this.factory['detectParser'](input);

    if (!parser) {
      throw new Error('No suitable parser found for input');
    }

    parser.setOptions(this.options);
    return parser.parse(input);
  }

  protected createNode(): never {
    throw new Error('AutoDetectParser does not create nodes directly');
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Default factory instance
 */
export const parserFactory = WorkflowParserFactory.getInstance();

/**
 * Convenience function to parse workflow with auto-detection
 */
export function parseWorkflow(
  input: WorkflowInput,
  options?: Partial<ParserOptions>
): ParsedWorkflow {
  return parserFactory.parse(input, options);
}

/**
 * Convenience function to validate workflow
 */
export function validateWorkflow(input: WorkflowInput) {
  return parserFactory.validate(input);
}

/**
 * Creates a parser of specified type
 */
export function createParser(
  type: ParserType = 'auto',
  options?: Partial<ParserOptions>
): BaseWorkflowParser {
  return parserFactory.createParser(type, options);
}

// ============================================================================
// Parser Plugins
// ============================================================================

import type { ParserPlugin } from './base-parser';

/**
 * History plugin for adding history support
 */
export class HistoryPlugin implements ParserPlugin {
  name = 'history';
  version = '1.0.0';

  afterParse(result: ParsedWorkflow): ParsedWorkflow {
    // Add history summary to metadata
    if (result.metadata) {
      result.metadata.hasHistory = true;
    }
    return result;
  }
}

/**
 * Metrics plugin for calculating workflow metrics
 */
export class MetricsPlugin implements ParserPlugin {
  name = 'metrics';
  version = '1.0.0';

  afterParse(result: ParsedWorkflow): ParsedWorkflow {
    // Metrics are already calculated by parser-utils
    // This plugin could add additional metrics
    return result;
  }
}

/**
 * Validation plugin for enhanced validation
 */
export class ValidationPlugin implements ParserPlugin {
  name = 'validation';
  version = '1.0.0';

  private additionalRules: Array<(workflow: any) => string | null> = [];

  addRule(rule: (workflow: any) => string | null): void {
    this.additionalRules.push(rule);
  }

  beforeParse(input: any): any {
    // Run additional validation rules
    for (const rule of this.additionalRules) {
      const error = rule(input);
      if (error) {
        throw new Error(error);
      }
    }
    return input;
  }
}

/**
 * Layout plugin for custom layout algorithms
 */
export class LayoutPlugin implements ParserPlugin {
  name = 'layout';
  version = '1.0.0';

  constructor(private layoutAlgorithm: (nodes: any[]) => any[]) {}

  afterParse(result: ParsedWorkflow): ParsedWorkflow {
    // Apply custom layout algorithm
    result.nodes = this.layoutAlgorithm(result.nodes);
    return result;
  }
}

// ============================================================================
// Export all parser types for backward compatibility
// ============================================================================

export { BaseWorkflowParser } from './base-parser';
export { DesignWorkflowParser } from './design-parser';
export { RuntimeWorkflowParser } from './runtime-parser';
export type { ParserPlugin } from './base-parser';