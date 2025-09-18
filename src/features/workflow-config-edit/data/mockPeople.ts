import type { Person } from "@features/workflow-config-edit/types/builder.types";

export const mockPeople: Person[] = [
  { id: "user-arm-1", name: "Ayesha Rahman", type: "user" },
  { id: "user-arm-2", name: "Fahim Ahmed", type: "user" },
  { id: "role-rm", name: "Relationship Manager", type: "role" },
  { id: "role-credit", name: "Credit Analyst", type: "role" },
  { id: "role-ops", name: "Operations", type: "role" }
];
