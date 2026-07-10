import { z } from "zod";
import { CHECKIN_VISIBILITIES, DRINK_CATEGORIES } from "./contracts";

export const createDraftSchema = z
  .object({
    localClientId: z.string().trim().min(1).max(100),
    draftPayload: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const updateDraftSchema = z
  .object({
    draftPayload: z.record(z.string(), z.unknown()).optional(),
    userEditedFields: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .strict();

export const publishCheckInSchema = z
  .object({
    draftId: z.string().uuid(),
    drinkName: z.string().trim().min(1).max(100),
    brandName: z.string().trim().min(1).max(100),
    storeName: z.string().trim().max(100).default(""),
    category: z.enum(DRINK_CATEGORIES),
    flavorTags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
    cityId: z.string().uuid(),
    regionId: z.string().uuid(),
    caption: z.string().trim().max(500).default(""),
    visibility: z.enum(CHECKIN_VISIBILITIES),
    aiConfidence: z.number().min(0).max(1).optional(),
    consumedOn: z.iso.date().optional(),
  })
  .strict();

const RISKY_CAPTION_TERMS = ["违禁", "诈骗", "色情", "仇恨"];

export function moderationStatusForCaption(caption: string) {
  return RISKY_CAPTION_TERMS.some((term) => caption.includes(term)) ? "pending_review" : "visible";
}
