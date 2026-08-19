// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { applyTranslations } from "./index";

describe("document localization", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <span data-i18n="settings">fallback</span>
      <button data-i18n-title="offlinePrivateTitle" data-i18n-aria-label="changeThemeAria"></button>
      <input data-i18n-placeholder="customSymbolsPlaceholder" />
      <span data-i18n="missing-key">keep me</span>
    `;
  });

  it("applies text and translated attributes", () => {
    applyTranslations();

    expect(document.querySelector('[data-i18n="settings"]')?.textContent).toBe("Settings");
    expect(document.querySelector("button")?.getAttribute("title")).toBe(
      "No network access or telemetry",
    );
    expect(document.querySelector("button")?.getAttribute("aria-label")).toBe("Change theme");
    expect(document.querySelector("input")?.getAttribute("placeholder")).toBe(
      "Use default symbol set",
    );
  });

  it("preserves fallback text for unknown keys", () => {
    applyTranslations();
    expect(document.querySelector('[data-i18n="missing-key"]')?.textContent).toBe("keep me");
  });
});
