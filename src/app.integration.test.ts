// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { PasswordPreset, SecretResult } from "./types";

const generated: SecretResult = {
  secret: "Ab3!fictional-safe-test",
  strength: {
    score: 4,
    guesses: 1_000_000,
    guessesLog10: 6,
    label: "Very strong",
  },
};

const presets: PasswordPreset[] = [
  {
    id: "balanced",
    name: "Backend Balanced",
    description: "Backend description",
    options: {
      length: 20,
      lowercase: true,
      uppercase: true,
      digits: true,
      symbols: true,
      excludeAmbiguous: true,
      customSymbols: null,
    },
  },
];

const invoke = vi.fn(
  (command: string, args?: Record<string, unknown>): Promise<unknown> => {
    const request = { command, args };
    switch (request.command) {
      case "get_presets_command":
        return Promise.resolve(presets);
      case "generate_password_command":
        return Promise.resolve(generated);
      case "copy_secret_command":
      case "clear_clipboard_command":
        return Promise.resolve(undefined);
      default:
        return Promise.reject(new Error(`Unexpected command in integration test: ${request.command}`));
    }
  },
);

const bridgeInvoke: TauriCore["invoke"] = <T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> => invoke(command, args).then((value) => value as T);

function mediaQueryList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  };
}

describe("primary frontend journey", () => {
  beforeAll(async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
    const parsed = new DOMParser().parseFromString(html, "text/html");
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;

    localStorage.clear();
    localStorage.setItem("keysmith.onboardingComplete", "true");
    window.matchMedia = (query: string) => mediaQueryList(query);
    window.__TAURI__ = {
      core: {
        invoke: bridgeInvoke,
      },
    };

    await import("./main");
    await vi.waitFor(() => {
      expect(document.querySelectorAll("#preset option")).toHaveLength(2);
    });
  });

  it("localizes metadata, generates a password, copies it, and switches generator tabs", async () => {
    const presetOption = document.querySelector<HTMLOptionElement>('#preset option[value="balanced"]');
    expect(presetOption?.textContent).toBe("Balanced");

    const generateButton = document.querySelector<HTMLButtonElement>("#generate-button");
    generateButton?.click();

    await vi.waitFor(() => {
      expect(document.querySelector("#secret-output")?.textContent).toBe(generated.secret);
    });
    expect(document.querySelector("#strength-label")?.textContent).toBe("Very strong");

    document.querySelector<HTMLButtonElement>("#copy-button")?.click();
    await vi.waitFor(() => {
      expect(invoke).toHaveBeenCalledWith("copy_secret_command", {
        secret: generated.secret,
        clearAfterSeconds: 30,
      });
    });

    const passwordTab = document.querySelector<HTMLButtonElement>("#tab-password");
    passwordTab?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(document.querySelector("#tab-passphrase")?.getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector<HTMLElement>("#password-controls")?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>("#passphrase-controls")?.hidden).toBe(false);
  });
});
