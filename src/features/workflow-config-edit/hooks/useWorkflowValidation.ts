// src/features/workflow-config-edit/hooks/useWorkflowValidation.ts
import { useState, useEffect, useMemo } from "react";
import { validationService, type ValidationResponse } from "../services/validationService";
import type { BuilderNode, BuilderEdge } from "@features/workflow-config-edit/types/builder.types";

export const useWorkflowValidation = (nodes: BuilderNode[], edges: BuilderEdge[]) => {
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Debounced validation
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      return;
    }
    
    setIsValidating(true);
    
    // Debounce validation by 500ms
    const timeoutId = setTimeout(async () => {
      try {
        const result = await validationService.validateWorkflow(nodes, edges);
        setValidation(result);
      } catch (error) {
        console.error("Validation error:", error);
        setValidation(null);
      } finally {
        setIsValidating(false);
      }
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [nodes, edges]);
  
  // Check if workflow is valid
  const isValid = useMemo(() => {
    return validation?.valid ?? true;
  }, [validation]);
  
  // Get validation errors
  const errors = useMemo(() => {
    return validation?.errors.filter(e => e.type === "error") ?? [];
  }, [validation]);
  
  // Get validation warnings
  const warnings = useMemo(() => {
    return validation?.errors.filter(e => e.type === "warning") ?? [];
  }, [validation]);
  
  return {
    validation,
    isValid,
    errors,
    warnings,
    isValidating,
    statistics: validation?.statistics
  };
};