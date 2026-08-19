# Frontend Architecture Reference

KeySmith's presentation layer is a small Vanilla TypeScript/Vite application. It owns user interaction and presentation while delegating credential generation and native side effects to narrow Tauri APIs.

## Primary files

- `index.html` — semantic application markup, generator panels, settings/onboarding/about dialogs, warnings, localization attributes, and exact external-destination metadata.
- `src/main.ts` — application state, generation lifecycle, stale-result protection, rendering, themes, tabs, dialogs, copy/save flows, and initialization.
- `src/api.ts` — typed Tauri command wrapper using `@tauri-apps/api/core`.
- `src/types.ts` — TypeScript mirror of serialized Rust inputs/results.
- `src/storage.ts` — non-secret preference persistence only.
- `src/export.ts` — deterministic batch-export text construction.
- `src/external-links.ts` — exact frontend external-destination allowlist and opener wrapper.
- `src/policy-input.ts` — exact custom-symbol input normalization (`""` → `null`, otherwise preserve user input).
- `src/logging.ts` — bounded/redacted structured diagnostic-data helper.
- `src/i18n/` — English catalog, static translation application, preset localization, and strength localization.
- `src/styles.css` — responsive themes/layout/focus/dialog/warning/reduced-motion styling.

## Startup

`init()` performs:

1. apply static translations to markup;
2. apply stored/system theme;
3. restore clipboard-clear preference;
4. bind events;
5. request Rust-defined presets;
6. show onboarding if the non-secret completion flag is absent.

Required DOM nodes are resolved through `byId<T>()`. Missing required markup fails fast rather than silently disabling a control.

## Transient state

`src/main.ts` keeps:

- `mode` — password/passphrase/batch;
- `currentSecret` — current single value;
- `batch` — current batch result objects;
- `presets` — Rust-returned preset definitions;
- `generationRevision` — monotonically increasing async-staleness guard.

Generated values are not sent to `localStorage`.

## Stale async result protection

Every generation captures both a revision and requested mode. `generationIsCurrent()` requires both to still match before a resolved command may render.

Changing mode increments `generationRevision`, clears busy state, changes panels/tabs, and resets output. Therefore a late password/passphrase/batch result cannot overwrite a newer mode.

Native batch export also captures the revision and requires Batch mode to still be active before restoring status/button state after the save dialog resolves.

Copy status is similarly revision-aware so an old copy completion does not overwrite status after newer generation state.

## Tauri API boundary

`src/api.ts` imports `invoke` and `isTauri` from `@tauri-apps/api/core`. `withGlobalTauri` is disabled in native configuration.

The wrapper exposes exactly:

```text
generatePassword   → generate_password_command
generatePassphrase → generate_passphrase_command
generateBatch      → generate_batch_command
presets            → get_presets_command
copySecret         → copy_secret_command
clearClipboard     → clear_clipboard_command
exportBatch        → export_batch_command
```

Outside Tauri, commands reject with a clear bridge-unavailable error. There is no browser-side generation fallback.

## Type contract

Rust Serde camelCase structures are mirrored in `src/types.ts`. Core policy structs also deny unknown fields, strengthening the boundary against accidental shape drift.

Batch IPC returns only `{ secret }` items. Single password/passphrase results return strength data; passphrases additionally return estimated selection-space entropy.

## Password input handling

`passwordOptions()` collects UI controls. Custom symbols use `customSymbolsFromInput()`:

- exactly empty string becomes `null`, selecting the Rust built-in symbol source;
- any non-empty string is preserved exactly;
- Rust is authoritative for the maximum-40 ASCII-punctuation validation and ambiguity filtering.

The frontend deliberately does not trim custom-symbol input because whitespace/non-punctuation should be rejected by Rust rather than silently changed into a different policy.

## Generation flow

`generate()`:

1. increments revision and records current mode;
2. marks Generate busy;
3. invokes the correct typed command;
4. checks staleness before rendering;
5. renders a single secret/strength, passphrase entropy, or batch list;
6. reports safe command errors;
7. clears busy state only if the same revision remains current.

