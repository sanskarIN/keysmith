import type {
  PassphraseOptions,
  PassphraseResult,
  PasswordOptions,
  PasswordPreset,
  SecretResult,
} from "./types";

type WasmRuntime = {
  default: () => Promise<unknown>;
  generate_password_json: (optionsJson: string) => string;
  generate_batch_json: (optionsJson: string, count: number) => string;
  generate_passphrase_json: (optionsJson: string) => string;
  presets_json: () => string;
};

let runtimePromise: Promise<WasmRuntime> | null = null;

async function loadRuntime(): Promise<WasmRuntime> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const modulePath = `${import.meta.env.BASE_URL}wasm/keysmith_web.js`;
      const runtime = (await import(/* @vite-ignore */ modulePath)) as WasmRuntime;
      await runtime.default();
      return runtime;
    })();
  }
  return runtimePromise;
}

function parse<T>(json: string): T {
  return JSON.parse(json) as T;
}

export const webRuntime = {
  async generatePassword(options: PasswordOptions): Promise<SecretResult> {
    const runtime = await loadRuntime();
    return parse<SecretResult>(runtime.generate_password_json(JSON.stringify(options)));
  },

  async generatePassphrase(options: PassphraseOptions): Promise<PassphraseResult> {
    const runtime = await loadRuntime();
    return parse<PassphraseResult>(runtime.generate_passphrase_json(JSON.stringify(options)));
  },

  async generateBatch(options: PasswordOptions, count: number): Promise<SecretResult[]> {
    const runtime = await loadRuntime();
    return parse<SecretResult[]>(runtime.generate_batch_json(JSON.stringify(options), count));
  },

  async presets(): Promise<PasswordPreset[]> {
    const runtime = await loadRuntime();
    return parse<PasswordPreset[]>(runtime.presets_json());
  },
};
