# Architecture

KeySmith is a modular desktop monolith with three layers.

## Core domain — `crates/keysmith-core`

Owns password policies, CSPRNG sampling, passphrase selection, presets, errors, and zxcvbn strength estimation. It has no UI or Tauri dependency. The randomness helper uses the OS-backed `getrandom` crate and rejection sampling before selection/shuffling. Security-sensitive input validation is repeated in the core rather than trusting webview constraints. Candidate character sets are deduplicated before random selection so repeated custom symbols do not receive extra probability weight.

## Desktop adapter — `src-tauri`

The desktop adapter exposes only the commands needed by the UI and separates them into explicit capabilities:

- `keysmith-generation` — password/passphrase/batch generation and preset lookup,
- `keysmith-clipboard` — explicit copy and manual clear,
- `keysmith-export` — bounded native plaintext batch export.

`core:default` is not granted. Only `main-capability` is explicitly enabled, `withGlobalTauri` is disabled, and Tauri is configured to remove unused commands from production builds.

Single-password and passphrase commands add zxcvbn strength metadata because those views display it. The batch command intentionally returns lightweight secret-only records and skips per-item zxcvbn work because the Batch view does not consume strength metadata.

Clipboard payloads and auto-clear durations are validated at the Rust IPC boundary. A single reschedulable worker owns pending clipboard clearing: a newer copy replaces the old schedule, `Never` cancels it, and timeout clearing happens only if the clipboard still equals the expected copied value.

Batch export lives in `src-tauri/src/export.rs`. The frontend does not receive a generic filesystem-write API. The command validates the export header, control-character shape, trailing newline, and an explicit size bound, wraps the command-owned plaintext in a zeroizing guard, opens the native save dialog, and writes only to the destination selected by the user.

The official opener plugin is scoped to the exact project/funding/support/business destinations shown in About. The frontend applies a matching allowlist before invoking it.

## Presentation — `src` + `index.html`

Vanilla TypeScript renders the generator, passphrase, batch, settings, and About experiences. It stores only non-secret preferences locally. Generated secrets remain in ephemeral UI state.

The bundled frontend imports `invoke` from `@tauri-apps/api/core`; no global `window.__TAURI__` object is exposed. Async generation and export results are revision-checked before mutating the active mode so a response from an older interaction cannot overwrite a newer UI state.

User-facing copy is separated from application behavior under `src/i18n`. Static markup keeps readable English fallbacks and localization keys; runtime status, preset, strength, export, clipboard, and external-link copy use catalog-backed helpers. English is the only shipped locale in `0.1.0`, while future locale selection remains separate from the security-sensitive Rust domain.

## Data flows

Generation:

`UI input → bundled typed IPC client → Rust/core validation → OS CSPRNG / word list → result → UI`

Clipboard:

`UI explicit copy → bounded Rust command → system clipboard → single replaceable clear schedule → conditional clear`

Batch export:

`ephemeral batch state → deterministic warning-bearing text → bounded Rust export command → native save dialog → user-selected local file`

External links:

`About link → frontend exact allowlist → scoped opener permission → operating-system browser/mail handler`

There is no application server, database, authentication service, telemetry endpoint, generated-secret history, or generic frontend filesystem permission.

For display-only metadata, stable backend values such as preset IDs and strength scores are mapped to localized frontend copy. Unknown future values retain backend fallbacks rather than failing generation. Batch IPC deliberately omits unused strength metadata to keep the maximum-size path bounded and efficient.

## Error handling

Core errors are typed with `thiserror`. Desktop commands translate failures into user-safe strings that do not include generated secret values or chosen filesystem paths. The UI presents errors through an `aria-live` status region.

## Related decisions

- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`
- `docs/adr/0003-frontend-localization-boundary.md`
- `docs/adr/0004-native-desktop-boundaries.md`
- `docs/i18n.md`
