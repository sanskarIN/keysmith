import type { ThemePreference } from "./types";

const CLIPBOARD_KEY = "keysmith.clipboardClearSeconds";
const THEME_KEY = "keysmith.theme";
const ONBOARDING_KEY = "keysmith.onboardingComplete";
const DEFAULT_CLIPBOARD_CLEAR_SECONDS = 30;
const SUPPORTED_CLIPBOARD_CLEAR_SECONDS = new Set([0, 15, 30, 60, 120]);
const SUPPORTED_STORED_CLIPBOARD_CLEAR_SECONDS = new Set(["0", "15", "30", "60", "120"]);

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

function normalizeClipboardClearSeconds(seconds: number): number {
  return Number.isInteger(seconds) && SUPPORTED_CLIPBOARD_CLEAR_SECONDS.has(seconds)
    ? seconds
    : DEFAULT_CLIPBOARD_CLEAR_SECONDS;
}

export function getClipboardClearSeconds(): number {
  const stored = safeRead(CLIPBOARD_KEY);
  if (stored === null || !SUPPORTED_STORED_CLIPBOARD_CLEAR_SECONDS.has(stored)) {
    return DEFAULT_CLIPBOARD_CLEAR_SECONDS;
  }
  return Number(stored);
}

export function setClipboardClearSeconds(seconds: number): void {
  safeWrite(CLIPBOARD_KEY, String(normalizeClipboardClearSeconds(seconds)));
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
