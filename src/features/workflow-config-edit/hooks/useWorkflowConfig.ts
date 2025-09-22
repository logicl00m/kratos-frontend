// src/features/workflow-config-edit/hooks/useWorkflowConfig.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workflowConfigService } from "../services/workflowConfigService";
import type { WorkflowBuilderConfig } from "@features/workflow-config-edit/types/builder.types";

export const useWorkflowConfig = (configId?: string) => {
  const queryClient = useQueryClient();
  
  // Load workflow configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["workflow", "config", configId],
    queryFn: () => configId ? workflowConfigService.loadConfiguration(configId) : null,
    enabled: !!configId,
  });
  
  // Save workflow configuration
  const saveMutation = useMutation({
    mutationFn: (config: WorkflowBuilderConfig) => workflowConfigService.saveConfiguration(config),
    onSuccess: (data) => {
      // Invalidate and refetch workflow config
      queryClient.invalidateQueries(["workflow", "config", data.id]);
    },
    onError: (error) => {
      console.error("Error saving workflow configuration:", error);
    },
  });
  
  // Get templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["workflow", "templates"],
    queryFn: () => workflowConfigService.getTemplates(),
  });
  
  return {
    config: config || null,
    configLoading,
    saveConfig: saveMutation.mutate,
    isSaving: saveMutation.isLoading,
    saveError: saveMutation.error,
    templates: templates || [],
    templatesLoading,
  };
};