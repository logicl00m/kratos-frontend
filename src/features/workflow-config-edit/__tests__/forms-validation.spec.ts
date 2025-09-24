import { describe, it, expect } from 'vitest';
import type { Node, Edge } from 'reactflow';
import type { BuilderNodeData, ProcessNodeData, FormRef } from '@features/workflow-config-edit/types/builder.types';
import { validateWorkflowWithForms } from '@features/workflow-config-edit/utils/builderUtils';

const process = (id: string, overrides: Partial<ProcessNodeData> = {}): Node<BuilderNodeData> => ({
  id,
  type: 'process',
  position: { x: 0, y: 0 },
  data: {
    label: id,
    assignees: [],
    actions: {
      left: { label: 'Left' },
      center: { label: 'Submit' },
      right: { label: 'Right' },
    },
    ...overrides,
  } as ProcessNodeData,
});

const edge = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target,
});

describe('forms validation', () => {
  it('No forms attached → ok=false, error count = #processNodes', () => {
    const nodes: Array<Node<BuilderNodeData>> = [process('p1'), process('p2')];
    const edges: Edge[] = [edge('e1', 'p1', 'p2')];
    const result = validateWorkflowWithForms(nodes, edges);
    const errorsAboutForms = result.errors.filter((e) => e.includes('no form attached'));
    expect(result.ok).toBe(false);
    expect(errorsAboutForms.length).toBe(2);
  });

  it('Mixed pinned/latest → ok=true, warning count = #latest', () => {
    const nodes: Array<Node<BuilderNodeData>> = [
      process('p1', { form: { id: 'f1', name: 'A', version: 1, binding: 'pinned' } }),
      process('p2', { form: { id: 'f2', name: 'B', version: 2, binding: 'latest' } }),
    ];
    const edges: Edge[] = [edge('e1', 'p1', 'p2')];
    const result = validateWorkflowWithForms(nodes, edges);
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBe(1);
  });

  it('100% coverage, all pinned → ok=true, no warnings', () => {
    const nodes: Array<Node<BuilderNodeData>> = [
      process('p1', { form: { id: 'f1', name: 'A', version: 1, binding: 'pinned' } }),
      process('p2', { form: { id: 'f2', name: 'B', version: 2, binding: 'pinned' } }),
    ];
    const edges: Edge[] = [edge('e1', 'p1', 'p2')];
    const result = validateWorkflowWithForms(nodes, edges);
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBe(0);
  });

  it('Global form provided → ok=true, no errors even without individual forms', () => {
    const nodes: Array<Node<BuilderNodeData>> = [process('p1'), process('p2')];
    const edges: Edge[] = [edge('e1', 'p1', 'p2')];
    const globalForm: FormRef = { id: 'global', name: 'GlobalForm', version: 1, binding: 'pinned' };
    const result = validateWorkflowWithForms(nodes, edges, globalForm);
    const errorsAboutForms = result.errors.filter((e) => e.includes('no form attached'));
    expect(result.ok).toBe(true);
    expect(errorsAboutForms.length).toBe(0);
    expect(result.coverage.withForms).toBe(2);
    expect(result.coverage.totalProcessNodes).toBe(2);
  });

  it('Global form with latest binding → ok=true, warning about non-deterministic behavior', () => {
    const nodes: Array<Node<BuilderNodeData>> = [process('p1'), process('p2')];
    const edges: Edge[] = [edge('e1', 'p1', 'p2')];
    const globalForm: FormRef = { id: 'global', name: 'GlobalForm', version: 1, binding: 'latest' };
    const result = validateWorkflowWithForms(nodes, edges, globalForm);
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBe(2); // One warning per process node
    const warningsAboutLatest = result.warnings.filter((w) => w.includes('tracks latest'));
    expect(warningsAboutLatest.length).toBe(2);
  });
});
