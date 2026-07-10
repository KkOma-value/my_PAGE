import { jsonError, jsonOk } from "@/lib/api/responses";
import {
  buildPersonalProfile,
  buildPersonalRecommendations,
  buildRankedSnapshot,
  seasonForDate,
  type SeedRecommendationItem,
} from "@/lib/recommendations/snapshots";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const maxDuration = 60;

interface SnapshotWrite {
  type: "city" | "region" | "season" | "personal";
  scopeId: string;
  userId: string | null;
  payload: unknown;
  generatedAt: string;
}

async function replaceSnapshot(input: SnapshotWrite) {
  const admin = getSupabaseAdmin();
  let lookup = admin
    .from("recommendation_snapshots")
    .select("id")
    .eq("type", input.type)
    .eq("scope_id", input.scopeId)
    .limit(1);
  lookup = input.userId ? lookup.eq("user_id", input.userId) : lookup.is("user_id", null);
  const existing = await lookup;
  if (existing.error) throw existing.error;
  const values = {
    type: input.type,
    scope_id: input.scopeId,
    user_id: input.userId,
    payload: input.payload,
    generated_at: input.generatedAt,
    source_version: "v1",
  };
  const write = existing.data && existing.data.length > 0
    ? await admin.from("recommendation_snapshots").update(values).eq("id", existing.data[0].id)
    : await admin.from("recommendation_snapshots").insert(values);
  if (write.error) throw write.error;
}

function seedItem(row: Record<string, unknown>): SeedRecommendationItem {
  return {
    drinkName: String(row.drink_name),
    brandName: String(row.brand_name),
    category: String(row.category),
    imageUrl: String(row.image_url),
    badge: String(row.badge),
    description: String(row.description),
    score: Math.max(1, 6 - Number(row.sort_order)),
  };
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return jsonError("UNAUTHORIZED", "Invalid cron secret", 401);
  }

  try {
    const admin = getSupabaseAdmin();
    const generatedAt = new Date().toISOString();
    const [seeds, publicCheckins, allCheckins, profiles] = await Promise.all([
      admin.from("seed_recommendations").select("*").eq("active", true),
      admin.from("checkins").select("drink_name,brand_name,category,consumed_on,image_path,city_id,region_id").eq("visibility", "public").eq("publish_status", "published").eq("moderation_status", "visible"),
      admin.from("checkins").select("user_id,category,flavor_tags,region_id").eq("publish_status", "published"),
      admin.from("profiles").select("id").eq("account_status", "active"),
    ]);
    if (seeds.error) throw seeds.error;
    if (publicCheckins.error) throw publicCheckins.error;
    if (allCheckins.error) throw allCheckins.error;
    if (profiles.error) throw profiles.error;

    const citySeedRows = (seeds.data ?? []).filter((row) => row.kind === "city");
    const seasonSeedRows = (seeds.data ?? []).filter((row) => row.kind === "season");
    const cityIds = Array.from(new Set(citySeedRows.map((row) => row.city_id).filter(Boolean)));
    for (const cityId of cityIds) {
      await replaceSnapshot({
        type: "city",
        scopeId: cityId,
        userId: null,
        payload: buildRankedSnapshot(
          citySeedRows.filter((row) => row.city_id === cityId).map(seedItem),
          (publicCheckins.data ?? []).filter((row) => row.city_id === cityId),
        ),
        generatedAt,
      });
    }

    const regionIds = Array.from(new Set((publicCheckins.data ?? []).map((row) => row.region_id).filter(Boolean)));
    for (const regionId of regionIds) {
      await replaceSnapshot({
        type: "region",
        scopeId: regionId,
        userId: null,
        payload: buildRankedSnapshot([], (publicCheckins.data ?? []).filter((row) => row.region_id === regionId)),
        generatedAt,
      });
    }

    for (const season of ["spring", "summer", "autumn", "winter"] as const) {
      await replaceSnapshot({
        type: "season",
        scopeId: season,
        userId: null,
        payload: buildRankedSnapshot(
          seasonSeedRows.filter((row) => row.season === season).map(seedItem),
          (publicCheckins.data ?? []).filter((row) => seasonForDate(row.consumed_on) === season),
        ),
        generatedAt,
      });
    }

    const personalSeeds = [...citySeedRows, ...seasonSeedRows].map(seedItem);
    for (const profileRow of profiles.data ?? []) {
      const own = (allCheckins.data ?? []).filter((row) => row.user_id === profileRow.id);
      const profile = buildPersonalProfile(own);
      const recommendations = buildPersonalRecommendations(personalSeeds, profile);
      const preferenceWrite = await admin.from("personal_preference_profiles").upsert({
        user_id: profileRow.id,
        favorite_categories: profile.favoriteCategories,
        frequent_regions: profile.frequentRegions,
        flavor_tags: profile.flavorTags,
        recommendations,
        generated_at: generatedAt,
      }, { onConflict: "user_id" });
      if (preferenceWrite.error) throw preferenceWrite.error;
      await replaceSnapshot({
        type: "personal",
        scopeId: profileRow.id,
        userId: profileRow.id,
        payload: recommendations,
        generatedAt,
      });
    }

    return jsonOk({
      generated: true,
      citySnapshots: cityIds.length,
      regionSnapshots: regionIds.length,
      seasonSnapshots: 4,
      personalSnapshots: profiles.data?.length ?? 0,
    });
  } catch (error) {
    return jsonError("SNAPSHOT_GENERATION_FAILED", error instanceof Error ? error.message : "Snapshot generation failed", 500);
  }
}
