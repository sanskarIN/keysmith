# Setup

## Common prerequisites

- Git
- current stable Rust toolchain
- Node.js 22+ recommended and npm
- native Tauri prerequisites for your operating system

Clone and install:

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
```

Then run the full desktop app:

```bash
npm run tauri dev
```

`npm run dev` starts only the Vite frontend. Native generation IPC, clipboard integration, system link opening, and the real batch save dialog require the Tauri runtime.

## Windows

Install the Microsoft C++ build tools and WebView2 requirements documented by Tauri. Use a current stable Rust MSVC toolchain.

After prerequisites are installed:

```powershell
npm install
npm run tauri dev
```

## macOS

Install Xcode Command Line Tools and a current stable Rust toolchain.

```bash
npm install
npm run tauri dev
```

Apple signing/notarization is required only when producing distributable signed/notarized artifacts; signing credentials are not part of normal local development and must never be committed.

## Linux

Package names vary by distribution. The repository CI currently uses Ubuntu 22.04 and installs:

```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

For another distribution, use the equivalent current Tauri desktop prerequisites rather than copying Ubuntu package names blindly.

Then:

```bash
npm install
npm run tauri dev
```

## Environment and secrets

KeySmith requires no application runtime secret for local generation. `.env.example` intentionally contains no credentials. Do not add generated passwords, API tokens, signing keys, or private user data to environment files.

The frontend accepts only `VITE_` and `TAURI_ENV_` build-environment prefixes. `TAURI_ENV_DEBUG` is treated as debug only when its literal value is `true`.

## Lockfiles

During the current release-candidate phase, dependency lockfiles must come from a trusted clean dependency resolution and then be committed/reviewed. Once a verified `package-lock.json` is committed, prefer `npm ci` for clean reproducible frontend installs. Once `Cargo.lock` is committed, release-sensitive Cargo commands should use the locked dependency graph where appropriate.

Do not regenerate lockfiles merely to make a diff disappear; review dependency changes explicitly.

## First checks after setup

```bash
npm run typecheck
npm run lint
npm test
npm run build
cargo check -p keysmith --all-targets
```

For the complete quality/security gate, use `docs/development.md` and `docs/testing.md`.
