# Tauri Desktop Boundary Reference

`src-tauri` is the narrow native boundary between KeySmith's unprivileged TypeScript presentation layer and operating-system capabilities. It owns IPC registration, clipboard access, native batch save, exact external-opener permission scope, window/CSP configuration, and packaging.

## Native modules

- `src/main.rs` — native executable entry point.
- `src/lib.rs` — Tauri builder, plugin setup, and command registration.
- `src/commands.rs` — generation adapters plus bounded/replaceable clipboard behavior.
- `src/export.rs` — dedicated bounded plaintext batch-save command.
- `capabilities/default.json` — exact main-window capability and opener destinations.
- `permissions/keysmith.toml` — custom generation/clipboard/export command allowlists.
- `tauri.conf.json` — build/window/CSP/global-bridge/bundle settings.

## Command surface

Seven commands are registered:

| Command | Responsibility |
| --- | --- |
| `generate_password_command` | validate/generate password through `keysmith-core`, then score it |
| `generate_batch_command` | validate/generate 1–500 passwords and return only secret values |
| `generate_passphrase_command` | generate passphrase plus strength/selection entropy |
| `get_presets_command` | return Rust-owned preset policies |
| `copy_secret_command` | bounded native clipboard write plus optional schedule |
| `clear_clipboard_command` | cancel pending schedule and clear current clipboard |
| `export_batch_command` | validate bounded export text, show native save dialog, write chosen local file |

There is no arbitrary shell/process command, arbitrary filesystem command, generic open-URL command, or network-generation API.

## Generation adapters

Generation commands delegate policy/security decisions to `keysmith-core`. Errors are converted to display-safe strings and do not embed generated values.

`generate_batch_command` returns `BatchSecretResult { secret }` rather than calculating 500 unnecessary strength estimates. Single password/passphrase commands still return zxcvbn strength information.

## Clipboard boundary

### Input bound

`copy_secret_command` accepts at most 65,536 Unicode characters. This covers the maximum supported batch of 500 × 128-character passwords plus 499 newline separators while retaining a hard native IPC bound.

### Delay allowlist

The Rust command accepts exactly `0`, `15`, `30`, `60`, or `120` seconds. Unsupported direct IPC values are rejected. This keeps native behavior aligned with the documented UI instead of trusting arbitrary frontend delays.

### One replaceable worker

A process-wide `OnceLock<Sender<ClipboardClearRequest>>` lazily starts one worker thread. The worker maintains at most one pending clear request.

- copying with a nonzero delay schedules the new expected value/deadline;
- a newer schedule replaces the older pending request;
- copying with `Never` sends/carries a cancel operation;
- manual clear cancels a pending operation before clearing.

This avoids spawning an unbounded thread for every copy and prevents an older timer from clearing a later copy of the same value sooner than requested.

### Conditional clear

At deadline, the worker opens the OS clipboard, reads current text, and clears only when it still exactly matches the expected copied value. Newer unrelated clipboard data is preserved.

Expected values are held in `Zeroizing<String>` where practical. Clipboard/serialization/webview/OS copies may still exist; zeroization is best-effort memory hygiene rather than an absolute erasure guarantee.

## Native plaintext export

`src/export.rs` is intentionally separate from generic commands.

### Accepted content shape

Rust requires export text to:

- begin with `# KeySmith batch export\n`;
- end with a newline;
- contain at most 70,000 characters;
- contain no control characters other than newline.

The frontend produces the timestamp/warning/generated values, but Rust independently checks the bounded safe shape before any file operation.

### Save flow

1. frontend explicitly invokes `export_batch_command`;
2. Rust wraps content in `Zeroizing<String>`;
3. validation runs before opening a dialog;
4. Tauri dialog plugin opens the native save dialog with `.txt` filter/default name;
5. cancellation returns `Ok(false)` and writes nothing;
6. a selected destination must resolve to a local path;
7. Rust writes the validated plaintext bytes and returns `Ok(true)`.

