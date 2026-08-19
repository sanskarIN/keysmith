// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { en } from "./en";

const LOCALIZATION_ATTRIBUTES = [
  "data-i18n",
  "data-i18n-title",
  "data-i18n-aria-label",
  "data-i18n-placeholder",
] as const;

describe("localized markup keys", () => {
  it("references only keys that exist in the English catalog", async () => {
    const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
    const document = new DOMParser().parseFromString(html, "text/html");
    const knownKeys = new Set(Object.keys(en));
    const missing: string[] = [];

    for (const attribute of LOCALIZATION_ATTRIBUTES) {
      for (const element of document.querySelectorAll<HTMLElement>(`[${attribute}]`)) {
        const key = element.getAttribute(attribute);
        if (key && !knownKeys.has(key)) missing.push(`${attribute}=${key}`);
      }
    }

    expect(missing).toEqual([]);
  });
});
