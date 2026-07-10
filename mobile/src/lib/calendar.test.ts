import { describe, expect, it } from "vitest";
import { buildCalendarCells } from "./calendar";

describe("buildCalendarCells", () => {
  it("builds a stable six-week grid with weekday offset", () => {
    const cells = buildCalendarCells(2026, 6);
    expect(cells).toHaveLength(42);
    expect(cells.slice(0, 3)).toEqual([null, null, null]);
    expect(cells[3]).toEqual({ day: 1, date: "2026-07-01" });
    expect(cells[33]).toEqual({ day: 31, date: "2026-07-31" });
  });
});
