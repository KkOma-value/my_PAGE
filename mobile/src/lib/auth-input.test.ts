import { describe, expect, it } from "vitest";
import { normalizePhoneNumber } from "./auth-input";

describe("normalizePhoneNumber", () => {
  it("adds mainland China country code to 11-digit mobile numbers", () => {
    expect(normalizePhoneNumber("138 0013 8000")).toBe("+8613800138000");
  });

  it("keeps valid E.164 numbers", () => {
    expect(normalizePhoneNumber("+8613800138000")).toBe("+8613800138000");
  });

  it("rejects invalid phone input", () => {
    expect(() => normalizePhoneNumber("12345")).toThrow("请输入有效手机号");
  });
});