For batch output, frontend display prefixes entries with numbers for readability, while the underlying `batch` array retains raw generated values for copy/export.

## Batch export construction

`buildBatchExport()` is pure/testable and creates:

```text
# KeySmith batch export
# Created: <ISO timestamp>
# WARNING: <localized warning>

<secret 1>
<secret 2>
...

```

The frontend does not choose/write a path. It sends the content to the dedicated native command, which validates the bounded text and opens the OS save dialog.

Cancellation is a normal result (`false`), distinct from a save failure.

## External links

`src/external-links.ts` defines an exact `Set` of five approved destinations. `openTrustedExternalUrl()` rejects anything outside that set before calling the Tauri opener plugin.

`index.html` exposes destinations through `data-external-url` button metadata rather than normal automatic navigation. `main.ts` only invokes the opener after a user click.

Tests verify frontend allowlist, markup destinations, and native capability scope do not drift apart.

## Local persistence boundary

`src/storage.ts` intentionally stores only:

- `keysmith.clipboardClearSeconds` — allowlisted values 0/15/30/60/120, default 30;
- `keysmith.theme` — system/light/dark;
- `keysmith.onboardingComplete` — completion boolean.

Storage access is defensive; unavailable/corrupt storage falls back safely.

Do not persist passwords, passphrases, batches, strength/entropy, clipboard text, export destinations, external-link history, or diagnostic objects containing sensitive data.

## Theme model

`ThemePreference` is `system | light | dark`.

- System resolves through `prefers-color-scheme`.
- A media-query change is applied only while stored preference is System.
- The top button cycles System → Light → Dark → System.
- Settings provides an explicit select.
- Theme title text comes from localized formatting helpers.

## Localization boundary

`applyTranslations()` processes markup attributes for text, title, ARIA label, and placeholder values.

Runtime strings come from `src/i18n/en.ts`. Preset IDs/options remain Rust-owned while `localizedPresetCopy()` maps IDs to localized name/description. Strength presentation maps the numeric score through `localizedStrengthLabel()` with a safe fallback.

See [`i18n.md`](i18n.md) and ADR 0003.

## Safe logging helper

`redactForLog()` recursively sanitizes structured diagnostic objects:

- sensitive key names are replaced with `[REDACTED]`;
- nesting deeper than four levels becomes `[TRUNCATED]`;
- unsupported values become a type marker rather than being serialized arbitrarily.

The helper is not permission to log generated secrets under harmless-looking keys; logging guidance in [`logging.md`](logging.md) remains authoritative.

## Accessibility behavior

The UI includes semantic grouping/labels, keyboard tabs, a skip link, live regions, native dialogs, visible focus, responsive controls, reduced motion, and text-based status meaning.

Static/real-markup tests cover IDs, labels, tab/panel state, dialog naming, button accessible names, keyboard behavior, contrast design tokens, and major integration flows. Packaged manual verification is still required.

## Test inventory

Frontend tests include:

- `storage.test.ts` — preference boundary/default/fallback;
- `api.test.ts` — command mapping/bridge behavior;
- `app.integration.test.ts` — real-markup generation/mode/clipboard/export flows including stale-result behavior;
- `accessibility.test.ts` — static accessibility structure;
- `contrast.test.ts` — primary-button contrast regression;
- `export.test.ts` — deterministic export text;
- `external-links.test.ts` and `external-links.integration.test.ts` — allowlist/config/markup behavior;
- `logging.test.ts` — redaction/depth behavior;
- `policy-input.test.ts` — custom-symbol input preservation;
- `tauri-security-config.test.ts` — static native security configuration;
- `version-consistency.test.ts` — version synchronization;
- `src/i18n/*.test.ts` — catalog/markup/preset/strength localization behavior.

## Frontend quality commands

```bash
npm run typecheck
npm run lint
npm run format:check
npm run secret:check
npm test
npm run build
```

CI also performs high-severity npm audit and documentation-inventory completeness checks.
