/**
 * Stats utilities for user profile.
 * Computes top category, flavor frequencies, and day streak from check-in data.
 */

import type { CheckInWithDetails } from "@/types";

/**
 * Returns the most frequent category name from a list of check-ins.
 * Falls back to "其他" if the list is empty.
 */
export function getTopCategory(sips: CheckInWithDetails[]): string {
  if (sips.length === 0) return "其他";

  const counts: Record<string, number> = {};
  for (const sip of sips) {
    const catName = sip.drink?.category?.name ?? "其他";
    counts[catName] = (counts[catName] ?? 0) + 1;
  }

  let topCat = "其他";
  let maxCount = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      topCat = cat;
    }
  }

  return topCat;
}

/**
 * Returns flavor tag frequencies sorted by count descending.
 * Flavor tags come from the check-in caption (comma-separated).
 */
export function getFlavorFrequencies(
  sips: CheckInWithDetails[]
): Array<[string, number]> {
  const counts: Record<string, number> = {};

  for (const sip of sips) {
    if (!sip.caption) continue;
    const tags = sip.caption
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    for (const tag of tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

/**
 * Calculates the current consecutive-day streak from check-in dates.
 * Streak counts backwards from today; if no check-in today, counts from the most recent date.
 */
export function calculateStreak(sips: CheckInWithDetails[]): number {
  if (sips.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const sip of sips) {
    dateSet.add(sip.date);
  }

  const sortedDates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  // If no check-in today, start from the most recent check-in date
  const anchorDate = dateSet.has(todayStr) ? today : parseDate(sortedDates[0]);

  let streak = 0;
  const cursor = new Date(anchorDate);

  while (true) {
    const cursorStr = formatDate(cursor);
    if (dateSet.has(cursorStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
