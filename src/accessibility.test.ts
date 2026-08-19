// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it } from "vitest";

function loadDocument(html: string): void {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;
}

function hasLabel(control: HTMLInputElement | HTMLSelectElement): boolean {
  if (control.getAttribute("aria-label")?.trim()) return true;
  if (control.id && document.querySelector(`label[for="${control.id}"]`)) return true;
  return control.closest("label") !== null;
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

  it("gives every input and select an associated accessible label", () => {
    for (const control of document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "input, select",
    )) {
      expect(hasLabel(control)).toBe(true);
    }
  });

  it("connects every generator tab to a tabpanel and starts with one active tab", () => {
    const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    expect(tabs.length).toBeGreaterThan(0);

    for (const tab of tabs) {
      const controls = tab.getAttribute("aria-controls");
      expect(controls).not.toBeNull();
      if (controls !== null) {
        expect(document.getElementById(controls)?.getAttribute("role")).toBe("tabpanel");
      }
    }

    expect(tabs.filter((tab) => tab.getAttribute("aria-selected") === "true")).toHaveLength(1);
    expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  });

  it("gives every button visible text or an explicit accessible label", () => {
    for (const button of document.querySelectorAll<HTMLButtonElement>("button")) {
      const visibleText = button.textContent?.trim() ?? "";
      const ariaLabel = button.getAttribute("aria-label")?.trim() ?? "";
      expect(visibleText.length > 0 || ariaLabel.length > 0).toBe(true);
    }
  });

  it("keeps native external actions as non-submit buttons with declared destinations", () => {
    const actions = document.querySelectorAll<HTMLButtonElement>("[data-external-url]");
    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) {
      expect(action.type).toBe("button");
      expect(action.dataset.externalUrl?.length).toBeGreaterThan(0);
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
