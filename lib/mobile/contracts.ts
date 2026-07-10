export const CHECKIN_VISIBILITIES = ["public", "private"] as const;
export type CheckInVisibility = (typeof CHECKIN_VISIBILITIES)[number];

export const MODERATION_STATUSES = ["visible", "pending_review", "hidden"] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const RECOGNITION_STATUSES = ["idle", "uploading", "recognizing", "ready", "failed"] as const;
export type RecognitionStatus = (typeof RECOGNITION_STATUSES)[number];

export const SNAPSHOT_TYPES = ["city", "region", "season", "personal"] as const;
export type RecommendationSnapshotType = (typeof SNAPSHOT_TYPES)[number];

export const DRINK_CATEGORIES = ["coffee", "milk_tea", "fruit_tea", "tea", "matcha", "pour_over", "other"] as const;
export type DrinkCategoryKey = (typeof DRINK_CATEGORIES)[number];

export interface RecognitionSuggestion {
  category: DrinkCategoryKey;
  brandName: string;
  storeName: string;
  drinkName: string;
  flavorTags: string[];
  confidence: number;
}
