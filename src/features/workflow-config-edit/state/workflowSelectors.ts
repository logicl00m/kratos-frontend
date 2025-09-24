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
	nodes: Array<Node<BuilderNodeData>>,
	globalForm?: { binding: 'pinned' | 'latest' }
): { withForms: number; total: number } => {
	const processNodes = selectProcessNodes(nodes);
	const total = processNodes.length;
	
	// If global form is provided, all nodes are considered to have forms
	if (globalForm) {
		return { withForms: total, total };
	}
	
	const withForms = processNodes.filter((n) => n.data.form).length;
	return { withForms, total };
};

export const selectLatestBindingNodes = (
	nodes: Array<Node<BuilderNodeData>>,
	globalForm?: { binding: 'pinned' | 'latest' }
): Array<Node<ProcessNodeData>> => {
	const processNodes = selectProcessNodes(nodes);
	
	// If global form is latest, all nodes are considered latest
	if (globalForm?.binding === 'latest') {
		return processNodes;
	}
	
	return processNodes.filter((n) => n.data.form?.binding === 'latest');
};
