import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const admin = getSupabaseAdmin();
    const checkin = await admin.from("checkins").select("user_id").eq("id", id).eq("visibility", "public").eq("publish_status", "published").eq("moderation_status", "visible").single();
    if (checkin.error || !checkin.data) return jsonError("CHECKIN_NOT_FOUND", "Public check-in not found", 404);
    if (checkin.data.user_id === userId) return jsonError("SELF_ACTION", "You cannot like your own check-in", 400);
    const blocked = await admin.from("blocks").select("blocker_id").or(`and(blocker_id.eq.${userId},blocked_id.eq.${checkin.data.user_id}),and(blocker_id.eq.${checkin.data.user_id},blocked_id.eq.${userId})`).limit(1);
    if (blocked.error) return jsonError("BLOCKS_READ_FAILED", blocked.error.message, 500);
    if (blocked.data && blocked.data.length > 0) return jsonError("CHECKIN_NOT_FOUND", "Public check-in not found", 404);

    const existing = await admin.from("likes").select("checkin_id").eq("user_id", userId).eq("checkin_id", id).limit(1);
    if (existing.error) return jsonError("LIKE_READ_FAILED", existing.error.message, 500);
    if (existing.data && existing.data.length > 0) {
      const removed = await admin.from("likes").delete().eq("user_id", userId).eq("checkin_id", id);
      if (removed.error) return jsonError("LIKE_DELETE_FAILED", removed.error.message, 500);
      return jsonOk({ liked: false });
    }
    const created = await admin.from("likes").insert({ user_id: userId, checkin_id: id });
    if (created.error) return jsonError("LIKE_CREATE_FAILED", created.error.message, 500);
    return jsonOk({ liked: true });
  } catch (error) {
    const details = errorDetails(error, "LIKE_FAILED", "Like failed");
    return jsonError(details.code, details.message, details.status);
  }
}
