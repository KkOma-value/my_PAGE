import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { SNAPSHOT_TYPES } from "@/lib/mobile/contracts";
import { attachSignedRecommendationImages } from "@/lib/mobile/image-storage";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface SnapshotPayloadItem {
  imagePath?: string | null;
  imageUrl?: string | null;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "city";
    const requestedScopeId = url.searchParams.get("scopeId") ?? "";
    if (!SNAPSHOT_TYPES.includes(type as (typeof SNAPSHOT_TYPES)[number])) {
      return jsonError("INVALID_TYPE", "Unknown recommendation type", 400);
    }
    if (type !== "personal" && !requestedScopeId) {
      return jsonError("INVALID_SCOPE", "scopeId is required", 400);
    }

    const scopeId = type === "personal" ? userId : requestedScopeId;
    const admin = getSupabaseAdmin();
    let query = admin
      .from("recommendation_snapshots")
      .select("*")
      .eq("type", type)
      .eq("scope_id", scopeId)
      .order("generated_at", { ascending: false })
      .limit(1);
    query = type === "personal" ? query.eq("user_id", userId) : query.is("user_id", null);

    const snapshot = await query;
    if (snapshot.error) return jsonError("DISCOVER_READ_FAILED", snapshot.error.message, 500);
    if (snapshot.data && snapshot.data.length > 0) {
      const row = snapshot.data[0];
      const payload = Array.isArray(row.payload)
        ? await attachSignedRecommendationImages(row.payload as SnapshotPayloadItem[])
        : row.payload;
      return jsonOk({ ...row, payload });
    }

    if (type === "city" || type === "season") {
      let fallback = admin
        .from("seed_recommendations")
        .select("*")
        .eq("kind", type)
        .eq("active", true)
        .order("sort_order", { ascending: true });
      fallback = type === "city" ? fallback.eq("city_id", scopeId) : fallback.eq("season", scopeId);
      const seed = await fallback;
      if (seed.error) return jsonError("SEED_READ_FAILED", seed.error.message, 500);
      return jsonOk({
        id: null,
        type,
        scope_id: scopeId,
        payload: (seed.data ?? []).map((item) => ({
          drinkName: item.drink_name,
          brandName: item.brand_name,
          category: item.category,
          imageUrl: item.image_url,
          badge: item.badge,
          description: item.description,
          score: Math.max(1, 6 - item.sort_order),
        })),
        generated_at: null,
        source_version: "seed",
      });
    }

    return jsonOk(null);
  } catch (error) {
    const details = errorDetails(error, "DISCOVER_READ_FAILED", "Discover read failed");
    return jsonError(details.code, details.message, details.status);
  }
}
