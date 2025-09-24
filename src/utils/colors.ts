// src/shared/utils/colors.ts
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    Disbursement: "#3b82f6",
    Verification: "#f59e0b",
    Underwriting: "#8b5cf6",
    Decision: "#ef4444",
    RMReview: "#06b6d4",
    CMReview: "#ec4899",
    BusinessReview: "#10b981",
    ARMDraft: "#6366f1",
  };
  return colors[stage] || "#6b7280";
}
