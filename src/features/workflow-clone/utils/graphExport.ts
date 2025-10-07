// src/features/workflow/utils/graphExport.ts
import { downloadBlob } from "@shared/utils/download";

export type GraphExportData = {
  nodes: Array<{ id: string; position: { x: number; y: number }; data: unknown }>;
  edges: Array<{ source: string; target: string; label?: string; data?: unknown }>;
};

export function exportGraphToJson(data: GraphExportData, filename = "workflow-graph.json") {
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
}
