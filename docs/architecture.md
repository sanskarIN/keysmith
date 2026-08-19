# Architecture

KeySmith is a modular desktop monolith with three layers.

## Core domain — `crates/keysmith-core`

Owns password policies, CSPRNG sampling, passphrase selection, presets, errors, and zxcvbn strength estimation. It has no UI or Tauri dependency. The randomness helper uses the OS-backed `getrandom` crate and rejection sampling before selection/shuffling.

## Desktop adapter — `src-tauri`

Exposes only the commands needed by the UI: generation, presets, clipboard copy, and clipboard clear. Clipboard auto-clear checks that the clipboard still contains the copied value before clearing it. Tauri capabilities and CSP are intentionally narrow.

## Presentation — `src` + `index.html`

Vanilla TypeScript renders the generator, passphrase, batch, settings, and About experiences. It stores only non-secret preferences locally. Generated secrets remain in ephemeral UI state.

## Data flow

`UI input → typed IPC → Rust validation → OS CSPRNG / word list → result → UI`. There is no application server, database, authentication service, or telemetry endpoint.

## Error handling

Core errors are typed with `thiserror`. Tauri translates them into user-safe strings. The UI presents errors through an `aria-live` status region and does not include secret values in error text.
