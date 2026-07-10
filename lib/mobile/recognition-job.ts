import type { RecognitionSuggestion } from "./contracts";
import { recognizeDrinkFromImage } from "./mock-recognition";

interface RecognitionJobInput {
  draftId: string;
  userId: string;
  imagePath: string;
}

type RecognitionUpdate = Record<string, unknown>;
type UpdateDraft = (update: RecognitionUpdate) => Promise<unknown> | unknown;
type Recognizer = (imagePath: string) => RecognitionSuggestion;

export async function runRecognitionJob(
  input: RecognitionJobInput,
  updateDraft: UpdateDraft,
  recognizer: Recognizer = recognizeDrinkFromImage,
) {
  try {
    await updateDraft({
      recognition_status: "recognizing",
      updated_at: new Date().toISOString(),
    });
    const suggestion = recognizer(input.imagePath);
    await updateDraft({
      recognition_status: "ready",
      recognition_suggestions: suggestion,
      updated_at: new Date().toISOString(),
    });
  } catch {
    try {
      await updateDraft({
        recognition_status: "failed",
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Upload response is already complete; a later manual retry can recover.
    }
  }
}
