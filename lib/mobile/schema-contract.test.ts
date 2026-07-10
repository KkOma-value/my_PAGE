import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationDirectory = join(process.cwd(), "supabase", "migrations");

function loadMigration() {
  expect(existsSync(migrationDirectory)).toBe(true);
  const filename = readdirSync(migrationDirectory).find((name) => name.endsWith("_ios_drink_app_mvp.sql"));
  expect(filename).toBeTruthy();
  return readFileSync(join(migrationDirectory, filename as string), "utf8").toLowerCase();
}

describe("Supabase schema contract", () => {
  it("enables RLS for every exposed application table", () => {
    const sql = loadMigration();
    const tables = [
      "profiles",
      "cities",
      "city_regions",
      "checkin_drafts",
      "checkins",
      "seed_recommendations",
      "recommendation_snapshots",
      "personal_preference_profiles",
      "likes",
      "favorites",
      "reports",
      "blocks",
    ];

    for (const table of tables) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("uses explicit Data API grants and a private image bucket", () => {
    const sql = loadMigration();
    expect(sql).toContain("grant select");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).toMatch(/'drink-images'[\s\S]*false/);
  });

  it("creates profiles on auth signup without a public security-definer function", () => {
    const sql = loadMigration();
    expect(sql).toContain("create schema if not exists private");
    expect(sql).toContain("after insert on auth.users");
    expect(sql).toContain("private.handle_new_user");
    expect(sql).not.toContain("function public.handle_new_user");
  });

  it("makes draft publication idempotent", () => {
    const sql = loadMigration();
    expect(sql).toContain("source_draft_id uuid not null unique");
  });
});
