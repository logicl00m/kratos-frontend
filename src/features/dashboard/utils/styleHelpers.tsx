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
    ARMDraft: "bg-indigo-500",
    RMReview: "bg-blue-500",
    CMReview: "bg-purple-500",
    RMResubmission: "bg-amber-500",
    THCRMDecision: "bg-pink-500",
    Completed: "bg-emerald-500",
  };
  return colors[stage] || "bg-gray-500";
};

export const getSlaColor = (status: SLAStatus) => {
  const colors: { [key in SLAStatus]: string } = {
    overdue: "text-red-600 font-semibold",
    due: "text-amber-600 font-medium",
    ontime: "text-gray-600",
    completed: "text-emerald-600 font-medium",
  };
  return colors[status] || "text-gray-600";
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