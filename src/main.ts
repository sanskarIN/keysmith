import "./styles.css";
import { api } from "./api";
import { buildBatchExport } from "./export";
import { applyTranslations } from "./i18n";
import { en, enFormat } from "./i18n/en";
import { localizedPresetCopy } from "./i18n/presets";
import { localizedStrengthLabel } from "./i18n/strength";
import {
  completeOnboarding,
  getClipboardClearSeconds,
  getThemePreference,
  isOnboardingComplete,
  setClipboardClearSeconds,
  setThemePreference,
} from "./storage";
import type {
  BatchSecretResult,
  GeneratorMode,
  PassphraseOptions,
  PasswordOptions,
  PasswordPreset,
  SecretResult,
  ThemePreference,
} from "./types";

function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing required element: ${id}`);
  return node as T;
}

const ui = {
  output: byId<HTMLOutputElement>("secret-output"),
  status: byId<HTMLParagraphElement>("status"),
  strengthLabel: byId<HTMLSpanElement>("strength-label"),
  strengthScore: byId<HTMLSpanElement>("strength-score"),
  generate: byId<HTMLButtonElement>("generate-button"),
  copy: byId<HTMLButtonElement>("copy-button"),
  copyBatch: byId<HTMLButtonElement>("copy-batch-button"),
  exportBatch: byId<HTMLButtonElement>("export-batch-button"),
  clearClipboard: byId<HTMLButtonElement>("clear-clipboard-button"),
  settingsClearClipboard: byId<HTMLButtonElement>("settings-clear-clipboard"),
  theme: byId<HTMLButtonElement>("theme-button"),
  settingsTheme: byId<HTMLSelectElement>("settings-theme"),
  settings: byId<HTMLButtonElement>("settings-button"),
  settingsDialog: byId<HTMLDialogElement>("settings-dialog"),
  about: byId<HTMLButtonElement>("about-button"),
  aboutDialog: byId<HTMLDialogElement>("about-dialog"),
  onboardingDialog: byId<HTMLDialogElement>("onboarding-dialog"),
  finishOnboarding: byId<HTMLButtonElement>("finish-onboarding-button"),
  showOnboarding: byId<HTMLButtonElement>("show-onboarding-button"),
  length: byId<HTMLInputElement>("length"),
  lengthValue: byId<HTMLElement>("length-value"),
  lowercase: byId<HTMLInputElement>("lowercase"),
  uppercase: byId<HTMLInputElement>("uppercase"),
  digits: byId<HTMLInputElement>("digits"),
  symbols: byId<HTMLInputElement>("symbols"),
  ambiguous: byId<HTMLInputElement>("ambiguous"),
  customSymbols: byId<HTMLInputElement>("custom-symbols"),
  preset: byId<HTMLSelectElement>("preset"),
  presetDescription: byId<HTMLParagraphElement>("preset-description"),
  words: byId<HTMLInputElement>("words"),
  wordsValue: byId<HTMLElement>("words-value"),
  separator: byId<HTMLInputElement>("separator"),
  capitalize: byId<HTMLInputElement>("capitalize"),
  includeNumber: byId<HTMLInputElement>("include-number"),
  batchCount: byId<HTMLInputElement>("batch-count"),
  clipboardTime: byId<HTMLSelectElement>("clipboard-time"),
  passwordControls: byId<HTMLDivElement>("password-controls"),
  passphraseControls: byId<HTMLDivElement>("passphrase-controls"),
  batchControls: byId<HTMLDivElement>("batch-controls"),
};

let mode: GeneratorMode = "password";
let currentSecret = "";
let batch: BatchSecretResult[] = [];
let presets: PasswordPreset[] = [];
let generationRevision = 0;

function passwordOptions(): PasswordOptions {
  const symbols = ui.customSymbols.value.trim();
  return {
    length: Number(ui.length.value),
    lowercase: ui.lowercase.checked,
    uppercase: ui.uppercase.checked,
    digits: ui.digits.checked,
    symbols: ui.symbols.checked,
    excludeAmbiguous: ui.ambiguous.checked,
    customSymbols: symbols.length > 0 ? symbols : null,
  };
}

function passphraseOptions(): PassphraseOptions {
  return {
    words: Number(ui.words.value),
    separator: ui.separator.value,
    capitalize: ui.capitalize.checked,
    includeNumber: ui.includeNumber.checked,
  };
}

function setBusy(busy: boolean): void {
  ui.generate.disabled = busy;
  ui.generate.textContent = busy ? en.generating : en.generate;
}

function setStatus(message: string, error = false): void {
  ui.status.textContent = message;
  ui.status.dataset.state = error ? "error" : "ok";
}

function renderStrength(result: SecretResult): void {
  ui.strengthLabel.textContent = localizedStrengthLabel(result.strength.score, result.strength.label);
  ui.strengthScore.textContent = `${result.strength.score}/4`;
  ui.strengthScore.dataset.score = String(result.strength.score);
}

function renderSecret(result: SecretResult): void {
  currentSecret = result.secret;
  ui.output.textContent = result.secret;
  ui.output.classList.add("has-secret");
  ui.copy.disabled = false;
  renderStrength(result);
}

function resetOutput(): void {
  currentSecret = "";
  batch = [];
  ui.output.textContent = en.outputPlaceholder;
  ui.output.classList.remove("has-secret", "batch-output");
  ui.copy.disabled = true;
  ui.copyBatch.disabled = true;
  ui.exportBatch.disabled = true;
  ui.strengthLabel.textContent = en.ready;
  ui.strengthScore.textContent = "";
}

function generationIsCurrent(revision: number, requestMode: GeneratorMode): boolean {
  return revision === generationRevision && requestMode === mode;
}

async function generate(): Promise<void> {
  const revision = ++generationRevision;
  const requestMode = mode;
  setBusy(true);
  setStatus("");
  try {
    if (requestMode === "password") {
      const result = await api.generatePassword(passwordOptions());
      if (!generationIsCurrent(revision, requestMode)) return;
      renderSecret(result);
    } else if (requestMode === "passphrase") {
      const result = await api.generatePassphrase(passphraseOptions());
      if (!generationIsCurrent(revision, requestMode)) return;
      renderSecret(result);
      setStatus(
        `${en.generated} ${en.estimatedEntropy}: ${result.estimatedEntropyBits.toFixed(1)} bits.`,
      );
      return;
    } else {
      const count = Number(ui.batchCount.value);
      const result = await api.generateBatch(passwordOptions(), count);
      if (!generationIsCurrent(revision, requestMode)) return;
      batch = result;
      currentSecret = "";
      ui.output.textContent = batch
        .map((item, index) => `${index + 1}. ${item.secret}`)
        .join("\n");
      ui.output.classList.add("has-secret", "batch-output");
      ui.copy.disabled = true;
      ui.copyBatch.disabled = false;
      ui.exportBatch.disabled = false;
      ui.strengthLabel.textContent = enFormat.batchGenerated(batch.length);
      ui.strengthScore.textContent = "";
    }
    setStatus(en.generated);
  } catch (error) {
    if (!generationIsCurrent(revision, requestMode)) return;
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`${en.generationFailed} ${message}`, true);
  } finally {
    if (revision === generationRevision) setBusy(false);
  }
}

async function copyText(value: string): Promise<void> {
  if (!value) return;
  try {
    await api.copySecret(value, Number(ui.clipboardTime.value));
    setStatus(en.copied);
  } catch (error) {
    setStatus(`${en.clipboardActionFailed} ${String(error)}`, true);
  }
}

async function clearClipboard(): Promise<void> {
  try {
    await api.clearClipboard();
    setStatus(en.clipboardCleared);
  } catch (error) {
    setStatus(`${en.clipboardActionFailed} ${String(error)}`, true);
  }
}

function exportBatch(): void {
  if (batch.length === 0) return;
  const now = new Date();
  const content = buildBatchExport(
    batch.map((item) => item.secret),
    now,
    en.batchExportWarning,
  );
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `keysmith-batch-${now.toISOString().slice(0, 10)}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus(en.batchExportWarning);
}

