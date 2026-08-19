// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
import type { PasswordOptions } from "./types";

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
  const invoke = vi.fn();

  beforeEach(() => {
    invoke.mockReset();
    Object.defineProperty(window, "__TAURI__", {
      configurable: true,
      writable: true,
      value: { core: { invoke } },
    });
  });

  it("sends password options only to the password command", async () => {
    invoke.mockResolvedValue({
      secret: "example",
      strength: { score: 4, guesses: 1, guessesLog10: 0, label: "Very strong" },
    });

    await api.generatePassword(options);

    expect(invoke).toHaveBeenCalledOnce();
    expect(invoke).toHaveBeenCalledWith("generate_password_command", { options });
  });

  it("passes the requested batch count and accepts lightweight secret-only results", async () => {
    invoke.mockResolvedValue([{ secret: "fictional-batch-value" }]);

    const result = await api.generateBatch(options, 12);

    expect(invoke).toHaveBeenCalledWith("generate_batch_command", { options, count: 12 });
    expect(result).toEqual([{ secret: "fictional-batch-value" }]);
    expect("strength" in result[0]!).toBe(false);
  });

  it("passes clipboard expiry through the narrow clipboard command", async () => {
    invoke.mockResolvedValue(undefined);

    await api.copySecret("fictional-test-secret", 30);

    expect(invoke).toHaveBeenCalledWith("copy_secret_command", {
      secret: "fictional-test-secret",
      clearAfterSeconds: 30,
    });
  });

  it("fails closed when the desktop bridge is unavailable", async () => {
    Reflect.deleteProperty(window, "__TAURI__");

    await expect(api.generatePassword(options)).rejects.toThrow(
      "KeySmith desktop bridge is unavailable",
    );
  });
});
