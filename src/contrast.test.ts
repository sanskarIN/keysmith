import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";

let css = "";

function hexChannels(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (match?.[1] === undefined) throw new Error(`Expected six-digit hex color, received ${hex}`);
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function relativeLuminance(hex: string): number {
  const channels = hexChannels(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

describe("design token contrast", () => {
  beforeAll(async () => {
    css = await readFile(new URL("./styles.css", import.meta.url), "utf8");
  });

  it("keeps primary button foreground/background pairs at WCAG AA normal-text contrast", () => {
    const backgrounds = Array.from(css.matchAll(/--accent:\s*(#[0-9a-f]{6})/gi), (match) => match[1]);
    const foregrounds = Array.from(
      css.matchAll(/--accent-contrast:\s*(#[0-9a-f]{6})/gi),
      (match) => match[1],
    );

    expect(backgrounds).toHaveLength(2);
    expect(foregrounds).toHaveLength(2);

    for (const [index, background] of backgrounds.entries()) {
      const foreground = foregrounds[index];
      if (background === undefined || foreground === undefined) {
        throw new Error("Missing accent contrast token pair");
      }
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
