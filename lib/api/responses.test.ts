import { describe, expect, it } from "vitest";
import { jsonErrorPayload, jsonOkPayload } from "./responses";

describe("API response payloads", () => {
  it("wraps success data", () => {
    expect(jsonOkPayload({ id: "1" })).toEqual({ success: true, data: { id: "1" } });
  });

  it("wraps errors", () => {
    expect(jsonErrorPayload("BAD_INPUT", "Invalid request")).toEqual({
      success: false,
      error: { code: "BAD_INPUT", message: "Invalid request" },
    });
  });
});
