// src/features/workflow-config-edit/hooks/usePeopleAndRoles.ts
import { useQuery } from "@tanstack/react-query";
import { peopleService } from "../services/peopleService";

export const usePeopleAndRoles = () => {
  return useQuery({
    queryKey: ["workflow", "people"],
    queryFn: () => peopleService.getPeopleAndRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};