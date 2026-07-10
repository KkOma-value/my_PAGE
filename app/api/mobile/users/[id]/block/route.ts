import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id: blockedId } = await context.params;
    if (blockedId === userId) return jsonError("SELF_ACTION", "You cannot block yourself", 400);
    const result = await getSupabaseAdmin().from("blocks").upsert(
      { blocker_id: userId, blocked_id: blockedId },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );
    if (result.error) return jsonError("BLOCK_FAILED", result.error.message, 500);
    return jsonOk({ blocked: true });
  } catch (error) {
    const details = errorDetails(error, "BLOCK_FAILED", "Block failed");
    return jsonError(details.code, details.message, details.status);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id: blockedId } = await context.params;
    const result = await getSupabaseAdmin().from("blocks").delete().eq("blocker_id", userId).eq("blocked_id", blockedId);
    if (result.error) return jsonError("UNBLOCK_FAILED", result.error.message, 500);
    return jsonOk({ blocked: false });
  } catch (error) {
    const details = errorDetails(error, "UNBLOCK_FAILED", "Unblock failed");
    return jsonError(details.code, details.message, details.status);
  }
}
