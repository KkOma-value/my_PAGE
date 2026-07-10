import { describe, expect, it } from "vitest";
import { moderationStatusForCaption, publishCheckInSchema } from "./checkin-input";

const validInput = {
  draftId: "d5549ea5-f42d-4f0d-b9c4-7451c602cc86",
  drinkName: "冰拿铁",
  brandName: "Manner 咖啡",
  storeName: "静安门店",
  category: "coffee",
  flavorTags: ["坚果香", "奶香"],
  cityId: "76047a86-46dc-4ce2-9199-cc48b996a0d8",
  regionId: "e8503efd-99d6-43c6-a910-d8919271f4ba",
  caption: "今日一杯",
  visibility: "private",
};

describe("publishCheckInSchema", () => {
  it("accepts editable structured drink fields", () => {
    expect(publishCheckInSchema.parse(validInput)).toMatchObject(validInput);
  });

  it("does not accept a client-controlled image URL", () => {
    const result = publishCheckInSchema.safeParse({ ...validInput, imageUrl: "https://attacker.example/image.jpg" });
    expect(result.success).toBe(false);
  });
});

describe("moderationStatusForCaption", () => {
  it("queues obvious risky prototype content for review", () => {
    expect(moderationStatusForCaption("这是违禁推广内容")).toBe("pending_review");
  });

  it("publishes ordinary drink notes immediately", () => {
    expect(moderationStatusForCaption("今天的拿铁坚果香很明显")).toBe("visible");
  });
});
