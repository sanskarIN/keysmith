import { save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type {
  PassphraseOptions,
  PassphraseResult,
  PasswordOptions,
  PasswordPreset,
  SecretResult,
} from "./types";
import { webRuntime } from "./web-runtime";

export type ExportResult = "saved" | "download-started" | "cancelled";

function hasNativeBridge(): boolean {
  return Boolean(window.__TAURI__?.core?.invoke);
}

function configureBrowserShell(): void {
  if (hasNativeBridge()) return;

  if (!document.querySelector<HTMLLinkElement>('link[rel="manifest"]')) {
    const manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    document.head.append(manifest);
  }

  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Generation still works online if service-worker installation is unavailable.
    });
  }
}

function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!window.__TAURI__?.core?.invoke) {
    return Promise.reject(new Error("KeySmith native bridge is unavailable."));
  }
  return window.__TAURI__.core.invoke<T>(command, args);
}

async function browserCopy(secret: string, clearAfterSeconds: number): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("This browser does not expose the Clipboard API in the current context.");
  }

  await navigator.clipboard.writeText(secret);
  if (clearAfterSeconds <= 0 || !navigator.clipboard.readText) return;

  window.setTimeout(() => {
    void (async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === secret) {
          await navigator.clipboard.writeText("");
        }
      } catch {
        // Browsers may deny background clipboard reads. Never erase blindly.
      }
    })();
  }, clearAfterSeconds * 1000);
}

async function browserClearClipboard(): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("This browser does not expose the Clipboard API in the current context.");
  }
  await navigator.clipboard.writeText("");
}

function browserExport(suggestedName: string, content: string): ExportResult {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = suggestedName;
  anchor.rel = "noopener";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return "download-started";
}

configureBrowserShell();

export const api = {
  generatePassword(options: PasswordOptions): Promise<SecretResult> {
    return hasNativeBridge()
      ? invoke("generate_password_command", { options })
      : webRuntime.generatePassword(options);
  },

  generatePassphrase(options: PassphraseOptions): Promise<PassphraseResult> {
    return hasNativeBridge()
      ? invoke("generate_passphrase_command", { options })
      : webRuntime.generatePassphrase(options);
  },

  generateBatch(options: PasswordOptions, count: number): Promise<SecretResult[]> {
    return hasNativeBridge()
      ? invoke("generate_batch_command", { options, count })
      : webRuntime.generateBatch(options, count);
  },

  presets(): Promise<PasswordPreset[]> {
    return hasNativeBridge() ? invoke("get_presets_command") : webRuntime.presets();
  },

  copySecret(secret: string, clearAfterSeconds: number): Promise<void> {
    return hasNativeBridge()
      ? invoke("copy_secret_command", { secret, clearAfterSeconds })
      : browserCopy(secret, clearAfterSeconds);
  },

  clearClipboard(): Promise<void> {
    return hasNativeBridge() ? invoke("clear_clipboard_command") : browserClearClipboard();
  },

  async exportTextFile(suggestedName: string, content: string): Promise<ExportResult> {
    if (!hasNativeBridge()) {
      return browserExport(suggestedName, content);
    }

    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: "Plain text", extensions: ["txt"] }],
    });
    if (!path) return "cancelled";

    await writeTextFile(path, content);
    const verified = await readTextFile(path);
    if (verified !== content) {
      throw new Error("The selected destination did not preserve the exported text.");
    }
    return "saved";
  },
};
