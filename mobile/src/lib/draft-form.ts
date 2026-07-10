import type {
  CheckInVisibility,
  DrinkCategoryKey,
  RecognitionSuggestion,
} from "../types/app";

export interface DraftFormValues {
  drinkName: string;
  brandName: string;
  storeName: string;
  category: DrinkCategoryKey;
  flavorTags: string[];
  caption: string;
  visibility: CheckInVisibility;
  cityId: string;
  regionId: string;
}

export function mergeRecognitionSuggestion(
  form: DraftFormValues,
  editedFields: string[],
  suggestion: Partial<RecognitionSuggestion>,
  force = false,
) {
  const edited = new Set(editedFields);
  const next = { ...form };
  const canFillText = (field: keyof DraftFormValues) =>
    force || (!edited.has(field) && !String(form[field]).trim());

  if (suggestion.drinkName && canFillText("drinkName")) next.drinkName = suggestion.drinkName;
  if (suggestion.brandName && canFillText("brandName")) next.brandName = suggestion.brandName;
  if (suggestion.storeName && canFillText("storeName")) next.storeName = suggestion.storeName;
  if (suggestion.category && (force || !edited.has("category"))) next.category = suggestion.category;
  if (suggestion.flavorTags && (force || (!edited.has("flavorTags") && form.flavorTags.length === 0))) {
    next.flavorTags = suggestion.flavorTags;
  }
  return next;
}

export function canPublishDraft(
  draft: { image_upload_status: string; image_url: string | null } | null,
  form: DraftFormValues,
) {
  return Boolean(
    draft?.image_upload_status === "ready" &&
      draft.image_url &&
      form.drinkName.trim() &&
      form.brandName.trim() &&
      form.category &&
      form.cityId &&
      form.regionId,
  );
}
