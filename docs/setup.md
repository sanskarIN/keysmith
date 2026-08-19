# Setup

This guide prepares a development machine for KeySmith. KeySmith is a Tauri 2 desktop application with a Rust 2024 workspace and a Vanilla TypeScript/Vite frontend, so both Rust and Node tooling plus platform-native desktop prerequisites are required for the full app.

For normal end users, use packaged release artifacts once a stable release is published. The steps below are for source development and release verification.

## Common prerequisites

Install:

- Git;
- a current stable Rust toolchain through rustup;
- Cargo (included with Rust);
- Node.js 22 or newer recommended;
- npm;
- the native Tauri prerequisites for your operating system.

Useful verification commands:

```bash
git --version
rustc --version
cargo --version
node --version
npm --version
```

The repository uses Rust edition 2024, so the installed stable toolchain must support that edition.

## Clone

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
```

Review the repository before running build/install commands if you are working from an untrusted fork.

## Install frontend/tooling dependencies

```bash
npm install
```

At the current 0.1.0 release-candidate checkpoint, a committed `package-lock.json` is not yet available. The handoff ledger tracks clean trusted lockfile generation as a release task. Once a lockfile is committed and CI policy is updated, reproducible `npm ci` installation should be preferred where appropriate.

## Verify the Rust workspace

Once Rust and any required native platform dependencies are installed:

```bash
cargo metadata --no-deps
cargo check -p keysmith-core
```

The core crate does not require Tauri's desktop system libraries, so it is a useful first Rust check when diagnosing platform setup.

## Run the frontend only

```bash
npm run dev
```

Vite listens on port `1420`, matching `src-tauri/tauri.conf.json`.

Frontend-only mode is useful for static UI work, but credential-generation commands intentionally fail outside Tauri because `src/api.ts` does not provide an insecure browser-random fallback.

Stop the development server before starting another process that needs the same fixed port.

## Run the full desktop application

```bash
npm run tauri dev
```

This runs the Vite frontend through the Tauri desktop shell and enables the Rust command/clipboard bridge.

A successful launch should show the KeySmith window and, on a clean first-run preference state, the onboarding dialog.

## Windows

### Required components

A Windows development environment needs the native toolchain expected by Tauri/Rust MSVC builds, including:

- Microsoft Visual C++ build tools / compatible Visual Studio Build Tools components;
- a supported Windows SDK;
- Microsoft Edge WebView2 runtime/development support as required by the Tauri environment;
- stable Rust using the MSVC target.

Check the active Rust host:

```powershell
rustup show
rustc -vV
```

A typical modern Windows host is `x86_64-pc-windows-msvc`.

### Development run

```powershell
npm install
npm run tauri dev
```

### Common Windows setup symptoms

- linker executable not found → Visual C++ build tools/SDK installation is incomplete;
- WebView runtime error → install/update WebView2;
- `cargo` not found → restart the terminal after installing rustup or fix PATH;
- port 1420 already in use → stop the other Vite process.

KeySmith suppresses the extra console window only in non-debug Windows application builds; development behavior may differ.

## macOS

### Required components

Install Xcode Command Line Tools:

```bash
xcode-select --install
```

Verify:

```bash
xcode-select -p
clang --version
rustc -vV
```

Normal local development does not require release signing credentials.

### Development run

```bash
npm install
npm run tauri dev
```

### Universal release target

The release workflow builds universal macOS artifacts and installs both Rust targets:

```text
aarch64-apple-darwin
x86_64-apple-darwin
```

Maintainers reproducing that release locally may need:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

Signing/notarization credentials are release secrets and must never be committed to the repository.

## Linux

Linux needs WebKitGTK and related desktop development packages before compiling the Tauri crate.

The repository's Ubuntu 22.04 CI installs:

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

These names are specifically the Ubuntu/Debian packages used by this repository's hosted CI. Other distributions use different package managers/names; install the equivalents required by Tauri 2 and your distribution.

Then:

```bash
npm install
npm run tauri dev
```

If you only need to work on the framework-independent core and cannot install desktop libraries yet:

```bash
cargo test -p keysmith-core --all-features
```

## Recommended editor setup

Any editor can be used. Helpful integrations include:

- Rust Analyzer for Rust;
- TypeScript language service;
- ESLint integration;
- EditorConfig support.

Editor automation should not rewrite repository line endings to CRLF. `.editorconfig`, `.gitattributes`, and `scripts/check-format.mjs` establish LF/final-newline/trailing-whitespace expectations.

## Environment files and secrets

No `.env` secret is required for normal KeySmith development or credential generation.

`.env.example` exists only to document the convention safely. Never commit:

- real `.env` files;
- API tokens;
- GitHub tokens;
- signing private keys/certificates containing private material;
- notarization credentials;
- user/generated passwords or passphrases.

Release workflows receive GitHub's standard workflow token through protected Actions context rather than a committed credential.

## First quality check

After setup:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
```

If the desktop check fails while the core succeeds, investigate platform-native Tauri prerequisites before modifying application code.

## Build a local package

```bash
npm run tauri build
```

A successful build does not automatically mean the artifact is signed, notarized, installable on every target machine, or functionally smoke-tested. See [`release.md`](release.md) and [`testing.md`](testing.md).

## Local preference reset for first-run testing

KeySmith stores only three non-secret browser/webview preference keys:

- `keysmith.clipboardClearSeconds`;
- `keysmith.theme`;
- `keysmith.onboardingComplete`.

For onboarding tests, clear the application's local webview storage through an appropriate development/debug workflow rather than editing application source. Do not introduce a secret-history reset because KeySmith intentionally has no secret-history storage.

## Setup troubleshooting order

When setup fails, isolate layers:

1. verify Git/Node/npm/Rust commands;
2. run `npm install`;
3. run `npm run typecheck`;
4. run `cargo check -p keysmith-core`;
5. verify platform-native Tauri packages/toolchain;
6. run `cargo check -p keysmith --all-targets`;
7. run `npm run tauri dev`;
8. consult [`troubleshooting.md`](troubleshooting.md) before changing build configuration.

This order prevents a missing system dependency from being mistaken for a KeySmith core bug.
