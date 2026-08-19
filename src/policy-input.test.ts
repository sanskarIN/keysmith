import { describe, expect, it } from "vitest";
import { customSymbolsFromInput } from "./policy-input";

describe("custom symbol input conversion", () => {
  it("uses null only for a truly empty input", () => {
    expect(customSymbolsFromInput("")).toBeNull();
  });

  it("preserves whitespace and punctuation exactly for Rust validation", () => {
    expect(customSymbolsFromInput(" ! @ ")).toBe(" ! @ ");
    expect(customSymbolsFromInput("\t!@")).toBe("\t!@");
  });
});
