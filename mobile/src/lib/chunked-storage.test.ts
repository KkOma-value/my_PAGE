import { describe, expect, it } from "vitest";
import { createChunkedStorage } from "./chunked-storage";

function memoryDriver() {
  const values = new Map<string, string>();
  return {
    values,
    driver: {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => void values.set(key, value),
      removeItem: async (key: string) => void values.delete(key),
    },
  };
}

describe("createChunkedStorage", () => {
  it("round-trips sessions larger than one SecureStore value", async () => {
    const memory = memoryDriver();
    const storage = createChunkedStorage(memory.driver, 1024);
    const session = "x".repeat(5000);

    await storage.setItem("session", session);

    expect(await storage.getItem("session")).toBe(session);
    expect(memory.values.size).toBeGreaterThan(2);
    expect(Array.from(memory.values.keys()).every((key) => /^[\w.-]+$/.test(key))).toBe(true);
  });

  it("removes all chunks", async () => {
    const memory = memoryDriver();
    const storage = createChunkedStorage(memory.driver, 4);
    await storage.setItem("session", "long-session");
    await storage.removeItem("session");
    expect(memory.values.size).toBe(0);
  });
});
