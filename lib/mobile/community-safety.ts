import type { ModerationStatus } from "./contracts";

export function moderationStatusAfterReportCount(reportCount: number): ModerationStatus {
  return reportCount >= 3 ? "pending_review" : "visible";
}
