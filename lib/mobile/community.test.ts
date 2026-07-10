import { describe, expect, it } from "vitest";
import { collectBlockedUserIds, decorateCommunityRows } from "./community";

describe("community helpers", () => {
  it("collects both users blocked by me and users who blocked me", () => {
    expect(
      collectBlockedUserIds(
        [
          { blocker_id: "me", blocked_id: "user-a" },
          { blocker_id: "user-b", blocked_id: "me" },
        ],
        "me",
      ),
    ).toEqual(["user-a", "user-b"]);
  });

  it("decorates public rows with my like and favorite state", () => {
    expect(decorateCommunityRows([{ id: "one" }, { id: "two" }], ["one"], ["two"])).toEqual([
      { id: "one", liked_by_me: true, favorited_by_me: false },
      { id: "two", liked_by_me: false, favorited_by_me: true },
    ]);
  });
});
