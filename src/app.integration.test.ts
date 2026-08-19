// @vitest-environment jsdom
import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { BatchSecretResult, PassphraseResult, PasswordPreset, SecretResult } from "./types";

const tauri = vi.hoisted(() => ({
  invoke: vi.fn(),
  isTauri: vi.fn(() => true),
}));
const opener = vi.hoisted(() => ({
  openUrl: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => tauri);
vi.mock("@tauri-apps/plugin-opener", () => opener);

const generatedPassword: SecretResult = {
  secret: "Ab3!fictional-safe-test",
  strength: {
    score: 4,
    guesses: 1_000_000,
    guessesLog10: 6,
    label: "Very strong",
  },
};

const generatedPassphrase: PassphraseResult = {
  secret: "fictional-safe-passphrase-test",
  strength: {
    score: 3,
    guesses: 100_000,
    guessesLog10: 5,
    label: "Strong",
  },
  estimatedEntropyBits: 64.2,
};

const generatedBatch: BatchSecretResult[] = [
  { secret: "fictional-batch-one" },
  { secret: "fictional-batch-two" },
];

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

function button(id: string): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (!element) throw new Error(`Missing button in integration fixture: ${id}`);
  return element;
}

describe("primary frontend journey", () => {
  beforeAll(async () => {
    tauri.invoke.mockImplementation(
      (command: string, args?: Record<string, unknown>): Promise<unknown> => {
        const request = { command, args };
        switch (request.command) {
          case "get_presets_command":
            return Promise.resolve(presets);
          case "generate_password_command":
            return Promise.resolve(generatedPassword);
          case "generate_passphrase_command":
            return Promise.resolve(generatedPassphrase);
          case "generate_batch_command":
            return Promise.resolve(generatedBatch);
          case "copy_secret_command":
          case "clear_clipboard_command":
            return Promise.resolve(undefined);
          default:
            return Promise.reject(
              new Error(`Unexpected command in integration test: ${request.command}`),
            );
        }
      },
    );
    opener.openUrl.mockResolvedValue(undefined);

    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
    const parsed = new DOMParser().parseFromString(html, "text/html");
    document.head.innerHTML = parsed.head.innerHTML;
    document.body.innerHTML = parsed.body.innerHTML;

    localStorage.clear();
    localStorage.setItem("keysmith.onboardingComplete", "true");
    window.matchMedia = (query: string) => mediaQueryList(query);

    await import("./main");
    await vi.waitFor(() => {
      expect(document.querySelectorAll("#preset option")).toHaveLength(2);
    });
  });

  it("covers localized password, passphrase, batch, clipboard, and keyboard flows", async () => {
    const presetOption = document.querySelector<HTMLOptionElement>('#preset option[value="balanced"]');
    expect(presetOption?.textContent).toBe("Balanced");

    button("generate-button").click();
    await vi.waitFor(() => {
      expect(document.querySelector("#secret-output")?.textContent).toBe(generatedPassword.secret);
    });
    expect(document.querySelector("#strength-label")?.textContent).toBe("Very strong");

    button("copy-button").click();
    await vi.waitFor(() => {
      expect(tauri.invoke).toHaveBeenCalledWith("copy_secret_command", {
        secret: generatedPassword.secret,
        clearAfterSeconds: 30,
      });
    });

    button("tab-password").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(document.querySelector("#tab-passphrase")?.getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector<HTMLElement>("#password-controls")?.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>("#passphrase-controls")?.hidden).toBe(false);

    button("generate-button").click();
    await vi.waitFor(() => {
      expect(document.querySelector("#secret-output")?.textContent).toBe(generatedPassphrase.secret);
    });
    expect(document.querySelector("#strength-label")?.textContent).toBe("Strong");
    expect(document.querySelector("#status")?.textContent).toContain("64.2 bits");

    button("tab-batch").click();
    expect(document.querySelector("#tab-batch")?.getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector<HTMLElement>("#batch-controls")?.hidden).toBe(false);

    button("generate-button").click();
    await vi.waitFor(() => {
      expect(document.querySelector("#secret-output")?.textContent).toBe(
        "1. fictional-batch-one\n2. fictional-batch-two",
      );
    });
    expect(document.querySelector("#strength-label")?.textContent).toBe("2 generated");
    expect(button("copy-batch-button").disabled).toBe(false);
    expect(button("export-batch-button").disabled).toBe(false);

    button("copy-batch-button").click();
    await vi.waitFor(() => {
      expect(tauri.invoke).toHaveBeenCalledWith("copy_secret_command", {
        secret: "fictional-batch-one\nfictional-batch-two",
        clearAfterSeconds: 30,
      });
    });
  });

  it("opens an About destination through the native scoped opener", async () => {
    opener.openUrl.mockClear();
    const githubLink = document.querySelector<HTMLAnchorElement>(
      '.link-stack a[href="https://github.com/sanskarIN"]',
    );
    if (!githubLink) throw new Error("Missing GitHub About link in integration fixture");

    githubLink.click();

    await vi.waitFor(() => {
      expect(opener.openUrl).toHaveBeenCalledWith("https://github.com/sanskarIN");
    });
  });

  it("ignores a generation result that finishes after the user changes modes", async () => {
    button("tab-password").click();

    let resolvePending: ((value: SecretResult) => void) | undefined;
    const pendingResult = new Promise<SecretResult>((resolve) => {
      resolvePending = resolve;
    });
    tauri.invoke.mockImplementationOnce((command: string) => {
      if (command !== "generate_password_command") {
        return Promise.reject(new Error(`Unexpected deferred command: ${command}`));
      }
      return pendingResult;
    });

    button("generate-button").click();
    expect(button("generate-button").disabled).toBe(true);

    button("tab-passphrase").click();
    expect(button("generate-button").disabled).toBe(false);
    expect(document.querySelector("#secret-output")?.textContent).toBe("Select Generate to begin");

    if (!resolvePending) throw new Error("Deferred password resolver was not initialized");
    resolvePending(generatedPassword);
    await pendingResult;
    await Promise.resolve();

    expect(document.querySelector("#tab-passphrase")?.getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector("#secret-output")?.textContent).toBe("Select Generate to begin");
    expect(button("copy-button").disabled).toBe(true);
  });
});
