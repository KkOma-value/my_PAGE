import { getSupabaseAdmin } from "@/lib/supabase/server";

export const DRINK_IMAGE_BUCKET = "drink-images";
export const MAX_DRINK_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DRINK_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function imageExtensionForMime(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  throw new Error("Unsupported image type");
}

function safePathSegment(value: string) {
  if (!/^[a-zA-Z0-9-]+$/.test(value)) throw new Error("Invalid image path segment");
  return value;
}

export function createImageObjectPath(
  userId: string,
  draftId: string,
  objectId: string,
  mimeType: string,
) {
  return [safePathSegment(userId), safePathSegment(draftId), safePathSegment(objectId)].join("/") +
    `.${imageExtensionForMime(mimeType)}`;
}

export async function signImagePath(imagePath: string, expiresInSeconds = 3600) {
  const { data, error } = await getSupabaseAdmin().storage
    .from(DRINK_IMAGE_BUCKET)
    .createSignedUrl(imagePath, expiresInSeconds);
  if (error) throw new Error(`Image signing failed: ${error.message}`);
  return data.signedUrl;
}

export async function attachSignedImageUrl<T extends { image_path?: string | null }>(
  row: T,
  signer: (path: string) => Promise<string> = signImagePath,
) {
  const { image_path: imagePath, ...publicRow } = row;
  return {
    ...publicRow,
    image_url: imagePath ? await signer(imagePath) : null,
  };
}

export async function attachSignedImageUrls<T extends { image_path?: string | null }>(rows: T[]) {
  return Promise.all(rows.map((row) => attachSignedImageUrl(row)));
}

export async function attachSignedRecommendationImages<
  T extends { imagePath?: string | null; imageUrl?: string | null },
>(items: T[], signer: (path: string) => Promise<string> = signImagePath) {
  return Promise.all(
    items.map(async (item) => {
      const { imagePath, ...publicItem } = item;
      return imagePath ? { ...publicItem, imageUrl: await signer(imagePath) } : publicItem;
    }),
  );
}
