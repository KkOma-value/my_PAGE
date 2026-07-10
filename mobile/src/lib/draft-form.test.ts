import { describe, expect, it } from "vitest";
import { canPublishDraft, mergeRecognitionSuggestion, type DraftFormValues } from "./draft-form";

const form: DraftFormValues = {
  drinkName: "手写名称",
  brandName: "",
  storeName: "",
  category: "tea",
  flavorTags: [],
  caption: "",
  visibility: "public",
  cityId: "city",
  regionId: "region",
};

const suggestion = {
  drinkName: "AI 名称",
  brandName: "AI 品牌",
  storeName: "AI 门店",
  category: "coffee" as const,
  flavorTags: ["坚果香"],
  confidence: 0.9,
};

describe("mergeRecognitionSuggestion", () => {
  it("fills empty fields without overwriting edited fields", () => {
    expect(mergeRecognitionSuggestion(form, ["drinkName", "category"], suggestion)).toMatchObject({
      drinkName: "手写名称",
      brandName: "AI 品牌",
      storeName: "AI 门店",
      category: "tea",
      flavorTags: ["坚果香"],
    });
  });

  it("overwrites fields only after explicit force apply", () => {
    expect(mergeRecognitionSuggestion(form, ["drinkName"], suggestion, true).drinkName).toBe("AI 名称");
  });
});

describe("canPublishDraft", () => {
  it("requires ready upload and required structured fields", () => {
    expect(canPublishDraft({ image_upload_status: "ready", image_url: "https://signed" }, { ...form, brandName: "品牌" })).toBe(true);
    expect(canPublishDraft({ image_upload_status: "uploading", image_url: null }, form)).toBe(false);
  });
});
