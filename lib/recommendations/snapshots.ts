export interface SeedRecommendationItem {
  drinkName: string;
  brandName: string;
  category: string;
  score: number;
  imageUrl?: string;
  badge?: string;
  description?: string;
}

export interface PublicCheckInItem {
  drink_name: string;
  brand_name: string;
  category: string;
  consumed_on: string;
  image_path?: string;
}

export interface PreferenceCheckInItem {
  category: string;
  flavor_tags: string[];
  region_id: string;
}

export interface PersonalPreferenceProfile {
  favoriteCategories: { category: string; count: number }[];
  frequentRegions: { regionId: string; count: number }[];
  flavorTags: { tag: string; count: number }[];
}

function checkInWeight(consumedOn: string, now: Date) {
  const consumedAt = new Date(`${consumedOn}T00:00:00Z`).getTime();
  if (!Number.isFinite(consumedAt)) return 0.1;
  const ageInDays = Math.max(0, (now.getTime() - consumedAt) / 86_400_000);
  if (ageInDays <= 30) return 1;
  if (ageInDays <= 90) return 0.6;
  if (ageInDays <= 365) return 0.25;
  return 0.1;
}

export function buildRankedSnapshot(
  seedItems: SeedRecommendationItem[],
  publicCheckins: PublicCheckInItem[],
  now = new Date(),
) {
  const scores = new Map<string, SeedRecommendationItem>();

  for (const item of seedItems) {
    scores.set(`${item.brandName}:${item.drinkName}`, { ...item });
  }

  for (const checkin of publicCheckins) {
    const key = `${checkin.brand_name}:${checkin.drink_name}`;
    const existing = scores.get(key) ?? {
      drinkName: checkin.drink_name,
      brandName: checkin.brand_name,
      category: checkin.category,
      imagePath: checkin.image_path,
      score: 0,
    };
    existing.score += checkInWeight(checkin.consumed_on, now);
    scores.set(key, existing);
  }

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score || a.drinkName.localeCompare(b.drinkName, "zh-CN"))
    .slice(0, 10)
    .map((item) => ({ ...item, score: Math.round(item.score * 100) / 100 }));
}

function rankedCounts(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"));
}

export function buildPersonalProfile(checkins: PreferenceCheckInItem[]): PersonalPreferenceProfile {
  return {
    favoriteCategories: rankedCounts(checkins.map((item) => item.category)).map(([category, count]) => ({ category, count })),
    frequentRegions: rankedCounts(checkins.map((item) => item.region_id)).map(([regionId, count]) => ({ regionId, count })),
    flavorTags: rankedCounts(checkins.flatMap((item) => item.flavor_tags)).map(([tag, count]) => ({ tag, count })),
  };
}

export function buildPersonalRecommendations(
  seedItems: SeedRecommendationItem[],
  profile: PersonalPreferenceProfile,
) {
  const categoryScores = new Map(profile.favoriteCategories.map((item) => [item.category, item.count]));
  return seedItems
    .map((item) => ({ ...item, score: item.score + (categoryScores.get(item.category) ?? 0) * 2 }))
    .sort((a, b) => b.score - a.score || a.drinkName.localeCompare(b.drinkName, "zh-CN"))
    .slice(0, 10);
}

export function seasonForDate(date: string) {
  const month = Number(date.slice(5, 7));
  if (month >= 3 && month <= 5) return "spring" as const;
  if (month >= 6 && month <= 8) return "summer" as const;
  if (month >= 9 && month <= 11) return "autumn" as const;
  return "winter" as const;
}
