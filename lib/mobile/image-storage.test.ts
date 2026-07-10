import { describe, expect, it } from "vitest";
import { attachSignedImageUrl, createImageObjectPath, imageExtensionForMime } from "./image-storage";

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

  it("adds a temporary URL without replacing stored object path", async () => {
    const result = await attachSignedImageUrl(
      { id: "draft", image_path: "owner/draft/photo.jpg" },
      async (path) => `https://signed.example/${path}`,
    );

    expect(result).toEqual({
      id: "draft",
      image_path: "owner/draft/photo.jpg",
      image_url: "https://signed.example/owner/draft/photo.jpg",
    });
  });
});
