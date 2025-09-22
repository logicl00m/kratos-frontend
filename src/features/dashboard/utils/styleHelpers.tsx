// src/features/dashboard/utils/styleHelpers.ts
import React from "react";
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
import type { LoanApplication } from "@features/dashboard/types/dashboard.types";

type SLAStatus = "ontime" | "due" | "overdue" | "completed";

export const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    ARMDraft: "bg-indigo-600",
    RMReview: "bg-blue-600",
    CMReview: "bg-purple-600",
    RMResubmission: "bg-amber-600",
    THCRMDecision: "bg-pink-600",
    Completed: "bg-emerald-600",
  };
  return colors[stage] || "bg-gray-600";
};

export const getStatusIcon = (status: SLAStatus) => {
  if (status === "overdue")
    return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === "due")
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  if (status === "completed")
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  return <Clock className="w-4 h-4 text-gray-400" />;
};