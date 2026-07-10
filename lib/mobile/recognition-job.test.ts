import { describe, expect, it } from "vitest";
import { runRecognitionJob } from "./recognition-job";

describe("runRecognitionJob", () => {
  it("moves a draft from recognizing to ready", async () => {
    const updates: Record<string, unknown>[] = [];
    await runRecognitionJob(
      { draftId: "draft", userId: "user", imagePath: "user/draft/coffee.jpg" },
      async (update) => updates.push(update),
    );

    expect(updates[0]).toMatchObject({ recognition_status: "recognizing" });
    expect(updates[1]).toMatchObject({
      recognition_status: "ready",
      recognition_suggestions: { category: "coffee", drinkName: "冰拿铁" },
    });
  });

  it("records failure without throwing into the upload response", async () => {
    const updates: Record<string, unknown>[] = [];
    await runRecognitionJob(
      { draftId: "draft", userId: "user", imagePath: "user/draft/photo.jpg" },
      async (update) => updates.push(update),
      () => {
        throw new Error("recognizer unavailable");
      },
    );

    expect(updates.at(-1)).toMatchObject({ recognition_status: "failed" });
  });
});
