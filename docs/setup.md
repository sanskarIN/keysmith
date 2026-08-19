# Setup

This guide prepares a machine for KeySmith source development. KeySmith combines a Rust 2024 workspace, a Tauri 2 native shell, and a Vanilla TypeScript/Vite frontend, so the full desktop application needs both language toolchains plus platform-native Tauri prerequisites.

## Common prerequisites

Install:

- Git,
- a current stable Rust toolchain through rustup,
- Cargo (included with Rust),
- Node.js 22+ recommended,
- npm,
- native Tauri prerequisites for the operating system.

Verify the common tools:

```bash
git --version
rustc --version
cargo --version
node --version
npm --version
```

The repository uses Rust edition 2024, so the installed stable compiler must support that edition.

## Clone and install

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
```

During release-candidate work, use the intended verification branch/commit rather than assuming the default branch already contains unreleased changes.

## Frontend-only development

```bash
npm run dev
```

This starts Vite on the fixed development port 1420. It is useful for static presentation work, but native generation IPC, clipboard integration, native export, and system external-link opening require the Tauri runtime. KeySmith deliberately does not add a browser-random generation fallback when the native bridge is unavailable.

## Full desktop development

```bash
npm run tauri dev
```

Use the full desktop mode for generation, native clipboard behavior, the operating-system save dialog, scoped external destinations, native dialogs/webview behavior, and integration testing.

## Windows

Install the Microsoft C++ build tools/compatible Visual Studio Build Tools components, an appropriate Windows SDK, WebView2 requirements, and a current stable Rust MSVC toolchain.

Useful diagnostics:

```powershell
rustup show
rustc -vV
```

Then:

```powershell
npm install
npm run tauri dev
```

Common Windows setup problems include an incomplete MSVC linker/toolchain, a missing/outdated WebView2 environment, stale PATH after installing Rust, and another process already using port 1420.

## macOS

Install Xcode Command Line Tools and current stable Rust:

```bash
xcode-select --install
xcode-select -p
clang --version
rustc -vV
```

Then:

```bash
npm install
npm run tauri dev
```

The release workflow builds universal macOS artifacts using Apple Silicon and Intel targets. Maintainers reproducing that packaging locally may need:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

Apple signing/notarization credentials are not required for ordinary local development and must never be committed.

## Linux

Package names vary by distribution. The repository's Ubuntu 22.04 CI/CodeQL desktop setup installs:

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

For another distribution, use the equivalent current Tauri desktop prerequisites rather than copying Ubuntu package names blindly.

Then:

```bash
npm install
npm run tauri dev
```

If native desktop packages are not available yet, the framework-independent core can still be checked separately:

```bash
cargo test -p keysmith-core --all-features
```

## Environment and secrets

KeySmith requires no application runtime secret for local credential generation. `.env.example` intentionally contains no credentials.

Never put these in source/environment examples/issues:

- generated passwords or passphrases,
- exported batch contents,
- API/authentication tokens,
- signing/notarization private material,
- private keys,
- private filesystem destinations.

The frontend accepts only `VITE_` and `TAURI_ENV_` build-environment prefixes. `TAURI_ENV_DEBUG` is treated as debug only when its literal value is `true`.

## Lockfiles

During the current release-candidate phase, dependency lockfiles must come from a trusted clean dependency resolution and then be committed/reviewed. CI generates short-lived `package-lock.json` and `Cargo.lock` artifacts to support that process.

Once a verified `package-lock.json` is committed, prefer reproducible npm installation such as `npm ci` where repository workflows are updated to support it. Once `Cargo.lock` is committed, release-sensitive Cargo commands should use the locked graph where appropriate.

Do not hand-author lockfiles and do not regenerate them merely to make a diff disappear; review dependency changes explicitly.

## First complete repository checks

After setup, run:

```bash
npm audit --audit-level=high
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
```

`npm run docs:check` validates that every Git-tracked project path appears in `docs/repository-reference.md`.

The full desktop commands require platform-native prerequisites. CI remains the cross-platform authority for Linux/Windows/macOS compilation and linting; packaged behavior still needs manual release verification.

## Setup isolation order

When setup fails, isolate layers instead of immediately modifying source/configuration:

1. verify Git/Node/npm/Rust commands;
2. run `npm install`;
3. run frontend typecheck;
4. run `cargo test -p keysmith-core --all-features`;
5. verify native Tauri prerequisites;
6. run `cargo check -p keysmith --all-targets`;
7. run `npm run tauri dev`;
8. consult [`troubleshooting.md`](troubleshooting.md).

See [`development.md`](development.md) for change procedures, [`testing.md`](testing.md) for the quality matrix, and [`verification.md`](verification.md) for packaged release checks.