The frontend never supplies a destination path and receives no arbitrary filesystem authority.

## External opener boundary

The Tauri opener plugin is enabled, but capability scope is exact. `opener:allow-open-url` permits only:

- `https://github.com/sanskarIN`
- `https://buymeacoffee.com/sanskarIN`
- `mailto:supportramsandesh@gmail.com`
- `mailto:sanskarin@outlook.in`
- `mailto:sanskarin.business@gmail.com`

The frontend independently checks the same exact allowlist before calling `openUrl`. Drift is covered by integration/configuration tests.

Do not replace this with wildcard URL schemes or arbitrary user-controlled URLs without an architecture/security review.

## Capability model

The `main` window receives only:

- `keysmith-generation`
- `keysmith-clipboard`
- `keysmith-export`
- exact-scoped `opener:allow-open-url`

Notably, `core:default` is not granted. `tauri.conf.json` explicitly references `main-capability` and enables `removeUnusedCommands`.

## Global bridge

`withGlobalTauri` is `false`. Frontend code imports `@tauri-apps/api` modules rather than relying on a globally injected `window.__TAURI__` object. This reduces the exposed global webview surface and is protected by static configuration tests.

## Content Security Policy

Production CSP:

- default source restricted to local app/custom asset protocols;
- connection source restricted to Tauri IPC endpoints;
- images restricted to local/Tauri assets;
- styles/fonts/scripts restricted to local application content;
- no production `'unsafe-inline'` style allowance;
- scripts remain `self` only.

Development CSP additionally allows the localhost Vite websocket and inline development styling needed by the dev environment.

`freezePrototype` remains enabled.

Any CSP broadening is a native security-boundary change and requires threat-model/documentation review.

## Window/build configuration

Main window:

- label `main`;
- title `KeySmith`;
- initial 1120 × 760;
- minimum 760 × 620;
- centered and resizable.

Build integration:

- `npm run dev` / `http://localhost:1420` during development;
- `npm run build` before production packaging;
- production assets from `../dist`;
- unused Tauri commands removed where supported.

Bundle metadata identifies `in.sanskar.keysmith`, Utility category, all Tauri targets, and the native PNG/ICNS/ICO icon set.

## Plugins/dependencies

- `tauri` / `tauri-build` — desktop shell/build integration;
- `keysmith-core` — credential policy/generation/strength;
- `arboard` — clipboard access;
- `tauri-plugin-dialog` — explicit native save dialog;
- `tauri-plugin-opener` — exact-scoped OS URL/mail handler opening;
- `serde` — IPC result serialization;
- `zeroize` — best-effort native secret/export-buffer cleanup.

## Tests protecting the native boundary

Protection is distributed across:

- unit tests in `src-tauri/src/commands.rs` for clipboard bounds, supported delays, replacement, and cancellation;
- unit tests in `src-tauri/src/export.rs` for valid/invalid export shapes;
- `src/tauri-security-config.test.ts` for global bridge, capabilities, command stripping, permissions, and dangerous-default drift;
- `src/external-links*.test.ts` for frontend/markup/native allowlist synchronization;
- API/integration tests for command names and native behavior contracts;
- cross-platform Tauri `cargo check` and Clippy in CI;
- Rust CodeQL after a complete workspace build.

## Security-review checklist

Before adding/changing native behavior:

1. Can it remain pure Rust core or frontend-only without new privilege?
2. Are all frontend-controlled values bounded and validated in Rust?
3. Is the command registered explicitly?
4. Does it have the narrowest custom permission?
5. Is capability scope limited to the intended window/destination?
6. Does `withGlobalTauri` remain false?
7. Does CSP remain restrictive?
8. Could the operation expose a secret/path/token in errors or logs?
9. Are mutable secret buffers minimized/zeroized where practical?
10. Are native/unit/integration/static-security/manual packaged tests updated?
11. Are `THREAT_MODEL.md`, `PRIVACY.md`, ADRs, and this document synchronized?
