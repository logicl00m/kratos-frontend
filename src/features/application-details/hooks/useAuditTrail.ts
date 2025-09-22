// src/features/application-details/hooks/useAuditTrail.ts
import { useQuery } from "@tanstack/react-query";
import { applicationDetailsService } from "../services/applicationDetailsService";

export const useAuditTrail = (applicationId: string) => {
  return useQuery({
    queryKey: ["application", applicationId, "auditTrail"],
    queryFn: () => applicationDetailsService.getApplicationHistory(applicationId),
    enabled: !!applicationId,
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};