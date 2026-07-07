/**
 * Shared TypeScript types for city-drink (Tea Check)
 * All API responses, data shapes, and shared contracts live here.
 */

// ================================================================
// API Response
// ================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ================================================================
// Category
// ================================================================

export type CategoryType = "milk_tea" | "coffee" | "fruit_tea" | "other" | string;

export interface CategoryInfo {
  id: string;
  name: string;        // machine name: may be a CategoryType or AI-generated slug
  label: string;
  parentId: string | null;
}

// ================================================================
// Brand & Drink
// ================================================================

export interface BrandInfo {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface DrinkInfo {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
}

export interface DrinkWithBrand extends DrinkInfo {
  brand: BrandInfo;
  category: CategoryInfo;
}

export interface BrandWithDrinks extends BrandInfo {
  drinks: DrinkInfo[];
}

// ================================================================
// City
// ================================================================

export interface CityInfo {
  id: string;
  name: string;
  province: string;
  code: string;
}

// ================================================================
// Check-in
// ================================================================

export interface CheckInInfo {
  id: string;
  userId: string;
  drinkId: string;
  cityId: string;
  imageUrl: string;
  cardUrl: string | null;
  categoryId: string | null;
  caption: string | null;
  aiSuggested: boolean;
  aiConfidence: number | null;
  lat: number | null;
  lng: number | null;
  locationName: string | null;
  createdAt: string;
  date: string;
}

export interface CheckInWithDetails extends CheckInInfo {
  drink: DrinkWithBrand;
  city: CityInfo;
  _count?: {
    likes: number;
  };
}

// ================================================================
// Ranking
// ================================================================

export interface RankingItem {
  rank: number;
  drink: {
    id: string;
    name: string;
    brand: string;
    category: CategoryType;
  };
  count: number;
  likes: number;
}

export interface RankingResponse {
  city: string;
  date: string;
  category: CategoryType | "all";
  top3: RankingItem[];
}

// ================================================================
// Season Tips
// ================================================================

export interface SeasonTipData {
  id: string;
  month: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  drinkIds: string; // comma-separated Drink IDs (SQLite limitation)
}

export interface SeasonTipWithDrinks extends SeasonTipData {
  drinks: DrinkWithBrand[];
}

// ================================================================
// User
// ================================================================

export interface UserInfo {
  id: string;
  createdAt: string;
}

export interface UserStats {
  totalCheckIns: number;
  byCategory: Record<CategoryType, number>;
  currentMonthCount: number;
}

// ================================================================
// AI Classification
// ================================================================

export interface ClassifyResult {
  primaryCategory: string;
  primaryLabel: string;
  subCategory: string;
  subLabel: string;
  labels: string[];
  brandHint: string | null;
  confidence: number;
}

// ================================================================
// Like
// ================================================================

export interface LikeInfo {
  id: string;
  userId: string;
  checkInId: string;
  createdAt: string;
}

// ================================================================
// UI Migration Shared Types (SipNotes)
// ================================================================

export enum DrinkCategory {
  Coffee = "咖啡",
  Matcha = "抹茶",
  Tea = "传统茶",
  FruitTea = "水果茶",
  PourOver = "手冲",
  MilkTea = "奶茶"
}

export interface SipRecord {
  id: string;
  drinkName: string;
  shopName: string;
  cityName: string;
  districtName?: string;
  date: string;
  category: DrinkCategory;
  flavorTags: string[];
  imageUrl: string;
  rating: number; // 1-5
  comment?: string;
  isFavorite?: boolean;
}

export interface CityRankingItem {
  rank: number;
  drinkName: string;
  shopName: string;
  cityName: string;
  districtName: string;
  category: DrinkCategory;
  sipsToday: string;
  isTrending?: boolean;
  imageUrl: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}


