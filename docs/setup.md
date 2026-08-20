# Setup

KeySmith targets Windows, macOS, Linux, Android, and iOS/iPadOS from the same Rust + TypeScript codebase.

## Common prerequisites

- Git
- current stable Rust toolchain
- Node.js 22+ recommended and npm
- native Tauri prerequisites for the target operating system

Clone and install:

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
```

Run repository-level configuration checks before platform setup:

```bash
npm run version:check
npm run platform:check
```

## Windows

Install the Microsoft C++ build tools and WebView2 requirements documented by Tauri. Use a current stable Rust MSVC toolchain.

Run:

```bash
npm run tauri dev
```

## macOS desktop

Install Xcode Command Line Tools and a current stable Rust toolchain. Apple signing/notarization is required only for distributable signed builds.

Run:

```bash
npm run tauri dev
```

## Linux desktop

Install the WebKitGTK and desktop development packages required by Tauri for your distribution. Package names differ by distribution; follow the current Tauri prerequisite guide.

Run:

```bash
npm run tauri dev
```

## Android

### Required tooling

Install Android Studio and ensure these SDK components are installed:

- Android SDK Platform
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android SDK Command-line Tools
- Android NDK (side by side)

Use an NDK version 28 or newer for release builds so generated native libraries are compatible with Android's 16 KB memory-page requirements.

Configure the Android SDK environment variables. Typical Linux/macOS values are:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 "$ANDROID_HOME/ndk" | sort -V | tail -1)"
```

On macOS the Android SDK is commonly under `$HOME/Library/Android/sdk`; on Windows use the Android SDK path shown by Android Studio and set `ANDROID_HOME`/`NDK_HOME` through the environment settings or shell.

Install the Rust Android targets if they are not already present:

```bash
rustup target add \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-android \
  x86_64-linux-android
```

Initialize the generated Android Studio project:

```bash
npm run android:init
npm run icons:generate
```

Run on a connected device or emulator:

```bash
npm run android:dev
```

Build packages:

```bash
npm run android:build:apk
npm run android:build:aab
```

KeySmith sets Android `minSdkVersion` to 24 in `src-tauri/tauri.android.conf.json`.

The generated Android project lives under `src-tauri/gen/android` and is intentionally ignored by Git. Regenerate it with `npm run android:init` instead of committing generated Android Studio files.

## iOS / iPadOS

### Host requirement

iOS development and builds require macOS with Xcode. Install Xcode, the Xcode Command Line Tools, CocoaPods where required by the Tauri toolchain, Node.js/npm, and stable Rust.

Install Rust iOS targets:

```bash
rustup target add \
  aarch64-apple-ios \
  aarch64-apple-ios-sim \
  x86_64-apple-ios
```

Initialize the generated Xcode project and mobile icons:

```bash
npm run ios:init
npm run icons:generate
npm run ios:prepare
```

`npm run ios:prepare` writes the required `PrivacyInfo.xcprivacy` file into `src-tauri/gen/apple` for the filesystem plugin's file-timestamp API usage. Re-run it whenever the generated Apple project is recreated.

Run on a simulator or configured device:

```bash
npm run ios:dev
```

Build:

```bash
npm run ios:build
```

KeySmith sets `minimumSystemVersion` to `14.0` in `src-tauri/tauri.ios.conf.json`.

The generated Apple project lives under `src-tauri/gen/apple` and is intentionally ignored by Git. Regenerate it with `npm run ios:init` rather than treating generated Xcode files as hand-maintained source.

## Physical-device development

Tauri mobile development can expose the Vite dev server to a device. `vite.config.ts` uses `TAURI_DEV_HOST` when Tauri provides it, including WebSocket HMR configuration.

Only expose the development server on a trusted local development network. Production credential generation does not require a development server or network connection.

## Mobile export behavior

Batch export uses the native save dialog plus filesystem plugin. After writing, KeySmith reads the selected file back and compares it with the requested export text. The UI reports success only when the readback matches exactly.

This verification is especially important on mobile document-provider destinations where platform/provider behavior may differ.

## Secrets

No `.env` secrets are required for local development. Never commit Android keystores, keystore passwords, Apple signing certificates/private keys, App Store Connect credentials, generated credentials, or other release secrets.
