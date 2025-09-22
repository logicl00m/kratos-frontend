/*
PROMPT (Copilot/GPT-5): Workflow selectors for forms coverage

- Selector: selectProcessNodes()
- Selector: selectFormsCoverage() → { withForms, total }
- Selector: selectLatestBindingNodes() → Node[]

Note: This file uses plain functions over arrays to remain store-agnostic.
*/

import type { Node } from 'reactflow';
import type { BuilderNodeData, ProcessNodeData } from '@features/workflow-config-edit/types/builder.types';

export const selectProcessNodes = (
	nodes: Array<Node<BuilderNodeData>>
): Array<Node<ProcessNodeData>> => nodes.filter((n) => n.type === 'process') as Array<Node<ProcessNodeData>>;

export const selectFormsCoverage = (
	nodes: Array<Node<BuilderNodeData>>
): { withForms: number; total: number } => {
	const processNodes = selectProcessNodes(nodes);
	const total = processNodes.length;
	const withForms = processNodes.filter((n) => n.data.form).length;
	return { withForms, total };
};

export const selectLatestBindingNodes = (
	nodes: Array<Node<BuilderNodeData>>
): Array<Node<ProcessNodeData>> =>
	selectProcessNodes(nodes).filter((n) => n.data.form?.binding === 'latest');
