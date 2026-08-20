import { save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type {
  PassphraseOptions,
  PassphraseResult,
  PasswordOptions,
  PasswordPreset,
  SecretResult,
} from "./types";

function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!window.__TAURI__?.core?.invoke) {
    return Promise.reject(
      new Error("KeySmith native bridge is unavailable. Run the app through Tauri."),
    );
  }
  return window.__TAURI__.core.invoke<T>(command, args);
}

export const api = {
  generatePassword(options: PasswordOptions): Promise<SecretResult> {
    return invoke("generate_password_command", { options });
  },
  generatePassphrase(options: PassphraseOptions): Promise<PassphraseResult> {
    return invoke("generate_passphrase_command", { options });
  },
  generateBatch(options: PasswordOptions, count: number): Promise<SecretResult[]> {
    return invoke("generate_batch_command", { options, count });
  },
  presets(): Promise<PasswordPreset[]> {
    return invoke("get_presets_command");
  },
  copySecret(secret: string, clearAfterSeconds: number): Promise<void> {
    return invoke("copy_secret_command", { secret, clearAfterSeconds });
  },
  clearClipboard(): Promise<void> {
    return invoke("clear_clipboard_command");
  },
  async exportTextFile(suggestedName: string, content: string): Promise<boolean> {
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: "Plain text", extensions: ["txt"] }],
    });
    if (!path) return false;

    await writeTextFile(path, content);
    const verified = await readTextFile(path);
    if (verified !== content) {
      throw new Error("The selected destination did not preserve the exported text.");
    }
    return true;
  },
};
