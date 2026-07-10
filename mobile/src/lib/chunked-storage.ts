export interface AsyncKeyValueDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createChunkedStorage(driver: AsyncKeyValueDriver, chunkSize = 1800) {
  const manifestKey = (key: string) => `${key}.chunk-count`;
  const chunkKey = (key: string, index: number) => `${key}.chunk.${index}`;

  return {
    async getItem(key: string) {
      const rawCount = await driver.getItem(manifestKey(key));
      if (!rawCount) return driver.getItem(key);
      const count = Number(rawCount);
      if (!Number.isInteger(count) || count < 0) return null;
      const chunks = await Promise.all(
        Array.from({ length: count }, (_, index) => driver.getItem(chunkKey(key, index))),
      );
      if (chunks.some((chunk) => chunk === null)) return null;
      return chunks.join("");
    },

    async setItem(key: string, value: string) {
      const previousCount = Number(await driver.getItem(manifestKey(key))) || 0;
      const chunks = Array.from(
        { length: Math.ceil(value.length / chunkSize) },
        (_, index) => value.slice(index * chunkSize, (index + 1) * chunkSize),
      );
      await Promise.all(chunks.map((chunk, index) => driver.setItem(chunkKey(key, index), chunk)));
      await driver.setItem(manifestKey(key), String(chunks.length));
      await driver.removeItem(key);
      await Promise.all(
        Array.from(
          { length: Math.max(0, previousCount - chunks.length) },
          (_, index) => driver.removeItem(chunkKey(key, chunks.length + index)),
        ),
      );
    },

    async removeItem(key: string) {
      const count = Number(await driver.getItem(manifestKey(key))) || 0;
      await Promise.all(
        Array.from({ length: count }, (_, index) => driver.removeItem(chunkKey(key, index))),
      );
      await Promise.all([driver.removeItem(manifestKey(key)), driver.removeItem(key)]);
    },
  };
}
