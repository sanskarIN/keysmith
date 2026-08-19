import type { ThemePreference } from "./types";

const CLIPBOARD_KEY = "keysmith.clipboardClearSeconds";
const THEME_KEY = "keysmith.theme";
const ONBOARDING_KEY = "keysmith.onboardingComplete";
const SUPPORTED_CLIPBOARD_CLEAR_SECONDS = [0, 15, 30, 60, 120] as const;
const DEFAULT_CLIPBOARD_CLEAR_SECONDS = 30;

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Settings persistence is non-critical and never contains generated secrets.
  }
}

function isSupportedClipboardClearSeconds(seconds: number): boolean {
  return SUPPORTED_CLIPBOARD_CLEAR_SECONDS.some((supported) => supported === seconds);
}

export function getClipboardClearSeconds(): number {
  const parsed = Number.parseInt(safeRead(CLIPBOARD_KEY) ?? String(DEFAULT_CLIPBOARD_CLEAR_SECONDS), 10);
  return isSupportedClipboardClearSeconds(parsed) ? parsed : DEFAULT_CLIPBOARD_CLEAR_SECONDS;
}

export function setClipboardClearSeconds(seconds: number): void {
  if (isSupportedClipboardClearSeconds(seconds)) {
    safeWrite(CLIPBOARD_KEY, String(seconds));
  }
}

export function getThemePreference(): ThemePreference {
  const value = safeRead(THEME_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function setThemePreference(theme: ThemePreference): void {
  safeWrite(THEME_KEY, theme);
}

export function isOnboardingComplete(): boolean {
  return safeRead(ONBOARDING_KEY) === "true";
}

export function completeOnboarding(): void {
  safeWrite(ONBOARDING_KEY, "true");
}
