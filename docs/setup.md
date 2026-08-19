# Setup

## Common prerequisites

- Git
- current stable Rust toolchain
- Node.js 22+ recommended and npm
- native Tauri prerequisites for your OS

Clone and install:

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
```

Then run:

```bash
npm run tauri dev
```

## Windows

Install the Microsoft C++ build tools and WebView2 requirements documented by Tauri. Use a current stable Rust MSVC toolchain.

## macOS

Install Xcode Command Line Tools. Apple signing/notarization is required only for distributable signed releases.

## Linux

Install the WebKitGTK and desktop development packages required by Tauri for your distribution. Package names differ by distro; use Tauri's current prerequisite documentation.

No `.env` secrets are required for local development.
