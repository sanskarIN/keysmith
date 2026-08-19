# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `0.1.0`
Current milestone: Phase 4 / release-candidate verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Required commit email: `sanskarin@outlook.in`

This file is the canonical continuation ledger for future KeySmith work. Read it before changing the repository.

## Scope implemented

### Repository and architecture

- Rust 2024 workspace with a framework-independent `keysmith-core` crate.
- Tauri 2 desktop adapter and Vanilla TypeScript/Vite presentation layer.
- Windows, macOS, and Linux bundle configuration.
- Apache-2.0 license, NOTICE, public/open-source repository metadata, funding link, issue templates, pull-request template, Dependabot, CI, CodeQL, and release workflow.
- Strict secret-handling boundary: generated credentials are never intentionally persisted by application code.
- Architecture decisions recorded under `docs/adr/`.

### Password generation

- Operating-system CSPRNG through `getrandom`.
- Rejection sampling for unbiased bounded selection.
- Fisher-Yates-style secure shuffle backed by the same unbiased sampler.
- Length validation from 4 to 128 characters.
- Lowercase, uppercase, digit, and symbol controls.
- Optional custom symbols.
- Ambiguous-character exclusion.
- At least one character from every enabled class.
- Batch generation from 1 to 500 passwords.
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.

### Passphrases and strength

- EFF large Diceware list through `eff_wordlist`.
- 3–12 word selection.
- Separator validation, capitalization, and optional two-digit suffix.
- Selection-space entropy estimate.
- zxcvbn strength scoring and guess estimates.
- Word-list source and selection model documented in `docs/wordlists.md`.

### Clipboard and exports

- Explicit clipboard copy command through the Rust desktop adapter.
- Configurable auto-clear: never, 15 seconds, 30 seconds, 1 minute, or 2 minutes.
- Auto-clear checks that the clipboard still equals the copied value before erasing it.
- Explicit clear-now action.
- Clipboard command rejects oversized values.
- Secret buffers handled by the clipboard command are zeroized after use where practical.
- Batch export is explicit plaintext with an in-product warning and warning header in the exported file.

### UI/UX

- Responsive desktop layout and reusable design tokens.
- Password, Passphrase, and Batch tabs.
- Live strength presentation.
- Policy presets and safe defaults.
- Light, dark, and system themes.
- First-run onboarding with a locally stored non-secret completion flag.
- Settings surface covering appearance, privacy/data, accessibility, updates, and onboarding help.
- About surface with version, Apache-2.0, support/business contacts, GitHub, Buy Me a Coffee, and `Made by the Sanskar`.
- Keyboard tab navigation, skip link, visible focus, semantic fieldsets/labels, aria-live status, reduced-motion support, responsive touch targets, and non-color-only status text.
- Editable SVG logo plus native PNG/ICO/ICNS application icons.

### Privacy/security hardening

- No account requirement.
- No telemetry or analytics.
- No password history.
- No generation-time network dependency.
- Restrictive Tauri CSP.
- Explicit least-privilege Tauri capability and command permissions.
- Central typed core errors with user-safe messages.
- Threat model covers assets, trust boundaries, abuse cases, mitigations, and residual risks.
- `.env.example` contains no credentials.
- `deny.toml` provides Rust advisory/license/source policy.
- CodeQL and dependency update automation are configured.

## Tests added

### Rust

- `crates/keysmith-core/tests/security.rs`
  - required enabled classes are represented,
  - ambiguous-character exclusion,
  - batch-size limits,
  - passphrase word-count behavior.
- `crates/keysmith-core/tests/properties.rs`
  - generated length invariant across 4–128 characters,
  - digits-only output invariant.

### TypeScript

- `src/storage.test.ts`
  - privacy-oriented clipboard default,
  - supported clipboard duration persistence,
  - invalid stored duration fallback,
  - theme persistence,
  - first-run onboarding state persistence.

## Documentation present

- `README.md`
- `LICENSE`
- `NOTICE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `THREAT_MODEL.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/github.md`
- `docs/wordlists.md`
- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`
- `.github/RELEASE_TEMPLATE.md`

## GitHub automation present

- `.github/workflows/ci.yml`
  - frontend typecheck/lint/text-hygiene/tests/build,
  - Rust core format/clippy/tests,
  - Tauri `cargo check` on Ubuntu, Windows, and macOS,
  - cargo-deny dependency policy.
- `.github/workflows/codeql.yml`
  - JavaScript/TypeScript and Rust analysis.
- `.github/workflows/release.yml`
  - tag-triggered Windows/macOS/Linux draft release builds.
- `.github/dependabot.yml`
  - Cargo, npm, and GitHub Actions updates.
- structured bug/feature issue forms and issue routing.
- pull-request quality/security checklist.
- BMC funding configuration.

## Verification already performed in the coding environment

