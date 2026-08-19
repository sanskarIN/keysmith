# KeySmith

<p align="center">
  <img src="src/assets/logo.svg" alt="KeySmith logo" width="120" />
</p>

<p align="center"><strong>Private, offline password and passphrase generation powered by Rust and Tauri.</strong></p>

<p align="center">
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000"></a>
  <a href="LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
</p>

KeySmith is a desktop utility for Windows, macOS, and Linux. Passwords and passphrases are generated locally using the operating system's cryptographically secure random source. The app has no account system, telemetry, password history, cloud sync, or generation-time network requirement.

## Highlights

- OS-backed CSPRNG through Rust `getrandom`, with rejection sampling to avoid modulo bias.
- Password policies for length, lowercase, uppercase, digits, symbols, custom symbols, and ambiguous-character exclusion.
- Custom symbol candidates are validated in Rust and deduplicated so repeated characters do not receive extra probability weight.
- EFF large Diceware word-list passphrases through the `eff-wordlist` crate.
- zxcvbn-based strength estimates for single passwords/passphrases rather than home-grown password scoring.
- Batch generation up to 500 items with a lightweight secret-only response path that avoids unused per-item zxcvbn work.
- Explicit plaintext batch export through a bounded Rust command and native operating-system save dialog; the frontend has no generic filesystem-write permission.
- Clipboard auto-clear with a single replaceable/cancellable schedule that clears only if the clipboard still contains the copied secret.
- Exact allowlisting for user-initiated GitHub, funding, support, and business links through the operating-system opener.
- Light, dark, and system themes with keyboard-first accessibility.
- English-first, internationalization-ready frontend with externalized UI strings and tested fallback behavior.
- Offline-by-design architecture with restrictive CSP, module-only Tauri API usage, no global Tauri bridge, explicitly enabled least-privilege capabilities, and unused-command stripping.
- CI-enforced file-by-file documentation completeness in addition to security/privacy/threat/testing/release/localization/architecture documentation.

## Screenshots

Real release screenshots will be captured from verified packaged release candidates during the final release gate. Placeholder binary screenshots are intentionally not represented as real captures. Until verified screenshots exist, inspect `index.html` and `src/styles.css` for the source UI.

## Supported platforms

| Platform | Target | Status |
| --- | --- | --- |
| Windows | x86_64 / ARM64 where supported by Tauri | Primary |
| macOS | Intel / Apple Silicon | Primary |
| Linux | Common Tauri desktop targets | Primary |

Release candidates are checked and linted as a Tauri desktop crate on Linux, Windows, and macOS in CI. Packaged-application verification is still required before a stable release is claimed.

## Tech stack

- Rust 2024 workspace
- Tauri 2 desktop shell
- Vanilla TypeScript + Vite frontend
- `@tauri-apps/api` bundled module API
- official Tauri dialog plugin for the Rust-owned native save flow
- official Tauri opener plugin with exact URL/mail scope
- `getrandom` for OS cryptographic randomness
- Cargo package `eff-wordlist` / Rust crate `eff_wordlist` for EFF Diceware words
- `zxcvbn` for strength estimation
- `arboard` for clipboard integration
- `zeroize` for application-owned sensitive buffers where practical

## Quick start

Prerequisites: current stable Rust, Node.js 22+ recommended, npm, and the platform prerequisites documented in [`docs/setup.md`](docs/setup.md).

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
npm run tauri dev
```

## Development

```bash
# Frontend and repository checks
npm audit --audit-level=high
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm test
npm run build

# Rust core checks
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features

# Desktop adapter checks for the current platform
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
```

See [`docs/development.md`](docs/development.md), [`docs/testing.md`](docs/testing.md), [`docs/logging.md`](docs/logging.md), and [`docs/i18n.md`](docs/i18n.md).

## Build and release

```bash
npm install
npm run tauri build
```

The Tauri bundler produces platform-native artifacts. A stable release additionally requires same-commit CI/CodeQL evidence, verified dependency lockfiles, packaged-app testing on all primary platforms, real screenshots, release-governance checks, and a tag that exactly matches the package version. Release signing credentials are never stored in the repository. See [`docs/release.md`](docs/release.md) and [`docs/verification.md`](docs/verification.md).

## Architecture

Security-sensitive generation logic lives in `crates/keysmith-core` and has no UI dependency. `src-tauri` owns narrow native adapters for generation IPC, clipboard handling, batch save, and scoped external opening. The TypeScript layer renders the UI, externalizes user-facing copy, stores only non-secret preferences in local storage, and imports Tauri through its bundled module API. Generated secrets are not intentionally persisted.

See [`docs/architecture.md`](docs/architecture.md), [`docs/core-api.md`](docs/core-api.md), [`docs/desktop-bridge.md`](docs/desktop-bridge.md), [`docs/frontend.md`](docs/frontend.md), and [`docs/adr/`](docs/adr/).

## Documentation

The complete maintained documentation portal is [`docs/README.md`](docs/README.md). Important entry points:

| Need | Document |
| --- | --- |
| End-user behavior and safe use | [`docs/user-guide.md`](docs/user-guide.md) |
| Full architecture/trust boundaries | [`docs/architecture.md`](docs/architecture.md) |
| Rust core API/security algorithms | [`docs/core-api.md`](docs/core-api.md) |
| Tauri commands/native privileges | [`docs/desktop-bridge.md`](docs/desktop-bridge.md) |
| Frontend state/API/integration model | [`docs/frontend.md`](docs/frontend.md) |
| Accessibility | [`docs/accessibility.md`](docs/accessibility.md) |
| Localization | [`docs/i18n.md`](docs/i18n.md) |
| Logging/redaction | [`docs/logging.md`](docs/logging.md) |
| Automated/manual testing | [`docs/testing.md`](docs/testing.md) |
| Exact release-candidate checklist | [`docs/verification.md`](docs/verification.md) |
| Release process | [`docs/release.md`](docs/release.md) |
| Maintainer operations | [`docs/maintainer-guide.md`](docs/maintainer-guide.md) |
| Every tracked repository file | [`docs/repository-reference.md`](docs/repository-reference.md) |
| Current continuation ledger | [`what_changed.md`](what_changed.md) |

`npm run docs:check` uses `git ls-files` to ensure every tracked project path appears in the canonical repository reference. CI runs this check on every candidate.

## Security and privacy

KeySmith does not log generated secrets, transmit them to an application server, or retain a password history. Clipboard use is explicit; auto-clear is optional and conditional. Batch exports are plaintext by design, carry a prominent warning, and are written only after the user chooses a destination in the native save dialog. Rust validates security-sensitive IPC inputs instead of trusting HTML constraints.

The main webview does not receive `core:default`, a global Tauri object, generic filesystem-write authority, or arbitrary external URL permission. CI includes dependency audit/policy checks, repository secret scanning, documentation completeness, strict TypeScript/Rust linting, cross-platform desktop checks, configuration regression tests, and CodeQL analysis of both the frontend and complete Rust workspace.

Read [`SECURITY.md`](SECURITY.md), [`PRIVACY.md`](PRIVACY.md), [`THREAT_MODEL.md`](THREAT_MODEL.md), and [`docs/logging.md`](docs/logging.md) before making security-sensitive changes.

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Run the relevant quality checks and add regression coverage for behavior changes before opening a pull request.

## License

Licensed under the [Apache License 2.0](LICENSE). Third-party dependencies retain their own licenses.

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
