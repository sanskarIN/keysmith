// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface TauriConfig {
  build?: { removeUnusedCommands?: boolean };
  app?: {
    withGlobalTauri?: boolean;
    security?: {
      capabilities?: string[];
      csp?: string;
      devCsp?: string;
      freezePrototype?: boolean;
    };
  };
}

interface CapabilityPermission {
  identifier?: string;
}

interface CapabilityFile {
  identifier: string;
  permissions: Array<string | CapabilityPermission>;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8")) as T;
}

describe("Tauri security configuration", () => {
  it("keeps the global bridge disabled and opts into one explicit capability", async () => {
    const config = await readJson<TauriConfig>("../src-tauri/tauri.conf.json");

    expect(config.app?.withGlobalTauri).toBe(false);
    expect(config.app?.security?.capabilities).toEqual(["main-capability"]);
    expect(config.app?.security?.freezePrototype).toBe(true);
    expect(config.build?.removeUnusedCommands).toBe(true);
  });

  it("keeps production CSP stricter than development allowances", async () => {
    const config = await readJson<TauriConfig>("../src-tauri/tauri.conf.json");
    const csp = config.app?.security?.csp ?? "";
    const devCsp = config.app?.security?.devCsp ?? "";

    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("blob:");
    expect(csp).not.toContain("data:");
    expect(devCsp).toContain("ws://localhost:1420");
    expect(devCsp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it("keeps main capability narrow and excludes Tauri core defaults", async () => {
    const capability = await readJson<CapabilityFile>(
      "../src-tauri/capabilities/default.json",
    );
    const identifiers = capability.permissions.map((permission) =>
      typeof permission === "string" ? permission : permission.identifier,
    );

    expect(capability.identifier).toBe("main-capability");
    expect(identifiers).not.toContain("core:default");
    expect(identifiers).toContain("keysmith-generation");
    expect(identifiers).toContain("keysmith-clipboard");
    expect(identifiers).toContain("keysmith-export");
    expect(identifiers).toContain("opener:allow-open-url");
  });
});
