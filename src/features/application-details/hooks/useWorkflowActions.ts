// src/features/application-details/hooks/useWorkflowActions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowService } from "../services/workflowService";

export const useWorkflowActions = (applicationId: string) => {
  const queryClient = useQueryClient();
  
  // Fetch available actions
  const { data: availableActions, isLoading: actionsLoading } = useQuery({
    queryKey: ["workflow", applicationId, "actions"],
    queryFn: () => workflowService.getAvailableActions(applicationId),
    enabled: !!applicationId,
  });
  
  // Perform workflow transition
  const transitionMutation = useMutation({
    mutationFn: (action: { targetState: string; data?: Record<string, unknown>; comment?: string }) =>
      workflowService.performTransition(applicationId, action),
    onSuccess: () => {
      // Invalidate and refetch application details
      queryClient.invalidateQueries(["application", applicationId, "details"]);
      queryClient.invalidateQueries(["workflow", applicationId, "actions"]);
    },
    onError: (error) => {
      console.error("Workflow transition failed:", error);
    },
  });
  
  // Assign workflow instance
  const assignMutation = useMutation({
    mutationFn: ({ assignee, comment }: { assignee: string; comment?: string }) =>
      workflowService.assignInstance(applicationId, assignee, comment),
    onSuccess: () => {
      // Invalidate and refetch application details
      queryClient.invalidateQueries(["application", applicationId, "details"]);
    },
    onError: (error) => {
      console.error("Workflow assignment failed:", error);
    },
  });
  
  return {
    availableActions: availableActions || [],
    actionsLoading,
    performTransition: transitionMutation.mutate,
    isTransitioning: transitionMutation.isLoading,
    transitionError: transitionMutation.error,
    assignInstance: assignMutation.mutate,
    isAssigning: assignMutation.isLoading,
    assignError: assignMutation.error,
  };
};