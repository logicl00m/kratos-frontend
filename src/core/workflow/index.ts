/**
 * Unified Workflow Parser Module
 *
 * Main export file for the refactored workflow parser system.
 * This module provides a unified, extensible, and maintainable
 * solution for all workflow parsing needs in the application.
 */

// ============================================================================
// Type Exports
// ============================================================================

export * from './types/unified-types';

// ============================================================================
// Parser Exports
// ============================================================================

export {
  BaseWorkflowParser,
  PluggableWorkflowParser,
  type ParserPlugin
} from './parsers/base-parser';

export {
  DesignWorkflowParser,
  parseWorkflowToGraph,
  exportGraphToWorkflow
} from './parsers/design-parser';

export {
  RuntimeWorkflowParser,
  parseRunningWorkflowToGraph,
  getWorkflowStatus,
  calculateProgress,
  getCurrentAssignee,
  getWorkflowOwner,
  validateWorkflowData,
  normalizeWorkflowData
} from './parsers/runtime-parser';

export {
  WorkflowParserFactory,
  parserFactory,
  parseWorkflow,
  validateWorkflow,
  createParser,
  HistoryPlugin,
  MetricsPlugin,
  ValidationPlugin,
  LayoutPlugin,
  type ParserType
} from './parsers/parser-factory';

// ============================================================================
// Utility Exports
// ============================================================================

export {
  // Edge utilities
  getEdgeStyle,
  getEdgeHandles,
  calculateEdgeCurveProperties,
  createStyledEdge,

  // Node positioning
  calculateNodePosition,
  type LayoutOptions,

  // Field extraction
  extractStateFields,
  buildFieldLookup,

  // Status utilities
  determineWorkflowStatus,
  getStatusInfo,

  // Validation
  validateWorkflowStructure,

  // Formatting
  formatActionLabel,
  formatStateName,
  toTitleCase,

  // Metrics
  calculateWorkflowMetrics,

  // Types
  type EdgeStyle
} from './utils/parser-utils';

// ============================================================================
// Backward Compatibility Exports
// ============================================================================

/**
 * Legacy function for parsing workflow to graph
 * @deprecated Use parseWorkflow() or DesignWorkflowParser instead
 */
export function parseWorkflowToGraphLegacy(workflow: any, options?: any) {
  console.warn('parseWorkflowToGraphLegacy is deprecated. Use parseWorkflow() instead.');
  return parseWorkflowToGraph(workflow, options);
}

/**
 * Legacy function for parsing running workflow
 * @deprecated Use parseWorkflow() or RuntimeWorkflowParser instead
 */
export function parseRunningWorkflowToGraphLegacy(workflow: any, options?: any) {
  console.warn('parseRunningWorkflowToGraphLegacy is deprecated. Use parseWorkflow() instead.');
  return parseRunningWorkflowToGraph(workflow, options);
}

// ============================================================================
// Quick Start Functions
// ============================================================================

/**
 * Quick function to parse any workflow type
 */
export function parse(input: any, options?: any) {
  return parseWorkflow(input, options);
}

/**
 * Quick function to validate any workflow type
 */
export function validate(input: any) {
  return validateWorkflow(input);
}

// ============================================================================
// Default Export (Removed to avoid circular dependencies)
// ============================================================================

// Export everything as named exports only to avoid hoisting issues