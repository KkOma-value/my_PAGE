import { describe, expect, it } from "vitest";
import { readSupabaseServerConfig } from "./server";

describe("readSupabaseServerConfig", () => {
  it("returns server configuration without exposing secret names to clients", () => {
    expect(
      readSupabaseServerConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://sipnotes.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "publishable-key",
        SUPABASE_SERVICE_ROLE_KEY: "server-secret",
      }),
    ).toEqual({
      url: "https://sipnotes.supabase.co",
      publishableKey: "publishable-key",
      serviceRoleKey: "server-secret",
    });
  });

  it("throws only when configuration is requested", () => {
    expect(() => readSupabaseServerConfig({})).toThrow("Missing Supabase server configuration");
  });
});
