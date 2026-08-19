// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

interface TauriConfig {
  build?: { removeUnusedCommands?: boolean };
  app?: {
    withGlobalTauri?: boolean;
    security?: { capabilities?: string[] };
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
    expect(config.build?.removeUnusedCommands).toBe(true);
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
