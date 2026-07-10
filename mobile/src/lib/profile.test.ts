import { describe, expect, it } from "vitest";
import type { PublishedCheckIn } from "../types/app";
import { checkinsForDate, summarizeCheckins } from "./profile";

function checkin(overrides: Partial<PublishedCheckIn>): PublishedCheckIn {
  return {
    id: "checkin-1",
    user_id: "user-1",
    drink_name: "拿铁",
    brand_name: "街角咖啡",
    store_name: "静安店",
    category: "coffee",
    flavor_tags: [],
    city_id: "shanghai",
    region_id: "jingan",
    image_url: "https://example.com/drink.jpg",
    caption: "",
    visibility: "private",
    moderation_status: "visible",
    consumed_on: "2026-07-10",
    created_at: "2026-07-10T08:00:00.000Z",
    ...overrides,
  };
}

describe("summarizeCheckins", () => {
  it("returns totals, unique cities, and the most frequent category", () => {
    const summary = summarizeCheckins([
      checkin({ id: "1", category: "coffee", city_id: "shanghai" }),
      checkin({ id: "2", category: "coffee", city_id: "hangzhou" }),
      checkin({ id: "3", category: "tea", city_id: "hangzhou" }),
    ]);

    expect(summary).toEqual({ total: 3, cityCount: 2, topCategory: "coffee" });
  });

  it("returns an empty category when no records exist", () => {
    expect(summarizeCheckins([])).toEqual({ total: 0, cityCount: 0, topCategory: null });
  });
});

describe("checkinsForDate", () => {
  it("keeps only records from the selected date", () => {
    const records = [
      checkin({ id: "1", consumed_on: "2026-07-10" }),
      checkin({ id: "2", consumed_on: "2026-07-09" }),
    ];

    expect(checkinsForDate(records, "2026-07-10").map((item) => item.id)).toEqual(["1"]);
  });
});
