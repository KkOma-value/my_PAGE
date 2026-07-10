import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { moderationStatusForCaption, publishCheckInSchema } from "@/lib/mobile/checkin-input";
import { collectBlockedUserIds, decorateCommunityRows } from "@/lib/mobile/community";
import { attachSignedImageUrl, attachSignedImageUrls } from "@/lib/mobile/image-storage";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const scope = new URL(request.url).searchParams.get("scope") ?? "mine";
    const admin = getSupabaseAdmin();

    if (scope === "community") {
      const blocks = await admin
        .from("blocks")
        .select("blocker_id,blocked_id")
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
      if (blocks.error) return jsonError("BLOCKS_READ_FAILED", blocks.error.message, 500);
      const blockedUserIds = collectBlockedUserIds(blocks.data ?? [], userId);

      let communityQuery = admin
        .from("checkins")
        .select("*, profiles!checkins_user_id_fkey(id,display_name,avatar_path), cities(code,display_name), city_regions(code,display_name)")
        .eq("visibility", "public")
        .eq("publish_status", "published")
        .eq("moderation_status", "visible")
        .order("created_at", { ascending: false })
        .limit(50);
      if (blockedUserIds.length > 0) {
        communityQuery = communityQuery.not("user_id", "in", `(${blockedUserIds.join(",")})`);
      }

      const community = await communityQuery;
      if (community.error) return jsonError("COMMUNITY_READ_FAILED", community.error.message, 500);
      const checkinIds = (community.data ?? []).map((row) => row.id);
      if (checkinIds.length === 0) return jsonOk([]);

      const [likes, favorites] = await Promise.all([
        admin.from("likes").select("checkin_id").eq("user_id", userId).in("checkin_id", checkinIds),
        admin.from("favorites").select("checkin_id").eq("user_id", userId).in("checkin_id", checkinIds),
      ]);
      if (likes.error) return jsonError("LIKES_READ_FAILED", likes.error.message, 500);
      if (favorites.error) return jsonError("FAVORITES_READ_FAILED", favorites.error.message, 500);

      const decorated = decorateCommunityRows(
        community.data ?? [],
        (likes.data ?? []).map((row) => row.checkin_id),
        (favorites.data ?? []).map((row) => row.checkin_id),
      );
      return jsonOk(await attachSignedImageUrls(decorated));
    }

    if (scope !== "mine") return jsonError("INVALID_SCOPE", "Scope must be mine or community", 400);

    const { data, error } = await admin
      .from("checkins")
      .select("*, cities(code,display_name,map_x,map_y), city_regions(code,display_name,map_x,map_y)")
      .eq("user_id", userId)
      .eq("publish_status", "published")
      .order("consumed_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return jsonError("CHECKINS_READ_FAILED", error.message, 500);
    return jsonOk(await attachSignedImageUrls(data ?? []));
  } catch (error) {
    const details = errorDetails(error, "CHECKINS_READ_FAILED", "Check-ins read failed");
    return jsonError(details.code, details.message, details.status);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const parsed = publishCheckInSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const admin = getSupabaseAdmin();
    const existing = await admin
      .from("checkins")
      .select("*")
      .eq("source_draft_id", parsed.data.draftId)
      .eq("user_id", userId)
      .limit(1);
    if (existing.error) return jsonError("CHECKIN_READ_FAILED", existing.error.message, 500);
    if (existing.data && existing.data.length > 0) {
      return jsonOk(await attachSignedImageUrl(existing.data[0]));
    }

    const draft = await admin
      .from("checkin_drafts")
      .select("*")
      .eq("id", parsed.data.draftId)
      .eq("user_id", userId)
      .single();
    if (draft.error || !draft.data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);
    if (!draft.data.image_path || draft.data.image_upload_status !== "ready") {
      return jsonError("IMAGE_REQUIRED", "Image upload is not ready", 400);
    }

    const region = await admin
      .from("city_regions")
      .select("id,city_id")
      .eq("id", parsed.data.regionId)
      .eq("city_id", parsed.data.cityId)
      .eq("active", true)
      .single();
    if (region.error || !region.data) return jsonError("INVALID_LOCATION", "City and region do not match", 400);

    const suggestion = draft.data.recognition_suggestions as { confidence?: number } | null;
    const inserted = await admin
      .from("checkins")
      .insert({
        user_id: userId,
        source_draft_id: parsed.data.draftId,
        drink_name: parsed.data.drinkName,
        brand_name: parsed.data.brandName,
        store_name: parsed.data.storeName,
        category: parsed.data.category,
        flavor_tags: parsed.data.flavorTags,
        city_id: parsed.data.cityId,
        region_id: parsed.data.regionId,
        image_path: draft.data.image_path,
        caption: parsed.data.caption,
        visibility: parsed.data.visibility,
        moderation_status: moderationStatusForCaption(parsed.data.caption),
        ai_confidence: parsed.data.aiConfidence ?? suggestion?.confidence,
        ai_source: "mock",
        consumed_on: parsed.data.consumedOn,
      })
      .select("*")
      .single();
    if (inserted.error || !inserted.data) return jsonError("CHECKIN_CREATE_FAILED", inserted.error?.message ?? "Create failed", 500);

    await admin
      .from("checkin_drafts")
      .delete()
      .eq("id", parsed.data.draftId)
      .eq("user_id", userId);

    return jsonOk(await attachSignedImageUrl(inserted.data), { status: 201 });
  } catch (error) {
    const details = errorDetails(error, "CHECKIN_CREATE_FAILED", "Check-in create failed");
    return jsonError(details.code, details.message, details.status);
  }
}
