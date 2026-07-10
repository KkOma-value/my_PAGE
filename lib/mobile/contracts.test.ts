import { describe, expect, it } from "vitest";
import {
  CHECKIN_VISIBILITIES,
  MODERATION_STATUSES,
  RECOGNITION_STATUSES,
  SNAPSHOT_TYPES,
} from "./contracts";

describe("mobile contracts", () => {
  it("defines stable visibility values", () => {
    expect(CHECKIN_VISIBILITIES).toEqual(["public", "private"]);
  });

  it("defines moderation states used by public surfaces", () => {
    expect(MODERATION_STATUSES).toEqual(["visible", "pending_review", "hidden"]);
  });

  it("defines async recognition states", () => {
    expect(RECOGNITION_STATUSES).toEqual(["idle", "uploading", "recognizing", "ready", "failed"]);
  });

  it("defines all discover snapshot types", () => {
    expect(SNAPSHOT_TYPES).toEqual(["city", "region", "season", "personal"]);
  });
});
