/*
PROMPT (Copilot/GPT-5): formsApi in-memory stub + Zod

- Stub client for:
  - searchForms(query: string): Promise<FormSummary[]>
  - createForm(payload: FormDTO): Promise<FormRef & { json: object }>
  - getForm(id: string, version?: number): Promise<FormDTO>
- Use in-memory array for now; easy to swap to backend.
- Add Zod validators for DTOs.

Types:
- FormDTO: { id?: string; name: string; version?: number; json: object }
- FormRef: { id: string; name: string; version: number; binding: 'pinned' | 'latest' }
*/

import { z } from 'zod';
import type { FormRef } from '@features/workflow-config-edit/types/builder.types';

// Zod Schemas
export const FormDTOSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  version: z.number().int().positive().optional(),
  json: z.record(z.string(), z.unknown()),
});
export type FormDTO = z.infer<typeof FormDTOSchema>;

export const FormSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.number().int().positive(),
});
export type FormSummary = z.infer<typeof FormSummarySchema>;

// In-memory store
const formsStore: Array<Required<FormDTO>> = [
  {
    id: 'form-applicationCore',
    name: 'applicationCore',
    version: 3,
    json: {
      applicationCore: {
        fields: [
          { id: 'applicantLegalName', type: 'text', data: '{{ data.borrower.legalName }}', fieldActions: ['save','validate'] },
          { id: 'requestedAmount', type: 'number', data: '{{ data.facility.requestedAmount }}', fieldActions: ['save','validate'] },
        ],
      },
    },
  },
];

const delay = async (ms = 150) => new Promise((res) => setTimeout(res, ms));

export async function searchForms(query: string): Promise<FormSummary[]> {
  await delay();
  const q = query.trim().toLowerCase();
  const matches = formsStore
    .filter((f) => !q || f.name.toLowerCase().includes(q))
    .sort((a, b) => b.version - a.version)
    .map(({ id, name, version }) => ({ id, name, version }));
  return FormSummarySchema.array().parse(matches);
}

export async function createForm(payload: FormDTO): Promise<FormRef & { json: object }> {
  await delay();
  const input = FormDTOSchema.parse(payload);
  const existing = formsStore.filter((f) => f.name === input.name);
  const nextVersion = existing.length > 0 ? Math.max(...existing.map((f) => f.version)) + 1 : 1;
  const id = input.id ?? `form-${input.name}`;
  const saved: Required<FormDTO> = {
    id,
    name: input.name,
    version: nextVersion,
    json: input.json,
  };
  formsStore.push(saved);
  const ref: FormRef & { json: object } = {
    id: saved.id,
    name: saved.name,
    version: saved.version,
    binding: 'pinned',
    json: saved.json,
  };
  return ref;
}

export async function getForm(id: string, version?: number): Promise<FormDTO> {
  await delay();
  const candidates = formsStore.filter((f) => f.id === id);
  if (candidates.length === 0) throw new Error('Form not found');
  const selected = typeof version === 'number'
    ? candidates.find((f) => f.version === version)
    : [...candidates].sort((a, b) => b.version - a.version)[0];
  if (!selected) throw new Error('Requested form version not found');
  return { id: selected.id, name: selected.name, version: selected.version, json: selected.json };
}

export const formsApi = { searchForms, createForm, getForm } as const;
