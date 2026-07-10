import { describe, expect, it } from "vitest";
import {
  buildPersonalProfile,
  buildPersonalRecommendations,
  buildRankedSnapshot,
  seasonForDate,
} from "./snapshots";

describe("recommendation snapshots", () => {
  it("keeps seeds and boosts recent public check-ins", () => {
    const snapshot = buildRankedSnapshot(
      [{ drinkName: "生椰拿铁", brandName: "Manner", category: "coffee", score: 1 }],
      [
        {
          drink_name: "生椰拿铁",
          brand_name: "Manner",
          category: "coffee",
          consumed_on: "2026-07-01",
        },
      ],
      new Date("2026-07-10T00:00:00Z"),
    );

    expect(snapshot[0]).toMatchObject({ drinkName: "生椰拿铁", score: 2 });
  });

  it("weights old check-ins below recent check-ins", () => {
    const snapshot = buildRankedSnapshot(
      [],
      [
        { drink_name: "旧款", brand_name: "A", category: "tea", consumed_on: "2025-01-01" },
        { drink_name: "新款", brand_name: "B", category: "tea", consumed_on: "2026-07-09" },
      ],
      new Date("2026-07-10T00:00:00Z"),
    );
    expect(snapshot.map((item) => item.drinkName)).toEqual(["新款", "旧款"]);
  });

  it("keeps private storage paths instead of expiring signed URLs", () => {
    const snapshot = buildRankedSnapshot(
      [],
      [
        {
          drink_name: "公开打卡",
          brand_name: "A",
          category: "tea",
          consumed_on: "2026-07-09",
          image_path: "owner/checkin/photo.jpg",
        },
      ],
      new Date("2026-07-10T00:00:00Z"),
    );
    expect(snapshot[0]).toMatchObject({ imagePath: "owner/checkin/photo.jpg" });
  });

  it("builds personal preferences from both private and public records", () => {
    const profile = buildPersonalProfile([
      { category: "coffee", flavor_tags: ["坚果香"], region_id: "region-a" },
      { category: "coffee", flavor_tags: ["奶香"], region_id: "region-a" },
      { category: "tea", flavor_tags: ["回甘"], region_id: "region-b" },
    ]);

    expect(profile.favoriteCategories[0]).toEqual({ category: "coffee", count: 2 });
    expect(profile.frequentRegions[0]).toEqual({ regionId: "region-a", count: 2 });
  });

  it("prioritizes seed recommendations matching personal categories", () => {
    const profile = buildPersonalProfile([
      { category: "coffee", flavor_tags: [], region_id: "region-a" },
      { category: "coffee", flavor_tags: [], region_id: "region-a" },
    ]);
    const recommendations = buildPersonalRecommendations(
      [
        { drinkName: "乌龙", brandName: "A", category: "tea", score: 1 },
        { drinkName: "拿铁", brandName: "B", category: "coffee", score: 1 },
      ],
      profile,
    );
    expect(recommendations[0].drinkName).toBe("拿铁");
  });

  it("maps dates to stable season keys", () => {
    expect(seasonForDate("2026-01-10")).toBe("winter");
    expect(seasonForDate("2026-04-10")).toBe("spring");
    expect(seasonForDate("2026-07-10")).toBe("summer");
    expect(seasonForDate("2026-10-10")).toBe("autumn");
  });
});
