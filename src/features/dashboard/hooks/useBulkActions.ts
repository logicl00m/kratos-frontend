// src/features/dashboard/hooks/useBulkActions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkActionService, type BulkActionRequest } from "../services/bulkActionService";

export const useBulkActions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkActionService.performBulkAction,
    onSuccess: () => {
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries(["applications"]);
      queryClient.invalidateQueries(["dashboard", "stats"]);
    },
    onError: (error) => {
      console.error("Bulk action failed:", error);
      // In a real implementation, we would show an error notification to the user
    }
  });
};