# Repository Reference

This document is the codebase map for KeySmith. It describes every tracked source, configuration, automation, policy, documentation, lockfile, and application asset path currently maintained by the project. Generated build output and dependency caches are intentionally excluded from version control.

## Top-level project files

| Path | Purpose |
| --- | --- |
| `.editorconfig` | Cross-editor whitespace, indentation, charset, and newline defaults. |
| `.env.example` | Safe example environment file; KeySmith does not require secrets for normal local generation. |
| `.gitattributes` | Git text/binary handling and line-ending policy. |
| `.gitignore` | Excludes build output, dependency folders, local environment files, OS/editor noise, and generated artifacts that should not be committed. |
| `Cargo.toml` | Rust workspace root. Defines `keysmith-core` and the Tauri application, Rust 2024 edition, package metadata, and workspace lint policy. |
| `Cargo.lock` | Tracked Cargo dependency lockfile used by locked CI and release builds. |
| `package.json` | Frontend/Tauri CLI scripts and JavaScript development dependencies. |
| `package-lock.json` | Tracked npm dependency lockfile consumed by `npm ci` in CI, setup, and release workflows. |
| `tsconfig.json` | TypeScript compiler configuration. |
| `vite.config.ts` | Vite development/build configuration. |
| `eslint.config.js` | ESLint configuration for TypeScript and project scripts. |
| `rustfmt.toml` | Rust formatting policy. |
| `deny.toml` | `cargo-deny` advisory, license, source, and dependency policy. |
| `index.html` | Desktop webview document, generator controls, settings, onboarding, privacy messaging, About dialog, and accessibility structure. |
| `README.md` | Main project overview, features, setup, development, architecture, security, support, and licensing entry point. |
| `CHANGELOG.md` | User-visible notable changes and release history. |
| `ROADMAP.md` | Planned project milestones and post-release direction. |
| `what_changed.md` | Canonical engineering handoff and verification ledger for continuation work. |
| `LICENSE` | Apache License 2.0 text. |
| `NOTICE` | Project notice and attribution information. |
| `CODE_OF_CONDUCT.md` | Community participation standards. |
| `CONTRIBUTING.md` | Contribution workflow and quality expectations. |
| `SECURITY.md` | Vulnerability reporting and security maintenance policy. |
| `PRIVACY.md` | Product privacy behavior and locally stored non-secret data. |
| `SUPPORT.md` | User support channels and troubleshooting direction. |
| `THREAT_MODEL.md` | Security boundaries, protected assets, threats, mitigations, and accepted limitations. |

Both dependency lockfiles are source-of-truth release reproducibility artifacts. Dependency-manifest changes must update and commit the corresponding lockfile in the same pull request.

## `.github/` automation and community configuration

| Path | Purpose |
| --- | --- |
| `.github/FUNDING.yml` | GitHub funding configuration. |
| `.github/RELEASE_TEMPLATE.md` | Human release-note/checklist template. |
| `.github/dependabot.yml` | Automated dependency update configuration. |
| `.github/pull_request_template.md` | Pull-request quality/security checklist. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Structured bug report form. |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Structured feature request form. |
| `.github/ISSUE_TEMPLATE/config.yml` | Issue-template chooser/contact configuration. |
| `.github/workflows/ci.yml` | Authoritative frontend, Rust-core, desktop-adapter, cross-platform Tauri, formatting, test, lockfile, and dependency-policy checks. |
| `.github/workflows/codeql.yml` | Scheduled and PR/push CodeQL analysis for JavaScript/TypeScript and Rust. |
| `.github/workflows/release.yml` | Tag-triggered native Tauri release build and draft GitHub Release creation using tracked lockfiles. |

The former duplicate `.github/workflows/rust.yml` workflow was removed during final verification because the maintained `ci.yml` workflow already covers Rust and installs the system dependencies required by Tauri. A temporary branch-only workflow used to generate the first verified lockfiles was removed immediately after committing them and is not part of the permanent automation surface.

## `crates/keysmith-core/` security-sensitive Rust core

| Path | Purpose |
| --- | --- |
| `crates/keysmith-core/Cargo.toml` | Core package metadata and dependencies: EFF word list, OS randomness, serialization, errors, strength estimation, and property testing. |
| `crates/keysmith-core/src/lib.rs` | Public core API surface and module exports. |
| `crates/keysmith-core/src/error.rs` | Typed validation/randomness error model with user-safe messages. |
| `crates/keysmith-core/src/random.rs` | OS CSPRNG access, unbiased rejection-sampling index generation, and secure Fisher-Yates shuffle. |
| `crates/keysmith-core/src/generator.rs` | Password character sets, ambiguous filtering, policy validation, required-class guarantees, password generation, and batch generation. |
| `crates/keysmith-core/src/passphrase.rs` | EFF large-list passphrase generation, separator validation, capitalization, numeric suffix, and selection-entropy estimate. |
| `crates/keysmith-core/src/policy.rs` | Serializable password and passphrase option models used across the Rust/Tauri boundary. |
| `crates/keysmith-core/src/presets.rs` | Built-in password policy presets and descriptions. |
| `crates/keysmith-core/src/strength.rs` | zxcvbn strength estimation adapter and stable UI-facing result shape. |
| `crates/keysmith-core/tests/security.rs` | Security regression coverage for policy guarantees and invalid-input behavior. |
| `crates/keysmith-core/tests/properties.rs` | Property-based tests across generated lengths and restricted character-set combinations. |

### Core invariants

- Password length: 4–128 characters.
- Batch size: 1–500 passwords.
- Passphrase word count: 3–12 words.
- Passphrase separator: at most three non-control characters.
- Enabled password character classes are represented when the requested length permits them.
- Disabled classes are not introduced by the generator.
- Random indices use rejection sampling rather than biased modulo selection.
- The core has no UI, storage, telemetry, account, or network-service dependency.

