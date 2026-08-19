# Frontend Reference

KeySmith's presentation layer is a small Vanilla TypeScript/Vite application. It deliberately avoids a large UI framework so the secret-handling flow remains easy to audit.

## Files

- `index.html` — complete semantic UI structure and dialog markup.
- `src/main.ts` — application state, DOM bindings, event handlers, rendering, theme logic, generation flow, clipboard actions, export, and initialization.
- `src/api.ts` — typed wrapper around the Tauri global IPC bridge.
- `src/types.ts` — TypeScript representation of Rust command inputs/outputs.
- `src/storage.ts` — safe local-storage access for non-secret preferences only.
- `src/storage.test.ts` — preference persistence tests.
- `src/styles.css` — responsive design tokens, layout, states, dialogs, focus, and reduced-motion rules.
- `src/i18n/en.ts` — initial English status strings.
- `src/tauri.d.ts` — declaration for the Tauri global object enabled by desktop configuration.
- `src/assets/logo.svg` — editable vector application mark.

## Startup sequence

`src/main.ts` ends with `void init()`.

`init()` performs this sequence:

1. read and apply the stored theme preference;
2. read and apply the stored clipboard-clear duration;
3. bind DOM events;
4. request Rust-defined presets through Tauri;
5. show onboarding when its completion flag is absent.

The application expects the required DOM elements to exist. The helper `byId<T>()` throws immediately if a required ID is missing, turning markup/code drift into an obvious development failure rather than silently disabling a security-related control.

## In-memory state

The frontend keeps only a few module-level values:

```text
mode          current generator mode
currentSecret currently rendered single password/passphrase
batch         current batch results
presets       Rust-defined preset list
```

`currentSecret` and `batch` are runtime-only variables. They are never passed to `localStorage` by application code.

Switching generator mode calls `resetOutput()`, which clears `currentSecret` and `batch`, resets controls, and replaces the visible output with the idle message.

## DOM contract

The UI object in `src/main.ts` binds all required IDs from `index.html`. Important groups are:

### Output and action IDs

- `secret-output`
- `status`
- `strength-label`
- `strength-score`
- `generate-button`
- `copy-button`
- `copy-batch-button`
- `export-batch-button`
- `clear-clipboard-button`

### Password option IDs

- `length` / `length-value`
- `lowercase`
- `uppercase`
- `digits`
- `symbols`
- `ambiguous`
- `custom-symbols`
- `preset` / `preset-description`

### Passphrase option IDs

- `words` / `words-value`
- `separator`
- `capitalize`
- `include-number`

### Batch and privacy IDs

- `batch-count`
- `clipboard-time`
- `settings-clear-clipboard`

### Dialog/settings IDs

- `theme-button`
- `settings-theme`
- `settings-button`
- `settings-dialog`
- `about-button`
- `about-dialog`
- `onboarding-dialog`
- `finish-onboarding-button`
- `show-onboarding-button`

When an ID changes in HTML, update `src/main.ts` in the same commit.

## Rust/TypeScript type contract

`src/types.ts` mirrors the Serde camelCase representation of the Rust structs. Changes to a Rust input or response type must be reflected here.

Important pairs:

| Rust | TypeScript |
| --- | --- |
| `PasswordOptions` | `PasswordOptions` |
| `PassphraseOptions` | `PassphraseOptions` |
| `StrengthEstimate` | `StrengthEstimate` |
| `PasswordPreset` | `PasswordPreset` |
| `SecretResult` in desktop adapter | `SecretResult` |
| `PassphraseResult` in desktop adapter | `PassphraseResult` |

There is no generated binding layer in 0.1.0, so synchronization is maintained through review, TypeScript compile checks, Rust compile checks, and integration testing.

## Tauri API wrapper

`src/api.ts` centralizes command names. UI code does not call `window.__TAURI__.core.invoke` directly.

If the global bridge is unavailable, the wrapper rejects with a clear error explaining that the app must run through Tauri. This prevents a browser-only preview from pretending that local secure generation succeeded.

Command mappings are:

```text
generatePassword   -> generate_password_command
generatePassphrase -> generate_passphrase_command
generateBatch      -> generate_batch_command
presets            -> get_presets_command
copySecret         -> copy_secret_command
clearClipboard     -> clear_clipboard_command
```

Any command rename must be coordinated with Rust registration, custom permissions, capabilities, API wrapper, documentation, and tests.

## Password options collection

`passwordOptions()` reads visible controls and converts them to the exact TypeScript/Rust shape. Custom symbols are trimmed; an empty value becomes `null` so Rust uses its built-in set.

The frontend does not assume that HTML limits are sufficient. Rust validates the received options.

## Passphrase options collection

`passphraseOptions()` reads word count, separator, capitalization, and numeric-suffix choices. Rust enforces word and separator limits.

