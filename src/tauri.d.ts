interface TauriCore {
  invoke<T>(command: string, args?: Record<string, unknown>): Promise<T>;
}

interface Window {
  __TAURI__: { core: TauriCore };
}
