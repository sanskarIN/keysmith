# KeySmith

<p align="center">
  <img src="src/assets/logo.svg" alt="KeySmith logo" width="120" />
</p>

<p align="center"><strong>Private, offline password and passphrase generation for desktop and mobile, powered by Rust and Tauri.</strong></p>

<p align="center">
  <img alt="Version: 2.7.4 cross-platform candidate" src="https://img.shields.io/badge/version-2.7.4%20cross--platform%20candidate-orange">
  <a href="https://buymeacoffee.com/sanskarIN"><img alt="Buy Me a Coffee" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000"></a>
  <a href="LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
</p>

KeySmith targets the complete native Tauri 2 platform set: **Windows, macOS, Linux, Android, and iOS**. Passwords and passphrases are generated locally using the operating system's cryptographically secure random source. The app has no account system, telemetry, password history, or required network access for credential generation.

**Current version line:** `2.7.4` cross-platform candidate. A target is considered verified only after its CI/build and platform smoke-test gates pass; see [`docs/release.md`](docs/release.md).

## Highlights

- OS-backed CSPRNG through Rust `getrandom`, with rejection sampling to avoid modulo bias.
- Password policies for length, lowercase, uppercase, digits, symbols, custom symbols, and ambiguous-character exclusion.
- Backend custom-symbol hardening: at most 40 characters, no alphanumeric/whitespace/control input, ambiguity filtering, and deduplication even when the UI is bypassed through direct IPC.
- EFF large Diceware word-list passphrases through the `eff_wordlist` crate.
- zxcvbn-based strength estimates rather than home-grown password scoring.
- Batch generation up to 500 items with explicit export safety warnings.
- Native save-dialog batch export with readback verification before success is reported.
- Cross-platform clipboard integration through Tauri's clipboard plugin, with conditional auto-clear and a backend duration allowlist.
- Responsive phone/tablet safe-area layout, coarse-pointer touch targets, scrollable dialogs, and compact narrow-screen controls.
- Light, dark, and system themes with keyboard-first desktop accessibility and touch-first mobile adaptations.
- Offline-by-design architecture with restrictive Tauri CSP and least-privilege capabilities.
- Deterministic platform/configuration and release-version consistency checks.
- Android and iOS project initialization/build commands plus CI build gates.
- Security, privacy, threat-model, testing, accessibility, release, and architecture documentation.

## Screenshots

Real screenshots must come from verified packaged builds. The shared UI is defined by `index.html`, `src/styles.css`, and `src/mobile.css`; placeholder binary screenshots are intentionally not represented as real captures.

## Supported native targets

| Platform | Target | Minimum / architecture | Repository state |
| --- | --- | --- | --- |
| Windows | Tauri desktop | x86_64 / ARM64 where supported by the toolchain | Configured; desktop CI gate |
| macOS | Tauri desktop | Intel / Apple Silicon | Configured; desktop CI gate |
| Linux | Tauri desktop | Common supported desktop targets | Configured; desktop CI gate |
| Android | Tauri mobile | Android 7.0+ / SDK 24; aarch64, armv7, i686, x86_64 | Configured; Android CI build gate |
| iOS / iPadOS | Tauri mobile | iOS 14.0+; device and simulator targets | Configured; iOS simulator CI build gate |

ChromeOS is not a separate Tauri build target; compatible ChromeOS devices may use the Android application through their Android runtime. Browser/PWA deployment is also a separate architecture and is not represented as a native Tauri target.

## Tech stack

- Rust 2024 workspace
- Tauri 2 desktop + mobile shell
- Vanilla TypeScript + Vite frontend
- `getrandom` for OS cryptographic randomness
- `eff_wordlist` for EFF Diceware words
- `zxcvbn` for strength estimation
- official Tauri clipboard-manager plugin for desktop/mobile plaintext clipboard operations
- official Tauri dialog + filesystem plugins for native export selection and verified text writes
- `zeroize` for best-effort scrubbing of owned Rust sensitive buffers where practical

## Quick start — desktop

Prerequisites: current stable Rust, Node.js 22+ recommended, npm, and the native Tauri prerequisites for your OS.

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
npm run tauri dev
```

## Quick start — Android

Install the Android prerequisites described in [`docs/setup.md`](docs/setup.md), then:

```bash
npm install
npm run android:init
npm run icons:generate
npm run android:dev
```

Build test/distribution packages with:

```bash
npm run android:build:apk
npm run android:build:aab
```

## Quick start — iOS / iPadOS

iOS development requires macOS with Xcode and the prerequisites in [`docs/setup.md`](docs/setup.md):

```bash
npm install
npm run ios:init
npm run icons:generate
npm run ios:prepare
npm run ios:dev
```

Build with:

```bash
npm run ios:build
```

Re-run `npm run ios:prepare` after regenerating `src-tauri/gen/apple` so the required filesystem privacy manifest is restored.

## Development quality gate

```bash
# Frontend, metadata, and platform configuration
npm run typecheck
npm run lint
npm run format:check
npm run version:check
npm run platform:check
npm test
npm run build

# Rust checks
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
cargo test -p keysmith --lib
```

CI additionally initializes and compiles an Android aarch64 debug APK and an iOS arm64 simulator build. See [`docs/development.md`](docs/development.md) and [`docs/testing.md`](docs/testing.md).

## Build and release

Desktop:

```bash
npm install
npm run version:check
npm run platform:check
npm run tauri build
```

Android:

```bash
npm run android:init
npm run icons:generate
npm run android:build:aab
```

For iOS:

```bash
npm run ios:init
npm run icons:generate
npm run ios:prepare
npm run ios:build
```

Store distribution requires the platform owner's signing/developer-account process. Signing credentials are never stored in the repository. See [`docs/release.md`](docs/release.md).

## Architecture

The security-sensitive generation logic lives in `crates/keysmith-core` and has no UI dependency. `src-tauri` exposes a narrow IPC command surface and initializes only the cross-platform native plugins needed for clipboard and explicit exports. The TypeScript layer renders the shared responsive UI and stores only non-secret preferences in local storage. Generated passwords are never intentionally persisted. See [`docs/architecture.md`](docs/architecture.md) and [`docs/adr/`](docs/adr/).

## Security and privacy

KeySmith does not log generated secrets, transmit them, or retain a password history. Clipboard use is explicit and optional. Batch exports are plaintext by design, require an explicit save action, and are read back before KeySmith reports success.

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
