# Changelog

All notable changes follow a Keep a Changelog style and Semantic Versioning.

## [Unreleased]

### Verification
- Complete the v2.7.4 pull-request quality matrix, CodeQL analysis, platform packaging, installer smoke tests, accessibility review, and signed-release checks before tagging the release.

## [2.7.4] - 2026-08-20

### Added
- Rust core with OS-backed cryptographic password generation and policy validation.
- EFF large-wordlist passphrase generation.
- zxcvbn strength estimates.
- Batch generation and guarded plaintext export.
- Tauri desktop shell with clipboard copy/conditional auto-clear.
- Responsive accessible TypeScript UI with light/dark/system themes.
- First-run onboarding and complete privacy, accessibility, update, and help settings surfaces.
- Native application icons for supported desktop packaging targets.
- Security, privacy, architecture, testing, release, accessibility, performance, troubleshooting, word-list, and contribution documentation.
- GitHub CI, CodeQL, dependency update, issue, pull-request, and release automation configuration.
- Deterministic release-version consistency checks across frontend, Rust workspace, Tauri bundle metadata, visible UI labels, and release tags.
- Desktop-adapter unit coverage for supported clipboard clear durations.

### Changed
- Frontend package, Rust workspace, Tauri bundle metadata, and visible application version labels now identify v2.7.4 consistently.
- CI now checks version consistency and treats desktop-adapter Clippy warnings as errors.
- CI now runs desktop-adapter library tests on Windows, macOS, and Linux in addition to Tauri compilation checks.
- Release verification is tracked explicitly as a release-candidate gate instead of being implied by version metadata.

### Fixed
- Custom-symbol rules are now enforced by the Rust backend instead of relying on the HTML `maxlength` alone; inputs over 40 characters and alphanumeric, whitespace, or control characters are rejected.
- Custom symbols are deduplicated before generation, and ambiguity exclusion applies to them consistently.
- Invalid/stale custom-symbol text is ignored when the symbol class is disabled instead of blocking unrelated generation modes.
- Clipboard command input is wrapped for best-effort zeroization across success and early-error paths.
- Clipboard auto-clear now accepts only the documented `0`, `15`, `30`, `60`, and `120` second values at the IPC boundary instead of silently accepting arbitrary timer values.

### Security
- Credential generation remains offline-first and uses operating-system cryptographic randomness.
- Generated credentials are not intentionally persisted by application code.
- Clipboard clearing remains conditional so a newer clipboard value is not erased accidentally.
- Tauri capability, CSP, dependency-policy, CodeQL, release-version integrity, and secret-handling controls remain part of the release gate.

> v2.7.4 is the active release-candidate version. Do not create the final `v2.7.4` tag until all required CI, CodeQL, package-build, and manual release checks are green.

## [0.1.0] - Unreleased preview

Initial public-preview implementation checkpoint. It was superseded by the v2.7.4 release-candidate line before being declared stable.
