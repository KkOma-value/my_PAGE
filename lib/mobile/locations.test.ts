import { describe, expect, it } from "vitest";
import { groupLocationOptions } from "./locations";

describe("groupLocationOptions", () => {
  it("nests active regions under their city", () => {
    expect(
      groupLocationOptions(
        [{ id: "city", code: "shanghai", name: "Shanghai", display_name: "上海", sort_order: 1 }],
        [{ id: "region", city_id: "city", code: "xuhui", name: "徐汇区", display_name: "徐汇区" }],
      ),
    ).toEqual([
      {
        id: "city",
        code: "shanghai",
        name: "Shanghai",
        display_name: "上海",
        sort_order: 1,
        regions: [{ id: "region", city_id: "city", code: "xuhui", name: "徐汇区", display_name: "徐汇区" }],
      },
    ]);
  });
});
