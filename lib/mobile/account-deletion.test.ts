import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("account deletion route", () => {
  it("deletes only recommendation snapshots owned by the current user", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/mobile/account/delete/route.ts"),
      "utf8",
    );

    expect(source).toContain('.delete().eq("user_id", userId)');
    expect(source).not.toContain('.delete().is("user_id", null)');
  });
});
