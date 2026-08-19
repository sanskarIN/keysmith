// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { en } from "./i18n/en";

function workspaceVersion(cargoToml: string): string {
  const match = /\[workspace\.package\][\s\S]*?\nversion = "([^"]+)"/.exec(cargoToml);
  if (!match?.[1]) throw new Error("Could not find workspace package version in Cargo.toml");
  return match[1];
}

describe("release version consistency", () => {
  it("keeps package, Rust workspace, Tauri config, and visible UI version aligned", async () => {
    const [packageText, cargoText, tauriText, html] = await Promise.all([
      readFile(new URL("../package.json", import.meta.url), "utf8"),
      readFile(new URL("../Cargo.toml", import.meta.url), "utf8"),
      readFile(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"),
      readFile(new URL("../index.html", import.meta.url), "utf8"),
    ]);

    const packageVersion = (JSON.parse(packageText) as { version: string }).version;
    const tauriVersion = (JSON.parse(tauriText) as { version: string }).version;
    const rustVersion = workspaceVersion(cargoText);
    const document = new DOMParser().parseFromString(html, "text/html");
    const aboutText = document.querySelector("#about-dialog .about-list")?.textContent ?? "";

    expect(rustVersion).toBe(packageVersion);
    expect(tauriVersion).toBe(packageVersion);
    expect(en.footerVersion).toContain(`v${packageVersion}`);
    expect(en.updatesBody).toContain(`Version ${packageVersion}`);
    expect(aboutText).toContain(packageVersion);
  });
});
