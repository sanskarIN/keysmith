import { describe, expect, it } from "vitest";
import { localizedPresetCopy } from "./presets";

describe("preset localization", () => {
  it("localizes known built-in preset identifiers", () => {
    expect(
      localizedPresetCopy({ id: "balanced", name: "Server name", description: "Server copy" }),
    ).toEqual({
      name: "Balanced",
      description: "Strong default for most modern accounts.",
    });
  });

  it("falls back to server-provided metadata for unknown presets", () => {
    expect(
      localizedPresetCopy({ id: "future", name: "Future preset", description: "Future copy" }),
    ).toEqual({
      name: "Future preset",
      description: "Future copy",
    });
  });
});
