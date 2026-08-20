# KeySmith

<p align="center">
  <img src="src/assets/logo.svg" alt="KeySmith logo" width="120" />
</p>

<p align="center"><strong>Private, offline password and passphrase generation powered by Rust and Tauri.</strong></p>

<p align="center">
  <img alt="Version: 2.7.4 release candidate" src="https://img.shields.io/badge/version-2.7.4%20RC-orange">
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000"></a>
  <a href="LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
</p>

KeySmith is a desktop utility for Windows, macOS, and Linux. Passwords and passphrases are generated locally using the operating system's cryptographically secure random source. The app has no account system, telemetry, password history, or required network access.

**Current version line:** `2.7.4` release candidate. The final `v2.7.4` tag must not be published until the automated and manual release gates in [`docs/release.md`](docs/release.md) are complete.

## Highlights

- OS-backed CSPRNG through Rust `getrandom`, with rejection sampling to avoid modulo bias.
- Password policies for length, lowercase, uppercase, digits, symbols, custom symbols, and ambiguous-character exclusion.
- Backend custom-symbol hardening: at most 40 characters, no alphanumeric/whitespace/control input, ambiguity filtering, and deduplication even when the UI is bypassed through direct IPC.
- EFF large Diceware word-list passphrases through the `eff_wordlist` crate.
- zxcvbn-based strength estimates rather than home-grown password scoring.
- Batch generation up to 500 items with explicit export safety warnings.
- Clipboard auto-clear that clears only if the clipboard still contains the copied secret, with a backend allowlist for supported durations and zeroizing wrappers for owned command buffers.
- Light, dark, and system themes with keyboard-first accessibility.
- Offline-by-design architecture with restrictive Tauri CSP and least-privilege capabilities.
- Release-version consistency checks across frontend, Rust, Tauri, visible UI metadata, and release tags.
- Security, privacy, threat-model, testing, accessibility, release, and architecture documentation.

## Screenshots

Real release screenshots will be captured from verified v2.7.4 packaged builds. Until then, the source UI is in `index.html` and `src/styles.css`; placeholder binary screenshots are intentionally not committed or represented as real application captures.

## Supported platforms

| Platform | Target | Status |
| --- | --- | --- |
| Windows | x86_64 / ARM64 where supported by Tauri | Primary |
| macOS | Intel / Apple Silicon | Primary |
| Linux | Common Tauri desktop targets | Primary |

## Tech stack

- Rust 2024 workspace
- Tauri 2 desktop shell
- Vanilla TypeScript + Vite frontend
- `getrandom` for OS cryptographic randomness
- `eff_wordlist` for EFF Diceware words
- `zxcvbn` for strength estimation
- `arboard` for clipboard integration
- `zeroize` for best-effort scrubbing of owned sensitive buffers where practical

## Quick start

Prerequisites: current stable Rust, Node.js 22+ recommended, npm, and the platform prerequisites documented by Tauri.

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
npm run tauri dev
```

For platform-specific dependencies, read [`docs/setup.md`](docs/setup.md).

## Development

```bash
# Frontend and release-metadata checks
npm run typecheck
npm run lint
npm run format:check
npm run version:check
npm test
npm run build

# Rust checks
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo test -p keysmith --lib
```

See [`docs/development.md`](docs/development.md) and [`docs/testing.md`](docs/testing.md).

## Build and release

```bash
npm install
npm run version:check
npm run tauri build
```

The Tauri bundler produces platform-native artifacts. Release signing credentials are never stored in the repository. Release tags are checked against repository version metadata before the automated release build proceeds. See [`docs/release.md`](docs/release.md).

## Architecture

The security-sensitive generation logic lives in `crates/keysmith-core` and has no UI dependency. `src-tauri` exposes a narrow IPC command surface. The TypeScript layer renders the UI and stores only non-secret preferences in local storage. Passwords are never intentionally persisted. See [`docs/architecture.md`](docs/architecture.md) and [`docs/adr/`](docs/adr/).

## Security and privacy

KeySmith does not log generated secrets, transmit them, or retain a password history. Clipboard use is explicit and optional. Batch exports are plaintext by design and therefore carry a prominent warning.

Read [`SECURITY.md`](SECURITY.md), [`PRIVACY.md`](PRIVACY.md), and [`THREAT_MODEL.md`](THREAT_MODEL.md) before making security-sensitive changes.

## Contributing

Contributions are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Run the relevant quality checks before opening a pull request.

## License

Licensed under the [Apache License 2.0](LICENSE). Third-party dependencies retain their own licenses.

## Contact and support

- Business: `sanskarin@outlook.in`
- Business: `sanskarin.business@gmail.com`
- Support: `supportramsandesh@gmail.com`
- GitHub: https://github.com/sanskarIN
- Buy Me a Coffee: https://buymeacoffee.com/sanskarIN

**Made by the Sanskar**
