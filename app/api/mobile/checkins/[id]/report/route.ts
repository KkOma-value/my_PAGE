import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { moderationStatusAfterReportCount } from "@/lib/mobile/community-safety";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface RouteContext { params: Promise<{ id: string }> }
const reportSchema = z.object({
  reason: z.enum(["spam", "inappropriate", "harassment", "privacy", "other"]),
  details: z.string().trim().max(500).default(""),
}).strict();

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const parsed = reportSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);
    const admin = getSupabaseAdmin();
    const checkin = await admin.from("checkins").select("user_id").eq("id", id).eq("visibility", "public").eq("publish_status", "published").single();
    if (checkin.error || !checkin.data) return jsonError("CHECKIN_NOT_FOUND", "Public check-in not found", 404);
    if (checkin.data.user_id === userId) return jsonError("SELF_ACTION", "You cannot report your own check-in", 400);

    const report = await admin.from("reports").upsert({
      reporter_id: userId,
      checkin_id: id,
      reason: parsed.data.reason,
      details: parsed.data.details,
      status: "open",
    }, { onConflict: "reporter_id,checkin_id" });
    if (report.error) return jsonError("REPORT_FAILED", report.error.message, 500);

    const reportCount = await admin.from("reports").select("id", { count: "exact", head: true }).eq("checkin_id", id).eq("status", "open");
    if (reportCount.error) return jsonError("REPORT_COUNT_FAILED", reportCount.error.message, 500);
    const moderationStatus = moderationStatusAfterReportCount(reportCount.count ?? 0);
    if (moderationStatus === "pending_review") {
      const update = await admin.from("checkins").update({ moderation_status: moderationStatus }).eq("id", id);
      if (update.error) return jsonError("MODERATION_UPDATE_FAILED", update.error.message, 500);
    }
    return jsonOk({ reported: true, moderationStatus });
  } catch (error) {
    const details = errorDetails(error, "REPORT_FAILED", "Report failed");
    return jsonError(details.code, details.message, details.status);
  }
}
