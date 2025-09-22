// src/features/application-details/hooks/useDocuments.ts
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationDetailsService } from "../services/applicationDetailsService";

export const useDocuments = (applicationId: string) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["application", applicationId, "documents"],
    queryFn: () => applicationDetailsService.getApplicationDocuments(applicationId),
    enabled: !!applicationId,
  });

  // Upload document
  const uploadMutation = useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType?: string }) =>
      applicationDetailsService.uploadDocument(applicationId, file, documentType),
    onMutate: () => {
      setUploadProgress(0);
    },
    onSuccess: () => {
      // Invalidate and refetch documents
      queryClient.invalidateQueries(["application", applicationId, "documents"]);
      setUploadProgress(0);
    },
    onError: (error) => {
      console.error("Document upload failed:", error);
      setUploadProgress(0);
    },
  });

  // Handle upload progress
  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  return {
    documents: documents || [],
    isLoading,
    error,
    uploadDocument: uploadMutation.mutate,
    isUploading: uploadMutation.isLoading,
    uploadProgress,
    handleUploadProgress,
  };
};