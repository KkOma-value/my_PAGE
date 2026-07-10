import { describe, expect, it } from "vitest";
import { matchLocationAddress } from "./location";

const cities = [
  {
    id: "shanghai",
    code: "shanghai",
    name: "Shanghai",
    display_name: "上海",
    regions: [
      { id: "xuhui", code: "xuhui", name: "徐汇区", display_name: "徐汇区" },
      { id: "jingan", code: "jingan", name: "静安区", display_name: "静安区" },
    ],
  },
];

describe("matchLocationAddress", () => {
  it("matches localized city and district without returning coordinates", () => {
    expect(matchLocationAddress({ city: "上海市", district: "徐汇区" }, cities)).toEqual({
      cityId: "shanghai",
      regionId: "xuhui",
    });
  });

  it("returns no suggestion when city is outside seed coverage", () => {
    expect(matchLocationAddress({ city: "拉萨市", district: "城关区" }, cities)).toBeNull();
  });
});
