# Changelog

All notable changes follow a Keep a Changelog style and Semantic Versioning.

## [Unreleased]

### Added
- Rust core with OS-backed cryptographic password generation and policy validation.
- EFF large-wordlist passphrase generation.
- zxcvbn strength estimates for single-password and passphrase views.
- Batch generation up to 500 items with warning-bearing plaintext export.
- Dedicated bounded Rust batch-export command using the operating system's native save dialog.
- Tauri desktop shell with explicit clipboard copy/manual clear and conditional auto-clear.
- Single replaceable/cancellable clipboard auto-clear worker with Rust IPC validation for supported delay values.
- Exact frontend and Tauri capability allowlists for GitHub, funding, support, and business external destinations.
- Responsive accessible TypeScript UI with light/dark/system themes.
- English-first internationalization architecture with externalized static/runtime copy, localized preset metadata, localized strength labels, and tested fallback behavior.
- Real-markup frontend integration coverage for password, passphrase, batch, clipboard, native export, native About link, keyboard navigation, and stale-result behavior.
- Static accessibility regression tests for IDs, labels, tabs/panels, button names, and dialog labelling.
- Automated primary-button contrast regression coverage for light and dark design tokens.
- Static Tauri security-configuration regression coverage for global-bridge state, explicit capabilities, unused-command stripping, custom permissions, and absence of `core:default`.
- External-link configuration drift tests that keep About markup, frontend allowlist, and native opener scope synchronized.
- Release-version consistency tests across npm, Cargo, Tauri configuration, and visible UI metadata.
- Security, privacy, architecture, testing, release, localization, contribution, and architecture-decision documentation.
- GitHub CI, CodeQL, dependency update, issue, pull-request, funding, and release automation configuration.

### Changed
- The frontend now imports the bundled `@tauri-apps/api/core` module; the global `window.__TAURI__` bridge is disabled.
- The main Tauri capability no longer grants `core:default`; only explicit KeySmith generation, clipboard, export, and exactly scoped opener permissions remain.
- Tauri production configuration explicitly enables only `main-capability` and removes commands not allowed by ACL.
- Clipboard input handling permits the complete documented `500 × 128` batch while retaining a 65,536-character upper bound.
- Clipboard auto-clear duration is validated in Rust and accepts only `Never`, 15 seconds, 30 seconds, 1 minute, or 2 minutes.
- A newer clipboard copy replaces the prior pending clear schedule; choosing `Never` or manually clearing cancels it.
- Persisted clipboard-clear settings use strict numeric parsing; malformed values fall back to the 30-second privacy-oriented default rather than being partially parsed.
- Security-sensitive custom-symbol validation is enforced by the Rust core rather than relying on HTML constraints.
- Repeated custom symbol candidates are deduplicated so duplicates do not increase their selection probability.
- Batch IPC responses contain only generated secrets; zxcvbn scoring is skipped for batch items because the Batch UI does not display per-item strength.
- Browser blob/download export was replaced by a bounded Rust-owned native save flow without generic frontend filesystem-write permission.
- About/contact links now open through the operating-system opener with an exact two-layer allowlist.
- Structured diagnostic redaction covers additional credential, API-key, session, and private-key field names.
- Repository maintenance scripts are included in ESLint.
- Text hygiene and secret scanning include `.env.example` and lockfiles when present.
- CodeQL Rust analysis builds the complete Rust workspace instead of only `keysmith-core`.
- Tauri desktop code is checked and linted with warnings denied on Linux, Windows, and macOS CI.
- Tag-triggered release builds are gated by a version-matching `Verify release tag` preflight and frontend/core quality checks.

### Fixed
- Clipboard secret buffers are wrapped in zeroizing guards so early error returns clear application-owned copies where practical.
- Recopying the same secret with a newer clipboard policy no longer leaves an older timer able to clear the value prematurely.
- Unsupported clipboard auto-clear IPC values are rejected instead of being silently clamped.
- Invalid custom-symbol input no longer blocks generation when the symbol character set is disabled.
- Duplicate custom symbols no longer bias random symbol selection.
- A generation result that completes after the user switches modes can no longer overwrite the active mode's output/status.
- A native export result that returns after the Batch view is no longer current cannot restore stale Batch status/actions.
- Localized trust-list markup no longer inherits success styling intended only for check icons.
- Light-theme primary-button foreground/background tokens meet the WCAG AA 4.5:1 normal-text contrast target while preserving the dark-theme contrast pairing.
- Tauri debug-mode detection now treats only the literal `TAURI_ENV_DEBUG=true` as debug, preventing string values such as `false` from disabling production minification.

## [0.1.0] - TBD

Initial public preview release. The release date will be set only after verified lockfiles, same-commit CI/CodeQL, packaged application verification on all primary platforms, real screenshots, release governance, and draft artifact inspection are complete.
