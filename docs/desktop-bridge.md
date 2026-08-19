# Tauri Desktop Bridge Reference

`src-tauri` is the narrow adapter between the browser-style TypeScript UI and the framework-independent Rust generation core. It owns desktop-only responsibilities such as clipboard access, Tauri IPC registration, capabilities, CSP, and native bundling.

## Package layout

- `Cargo.toml` — desktop crate metadata and dependencies.
- `build.rs` — delegates build-time configuration generation to `tauri_build::build()`.
- `src/main.rs` — native executable entry point.
- `src/lib.rs` — Tauri application bootstrap and command registration.
- `src/commands.rs` — all application commands exposed to the frontend.
- `tauri.conf.json` — window, CSP, build, identifier, version, and bundle configuration.
- `capabilities/default.json` — associates the main window with a least-privilege permission set.
- `permissions/keysmith.toml` — groups commands into generation and clipboard permissions.
- `icons/` — native application icons consumed by the Tauri bundler.

## Trust boundary

The frontend is treated as an unprivileged presentation layer. It may request supported operations, but Rust validates all security-relevant generation constraints.

The bridge intentionally exposes only six commands:

| Command | Input | Output | Side effects |
| --- | --- | --- | --- |
| `generate_password_command` | `PasswordOptions` | `SecretResult` | none outside process memory |
| `generate_batch_command` | `PasswordOptions`, count | list of `SecretResult` | none outside process memory |
| `generate_passphrase_command` | `PassphraseOptions` | `PassphraseResult` | none outside process memory |
| `get_presets_command` | none | password presets | none |
| `copy_secret_command` | secret, clear delay | success/error | writes system clipboard; may later clear it |
| `clear_clipboard_command` | none | success/error | writes an empty system clipboard value |

There are no filesystem, shell, arbitrary process, arbitrary network, or generic command-execution commands.

## Generation result shapes

### `SecretResult`

```text
secret: String
strength: StrengthEstimate
```

### `PassphraseResult`

```text
secret: String
strength: StrengthEstimate
estimatedEntropyBits: f64
```

Serde's camelCase field naming keeps Rust response names aligned with TypeScript interfaces.

## Command behavior

### Password command

1. accepts frontend options;
2. calls `keysmith_core::generate_password`;
3. converts a typed core error to a user-safe string;
4. computes zxcvbn strength for the generated value;
5. returns the secret and strength.

### Batch command

1. validates/generates through `keysmith_core::generate_batch`;
2. computes strength independently for each generated password;
3. returns a list to the frontend.

No export file is written by Rust. This keeps the potentially dangerous plaintext-export behavior explicit in the UI layer.

### Passphrase command

The adapter calculates selection-space entropy from the supplied options, generates the passphrase using the same options, then returns both the zxcvbn estimate and the selection-space estimate.

### Preset command

Returns the core-defined preset list. Presets are treated as output-only static policy definitions.

## Clipboard lifecycle

Clipboard behavior is intentionally isolated in `src/commands.rs` through `arboard`.

### Copy size guard

`copy_secret_command` rejects values above 4096 characters. This protects the command from accidental or malicious oversized frontend inputs even though normal single and batch UI values are much smaller.

### Immediate copy

The command creates an `arboard::Clipboard`, clones the value for the platform API, writes it, and then zeroizes its local mutable `secret` buffer before returning.

Rust `String` zeroization is a best-effort memory hygiene technique, not a guarantee that no copy exists elsewhere. Copies may exist in the frontend, Tauri serialization buffers, allocator history, the clipboard provider, operating-system clipboard managers, or other processes.

### Delayed conditional clear

When `clear_after_seconds > 0`:

1. a temporary expected-value buffer is moved into a background thread;
2. the thread waits for `min(clear_after_seconds, 300)` seconds;
3. it reads the current clipboard;
4. it clears the clipboard only when the current text exactly equals the original copied value;
5. it zeroizes the expected-value buffer before the thread exits.

This comparison avoids destroying unrelated content that the user copied after KeySmith.

### Clear now

`clear_clipboard_command` replaces clipboard text with an empty string. It does not and cannot erase copies retained by clipboard-history services or other applications.

## Tauri application bootstrap

`src/lib.rs` creates a default `tauri::Builder`, registers the six commands with `tauri::generate_handler!`, loads generated configuration, and runs the application.

`src/main.rs` calls the library `run()` function and suppresses a console window on non-debug Windows builds through `windows_subsystem = "windows"`.

## Capability model

`capabilities/default.json` applies to the `main` window and grants:

- `core:default`
- `keysmith-generation`
- `keysmith-clipboard`

`permissions/keysmith.toml` maps those two custom permissions to explicit command allowlists.

When a new Tauri command is introduced, it must not become callable merely by being registered. Review and update the permission mapping, threat model, frontend API wrapper, tests, and this document.

## Content Security Policy

`tauri.conf.json` defines a restrictive CSP with local application content as the default source. IPC and Tauri asset protocols are explicitly admitted where required. Scripts remain restricted to `self`. Inline styles are currently allowed because the application and Tauri/WebView behavior require the existing styling arrangement.

`freezePrototype` is enabled to reduce prototype-tampering risk in the webview environment.

CSP changes are security-sensitive and should be justified in the pull request and mirrored in `THREAT_MODEL.md` if they change a trust boundary.

## Window configuration

The main window:

- label: `main`
- title: `KeySmith`
- initial size: 1120 × 760
- minimum size: 760 × 620
- resizable: yes
- centered: yes

The capability file references the `main` label, so renaming the window requires a coordinated capability update.

## Build integration

Tauri expects:

- development frontend: `npm run dev` at `http://localhost:1420`;
- production frontend command: `npm run build`;
- production assets: `../dist`.

`vite.config.ts` uses the same fixed development port.

## Bundle metadata

The Tauri bundle config defines:

- product: KeySmith;
- application identifier: `in.sanskar.keysmith`;
- category: Utility;
- version: `0.1.0`;
- native targets: all supported Tauri targets;
- copyright: 2026 Sanskar;
- icon set: 32×32 PNG, 128×128 PNG, 256-density PNG, ICNS, and ICO assets.

Version changes must remain synchronized with root workspace/package metadata, frontend-visible version strings, changelog, and release documentation.

## Desktop dependencies

- `tauri` — desktop application framework.
- `tauri-build` — build-time Tauri integration.
- `keysmith-core` — generation and strength logic.
- `arboard` — cross-platform clipboard access.
- `serde` — command serialization.
- `zeroize` — best-effort clearing of mutable secret buffers.

## Verification

At minimum, desktop changes require:

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
npm run build
```

`cargo check -p keysmith --all-targets` must be exercised on Windows, macOS, and Linux because clipboard and webview dependencies are platform-specific. The main CI matrix performs that check. Packaged release artifacts still require manual smoke testing.

## Security review checklist for bridge changes

- Is the command necessary, or can the behavior remain in the core/frontend without new privilege?
- Are all inputs validated in Rust?
- Can an input contain a generated secret or sensitive path?
- Could errors or logs expose a secret?
- Does the permission file grant only the required command?
- Does the capability remain scoped to the intended window?
- Is CSP unchanged or minimally expanded?
- Are clipboard/filesystem/network side effects explicit to the user?
- Are temporary secret buffers minimized and zeroized where practical?
- Are `THREAT_MODEL.md`, `PRIVACY.md`, tests, and this reference updated?
