import type { RecognitionSuggestion } from "./contracts";

export function recognizeDrinkFromImage(imagePath: string): RecognitionSuggestion {
  const lower = imagePath.toLowerCase();

  if (lower.includes("coffee") || lower.includes("latte")) {
    return {
      category: "coffee",
      brandName: "Manner 咖啡",
      storeName: "城市门店",
      drinkName: "冰拿铁",
      flavorTags: ["坚果香", "奶香"],
      confidence: 0.86,
    };
  }

  if (lower.includes("milk") || lower.includes("bubble")) {
    return {
      category: "milk_tea",
      brandName: "喜茶",
      storeName: "城市门店",
      drinkName: "芋泥厚牛乳",
      flavorTags: ["奶香", "浓郁"],
      confidence: 0.82,
    };
  }

  if (lower.includes("fruit") || lower.includes("lemon")) {
    return {
      category: "fruit_tea",
      brandName: "茶百道",
      storeName: "城市门店",
      drinkName: "爆柠四季春",
      flavorTags: ["果香", "清爽"],
      confidence: 0.8,
    };
  }

  return {
    category: "tea",
    brandName: "山中茶寮",
    storeName: "城市门店",
    drinkName: "高山冷泡乌龙",
    flavorTags: ["草木香", "回甘"],
    confidence: 0.62,
  };
}
