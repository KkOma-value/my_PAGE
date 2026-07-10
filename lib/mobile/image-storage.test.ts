import { describe, expect, it } from "vitest";
import {
  attachSignedImageUrl,
  attachSignedRecommendationImages,
  createImageObjectPath,
  createRecognitionObjectId,
  imageExtensionForMime,
} from "./image-storage";

describe("private image storage", () => {
  it("builds an owner-scoped object path", () => {
    expect(
      createImageObjectPath(
        "21eb44cc-0aec-4fab-9120-c445f8295d2a",
        "6e77971a-c197-42dc-aa1f-1f1f650281a2",
        "photo-id",
        "image/webp",
      ),
    ).toBe("21eb44cc-0aec-4fab-9120-c445f8295d2a/6e77971a-c197-42dc-aa1f-1f1f650281a2/photo-id.webp");
  });

  it("rejects unsupported image types", () => {
    expect(() => imageExtensionForMime("image/gif")).toThrow("Unsupported image type");
  });

  it("keeps safe filename keywords for deterministic mock recognition", () => {
    expect(createRecognitionObjectId("Iced Coffee.JPG", "object-id")).toBe("iced-coffee-object-id");
  });

  it("adds a temporary URL without exposing stored object path", async () => {
    const result = await attachSignedImageUrl(
      { id: "draft", image_path: "owner/draft/photo.jpg" },
      async (path) => `https://signed.example/${path}`,
    );

    expect(result).toEqual({
      id: "draft",
      image_url: "https://signed.example/owner/draft/photo.jpg",
    });
  });

  it("signs only recommendation items backed by private storage", async () => {
    const result = await attachSignedRecommendationImages(
      [
        { drinkName: "A", imagePath: "owner/checkin/a.jpg" },
        { drinkName: "B", imageUrl: "https://seed.example/b.jpg" },
      ],
      async (path) => `https://signed.example/${path}`,
    );
    expect(result).toEqual([
      { drinkName: "A", imageUrl: "https://signed.example/owner/checkin/a.jpg" },
      { drinkName: "B", imageUrl: "https://seed.example/b.jpg" },
    ]);
  });
});
