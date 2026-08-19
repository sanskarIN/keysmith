import { describe, expect, it } from "vitest";
import { buildBatchExport } from "./export";

describe("batch export formatting", () => {
  it("includes a deterministic safety header and preserves secret ordering", () => {
    const output = buildBatchExport(
      ["fictional-one", "fictional-two"],
      new Date("2026-08-19T00:00:00.000Z"),
      "Store securely.",
    );

    expect(output).toBe(
      [
        "# KeySmith batch export",
        "# Created: 2026-08-19T00:00:00.000Z",
        "# WARNING: Store securely.",
        "",
        "fictional-one",
        "fictional-two",
        "",
      ].join("\n"),
    );
  });

  it("does not add numbering that could be mistaken for password content", () => {
    const output = buildBatchExport(
      ["fictional-secret"],
      new Date("2026-08-19T00:00:00.000Z"),
      "Store securely.",
    );

    expect(output).not.toContain("1. fictional-secret");
  });
});
