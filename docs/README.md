# KeySmith Documentation

This directory is the maintained technical and operational documentation set for KeySmith. Start here when you are reviewing the repository, onboarding as a contributor, auditing security-sensitive behavior, or preparing a release.

## Documentation map

### Product and user documentation

- [`user-guide.md`](user-guide.md) — generator modes, options, presets, clipboard behavior, batch export, settings, and safety guidance.
- [`accessibility.md`](accessibility.md) — keyboard, focus, semantics, motion, contrast, and manual accessibility checks.
- [`troubleshooting.md`](troubleshooting.md) — common development, desktop, clipboard, build, and platform problems.

### Architecture and implementation

- [`architecture.md`](architecture.md) — high-level trust boundaries and component responsibilities.
- [`core-api.md`](core-api.md) — Rust core modules, public API contracts, validation rules, randomness model, entropy estimates, and error semantics.
- [`desktop-bridge.md`](desktop-bridge.md) — Tauri command surface, capabilities, clipboard lifecycle, CSP, and desktop bundle configuration.
- [`frontend.md`](frontend.md) — TypeScript state, DOM/event model, local preference storage, theming, export flow, and UI assets.
- [`repository-reference.md`](repository-reference.md) — file-by-file repository inventory. Every committed project file is accounted for, including CI/configuration files and native icon assets.
- [`adr/`](adr/) — architecture decision records.

### Development and quality

- [`setup.md`](setup.md) — platform prerequisites and first development run.
- [`development.md`](development.md) — development workflow and change discipline.
- [`testing.md`](testing.md) — Rust, TypeScript, desktop, security, and manual test expectations.
- [`performance.md`](performance.md) — performance goals and measurement guidance.
- [`wordlists.md`](wordlists.md) — EFF large Diceware word-list source and selection model.
- [`maintainer-guide.md`](maintainer-guide.md) — dependency maintenance, CI ownership, documentation update rules, and release-candidate workflow.

### Project operations

- [`github.md`](github.md) — repository governance and branch-protection guidance.
- [`release.md`](release.md) — versioning, cross-platform packaging, verification, and release process.
- Root [`SECURITY.md`](../SECURITY.md) — vulnerability reporting policy.
- Root [`THREAT_MODEL.md`](../THREAT_MODEL.md) — assets, attackers, trust boundaries, mitigations, and residual risk.
- Root [`PRIVACY.md`](../PRIVACY.md) — product privacy commitments.
- Root [`CONTRIBUTING.md`](../CONTRIBUTING.md) — contributor requirements.
- Root [`what_changed.md`](../what_changed.md) — canonical continuation and verification ledger.

## Documentation rules

Documentation must describe the repository that actually exists, not intended future behavior. When a code or configuration change alters a public contract, security boundary, stored preference, command, build step, platform requirement, or release behavior, update the corresponding documentation in the same change.

The file inventory in [`repository-reference.md`](repository-reference.md) is the completeness checklist. A new committed file should be added there before the change is considered fully documented.

## Security-sensitive documentation

Changes to any of the following require an explicit documentation review:

- `crates/keysmith-core/src/random.rs`
- `crates/keysmith-core/src/generator.rs`
- `crates/keysmith-core/src/passphrase.rs`
- `src-tauri/src/commands.rs`
- `src-tauri/capabilities/default.json`
- `src-tauri/permissions/keysmith.toml`
- `src/storage.ts`
- `THREAT_MODEL.md`
- `PRIVACY.md`
- release and dependency-policy workflows

Generated passwords, passphrases, batch values, or clipboard contents must never be copied into documentation, test fixtures, logs, screenshots, issue templates, or release notes as real credentials.