## Generation flow

`generate()`:

1. disables the Generate button and shows a generating state;
2. clears the previous status;
3. selects the command based on the current mode;
4. renders a single secret or a newline-formatted batch;
5. updates strength/status information;
6. catches command failures and writes a user-visible error status;
7. restores the Generate button in `finally`.

For passphrases, the returned selection-space entropy is displayed in the status region.

For batches, individual strength values remain available in memory but the output summary reports the number generated rather than rendering hundreds of strength indicators.

## Clipboard flow

`copyText()` never uses the browser clipboard API. It calls the privileged Rust `copy_secret_command` with the currently selected clear duration.

A successful command produces the translated `Copied.` status. A failure is visible to the user.

`clearClipboard()` similarly uses the Rust command and reports success/failure in the status region.

## Batch export flow

`exportBatch()` is intentionally frontend-only and requires a non-empty current batch. It creates text containing:

- a fixed export title;
- an ISO creation timestamp;
- a plaintext credential warning;
- one password per line.

A temporary `Blob` URL is created, attached to a temporary anchor, clicked, and immediately revoked.

The export path is user-selected/handled by the webview/OS download behavior. KeySmith does not keep a file-history index.

## Theme model

`ThemePreference` is one of `system`, `light`, or `dark`.

- `resolvedTheme()` maps `system` to the current `prefers-color-scheme` media query.
- `applyTheme()` writes resolved and preference values to `document.documentElement.dataset`.
- `saveAndApplyTheme()` persists the non-secret preference and applies it.
- `cycleTheme()` rotates System → Light → Dark → System.
- a media-query change listener reapplies the system theme only when the stored preference remains `system`.

## Local storage boundary

`src/storage.ts` is the only application module that intentionally touches `localStorage`.

### Keys

| Key | Allowed values | Default |
| --- | --- | --- |
| `keysmith.clipboardClearSeconds` | `0`, `15`, `30`, `60`, `120` | `30` |
| `keysmith.theme` | `system`, `light`, `dark` | `system` |
| `keysmith.onboardingComplete` | `true` or absent | absent/false |

Reads and writes are wrapped in `try/catch` because storage can be unavailable in hardened or unusual webview contexts. Failure to persist settings is non-fatal.

Do not add generated secrets, password history, passphrases, batch output, clipboard content, entropy results, or strength results to local storage.

## Preset flow

Presets are fetched from Rust at startup. Each becomes an option in the preset select control. Applying a preset updates all password controls and its description.

The source of truth is Rust, not hard-coded TypeScript. This avoids policy drift between the secure core and the UI.

## Tabs and keyboard behavior

Elements with `data-mode` act as tabs. `switchMode()` synchronizes:

- internal mode state;
- `aria-selected`;
- roving `tabIndex`;
- visible control panel;
- output reset.

Left/Right Arrow cycles through Password, Passphrase, and Batch and moves focus to the newly selected tab.

## Dialog behavior

Onboarding, Settings, and About use native `<dialog>` elements.

- Onboarding uses a `method="dialog"` form; the Start button both submits/closes the dialog and records completion through its click handler.
- Settings and About include dialog close controls using form dialog semantics.
- Reopening onboarding first closes Settings, then opens the onboarding modal.

## Accessibility contract

The HTML and CSS implement:

- a skip link to the generator;
- semantic headings and landmarks;
- fieldsets and legends for option groups;
- associated labels;
- accessible tab roles/state;
- `aria-live` status/output regions;
- keyboard tab switching;
- visible focus indicators;
- non-color status text;
- reduced-motion handling;
- responsive/touch-friendly controls.

See [`accessibility.md`](accessibility.md) for manual checks.

## Styling architecture

`src/styles.css` contains the entire styling surface. It defines theme variables, shared card/button/input patterns, generator layout, output states, dialogs, responsive breakpoints, focus states, and reduced-motion handling.

Because there is no runtime CSS-in-JS layer, styling can be audited statically alongside `index.html`.

## Internationalization seed

`src/i18n/en.ts` currently centralizes a small set of repeated status strings. It is not yet a full locale-switching subsystem. When broader localization is introduced, avoid placing command names, validation policy, or security logic in translation files.

## Frontend tests

`src/storage.test.ts` uses Vitest with jsdom and currently verifies:

- the 30-second clipboard-clear default;
- supported clipboard duration round-trip;
- fallback from unsupported stored duration;
- theme round-trip;
- onboarding completion persistence without extra data.

Future frontend behavior with pure/testable logic should be extracted from `main.ts` rather than requiring fragile end-to-end DOM mocks.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

A successful Vite build is not sufficient by itself: packaged Tauri smoke tests remain required for clipboard, dialogs, external links, platform theming, and native behavior.
