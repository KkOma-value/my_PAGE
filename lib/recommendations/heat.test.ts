import { describe, expect, it } from "vitest";
import { buildHeatCounts } from "./heat";

describe("buildHeatCounts", () => {
  it("groups personal check-ins by city and region", () => {
    expect(
      buildHeatCounts([
        { city_id: "city-a", region_id: "region-a" },
        { city_id: "city-a", region_id: "region-b" },
        { city_id: "city-b", region_id: "region-b" },
      ]),
    ).toEqual({
      cities: [
        { cityId: "city-a", count: 2 },
        { cityId: "city-b", count: 1 },
      ],
      regions: [
        { regionId: "region-b", count: 2 },
        { regionId: "region-a", count: 1 },
      ],
    });
  });
});
