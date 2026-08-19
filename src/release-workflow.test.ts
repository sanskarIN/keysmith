// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readReleaseWorkflow(): Promise<string> {
  return readFile(new URL("../.github/workflows/release.yml", import.meta.url), "utf8");
}

describe("release workflow security and reproducibility", () => {
  it("requires committed dependency lockfiles and locked package resolution", async () => {
    const workflow = await readReleaseWorkflow();

    expect(workflow).toContain("name: Require committed dependency lockfiles");
    expect(workflow).toContain("test -f package-lock.json");
    expect(workflow).toContain("test -f Cargo.lock");
    expect(workflow).toContain("run: npm ci");
    expect(workflow).not.toContain("run: npm install");
    expect(workflow).toContain("cargo clippy --locked");
    expect(workflow).toContain("cargo test --locked");
    expect(workflow).toContain("cargo metadata --locked");
    expect(workflow).not.toContain("cargo generate-lockfile");
  });

  it("keeps release preflight read-only and grants write only to artifact builds", async () => {
    const workflow = await readReleaseWorkflow();

    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow).toContain("build:\n    needs: verify-tag\n    permissions:\n      contents: write");
    expect(workflow).toContain("npm run docs:check");
    expect(workflow).toContain("EmbarkStudios/cargo-deny-action@v2");
  });
});
