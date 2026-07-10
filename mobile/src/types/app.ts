export type CheckInVisibility = "public" | "private";
export type RecognitionStatus = "idle" | "uploading" | "recognizing" | "ready" | "failed";
export type DrinkCategoryKey = "coffee" | "milk_tea" | "fruit_tea" | "tea" | "matcha" | "pour_over" | "other";

export interface RecognitionSuggestion {
  category: DrinkCategoryKey;
  brandName: string;
  storeName: string;
  drinkName: string;
  flavorTags: string[];
  confidence: number;
}

export interface CheckInDraft {
  id: string;
  local_client_id: string;
  image_upload_status: "idle" | "uploading" | "ready" | "failed";
  image_url: string | null;
  recognition_status: RecognitionStatus;
  recognition_suggestions: Partial<RecognitionSuggestion>;
  user_edited_fields: string[];
  draft_payload: Record<string, unknown>;
  updated_at: string;
}

export interface CityRegion {
  id: string;
  city_id?: string;
  code: string;
  name: string;
  display_name: string;
  map_x?: number;
  map_y?: number;
}

export interface CityOption {
  id: string;
  code: string;
  name: string;
  display_name: string;
  province?: string;
  map_x?: number;
  map_y?: number;
  regions: CityRegion[];
}

export interface PublishedCheckIn {
  id: string;
  user_id: string;
  drink_name: string;
  brand_name: string;
  store_name: string;
  category: DrinkCategoryKey;
  flavor_tags: string[];
  city_id: string;
  region_id: string;
  image_url: string;
  caption: string;
  visibility: CheckInVisibility;
  moderation_status: "visible" | "pending_review" | "hidden";
  consumed_on: string;
  created_at: string;
  liked_by_me?: boolean;
  favorited_by_me?: boolean;
  profiles?: { id: string; display_name: string; avatar_path: string | null };
  cities?: { code: string; display_name: string };
  city_regions?: { code: string; display_name: string };
}

export interface RecommendationItem {
  drinkName: string;
  brandName: string;
  category: DrinkCategoryKey;
  imageUrl?: string | null;
  badge?: string;
  description?: string;
  score: number;
}

export interface SnapshotResponse {
  id: string | null;
  type: "city" | "region" | "season" | "personal";
  scope_id: string;
  payload: RecommendationItem[];
  generated_at: string | null;
  source_version: string;
}

export interface MapHeatResponse {
  cities: Array<{ id: string; code: string; display_name: string; map_x: number; map_y: number; count: number }>;
  regions: Array<{ id: string; city_id: string; code: string; display_name: string; map_x: number; map_y: number; count: number }>;
}