## `src-tauri/` desktop adapter and native configuration

| Path | Purpose |
| --- | --- |
| `src-tauri/Cargo.toml` | Tauri application package and native dependencies (`tauri`, `arboard`, `zeroize`, and local `keysmith-core`). |
| `src-tauri/build.rs` | Tauri build-script entry point. |
| `src-tauri/tauri.conf.json` | Application identity, window/build/bundle settings, CSP, and packaged icon configuration. |
| `src-tauri/src/main.rs` | Native executable entry point. |
| `src-tauri/src/lib.rs` | Tauri application builder and command registration. |
| `src-tauri/src/commands.rs` | Narrow IPC adapter for generation, presets, clipboard copy/conditional clear, and explicit clipboard clearing. Contains desktop-adapter unit tests. |
| `src-tauri/capabilities/default.json` | Window capability assignment and least-privilege permission selection. |
| `src-tauri/permissions/keysmith.toml` | Explicit permission declarations for KeySmith commands. |
| `src-tauri/icons/32x32.png` | Small PNG application icon. |
| `src-tauri/icons/128x128.png` | Standard PNG application icon. |
| `src-tauri/icons/128x128@2x.png` | High-density PNG application icon. |
| `src-tauri/icons/icon.ico` | Windows icon bundle. |
| `src-tauri/icons/icon.icns` | macOS icon bundle. |

### IPC command surface

The frontend can invoke only the registered KeySmith commands:

- `generate_password_command`
- `generate_passphrase_command`
- `generate_batch_command`
- `get_presets_command`
- `copy_secret_command`
- `clear_clipboard_command`

Clipboard auto-clear accepts only `0`, `15`, `30`, `60`, or `120` seconds. Copy payloads are bounded while still supporting the maximum valid 500 × 128-character batch plus separators. The Rust command buffer is zeroized after clipboard handling, including error paths. The OS clipboard itself is outside KeySmith's memory-zeroization guarantee.

## `src/` frontend

| Path | Purpose |
| --- | --- |
| `src/main.ts` | Application state, mode switching, generation actions, presets, strength rendering, batch copy/export, theme handling, dialogs, onboarding, and event binding. |
| `src/api.ts` | Typed wrapper around the narrow Tauri `invoke` command surface. |
| `src/types.ts` | Shared frontend option/result/preset/theme/mode TypeScript types. |
| `src/storage.ts` | Fault-tolerant local persistence for non-secret preferences only. |
| `src/storage.test.ts` | Vitest/jsdom regression tests for local non-secret preference behavior. |
| `src/styles.css` | Responsive layout, themes, dialogs, controls, visible focus, reduced-motion behavior, and accessibility-oriented styling. |
| `src/tauri.d.ts` | Minimal TypeScript declaration for the injected Tauri bridge used by the frontend. |
| `src/i18n/en.ts` | Central English UI/status strings currently extracted for reuse/future localization. |
| `src/assets/logo.svg` | Source vector logo used by the webview and README. |

### Local storage contract

Only these non-secret values are intentionally persisted:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Generated passwords, passphrases, batches, strength inputs, custom symbols, and clipboard contents are not written to application local storage.

## `scripts/`

| Path | Purpose |
| --- | --- |
| `scripts/check-format.mjs` | Repository formatting verification used by `npm run format:check` and CI. |

## `docs/`

| Path | Purpose |
| --- | --- |
| `docs/setup.md` | Platform prerequisites, tracked-lockfile installation, and initial setup. |
| `docs/development.md` | Development commands, locked dependency workflow, architecture boundaries, and contributor expectations. |
| `docs/testing.md` | Automated/static/manual testing strategy, reproducible setup, and security regression rule. |
| `docs/verification.md` | Release-candidate automated, reproducibility, security, packaged-app smoke-test, and evidence gates. |
| `docs/release.md` | Release sequencing, native builds, signing/notarization boundaries, and publication process. |
| `docs/architecture.md` | Layer responsibilities and data flow. |
| `docs/accessibility.md` | Keyboard, focus, semantics, motion, text, and accessibility requirements. |
| `docs/performance.md` | Performance characteristics and regression expectations. |
| `docs/troubleshooting.md` | Common setup/build/runtime troubleshooting. |
| `docs/github.md` | Repository administration, automation, and GitHub maintenance guidance. |
| `docs/wordlists.md` | EFF word-list source/usage and passphrase rationale. |
| `docs/adr/0001-rust-core-tauri-ui.md` | Architecture decision: security-sensitive Rust core with Tauri/TypeScript UI. |
| `docs/adr/0002-os-csprng-and-no-secret-storage.md` | Architecture decision: OS CSPRNG and no generated-secret persistence. |

## Data flow

1. The user configures password/passphrase options in `index.html` controls managed by `src/main.ts`.
2. `src/api.ts` invokes one of the explicitly registered Tauri commands.
3. `src-tauri/src/commands.rs` passes validated option structures into `keysmith-core`.
4. `keysmith-core` obtains randomness from the operating system and returns the generated value and/or strength metadata.
5. The frontend renders the result in memory. It does not add the generated value to history or local storage.
6. Clipboard use occurs only after an explicit copy action. Batch export occurs only after an explicit export action and produces plaintext with a warning.

## Build and generated directories

The following categories are generated locally/CI and must not be treated as source-of-truth project files:

- `node_modules/`
- `dist/`
- Rust `target/`
- Tauri bundle output
- temporary coverage/cache/log files
- local `.env` files
- OS/editor metadata

For the authoritative quality gates, see `docs/verification.md`; for the current verified/unverified release state, see `what_changed.md`.
