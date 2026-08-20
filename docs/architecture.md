# Architecture

KeySmith is a modular native application with one shared security core and one shared responsive UI across Windows, macOS, Linux, Android, and iOS.

## Core domain — `crates/keysmith-core`

Owns password policies, CSPRNG sampling, passphrase selection, presets, validation errors, and zxcvbn strength estimation. It has no UI or Tauri dependency. The randomness helper uses the operating-system-backed `getrandom` crate and rejection sampling before selection/shuffling.

Keeping generation logic independent from Tauri means the security-sensitive core is compiled for every supported native target without duplicating password logic in Kotlin, Swift, JavaScript, or platform-specific desktop code.

## Native adapter — `src-tauri`

The Tauri 2 adapter exposes only the commands needed by the shared UI:

- password generation,
- batch generation,
- passphrase generation,
- preset lookup,
- clipboard copy,
- clipboard clear.

The adapter initializes official Tauri plugins for:

- plaintext clipboard access across desktop and mobile,
- native save dialogs,
- scoped filesystem access for explicit batch exports.

The previous direct desktop-only `arboard` dependency is not used by application code. The clipboard plugin provides the platform implementation while KeySmith retains its own duration validation and conditional-clear policy.

Clipboard auto-clear runs the delayed read away from the initiating command path and clears only when the clipboard still equals the expected copied secret.

## Platform configuration

The shared base configuration is `src-tauri/tauri.conf.json`.

Mobile overrides are committed separately:

- `src-tauri/tauri.android.conf.json`
  - removes desktop sizing assumptions from the mobile window override,
  - sets Android minimum SDK 24.
- `src-tauri/tauri.ios.conf.json`
  - removes desktop sizing assumptions from the mobile window override,
  - sets iOS minimum system version 14.0.

Tauri generates native IDE projects under `src-tauri/gen/`. Those generated Android Studio/Xcode files are intentionally ignored and recreated through the documented init commands.

## Presentation — `src` + `index.html`

Vanilla TypeScript renders the generator, passphrase, batch, settings, onboarding, and About experiences. It stores only non-secret preferences locally. Generated secrets remain in ephemeral UI state.

The presentation has two CSS layers:

- `src/styles.css` — shared desktop-first design system and responsive layout,
- `src/mobile.css` — phone/tablet safe areas, coarse-pointer targets, narrow-screen controls, and mobile dialog behavior.

`index.html` opts into `viewport-fit=cover` so CSS safe-area environment variables can keep controls away from notches and home indicators.

## Mobile development server

`vite.config.ts` reads `TAURI_DEV_HOST`. When Tauri exposes a development host for a physical Android/iOS device, Vite binds to that host and configures WebSocket HMR accordingly. Desktop development retains the localhost behavior.

This development-network path is not part of production credential generation.

## Export data flow

Batch export is intentionally explicit:

`batch in UI memory → native save dialog → user-selected scoped path/URI → text write → exact text readback → success message`.

KeySmith reports success only if the exported text can be read back exactly. This avoids silently treating a mobile document-provider write as successful when the provider fails to persist the requested data.

The export capability is limited to save-dialog selection plus text read/write commands; broad filesystem directories are not granted by default.

## iOS privacy manifest generation

The Tauri filesystem plugin uses Apple APIs that require an approved reason entry for file timestamps. `scripts/prepare-ios-privacy.mjs` writes the required `PrivacyInfo.xcprivacy` into the generated Apple project after `tauri ios init`.

Because `src-tauri/gen/` is regenerated and ignored, the preparation step is part of both documented iOS setup and CI.

## Mobile icons

`src/assets/logo.svg` is the editable branding source. `npm run icons:generate` calls the Tauri icon generator after mobile project initialization so Android mipmaps and the iOS AppIcon set do not ship with generator defaults.

## Capability boundary

`src-tauri/capabilities/default.json` applies to the main webview on all supported native platforms and grants:

- Tauri core defaults,
- KeySmith generation commands,
- KeySmith clipboard commands,
- native save dialog,
- text-file write,
- text-file readback for export verification.

No shell, arbitrary command execution, remote HTTP client, telemetry, or unrestricted filesystem capability is required by the current product.

## Data flow

Primary generation flow:

`UI input → typed Tauri IPC → Rust validation → OS CSPRNG / packaged word list → result → UI`.

Clipboard flow:

`UI explicit copy → KeySmith Rust command → official clipboard plugin → OS clipboard → conditional delayed comparison/clear`.

Export flow:

`UI explicit export → dialog plugin → scoped destination → filesystem plugin write/readback → verified status`.

There is no application server, credential database, authentication service, cloud synchronization service, or telemetry endpoint.

## Error handling

Core errors are typed with `thiserror`. Tauri translates them into user-safe strings. The UI presents errors through an `aria-live` status region and does not include generated secret values in error text.

Native export errors, including readback mismatches, are surfaced as failures rather than converted into success messages.

## Cross-platform verification boundary

Source-level platform configuration is guarded by `npm run platform:check`. GitHub Actions then verifies:

- Windows desktop compilation/tests,
- macOS desktop compilation/tests,
- Linux desktop compilation/tests,
- Android project initialization + aarch64 debug APK build,
- iOS project initialization + privacy preparation + arm64 simulator build.

CI compilation does not replace real-device/store-signing smoke testing; `docs/release.md` defines that final boundary.
