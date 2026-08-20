# Changelog

All notable changes follow a Keep a Changelog style and Semantic Versioning.

## [Unreleased]

### Verification
- Complete the final v2.7.4 five-platform pull-request quality matrix, CodeQL analysis, signed/package smoke tests, real screenshots, and release-artifact review before describing the release as fully cross-platform verified.

## [2.7.4] - 2026-08-20

### Added
- Rust core with OS-backed cryptographic password generation and policy validation.
- EFF large-wordlist passphrase generation.
- zxcvbn strength estimates.
- Batch generation and guarded plaintext export.
- Tauri native shell targeting Windows, macOS, Linux, Android, and iOS/iPadOS from the shared Rust + TypeScript codebase.
- Android platform configuration with minimum SDK 24 and build/dev scripts for APK/AAB workflows.
- iOS platform configuration with minimum system version 14.0 and device/simulator build/dev scripts.
- Cross-platform Tauri clipboard-manager integration for plaintext credential copy and conditional auto-clear.
- Native dialog/filesystem batch export shared by desktop and mobile.
- Exact post-write export readback verification before success is reported.
- Mobile safe-area, touch-target, narrow-screen, and scrollable-dialog UI adaptations.
- `TAURI_DEV_HOST` Vite/HMR support for physical mobile-device development.
- All-platform icon generation from the shared KeySmith SVG branding source.
- Deterministic iOS privacy-manifest preparation for filesystem-plugin file-timestamp API usage.
- `npm run platform:check` to guard the five-platform configuration invariants.
- Android aarch64 debug-APK and iOS arm64-simulator build jobs in CI in addition to Windows/macOS/Linux desktop checks.
- Responsive accessible TypeScript UI with light/dark/system themes.
- First-run onboarding and complete privacy, accessibility, update, and help settings surfaces.
- Security, privacy, architecture, testing, release, accessibility, performance, troubleshooting, word-list, mobile-setup, and contribution documentation.
- GitHub CI, CodeQL, dependency update, issue, pull-request, and release automation configuration.
- Deterministic release-version consistency checks across frontend, Rust workspace, Tauri bundle metadata, visible UI labels, and release tags.
- Native-adapter unit coverage for supported clipboard clear durations.

### Changed
- Frontend package, Rust workspace, Tauri bundle metadata, and visible application version labels identify v2.7.4 consistently.
- The previous desktop-only direct `arboard` integration has been replaced by Tauri's official cross-platform clipboard plugin.
- Batch export no longer depends on browser Blob/download behavior; it uses an explicit native save destination on every supported native target.
- The native capability grants only save-dialog plus text write/readback permissions required by explicit exports.
- Mobile platform overrides intentionally remove desktop minimum-window sizing assumptions.
- CI checks both version consistency and platform consistency, treats native-adapter Clippy warnings as errors, and verifies desktop plus Android/iOS compilation paths.
- Release verification is tracked explicitly as a five-platform release-candidate gate rather than being implied by version metadata or desktop success.

### Fixed
- Custom-symbol rules are enforced by the Rust backend instead of relying on the HTML `maxlength` alone; inputs over 40 characters and alphanumeric, whitespace, or control characters are rejected.
- Custom symbols are deduplicated before generation, and ambiguity exclusion applies to them consistently.
- Invalid/stale custom-symbol text is ignored when the symbol class is disabled instead of blocking unrelated generation modes.
- Clipboard command input is wrapped for best-effort zeroization across success and early-error paths.
- Clipboard auto-clear accepts only the documented `0`, `15`, `30`, `60`, and `120` second values at the IPC boundary.
- Mobile batch export now detects a destination/provider that fails to preserve the requested text instead of presenting a false-success status.

### Security
- Credential generation remains offline-first and uses operating-system cryptographic randomness on all native targets.
- Generated credentials are not intentionally persisted by application code.
- Clipboard clearing remains conditional so a newer clipboard value is not erased accidentally.
- Mobile development-network exposure is limited to the explicit Tauri/Vite development path and is not part of production generation.
- Android/iOS generated projects, signing credentials, and store credentials remain outside committed application source/secrets.
- Tauri capability, CSP, dependency-policy, CodeQL, release-version integrity, platform-integrity, export-readback, and secret-handling controls remain part of the release gate.

> v2.7.4 is the active cross-platform release candidate. Do not describe it as fully cross-platform verified until the exact final candidate passes Windows, macOS, Linux, Android, iOS, CodeQL, package/signed-build, and manual smoke-test gates.

## [0.1.0] - Unreleased preview

Initial public-preview implementation checkpoint. It was superseded by the v2.7.4 release-candidate line before being declared stable.
