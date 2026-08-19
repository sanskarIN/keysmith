// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";

function loadDocument(html: string): void {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;
}

describe("static accessibility contract", () => {
  beforeAll(async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
    loadDocument(html);
  });

  it("uses unique element ids", () => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>("[id]"), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps explicit labels connected to existing controls", () => {
    for (const label of document.querySelectorAll<HTMLLabelElement>("label[for]")) {
      expect(label.htmlFor.length).toBeGreaterThan(0);
      expect(document.getElementById(label.htmlFor)).not.toBeNull();
    }
  });

  it("connects every generator tab to a tabpanel", () => {
    const tabs = document.querySelectorAll<HTMLElement>('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(0);

    for (const tab of tabs) {
      const controls = tab.getAttribute("aria-controls");
      expect(controls).not.toBeNull();
      if (controls !== null) {
        expect(document.getElementById(controls)?.getAttribute("role")).toBe("tabpanel");
      }
    }
  });

  it("gives every button visible text or an explicit accessible label", () => {
    for (const button of document.querySelectorAll<HTMLButtonElement>("button")) {
      const visibleText = button.textContent?.trim() ?? "";
      const ariaLabel = button.getAttribute("aria-label")?.trim() ?? "";
      expect(visibleText.length > 0 || ariaLabel.length > 0).toBe(true);
    }
  });

  it("connects every dialog to an existing labelled-by heading", () => {
    for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog")) {
      const labelledBy = dialog.getAttribute("aria-labelledby");
      expect(labelledBy).not.toBeNull();
      if (labelledBy !== null) {
        expect(document.getElementById(labelledBy)).not.toBeNull();
      }
    }
  });
});
