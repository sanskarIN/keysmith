# Architecture

KeySmith is a modular desktop monolith with three layers.

## Core domain — `crates/keysmith-core`

Owns password policies, CSPRNG sampling, passphrase selection, presets, errors, and zxcvbn strength estimation. It has no UI or Tauri dependency. The randomness helper uses the OS-backed `getrandom` crate and rejection sampling before selection/shuffling. Security-sensitive input validation is repeated in the core rather than trusting webview constraints.

## Desktop adapter — `src-tauri`

Exposes only the commands needed by the UI: generation, presets, clipboard copy, and clipboard clear. Clipboard auto-clear checks that the clipboard still contains the copied value before clearing it. Clipboard payloads are bounded while still supporting the maximum documented batch size. Tauri capabilities and CSP are intentionally narrow.

## Presentation — `src` + `index.html`

Vanilla TypeScript renders the generator, passphrase, batch, settings, and About experiences. It stores only non-secret preferences locally. Generated secrets remain in ephemeral UI state.

User-facing copy is separated from application behavior under `src/i18n`. Static markup keeps readable English fallbacks and localization keys; runtime status, preset, and strength copy use catalog-backed helpers. English is the only shipped locale in `0.1.0`, while the architecture keeps future locale selection separate from the security-sensitive Rust domain.

## Data flow

`UI input → typed IPC → Rust validation → OS CSPRNG / word list → result → UI`. There is no application server, database, authentication service, or telemetry endpoint.

For display-only metadata, stable backend values such as preset IDs and strength scores are mapped to localized frontend copy. Unknown future values retain backend fallbacks rather than failing generation.

## Error handling

Core errors are typed with `thiserror`. Tauri translates them into user-safe strings. The UI presents errors through an `aria-live` status region and does not include secret values in error text.

## Related decisions

- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`
- `docs/adr/0003-frontend-localization-boundary.md`
- `docs/i18n.md`
