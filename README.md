# KeySmith

<p align="center">
  <img src="src/assets/logo.svg" alt="KeySmith logo" width="120" />
</p>

<p align="center"><strong>Private, offline password and passphrase generation powered by Rust and Tauri.</strong></p>

<p align="center">
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000"></a>
  <a href="LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
</p>

KeySmith is a desktop utility for Windows, macOS, and Linux. Passwords and passphrases are generated locally using the operating system's cryptographically secure random source. The app has no account system, telemetry, password history, or required network access for credential generation.

## Highlights

- OS-backed CSPRNG through Rust `getrandom`, with rejection sampling to avoid modulo bias.
- Password policies for length, lowercase, uppercase, digits, symbols, custom symbols, and ambiguous-character exclusion.
- EFF large Diceware word-list passphrases through the `eff_wordlist` crate.
- zxcvbn-based strength estimates rather than home-grown password scoring.
- Batch generation up to 500 items with explicit plaintext-export safety warnings.
- Clipboard auto-clear that clears only if the clipboard still contains the copied secret.
- Light, dark, and system themes with keyboard-first accessibility.
- Offline-by-design architecture with restrictive Tauri CSP and least-privilege capabilities.
- Security, privacy, threat-model, testing, accessibility, release, architecture, and file-by-file repository documentation.

## Screenshots

Real release screenshots will be captured from verified release candidates during release verification. Until then, the source UI is in `index.html` and `src/styles.css`; placeholder binary screenshots are intentionally not committed.

## Supported platforms

| Platform | Target | Status |
| --- | --- | --- |
| Windows | x86_64 / ARM64 where supported by Tauri | Primary |
| macOS | Intel / Apple Silicon | Primary |
| Linux | Common Tauri desktop targets | Primary |

Cross-platform source/build configuration exists today. Stable-release status still depends on the release-candidate checks and packaged-app smoke tests recorded in `what_changed.md`.

## Tech stack

- Rust 2024 workspace
- Tauri 2 desktop shell
- Vanilla TypeScript + Vite frontend
- `getrandom` for OS cryptographic randomness
- `eff_wordlist` for EFF Diceware words
- `zxcvbn` for strength estimation
- `arboard` for clipboard integration
- Vitest + proptest for automated behavior/property tests
- cargo-deny + CodeQL + Dependabot for dependency/security automation

## Quick start

Prerequisites: current stable Rust, Node.js 22+ recommended, npm, and the platform prerequisites required by Tauri.

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
npm run tauri dev
```

For platform-specific dependencies, read [`docs/setup.md`](docs/setup.md).

## Generator capabilities

### Passwords

- 4–128 characters;
- lowercase, uppercase, digits, symbols;
- optional custom symbol set;
- ambiguous-character exclusion;
- at least one character from every enabled class;
- secure final shuffle;
- Balanced, Maximum, Legacy compatible, and Alphanumeric presets.

### Passphrases

- 3–12 independently selected EFF large Diceware words;
- separator from 0–3 non-control characters;
- optional first-letter capitalization;
- optional independently selected two-digit suffix;
- selection-space entropy estimate plus zxcvbn strength presentation.

### Batch

- 1–500 independently generated passwords;
- explicit Copy all action;
- explicit plaintext `.txt` export with an in-app and in-file warning.

## Clipboard safety model

Clipboard use is explicit. The default clear preference is 30 seconds, with supported choices Never, 15 seconds, 30 seconds, 1 minute, and 2 minutes.

When delayed clearing is enabled, the Rust desktop command checks that the system clipboard still exactly equals the value copied by KeySmith before clearing. Newer unrelated clipboard content is left untouched.

Clipboard privacy ultimately depends on the operating system and other software. Clipboard managers or other processes can retain/observe values outside KeySmith's control. See [`docs/user-guide.md`](docs/user-guide.md) and [`THREAT_MODEL.md`](THREAT_MODEL.md).

## Development

```bash
# Frontend checks
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build

# Focused Rust core checks
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features

