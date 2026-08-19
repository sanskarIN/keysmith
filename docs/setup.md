# Setup

## Common prerequisites

- Git
- current stable Rust toolchain
- Node.js 22+ recommended and npm
- native Tauri prerequisites for your OS

Clone and install the exact dependency graph recorded by the repository lockfiles:

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm ci
cargo metadata --locked --format-version 1 --no-deps > /dev/null
```

Then run:

```bash
npm run tauri dev
```

Use `npm install` only when intentionally changing JavaScript dependencies and updating `package-lock.json`. After changing Rust dependencies, regenerate and commit `Cargo.lock`. Dependency-manifest and lockfile changes belong in the same pull request.

## Windows

Install the Microsoft C++ build tools and WebView2 requirements documented by Tauri. Use a current stable Rust MSVC toolchain.

## macOS

Install Xcode Command Line Tools. Apple signing/notarization is required only for distributable signed releases.

## Linux

Install the WebKitGTK and desktop development packages required by Tauri for your distribution. Package names differ by distro; use Tauri's current prerequisite documentation.

No `.env` secrets are required for local development.
