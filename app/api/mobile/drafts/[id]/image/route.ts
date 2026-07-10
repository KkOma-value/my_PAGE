import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import {
  ALLOWED_DRINK_IMAGE_TYPES,
  attachSignedImageUrl,
  createImageObjectPath,
  createRecognitionObjectId,
  DRINK_IMAGE_BUCKET,
  MAX_DRINK_IMAGE_BYTES,
} from "@/lib/mobile/image-storage";
import { runRecognitionJob } from "@/lib/mobile/recognition-job";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  let draftId = "";
  let userId = "";

  try {
    ({ userId } = await requireUser(request));
    ({ id: draftId } = await context.params);
    const admin = getSupabaseAdmin();
    const draft = await admin
      .from("checkin_drafts")
      .select("id,image_path")
      .eq("id", draftId)
      .eq("user_id", userId)
      .single();
    if (draft.error || !draft.data) return jsonError("DRAFT_NOT_FOUND", "Draft not found", 404);

    const formData = (await request.formData()) as unknown as {
      get(name: string): FormDataEntryValue | null;
    };
    const file = formData.get("file");
    if (!(file instanceof File)) return jsonError("MISSING_FILE", "No image file provided", 400);
    if (!ALLOWED_DRINK_IMAGE_TYPES.has(file.type)) {
      return jsonError("INVALID_FILE_TYPE", "Image must be JPEG, PNG, or WEBP", 400);
    }
    if (file.size > MAX_DRINK_IMAGE_BYTES) {
      return jsonError("FILE_TOO_LARGE", "Image must be 5MB or smaller", 400);
    }

    await admin
      .from("checkin_drafts")
      .update({
        image_upload_status: "uploading",
        recognition_status: "uploading",
        updated_at: new Date().toISOString(),
      })
      .eq("id", draftId)
      .eq("user_id", userId);

    const imagePath = createImageObjectPath(
      userId,
      draftId,
      createRecognitionObjectId(file.name, randomUUID()),
      file.type,
    );
    const upload = await admin.storage.from(DRINK_IMAGE_BUCKET).upload(
      imagePath,
      Buffer.from(await file.arrayBuffer()),
      { contentType: file.type, upsert: false },
    );
    if (upload.error) {
      await admin
        .from("checkin_drafts")
        .update({ image_upload_status: "failed", recognition_status: "failed" })
        .eq("id", draftId)
        .eq("user_id", userId);
      return jsonError("UPLOAD_FAILED", upload.error.message, 500);
    }

    const updated = await admin
      .from("checkin_drafts")
      .update({
        image_upload_status: "ready",
        image_path: imagePath,
        recognition_status: "recognizing",
        recognition_suggestions: {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", draftId)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (updated.error || !updated.data) return jsonError("DRAFT_IMAGE_UPDATE_FAILED", updated.error?.message ?? "Draft not found", 500);

    const previousImagePath = draft.data.image_path;
    after(async () => {
      if (previousImagePath && previousImagePath !== imagePath) {
        await admin.storage.from(DRINK_IMAGE_BUCKET).remove([previousImagePath]);
      }
      await runRecognitionJob(
        { draftId, userId, imagePath },
        async (update) => {
          const result = await admin.from("checkin_drafts").update(update).eq("id", draftId).eq("user_id", userId);
          if (result.error) throw result.error;
        },
      );
    });

    return jsonOk(await attachSignedImageUrl(updated.data));
  } catch (error) {
    const details = errorDetails(error, "UPLOAD_FAILED", "Upload failed");
    return jsonError(details.code, details.message, details.status);
  }
}
