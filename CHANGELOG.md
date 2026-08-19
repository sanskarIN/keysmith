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
- First-run onboarding plus complete Settings and About surfaces.
- Security, privacy, architecture, testing, release, contribution, user, maintainer, frontend, desktop-bridge, core-API, and file-by-file repository documentation.
- Canonical documentation portal and repository inventory covering every committed project file, including native icon assets and GitHub automation.
- Additional Rust security regression tests for empty character policies, ambiguity-filtered custom symbols, batch bounds, passphrase word-count bounds, and separator validation.
- GitHub CI, CodeQL, dependency update, issue, pull-request, and release automation configuration.

### Fixed

- Standalone Rust GitHub Actions workflow now scopes build/test work to `keysmith-core` instead of attempting a full Linux Tauri workspace build without the native desktop libraries installed by the main cross-platform CI matrix.

## [0.1.0] - TBD

Initial public preview release. Release date will be set only after clean multi-platform CI and release-candidate verification.
