import { requireUser } from "@/lib/api/auth";
import { errorDetails, jsonError, jsonOk } from "@/lib/api/responses";
import { createDraftSchema } from "@/lib/mobile/checkin-input";
import { attachSignedImageUrl, attachSignedImageUrls } from "@/lib/mobile/image-storage";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const { data, error } = await getSupabaseAdmin()
      .from("checkin_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return jsonError("DRAFTS_READ_FAILED", error.message, 500);
    return jsonOk(await attachSignedImageUrls(data ?? []));
  } catch (error) {
    const details = errorDetails(error, "DRAFTS_READ_FAILED", "Drafts read failed");
    return jsonError(details.code, details.message, details.status);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = createDraftSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("INVALID_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { data, error } = await getSupabaseAdmin()
      .from("checkin_drafts")
      .upsert(
        {
          user_id: userId,
          local_client_id: parsed.data.localClientId,
          draft_payload: parsed.data.draftPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,local_client_id" },
      )
      .select("*")
      .single();

    if (error) return jsonError("DRAFT_CREATE_FAILED", error.message, 500);
    return jsonOk(await attachSignedImageUrl(data), { status: 201 });
  } catch (error) {
    const details = errorDetails(error, "DRAFT_CREATE_FAILED", "Draft create failed");
    return jsonError(details.code, details.message, details.status);
  }
}
