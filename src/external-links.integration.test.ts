// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tauri-apps/plugin-opener", () => ({ openUrl: vi.fn() }));

import { isTrustedExternalUrl } from "./external-links";

interface CapabilityPermission {
  identifier?: string;
  allow?: Array<{ url?: string }>;
}

interface CapabilityFile {
  permissions: Array<string | CapabilityPermission>;
}

async function aboutDestinationUrls(): Promise<string[]> {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const document = new DOMParser().parseFromString(html, "text/html");
  return Array.from(
    document.querySelectorAll<HTMLElement>(".link-stack [data-external-url]"),
    (element) => element.dataset.externalUrl,
  ).filter((url): url is string => typeof url === "string" && url.length > 0);
}

async function openerCapabilityUrls(): Promise<string[]> {
  const content = await readFile(
    new URL("../src-tauri/capabilities/default.json", import.meta.url),
    "utf8",
  );
  const capability = JSON.parse(content) as CapabilityFile;
  const openerPermission = capability.permissions.find(
    (permission): permission is CapabilityPermission =>
      typeof permission === "object" && permission.identifier === "opener:allow-open-url",
  );
  return (openerPermission?.allow ?? [])
    .map((entry) => entry.url)
    .filter((url): url is string => typeof url === "string");
}

describe("external link configuration", () => {
  it("keeps every About destination inside the frontend allowlist", async () => {
    const urls = await aboutDestinationUrls();
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every(isTrustedExternalUrl)).toBe(true);
  });

  it("keeps Tauri opener scope exactly aligned with the About destinations", async () => {
    const markupUrls = [...(await aboutDestinationUrls())].sort();
    const capabilityUrls = [...(await openerCapabilityUrls())].sort();
    expect(capabilityUrls).toEqual(markupUrls);
  });

  it("does not keep external navigation fallbacks in About anchors", async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
    const document = new DOMParser().parseFromString(html, "text/html");
    const externalAnchors = document.querySelectorAll<HTMLAnchorElement>(
      '.link-stack a[href^="http:"], .link-stack a[href^="https:"], .link-stack a[href^="mailto:"]',
    );
    expect(externalAnchors).toHaveLength(0);
  });
});
