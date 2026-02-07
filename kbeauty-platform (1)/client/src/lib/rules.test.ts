import { describe, expect, it } from "vitest";
import { getMicroTip } from "./rules";

describe("rules micro tips", () => {
  it("should recommend calming for irritable mood", () => {
    const tip = getMicroTip({ mood: "irritable" });
    expect(tip.message).toMatch(/calming/i);
    expect(tip.recommend).toContain("centella");
  });

  it("should suggest tea tree for spicy food", () => {
    const tip = getMicroTip({ food: "Spicy" });
    expect(tip.recommend).toContain("tea-tree");
  });
});