# Desktop adapter on the current platform
cargo check -p keysmith --all-targets
```

See [`docs/development.md`](docs/development.md) and [`docs/testing.md`](docs/testing.md).

## Build and release

```bash
npm install
npm run tauri build
```

The Tauri bundler produces platform-native artifacts. Release signing credentials are never stored in the repository. A successful build is not automatically a signed or smoke-tested release.

See [`docs/release.md`](docs/release.md) for the full clean-candidate, cross-platform, signing/notarization, smoke-test, tagging, and publication process.

## Architecture

The security-sensitive generation logic lives in `crates/keysmith-core` and has no UI/Tauri dependency. `src-tauri` exposes a narrow IPC/clipboard command surface. The TypeScript layer renders the UI and stores only non-secret preferences in local storage.

Primary runtime flow:

```text
UI input
→ typed Tauri IPC
→ Rust validation
→ OS-backed random selection / EFF word list
→ strength result
→ transient UI state
→ optional explicit clipboard/export action
```

Passwords are not intentionally persisted. See [`docs/architecture.md`](docs/architecture.md), [`docs/core-api.md`](docs/core-api.md), [`docs/desktop-bridge.md`](docs/desktop-bridge.md), [`docs/frontend.md`](docs/frontend.md), and [`docs/adr/`](docs/adr/).

## Documentation

The complete documentation portal is [`docs/README.md`](docs/README.md).

| Need | Document |
| --- | --- |
| End-user behavior and safe use | [`docs/user-guide.md`](docs/user-guide.md) |
| Platform development setup | [`docs/setup.md`](docs/setup.md) |
| Architecture and trust boundaries | [`docs/architecture.md`](docs/architecture.md) |
| Rust core API/algorithms | [`docs/core-api.md`](docs/core-api.md) |
| Tauri commands/clipboard/capabilities | [`docs/desktop-bridge.md`](docs/desktop-bridge.md) |
| Frontend state/storage/interactions | [`docs/frontend.md`](docs/frontend.md) |
| Development workflow | [`docs/development.md`](docs/development.md) |
| Test/verification matrix | [`docs/testing.md`](docs/testing.md) |
| Release process | [`docs/release.md`](docs/release.md) |
| Accessibility requirements | [`docs/accessibility.md`](docs/accessibility.md) |
| Troubleshooting | [`docs/troubleshooting.md`](docs/troubleshooting.md) |
| Performance budgets | [`docs/performance.md`](docs/performance.md) |
| GitHub governance | [`docs/github.md`](docs/github.md) |
| Maintainer operations | [`docs/maintainer-guide.md`](docs/maintainer-guide.md) |
| Every committed repository file | [`docs/repository-reference.md`](docs/repository-reference.md) |
| Word-list provenance | [`docs/wordlists.md`](docs/wordlists.md) |
| Active continuation/verification ledger | [`what_changed.md`](what_changed.md) |

The file-by-file reference is the completeness checklist: new/removed/renamed committed files should be reflected there in the same pull request.

## Security and privacy

KeySmith does not intentionally log generated secrets, transmit them, or retain a password history. Clipboard use is explicit and optional. Batch exports are plaintext by design and therefore carry a prominent warning.

Read [`SECURITY.md`](SECURITY.md), [`PRIVACY.md`](PRIVACY.md), and [`THREAT_MODEL.md`](THREAT_MODEL.md) before making security-sensitive changes.

The only intentional non-secret local preference keys at the current checkpoint are:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

## Quality and security automation

Pull requests are designed to exercise:

- strict TypeScript type checking and ESLint;
- repository text hygiene;
- frontend unit tests and production build;
- Rust formatting, strict core Clippy, build/tests;
- Tauri `cargo check` on Linux, Windows, and macOS;
- cargo-deny dependency policy;
- CodeQL for JavaScript/TypeScript and Rust.

Tag-triggered release automation builds draft platform artifacts. See `.github/workflows/` and [`docs/testing.md`](docs/testing.md).

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Run the relevant quality checks before opening a pull request, add regression coverage for behavior fixes, and update documentation with the implementation.

Potential vulnerabilities should follow [`SECURITY.md`](SECURITY.md) rather than exposing sensitive details in a public issue.

## Project scope

KeySmith is a credential generator, not a password manager. It intentionally does not include a credential vault, secret history, accounts, cloud sync, telemetry, remote generation, or silent background update checks.

## License

Licensed under the [Apache License 2.0](LICENSE). Third-party dependencies retain their own licenses.

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
