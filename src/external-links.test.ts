// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const opener = vi.hoisted(() => ({
  openUrl: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-opener", () => opener);

import { isTrustedExternalUrl, openTrustedExternalUrl } from "./external-links";

describe("trusted external links", () => {
  beforeEach(() => {
    opener.openUrl.mockReset();
    opener.openUrl.mockResolvedValue(undefined);
  });

  it("allows the documented project and contact destinations", () => {
    for (const url of [
      "https://github.com/sanskarIN",
      "https://buymeacoffee.com/sanskarIN",
      "mailto:supportramsandesh@gmail.com",
      "mailto:sanskarin@outlook.in",
      "mailto:sanskarin.business@gmail.com",
    ]) {
      expect(isTrustedExternalUrl(url)).toBe(true);
    }
  });

  it("opens an approved destination through the system opener", async () => {
    await openTrustedExternalUrl("https://github.com/sanskarIN");
    expect(opener.openUrl).toHaveBeenCalledWith("https://github.com/sanskarIN");
  });

  it("rejects unapproved destinations before invoking the plugin", async () => {
    await expect(openTrustedExternalUrl("https://example.com")).rejects.toThrow(
      "External URL is not approved",
    );
    expect(opener.openUrl).not.toHaveBeenCalled();
  });
});
