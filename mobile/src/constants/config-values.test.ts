import { describe, expect, it } from "vitest";
import { resolveMobileConfig } from "./config-values";

describe("resolveMobileConfig", () => {
  it("prefers Expo public variables and removes a trailing slash", () => {
    expect(
      resolveMobileConfig({
        publicApiUrl: "https://api.sipnotes.example/",
        publicSupabaseUrl: "https://sipnotes.supabase.co/",
        publicSupabaseKey: "publishable-key",
        hostUri: "192.168.1.20:8081",
      }),
    ).toEqual({
      apiUrl: "https://api.sipnotes.example",
      apiBase: "https://api.sipnotes.example/api/mobile",
      supabaseUrl: "https://sipnotes.supabase.co",
      supabaseAnonKey: "publishable-key",
    });
  });

  it("falls back to Metro host for local API development", () => {
    expect(resolveMobileConfig({ hostUri: "10.0.0.8:8081" }).apiUrl).toBe("http://10.0.0.8:5555");
  });
});
