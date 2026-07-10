import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { DRINK_IMAGE_BUCKET } from "@/lib/mobile/image-storage";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId, accessToken } = await requireUser(request);
    const admin = getSupabaseAdmin();
    const [drafts, checkins] = await Promise.all([
      admin.from("checkin_drafts").select("image_path").eq("user_id", userId),
      admin.from("checkins").select("image_path").eq("user_id", userId),
    ]);
    if (drafts.error) return jsonError("DRAFTS_READ_FAILED", drafts.error.message, 500);
    if (checkins.error) return jsonError("CHECKINS_READ_FAILED", checkins.error.message, 500);
    const imagePaths = Array.from(new Set([...(drafts.data ?? []), ...(checkins.data ?? [])].map((row) => row.image_path).filter(Boolean)));
    if (imagePaths.length > 0) {
      const removal = await admin.storage.from(DRINK_IMAGE_BUCKET).remove(imagePaths);
      if (removal.error) return jsonError("ACCOUNT_IMAGE_DELETE_FAILED", removal.error.message, 500);
    }

    const snapshots = await admin.from("recommendation_snapshots").delete().is("user_id", null);
    if (snapshots.error) return jsonError("SNAPSHOT_PURGE_FAILED", snapshots.error.message, 500);
    const revoked = await admin.auth.admin.signOut(accessToken, "global");
    if (revoked.error) return jsonError("SESSION_REVOKE_FAILED", revoked.error.message, 500);
    const deleted = await admin.auth.admin.deleteUser(userId, false);
    if (deleted.error) return jsonError("ACCOUNT_DELETE_FAILED", deleted.error.message, 500);

    return jsonOk({ deleted: true });
  } catch (error) {
    const details = errorDetails(error, "ACCOUNT_DELETE_FAILED", "Account delete failed");
    return jsonError(details.code, details.message, details.status);
  }
}
