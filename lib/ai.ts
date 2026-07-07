import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface ClassifyResult {
  primaryCategory: string;   // machine name: beverage, food, fashion, pet, etc.
  primaryLabel: string;      // Chinese: 饮品, 食物, 穿搭, 宠物...
  subCategory: string;       // machine name: milk_tea, coffee, ootd, dessert...
  subLabel: string;          // Chinese display name
  labels: string[];          // descriptive labels: ["珍珠奶茶", "喜茶"]
  brandHint: string | null;  // possible brand name
  confidence: number;        // 0-1
}

function imageToBase64DataUrl(imagePath: string, mimeType: string): string {
  const buffer = readFileSync(imagePath);
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return mimeTypes[ext.toLowerCase()] ?? "image/jpeg";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 50);
}

export async function classifyImage(
  imageUrl: string
): Promise<ClassifyResult | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return null;
    }

    const publicDir = join(process.cwd(), "public");
    const imagePath = join(publicDir, imageUrl.replace(/^\//, ""));

    if (!existsSync(imagePath)) {
      console.error("Image not found for AI classification:", imagePath);
      return null;
    }

    const ext = imagePath.substring(imagePath.lastIndexOf("."));
    const mimeType = getMimeType(ext);
    const dataUrl = imageToBase64DataUrl(imagePath, mimeType);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `你是一个通用物品识别助手。分析这张图片，判断用户分享的是什么类型的物品。

返回严格 JSON 格式：
{
  "primaryCategory": "类别英文名(slug)",
  "primaryLabel": "类别中文名",
  "subCategory": "子类别英文名(slug)",
  "subLabel": "子类别中文名",
  "labels": ["标签1", "标签2"],
  "brandHint": "可能的品牌名或null",
  "confidence": 0.85
}

常见主类目参考（但不仅限于）：
- beverage/饮品 → 子类: milk_tea/奶茶, coffee/咖啡, fruit_tea/果茶, wine/酒, juice/果汁
- food/食物 → 子类: dessert/甜品, snack/小吃, meal/正餐, fruit/水果
- fashion/穿搭 → 子类: ootd/日常穿搭, accessory/配饰, shoes/鞋子
- pet/宠物 → 子类: cat/猫, dog/狗
- place/地点 → 子类: cafe/咖啡馆, restaurant/餐厅, park/公园
- plant/植物 → 子类: flower/花, succulent/多肉
- other/其他 → 子类: unknown/未知

如果是饮品，尽量识别品牌；如果不是，brandHint 填 null。
只返回 JSON，不要包含其他文字。`,
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as ClassifyResult;

    // Normalize: ensure slug format for category names
    parsed.primaryCategory = slugify(parsed.primaryCategory || "other");
    parsed.subCategory = slugify(parsed.subCategory || "unknown");

    // Clamp confidence
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence ?? 0.5));

    // Ensure labels is an array
    if (!Array.isArray(parsed.labels)) {
      parsed.labels = [];
    }

    return parsed;
  } catch (error) {
    console.error("AI classification failed:", error);
    return null;
  }
}

// Backward-compatible wrapper for existing code
export interface ClassifyDrinkResult {
  category: string;
  confidence: number;
  reason: string;
}

export async function classifyDrink(
  imageUrl: string
): Promise<ClassifyDrinkResult | null> {
  const result = await classifyImage(imageUrl);
  if (!result) return null;

  // Map general result back to drink-specific format
  const drinkCategories = ["milk_tea", "coffee", "fruit_tea", "other"];
  const category = drinkCategories.includes(result.subCategory)
    ? result.subCategory
    : result.primaryCategory === "beverage"
    ? "other"
    : "other";

  return {
    category,
    confidence: result.confidence,
    reason: result.labels.join("、") || result.subLabel,
  };
}
