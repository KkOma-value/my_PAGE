import { after } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { attachSignedImageUrl } from "@/lib/mobile/image-storage";
import { runRecognitionJob } from "@/lib/mobile/recognition-job";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireUser(request);
    const { id: draftId } = await context.params;
    const admin = getSupabaseAdmin();
    const draft = await admin
      .from("checkin_drafts")
      .select("*")
      .eq("id", draftId)
      .eq("user_id", userId)
      .single();
    if (draft.error || !draft.data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);
    if (!draft.data.image_path) return jsonError("IMAGE_REQUIRED", "Upload an image before recognition", 400);

    const queued = await admin
      .from("checkin_drafts")
      .update({ recognition_status: "recognizing", updated_at: new Date().toISOString() })
      .eq("id", draftId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (queued.error || !queued.data) return jsonError("RECOGNITION_QUEUE_FAILED", queued.error?.message ?? "Draft not found", 500);

    after(() =>
      runRecognitionJob(
        { draftId, userId, imagePath: draft.data.image_path },
        async (update) => {
          const result = await admin.from("checkin_drafts").update(update).eq("id", draftId).eq("user_id", userId);
          if (result.error) throw result.error;
        },
      ),
    );

    return jsonOk(await attachSignedImageUrl(queued.data), { status: 202 });
  } catch (error) {
    const details = errorDetails(error, "RECOGNITION_FAILED", "Recognition failed");
    return jsonError(details.code, details.message, details.status);
  }
}
