// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  completeOnboarding,
  getClipboardClearSeconds,
  getThemePreference,
  isOnboardingComplete,
  setClipboardClearSeconds,
  setThemePreference,
} from "./storage";

describe("local non-secret settings", () => {
  beforeEach(() => localStorage.clear());

  it("uses privacy-oriented clipboard default", () => {
    expect(getClipboardClearSeconds()).toBe(30);
  });

  it("round trips supported clipboard durations", () => {
    setClipboardClearSeconds(60);
    expect(getClipboardClearSeconds()).toBe(60);
  });

  it("rejects unsupported stored clipboard durations", () => {
    localStorage.setItem("keysmith.clipboardClearSeconds", "999");
    expect(getClipboardClearSeconds()).toBe(30);
  });

  it("does not persist unsupported clipboard durations", () => {
    setClipboardClearSeconds(999);
    expect(localStorage.getItem("keysmith.clipboardClearSeconds")).toBeNull();
    expect(getClipboardClearSeconds()).toBe(30);
  });

  it("round trips theme preference", () => {
    setThemePreference("dark");
    expect(getThemePreference()).toBe("dark");
  });

  it("records onboarding completion without storing a secret", () => {
    expect(isOnboardingComplete()).toBe(false);
    completeOnboarding();
    expect(isOnboardingComplete()).toBe(true);
    expect(localStorage.length).toBe(1);
  });
});
