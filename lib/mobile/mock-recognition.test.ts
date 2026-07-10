import { describe, expect, it } from "vitest";
import { recognizeDrinkFromImage } from "./mock-recognition";

describe("recognizeDrinkFromImage", () => {
  it("recognizes coffee-like image names", () => {
    expect(recognizeDrinkFromImage("user/draft/iced-coffee.jpg")).toMatchObject({
      category: "coffee",
      brandName: "Manner 咖啡",
      drinkName: "冰拿铁",
    });
  });

  it("returns a stable fallback suggestion", () => {
    expect(recognizeDrinkFromImage("user/draft/photo-123.jpg")).toMatchObject({
      category: "tea",
      confidence: 0.62,
    });
  });
});
