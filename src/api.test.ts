// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordOptions } from "./types";

const tauri = vi.hoisted(() => ({
  invoke: vi.fn(),
  isTauri: vi.fn(() => true),
}));

vi.mock("@tauri-apps/api/core", () => tauri);

import { api } from "./api";

const options: PasswordOptions = {
  length: 20,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: true,
  customSymbols: null,
};

describe("Tauri IPC client", () => {
  beforeEach(() => {
    tauri.invoke.mockReset();
    tauri.isTauri.mockReset();
    tauri.isTauri.mockReturnValue(true);
  });

  it("sends password options only to the password command", async () => {
    tauri.invoke.mockResolvedValue({
      secret: "example",
      strength: { score: 4, guesses: 1, guessesLog10: 0, label: "Very strong" },
    });

    await api.generatePassword(options);

    expect(tauri.invoke).toHaveBeenCalledOnce();
    expect(tauri.invoke).toHaveBeenCalledWith("generate_password_command", { options });
  });

  it("passes the requested batch count and accepts lightweight secret-only results", async () => {
    tauri.invoke.mockResolvedValue([{ secret: "fictional-batch-value" }]);

    const result = await api.generateBatch(options, 12);

    expect(tauri.invoke).toHaveBeenCalledWith("generate_batch_command", { options, count: 12 });
    expect(result).toEqual([{ secret: "fictional-batch-value" }]);
    expect(result.at(0)).not.toHaveProperty("strength");
  });

  it("passes clipboard expiry through the narrow clipboard command", async () => {
    tauri.invoke.mockResolvedValue(undefined);

    await api.copySecret("fictional-test-secret", 30);

    expect(tauri.invoke).toHaveBeenCalledWith("copy_secret_command", {
      secret: "fictional-test-secret",
      clearAfterSeconds: 30,
    });
  });

  it("passes only prepared plaintext content to the native export command", async () => {
    const content = "# KeySmith batch export\n# WARNING: fictional test\n\nfictional-value\n";
    tauri.invoke.mockResolvedValue(true);

    await expect(api.exportBatch(content)).resolves.toBe(true);
    expect(tauri.invoke).toHaveBeenCalledWith("export_batch_command", { content });
  });

  it("fails closed when the desktop runtime is unavailable", async () => {
    tauri.isTauri.mockReturnValue(false);

    await expect(api.generatePassword(options)).rejects.toThrow(
      "KeySmith desktop bridge is unavailable",
    );
    expect(tauri.invoke).not.toHaveBeenCalled();
  });
});
