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

  it("rejects malformed stored clipboard durations instead of partially parsing them", () => {
    for (const value of ["30seconds", "30.5", "0x1e", "", "NaN", "Infinity"]) {
      localStorage.setItem("keysmith.clipboardClearSeconds", value);
      expect(getClipboardClearSeconds()).toBe(30);
    }
  });

  it("normalizes unsupported clipboard duration writes", () => {
    setClipboardClearSeconds(999);
    expect(localStorage.getItem("keysmith.clipboardClearSeconds")).toBe("30");
    expect(getClipboardClearSeconds()).toBe(30);
  });

  it("normalizes non-integer clipboard duration writes", () => {
    setClipboardClearSeconds(15.5);
    expect(localStorage.getItem("keysmith.clipboardClearSeconds")).toBe("30");
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
