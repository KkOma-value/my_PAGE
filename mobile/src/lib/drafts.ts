import type { ImagePickerAsset } from "expo-image-picker";
import type { CheckInDraft, PublishedCheckIn } from "../types/app";
import type { DraftFormValues } from "./draft-form";
import { apiFormRequest, apiRequest } from "./api";

export function listDrafts() {
  return apiRequest<CheckInDraft[]>("/drafts");
}

export function getDraft(draftId: string) {
  return apiRequest<CheckInDraft>(`/drafts/${draftId}`);
}

export function createDraft(localClientId: string, form: DraftFormValues) {
  return apiRequest<CheckInDraft>("/drafts", {
    method: "POST",
    body: JSON.stringify({ localClientId, draftPayload: form }),
  });
}

export function updateDraft(draftId: string, form: DraftFormValues, userEditedFields: string[]) {
  return apiRequest<CheckInDraft>(`/drafts/${draftId}`, {
    method: "PATCH",
    body: JSON.stringify({ draftPayload: form, userEditedFields }),
  });
}

export function deleteDraft(draftId: string) {
  return apiRequest<{ id: string }>(`/drafts/${draftId}`, { method: "DELETE" });
}

export function uploadDraftImage(draftId: string, asset: ImagePickerAsset) {
  const filename = asset.fileName || asset.uri.split("/").pop() || "drink.jpg";
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeType = asset.mimeType || (extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg");
  const formData = new FormData();
  formData.append("file", { uri: asset.uri, name: filename, type: mimeType } as unknown as Blob);
  return apiFormRequest<CheckInDraft>(`/drafts/${draftId}/image`, formData);
}

export function retryRecognition(draftId: string) {
  return apiRequest<CheckInDraft>(`/drafts/${draftId}/recognize`, { method: "POST" });
}

export function publishDraft(
  draftId: string,
  form: DraftFormValues,
  aiConfidence?: number,
) {
  return apiRequest<PublishedCheckIn>("/checkins", {
    method: "POST",
    body: JSON.stringify({
      draftId,
      drinkName: form.drinkName,
      brandName: form.brandName,
      storeName: form.storeName,
      category: form.category,
      flavorTags: form.flavorTags,
      cityId: form.cityId,
      regionId: form.regionId,
      caption: form.caption,
      visibility: form.visibility,
      aiConfidence,
      consumedOn: new Date().toISOString().slice(0, 10),
    }),
  });
}
