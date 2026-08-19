import { describe, expect, it } from "vitest";
import { localizedStrengthLabel } from "./strength";

describe("strength localization", () => {
  it("maps every zxcvbn score to localized copy", () => {
    expect([0, 1, 2, 3, 4].map((score) => localizedStrengthLabel(score, "fallback"))).toEqual([
      "Very weak",
      "Weak",
      "Fair",
      "Strong",
      "Very strong",
    ]);
  });

  it("preserves the backend label for an unknown future score", () => {
    expect(localizedStrengthLabel(5, "Future strength")).toBe("Future strength");
  });
});
