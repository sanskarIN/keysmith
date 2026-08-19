import type { ThemePreference } from "./types";

const CLIPBOARD_KEY = "keysmith.clipboardClearSeconds";
const THEME_KEY = "keysmith.theme";
const ONBOARDING_KEY = "keysmith.onboardingComplete";

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

export function getClipboardClearSeconds(): number {
  const parsed = Number.parseInt(safeRead(CLIPBOARD_KEY) ?? "30", 10);
  return [0, 15, 30, 60, 120].includes(parsed) ? parsed : 30;
}

export function setClipboardClearSeconds(seconds: number): void {
  safeWrite(CLIPBOARD_KEY, String(seconds));
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
