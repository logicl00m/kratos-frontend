// src/features/workflow-config-edit/services/peopleService.ts
import type { Person } from "@features/workflow-config-edit/types/builder.types";

export const peopleService = {
  /**
   * Fetch people and roles for workflow builder
   */
  async getPeopleAndRoles(): Promise<Person[]> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll return mock data
      return [
        { id: "user1", name: "Fahim Ahmed", type: "user" },
        { id: "user2", name: "Sadia Rahman", type: "user" },
        { id: "user3", name: "Rafiq Khan", type: "user" },
        { id: "role1", name: "Relationship Manager", type: "role" },
        { id: "role2", name: "Credit Manager", type: "role" },
        { id: "role3", name: "Team Head CRM", type: "role" },
      ];
    } catch (error) {
      console.error("Error fetching people and roles:", error);
      throw error;
    }
  }
};