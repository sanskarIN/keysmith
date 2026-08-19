# Changelog

All notable changes follow a Keep a Changelog style and Semantic Versioning.

## [Unreleased]

### Added
- Rust core with OS-backed cryptographic password generation and policy validation.
- EFF large-wordlist passphrase generation.
- zxcvbn strength estimates.
- Batch generation and guarded plaintext export.
- Tauri desktop shell with clipboard copy/conditional auto-clear.
- Responsive accessible TypeScript UI with light/dark/system themes.
- Security, privacy, architecture, testing, verification, release, repository-reference, and contribution documentation.
- GitHub CI, CodeQL, dependency update, issue, pull-request, and release automation configuration.
- Desktop-adapter regression tests for clipboard command boundaries.

### Fixed
- Corrected the Cargo package name for the EFF word-list dependency so clean dependency resolution can find `eff-wordlist`.
- Preserved secret-buffer zeroization on clipboard command error paths and rejected unsupported auto-clear values at the native command boundary.
- Raised the guarded clipboard payload ceiling to support copying the maximum valid 500-by-128-character batch.
- Rejected unsupported clipboard-clear preference writes in the frontend persistence layer.
- Kept password-policy controls visible in Batch mode so the generated batch can be configured directly.
- Removed an obsolete duplicate Rust workflow that did not install Tauri's Linux system dependencies.
- Added workflow concurrency cancellation so superseded pull-request verification runs do not consume unnecessary runners.

## [0.1.0] - TBD

Initial public preview release. Release date will be set only after clean multi-platform CI and release-candidate verification.
