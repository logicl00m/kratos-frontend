// src/features/application-details/hooks/useApplicationDetails.ts
import { useQuery } from "@tanstack/react-query";
import { applicationDetailsService } from "../services/applicationDetailsService";

export const useApplicationDetails = (id: string) => {
  return useQuery({
    queryKey: ["application", id, "details"],
    queryFn: () => applicationDetailsService.getApplicationDetails(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};