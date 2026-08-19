# KeySmith Documentation

This directory is the maintained documentation portal for the KeySmith desktop password/passphrase generator. It covers end-user behavior, secure implementation boundaries, testing, release verification, accessibility, localization, logging, performance, and repository operations.

## Start here

- [`user-guide.md`](user-guide.md) — complete product behavior, generator modes, presets, clipboard, export, themes, settings, safety, and privacy expectations.
- [`architecture.md`](architecture.md) — system architecture, trust boundaries, native/frontend ownership, and protected data flows.
- [`verification.md`](verification.md) — release-candidate verification checklist for actual packaged desktop builds.
- [`repository-reference.md`](repository-reference.md) — canonical file-by-file inventory of every Git-tracked project file.

## Security-sensitive implementation

- [`core-api.md`](core-api.md) — Rust generation core, validation rules, OS randomness, passphrases, strength estimates, errors, and tests.
- [`desktop-bridge.md`](desktop-bridge.md) — Tauri commands, native batch save, clipboard worker, capabilities, opener allowlist, CSP, and native privilege model.
- [`frontend.md`](frontend.md) — TypeScript application state, IPC wrapper, stale-result protection, export construction, external-link allowlist, preferences, and integration tests.
- [`logging.md`](logging.md) — safe structured diagnostic-data redaction policy.
- [`wordlists.md`](wordlists.md) — EFF large Diceware word-list source and entropy/selection model.
- Root [`THREAT_MODEL.md`](../THREAT_MODEL.md) — threats, assets, mitigations, and residual risks.
- Root [`SECURITY.md`](../SECURITY.md) — vulnerability reporting and security policy.
- Root [`PRIVACY.md`](../PRIVACY.md) — runtime data-handling commitments.

## Frontend and accessibility

- [`accessibility.md`](accessibility.md) — accessibility behavior, regression coverage, and manual verification requirements.
- [`i18n.md`](i18n.md) — English-first localization architecture, translation boundaries, preset/strength localization, and tests.
- [`performance.md`](performance.md) — performance budgets and security-preserving measurement rules.

## Development and maintenance

- [`setup.md`](setup.md) — Windows, macOS, and Linux development prerequisites.
- [`development.md`](development.md) — day-to-day development rules and secure cross-layer change procedures.
- [`testing.md`](testing.md) — automated, security, desktop, dependency, CodeQL, and manual testing strategy.
- [`troubleshooting.md`](troubleshooting.md) — layer-by-layer diagnosis for frontend, Rust, Tauri, clipboard, export, CI, and packaging problems.
- [`maintainer-guide.md`](maintainer-guide.md) — maintainer workflow, dependency/version/documentation gates, CI ownership, PR/release discipline, and handoff requirements.
- [`github.md`](github.md) — branch protection, pull requests, Actions permissions, dependency automation, and release governance.
- [`release.md`](release.md) — clean candidate, version synchronization, lockfiles, signing/notarization, tagging, packaging, smoke testing, and publication.
- Root [`CONTRIBUTING.md`](../CONTRIBUTING.md) — contributor requirements.
- Root [`what_changed.md`](../what_changed.md) — canonical active development/verification handoff ledger.

## Architecture decisions

- [`adr/0001-rust-core-tauri-ui.md`](adr/0001-rust-core-tauri-ui.md) — framework-independent Rust security core behind a Tauri/TypeScript desktop UI.
- [`adr/0002-os-csprng-and-no-secret-storage.md`](adr/0002-os-csprng-and-no-secret-storage.md) — OS cryptographic randomness and no intentional generated-secret history.
- [`adr/0003-frontend-localization-boundary.md`](adr/0003-frontend-localization-boundary.md) — localization ownership and typed/static-copy boundary.
- [`adr/0004-native-desktop-boundaries.md`](adr/0004-native-desktop-boundaries.md) — native save/clipboard/external-opener authority and least-privilege desktop boundary.

## Documentation rules

Documentation describes implemented behavior, not intended future behavior. A code/configuration change that alters a public contract, validation rule, Tauri command, capability/permission, native side effect, persistent preference, localization rule, release check, platform prerequisite, or security/privacy guarantee must update the relevant documentation in the same pull request.

`docs/repository-reference.md` is the completeness source of truth. `npm run docs:check` compares it with `git ls-files`; CI fails if any tracked project file is missing from the inventory.

## Security-review trigger files

Changes to these areas require explicit security/privacy documentation review:

- `crates/keysmith-core/src/random.rs`
- `crates/keysmith-core/src/generator.rs`
- `crates/keysmith-core/src/passphrase.rs`
- `crates/keysmith-core/src/policy.rs`
- `src-tauri/src/commands.rs`
- `src-tauri/src/export.rs`
- `src-tauri/capabilities/default.json`
- `src-tauri/permissions/keysmith.toml`
- `src/external-links.ts`
- `src/storage.ts`
- `src/logging.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/release.yml`
- `THREAT_MODEL.md`
- `PRIVACY.md`

Generated credentials, exported batches, clipboard contents, filesystem destinations, private keys, tokens, or real user secrets must never be copied into documentation, logs, screenshots, test fixtures, issues, or release notes.
