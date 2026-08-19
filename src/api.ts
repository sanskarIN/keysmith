import { invoke as tauriInvoke, isTauri } from "@tauri-apps/api/core";
import type {
  BatchSecretResult,
  PassphraseOptions,
  PassphraseResult,
  PasswordOptions,
  PasswordPreset,
  SecretResult,
} from "./types";

function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    return Promise.reject(
      new Error("KeySmith desktop bridge is unavailable. Run the app through Tauri."),
    );
  }
  return tauriInvoke<T>(command, args);
}

export const api = {
  generatePassword(options: PasswordOptions): Promise<SecretResult> {
    return invoke("generate_password_command", { options });
  },
  generatePassphrase(options: PassphraseOptions): Promise<PassphraseResult> {
    return invoke("generate_passphrase_command", { options });
  },
  generateBatch(options: PasswordOptions, count: number): Promise<BatchSecretResult[]> {
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
};
