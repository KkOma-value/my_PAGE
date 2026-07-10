import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { updateDraftSchema } from "@/lib/mobile/checkin-input";
import { attachSignedImageUrl, DRINK_IMAGE_BUCKET } from "@/lib/mobile/image-storage";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const { data, error } = await getSupabaseAdmin()
      .from("checkin_drafts")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);
    return jsonOk(await attachSignedImageUrl(data));
  } catch (error) {
    const details = errorDetails(error, "DRAFT_READ_FAILED", "Draft read failed");
    return jsonError(details.code, details.message, details.status);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const parsed = updateDraftSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.draftPayload !== undefined) update.draft_payload = parsed.data.draftPayload;
    if (parsed.data.userEditedFields !== undefined) update.user_edited_fields = parsed.data.userEditedFields;

    const { data, error } = await getSupabaseAdmin()
      .from("checkin_drafts")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);
    return jsonOk(await attachSignedImageUrl(data));
  } catch (error) {
    const details = errorDetails(error, "DRAFT_UPDATE_FAILED", "Draft update failed");
    return jsonError(details.code, details.message, details.status);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id } = await context.params;
    const admin = getSupabaseAdmin();
    const draft = await admin
      .from("checkin_drafts")
      .select("image_path")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (draft.error || !draft.data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);

    if (draft.data.image_path) {
      const removal = await admin.storage.from(DRINK_IMAGE_BUCKET).remove([draft.data.image_path]);
      if (removal.error) return jsonError("DRAFT_IMAGE_DELETE_FAILED", removal.error.message, 500);
    }

    const { error } = await admin.from("checkin_drafts").delete().eq("id", id).eq("user_id", userId);
    if (error) return jsonError("DRAFT_DELETE_FAILED", error.message, 500);
    return jsonOk({ id });
  } catch (error) {
    const details = errorDetails(error, "DRAFT_DELETE_FAILED", "Draft delete failed");
    return jsonError(details.code, details.message, details.status);
  }
}