- Repository metadata and existing `LICENSE` were inspected before implementation.
- JSON and TOML files were syntax-parsed locally during construction.
- TypeScript core/frontend sources prior to the onboarding/settings additions passed a strict local `tsc --noEmit` invocation using the available compiler.
- Generated native icon files were created and checked as binary assets before being committed.
- Current Rust APIs for `getrandom`, `eff_wordlist`, and `zxcvbn` were checked against their published Rust documentation while implementing the core.

## Verification still required before calling 0.1.0 stable

The current execution environment does not provide a Rust toolchain and does not provide normal package-registry/network access to the local shell, so a clean local `cargo` build and dependency install could not be truthfully claimed here. GitHub Actions is configured to perform those checks from clean hosted runners.

Do not mark the release stable until all of these are observed green on the same release-candidate commit:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm test`
5. `npm run build`
6. `cargo fmt --all -- --check`
7. `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
8. `cargo test -p keysmith-core --all-features`
9. `cargo check -p keysmith --all-targets` on Windows, macOS, and Linux
10. cargo-deny policy
11. CodeQL analysis
12. `npm run tauri build` on release platforms
13. manual smoke testing of generated installers/apps
14. keyboard/accessibility manual review
15. real release screenshots captured from the verified build

## Known limitations / non-blocking design decisions

- No password history or vault is implemented by design; KeySmith is a generator, not a password manager.
- No cloud synchronization or telemetry is planned.
- Batch exports are plaintext by design and intentionally warn the user.
- Clipboard security depends on the operating system; other processes or clipboard managers can observe clipboard contents before a clear operation.
- No silent automatic update check is implemented because the app is offline by default. Releases are distributed through the repository release process.
- Lockfiles could not be generated in the local shell without package-registry access; the clean CI jobs are the next authoritative dependency-resolution check. Commit lockfiles once generated from a trusted clean build.
- Real screenshots are intentionally deferred until the UI can be launched from a verified release candidate; the README does not pretend placeholders are real captures.
- Branch protection is not enabled yet. `docs/github.md` describes the recommended rule set to enable after the first green CI run establishes valid required-check names.

## Next exact tasks

1. Create a verification branch from the current `main` commit and open a pull request so PR-triggered CI can be inspected through the connected GitHub tooling.
2. Read every failed CI job log, fix the root cause, and add a regression test when behavior is affected.
3. Repeat until the full PR quality matrix and CodeQL are green.
4. Commit generated `Cargo.lock` and `package-lock.json` from the clean verified dependency resolution if the CI/tooling produces suitable lockfiles.
5. Run/package Tauri release builds on Windows, macOS, and Linux.
6. Smoke-test generation, passphrases, batch export, clipboard auto-clear, onboarding, settings, themes, and About links from packaged apps.
7. Capture real screenshots and replace the README screenshot note.
8. Enable `main` branch protection using the proven check names.
9. Set the `0.1.0` release date in `CHANGELOG.md`, update this ledger, tag `v0.1.0`, and let the release workflow create the draft artifacts.

## Migration notes

There is no credential database and therefore no secret-data migration. Non-secret local preferences currently use these keys:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Future preference schema changes must preserve safe defaults and must never turn this storage into a secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 introduces an offline-first desktop password and passphrase generator with OS-backed cryptographic randomness, EFF Diceware passphrases, zxcvbn strength estimates, policy presets, batch generation, guarded plaintext export, conditional clipboard auto-clear, first-run onboarding, complete privacy/accessibility/settings surfaces, cross-platform Tauri packaging configuration, security documentation, and automated quality/security workflows.

No account, telemetry, cloud sync, or password-history service is included.

## Recent meaningful commits

- `c62ac0c` — `feat: add native platform application icons`
- `02131d5e` — `test: cover onboarding preference state`
- `c64aba7e` — `feat: wire onboarding and settings behavior`
- `d9687efa` — `feat: add onboarding and complete settings surfaces`
- `629640f9` — `feat: persist first-run onboarding state`
- `c1352a11` — `docs: add release notes template`
- `3846bc7a` — `docs: document passphrase word-list source`
- `d18d2455` — `docs: add GitHub governance guidance`
- `862c2290` — `build: make format gate deterministic in CI`
- `eedb7856` — `build: add deterministic text format check`
- `82afd3bd` — `fix: correct Tauri environment prefix matching`
- `eee83872` — `fix: keep preset serialization output-only`
- `ccc0529c` — `fix: avoid unnecessary static deserialization`
- `767e9653` — `build: keep strict clippy gate actionable`
- `00cc46c7` — `ci: add multi-platform quality pipeline`
- `06b220f5` — `ci: add CodeQL security analysis`
- `686f7558` — `ci: add cross-platform release workflow`
- `a6657ba0` — `feat: implement cryptographically secure password generation`
- `7b69f047` — `feat: add EFF wordlist passphrase generation`
- `7777fbe6` — `feat: add zxcvbn password strength estimates`

## Commit identity

GitHub commits created during this implementation are attributed to `Sanskar <sanskarin@outlook.in>` by the connected repository identity. Continue using that email for project-maintainer commits.
