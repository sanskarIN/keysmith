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
- English-first internationalization architecture with externalized static/runtime copy, localized preset metadata, localized strength labels, and tested fallback behavior.
- Browser-level frontend integration coverage using the real `index.html` with a mocked narrow Tauri bridge.
- Security, privacy, architecture, testing, release, localization, and contribution documentation.
- GitHub CI, CodeQL, dependency update, issue, pull-request, and release automation configuration.

### Changed
- Clipboard input handling now permits the complete documented 500 × 128-character batch while retaining an explicit upper bound.
- Clipboard auto-clear settings normalize unsupported writes back to the 30-second privacy-oriented default.
- Structured diagnostic redaction covers additional credential, API-key, session, and private-key field names.
- Security-sensitive custom-symbol validation is enforced by the Rust core rather than relying on HTML constraints.

### Fixed
- Clipboard secret buffers are wrapped in zeroizing guards so early error returns still clear the application-owned copy where practical.
- Invalid custom-symbol input no longer blocks generation when the symbol character set is disabled.

## [0.1.0] - TBD

Initial public preview release. Release date will be set only after clean multi-platform CI and release-candidate verification.
