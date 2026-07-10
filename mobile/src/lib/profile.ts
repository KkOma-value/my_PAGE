import type { DrinkCategoryKey, PublishedCheckIn } from "../types/app";

export function summarizeCheckins(checkins: PublishedCheckIn[]) {
  const categoryCounts = new Map<DrinkCategoryKey, number>();
  for (const checkin of checkins) {
    categoryCounts.set(checkin.category, (categoryCounts.get(checkin.category) ?? 0) + 1);
  }
  const topCategory = [...categoryCounts.entries()]
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;

  return {
    total: checkins.length,
    cityCount: new Set(checkins.map((checkin) => checkin.city_id)).size,
    topCategory,
  };
}

export function checkinsForDate(checkins: PublishedCheckIn[], date: string) {
  return checkins.filter((checkin) => checkin.consumed_on === date);
}
