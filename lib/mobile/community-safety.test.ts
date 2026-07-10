import { describe, expect, it } from "vitest";
import { moderationStatusAfterReportCount } from "./community-safety";

describe("moderationStatusAfterReportCount", () => {
  it("keeps low-report public content visible", () => {
    expect(moderationStatusAfterReportCount(2)).toBe("visible");
  });

  it("queues content after three reports", () => {
    expect(moderationStatusAfterReportCount(3)).toBe("pending_review");
  });
});
