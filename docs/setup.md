# Setup

## Common prerequisites

- Git
- Rust 1.97.1; the repository selects it automatically through `rust-toolchain.toml`
- Node.js 22+ recommended and npm
- native Tauri prerequisites for your OS

Clone and install the exact committed frontend dependency graph:

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm ci
```

Verify that the committed Rust lockfile is current before development or release work:

```bash
cargo metadata --locked --format-version 1 > /dev/null
```

Then run:

```bash
npm run tauri dev
```

## Windows

Install the Microsoft C++ build tools and WebView2 requirements documented by Tauri. The pinned Rust toolchain is selected automatically by rustup when commands are run inside the repository.

## macOS

Install Xcode Command Line Tools. Apple signing/notarization is required only for distributable signed releases.

## Linux

Install the WebKitGTK and desktop development packages required by Tauri for your distribution. Package names differ by distro; use Tauri's current prerequisite documentation.

No `.env` secrets are required for local development.

## Reproducibility rule

Use `npm ci` for normal setup and CI-equivalent verification. Do not replace the committed lockfiles merely because a newer transitive dependency exists; dependency updates should be explicit, reviewed changes that pass the complete quality and license-policy gates.
