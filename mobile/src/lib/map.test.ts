import { describe, expect, it } from "vitest";
import { heatOpacity, indexHeat } from "./map";

describe("map heat", () => {
  it("uses stronger opacity for more check-ins", () => {
    expect(heatOpacity(0, 10)).toBe(0.16);
    expect(heatOpacity(10, 10)).toBe(1);
  });

  it("indexes counts by id", () => {
    expect(indexHeat([{ id: "city", count: 4 }]).get("city")).toEqual({ count: 4, opacity: 1 });
  });
});