function setPanelVisibility(panel: HTMLElement, visible: boolean): void {
  panel.hidden = !visible;
  panel.classList.toggle("hidden", !visible);
}

function switchMode(next: GeneratorMode): void {
  generationRevision += 1;
  setBusy(false);
  mode = next;
  document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((tab) => {
    const selected = tab.dataset.mode === next;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  setPanelVisibility(ui.passwordControls, next === "password");
  setPanelVisibility(ui.passphraseControls, next === "passphrase");
  setPanelVisibility(ui.batchControls, next === "batch");
  resetOutput();
}

function applyPreset(preset: PasswordPreset): void {
  ui.length.value = String(preset.options.length);
  ui.lengthValue.textContent = String(preset.options.length);
  ui.lowercase.checked = preset.options.lowercase;
  ui.uppercase.checked = preset.options.uppercase;
  ui.digits.checked = preset.options.digits;
  ui.symbols.checked = preset.options.symbols;
  ui.ambiguous.checked = preset.options.excludeAmbiguous;
  ui.customSymbols.value = preset.options.customSymbols ?? "";
  ui.presetDescription.textContent = localizedPresetCopy(preset).description;
}

function resolvedTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolvedTheme(preference);
  document.documentElement.dataset.themePreference = preference;
  ui.theme.title = enFormat.themeTitle(preference);
  ui.settingsTheme.value = preference;
}

function saveAndApplyTheme(preference: ThemePreference): void {
  setThemePreference(preference);
  applyTheme(preference);
}

function cycleTheme(): void {
  const current = (document.documentElement.dataset.themePreference ??
    "system") as ThemePreference;
  const next: ThemePreference =
    current === "system" ? "light" : current === "light" ? "dark" : "system";
  saveAndApplyTheme(next);
}

async function loadPresets(): Promise<void> {
  try {
    presets = await api.presets();
    for (const preset of presets) {
      const option = document.createElement("option");
      const copy = localizedPresetCopy(preset);
      option.value = preset.id;
      option.textContent = copy.name;
      ui.preset.append(option);
    }
  } catch (error) {
    setStatus(`${en.presetLoadFailed} ${String(error)}`, true);
  }
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((tab) => {
    tab.addEventListener("click", () => switchMode(tab.dataset.mode as GeneratorMode));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const ordered: GeneratorMode[] = ["password", "passphrase", "batch"];
      const index = ordered.indexOf(mode);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = ordered[(index + delta + ordered.length) % ordered.length];
      if (next) {
        switchMode(next);
        byId<HTMLButtonElement>(`tab-${next}`).focus();
      }
    });
  });
  ui.generate.addEventListener("click", () => void generate());
  ui.copy.addEventListener("click", () => void copyText(currentSecret));
  ui.copyBatch.addEventListener("click", () => void copyText(batch.map((item) => item.secret).join("\n")));
  ui.exportBatch.addEventListener("click", exportBatch);
  ui.clearClipboard.addEventListener("click", () => void clearClipboard());
  ui.settingsClearClipboard.addEventListener("click", () => void clearClipboard());
  ui.length.addEventListener("input", () => {
    ui.lengthValue.textContent = ui.length.value;
    ui.preset.value = "";
  });
  ui.words.addEventListener("input", () => {
    ui.wordsValue.textContent = ui.words.value;
  });
  ui.preset.addEventListener("change", () => {
    const preset = presets.find((item) => item.id === ui.preset.value);
    if (preset) {
      applyPreset(preset);
    } else {
      ui.presetDescription.textContent = en.presetHint;
    }
  });
  ui.clipboardTime.addEventListener("change", () =>
    setClipboardClearSeconds(Number(ui.clipboardTime.value)),
  );
  ui.theme.addEventListener("click", cycleTheme);
  ui.settingsTheme.addEventListener("change", () =>
    saveAndApplyTheme(ui.settingsTheme.value as ThemePreference),
  );
  ui.settings.addEventListener("click", () => ui.settingsDialog.showModal());
  ui.about.addEventListener("click", () => ui.aboutDialog.showModal());
  ui.finishOnboarding.addEventListener("click", completeOnboarding);
  ui.showOnboarding.addEventListener("click", () => {
    ui.settingsDialog.close();
    ui.onboardingDialog.showModal();
  });

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (document.documentElement.dataset.themePreference === "system") {
      applyTheme("system");
    }
  });
}

async function init(): Promise<void> {
  applyTranslations();
  applyTheme(getThemePreference());
  ui.clipboardTime.value = String(getClipboardClearSeconds());
  bindEvents();
  await loadPresets();
  if (!isOnboardingComplete()) {
    ui.onboardingDialog.showModal();
  }
}

void init();
