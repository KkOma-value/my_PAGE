import { describe, expect, it } from "vitest";
import { parseBearerToken } from "./auth";

describe("parseBearerToken", () => {
  it("returns token from a valid Bearer header", () => {
    expect(parseBearerToken("Bearer access-token")).toBe("access-token");
  });

  it("rejects missing and malformed headers", () => {
    expect(parseBearerToken(null)).toBeNull();
    expect(parseBearerToken("Basic access-token")).toBeNull();
    expect(parseBearerToken("Bearer ")).toBeNull();
  });
});
