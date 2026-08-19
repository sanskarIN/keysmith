// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  getClipboardClearSeconds,
  getThemePreference,
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

  it("round trips theme preference", () => {
    setThemePreference("dark");
    expect(getThemePreference()).toBe("dark");
  });
});
