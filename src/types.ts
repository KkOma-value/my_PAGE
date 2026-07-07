/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DrinkCategory {
  Coffee = "咖啡",
  Matcha = "抹茶",
  Tea = "传统茶",
  FruitTea = "水果茶",
  PourOver = "手冲",
  MilkTea = "奶茶"
}

export interface CityInfo {
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  displayName: string;
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
  color: string; // e.g., "primary", "secondary", "tertiary"
}
