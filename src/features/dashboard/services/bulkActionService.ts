// src/features/dashboard/services/bulkActionService.ts
import { workflowInstanceApi } from "@lib/api/endpoints/workflow";
import type { ApiResponse } from "@lib/api/types";

export interface BulkActionRequest {
  applicationIds: string[];
  action: "assign" | "approve" | "reject" | "delete";
  payload?: {
    assigneeId?: string;
    comment?: string;
  };
}

export interface BulkActionResult {
  successCount: number;
  failedCount: number;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

export const bulkActionService = {
  /**
   * Perform bulk actions on applications
   */
  async performBulkAction(request: BulkActionRequest): Promise<BulkActionResult> {
    try {
      // For assign action
      if (request.action === "assign" && request.payload?.assigneeId) {
        const results = await Promise.all(
          request.applicationIds.map(async (id) => {
            try {
              await workflowInstanceApi.assign(
                id,
                request.payload!.assigneeId!,
                request.payload?.comment
              );
              return { id, success: true };
            } catch (error) {
              return {
                id,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          })
        );

        return {
          successCount: results.filter((r) => r.success).length,
          failedCount: results.filter((r) => !r.success).length,
          results,
        };
      }

      // For other actions, we would implement similar logic
      // This is a simplified implementation for now
      throw new Error(`Bulk action '${request.action}' not implemented`);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      throw error;
    }
  }
};