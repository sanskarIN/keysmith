# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `0.1.0-rc`
Current milestone: Phase 4 / release-candidate verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Verification branch: `verify/0.1.0-rc`
Pull request: `#1` — `ci: verify KeySmith 0.1.0 release candidate`
Required commit email: `sanskarin@outlook.in`

This file is the canonical continuation ledger. Read it before changing the repository.

## Implemented scope

### Architecture

- Rust 2024 workspace with framework-independent `keysmith-core`.
- Tauri 2 desktop adapter and Vanilla TypeScript/Vite UI.
- Windows, macOS, and Linux packaging configuration.
- Apache-2.0 license and public/open-source repository metadata.
- Domain generation logic separated from desktop IPC and presentation code.
- ADRs under `docs/adr/`.

### Password generation

- Operating-system CSPRNG through `getrandom`.
- Unbiased bounded random selection using rejection sampling.
- Secure shuffle using the same unbiased random source.
- Password length validation from 4 through 128 characters.
- Lowercase, uppercase, digit, symbol, custom-symbol, and ambiguity-exclusion controls.
- At least one character from every enabled class.
- Batch generation from 1 through 500 passwords.
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.

### Passphrases and strength

- EFF large Diceware list through `eff-wordlist`.
- 3–12 word selection.
- Separator validation, optional capitalization, and optional numeric suffix.
- Selection-space entropy estimate.
- zxcvbn strength scoring and guess estimates.
- Word-list source documented in `docs/wordlists.md`.

### Clipboard and export

- Explicit clipboard copy command through Rust/Tauri.
- Configurable conditional auto-clear.
- Auto-clear erases only when the clipboard still contains the copied secret.
- Manual clear action.
- Clipboard input size limit.
- Clipboard secret input is now guarded by `Zeroizing<String>` so early clipboard-construction or write errors cannot bypass zeroization of the command-owned secret buffer.
- Auto-clear comparison buffer is also guarded by `Zeroizing<String>`.
- Batch export is explicit plaintext and includes an in-product warning plus warning header.

### UI/UX

- Responsive desktop layout and reusable design tokens.
- Password, Passphrase, and Batch modes.
- Live strength presentation.
- Light, dark, and system themes.
- First-run onboarding stored only as a non-secret local preference.
- Settings for appearance, privacy/data, accessibility, updates, and onboarding help.
- About surface with version, Apache-2.0, support/business contacts, GitHub, Buy Me a Coffee, and `Made by the Sanskar`.
- Keyboard tab navigation, skip link, visible focus, semantic controls, aria-live status, reduced-motion support, touch-friendly targets, and non-color-only status text.
- Editable SVG branding plus native PNG/ICO/ICNS icons.

### Privacy and security

- No account requirement.
- No telemetry or analytics.
- No password history.
- No generation-time network dependency.
- Restrictive Tauri CSP and explicit capabilities.
- Typed core errors with user-safe IPC error messages.
- Threat model covers assets, trust boundaries, abuse cases, mitigations, and residual risks.
- `.env.example` contains placeholders only.
- `deny.toml`, CodeQL, dependency automation, npm audit, and repository secret scanning are configured.
- Structured frontend diagnostic logging is redacted and does not accept generated secret values.

## Automated tests present

### Rust

- Security invariants for required character classes, ambiguity exclusion, batch limits, and passphrase behavior.
- Property tests for generated length and character-set invariants.
- Validation tests for unsupported lengths, missing character sets, custom symbols, ambiguity-filter exhaustion, unsafe passphrase separators, and invalid word counts.

### TypeScript

- Preference persistence and safe fallbacks.
- Onboarding state.
- API invocation mapping and failure normalization.
- Batch export formatting/warning behavior.
- Structured logging/redaction behavior.

## GitHub automation

- `.github/workflows/ci.yml`
  - npm dependency resolution and high-severity audit,
  - repository secret scan,
  - TypeScript typecheck,
  - ESLint,
  - deterministic text-hygiene check,
  - frontend tests,
  - frontend production build,
  - Rust format, Clippy, tests, lockfile generation, cargo-deny,
  - Tauri `cargo check` on Ubuntu, Windows, and macOS,
  - temporary lockfile artifacts for verified dependency resolution.
- `.github/workflows/codeql.yml`
  - JavaScript/TypeScript and Rust analysis with explicit Rust core build.
- `.github/workflows/release.yml`
  - tag-triggered cross-platform draft release builds.
- Dependabot for Cargo, npm, and GitHub Actions.
- Structured issue forms, pull-request template, funding configuration, and governance guidance.

## Documentation set

Repository documentation includes `README.md`, `LICENSE`, `NOTICE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `PRIVACY.md`, `THREAT_MODEL.md`, `CHANGELOG.md`, `ROADMAP.md`, this file, architecture/setup/development/testing/release/troubleshooting/accessibility/performance/GitHub/word-list/logging/verification docs, ADRs, and a release template.

## Release-candidate work completed on PR #1

The verification branch contains iterative CI/security/test/documentation fixes rather than hiding failed attempts. Important work includes:

- consolidated and hardened CI,
- added npm audit and secret scanning,
- added lockfile artifact generation,
- hardened CodeQL Rust analysis,
- removed redundant legacy Rust workflow,
- corrected Rust dependency/package naming and formatting issues,
- expanded Rust validation/security/property tests,
- expanded TypeScript API/export/logging tests,
- added redacted structured diagnostics,
- aligned contributor and verification documentation with the actual quality gate,
- hardened clipboard secret zeroization on all command return paths.

Newest security fix commits:

- `49358e95` — `fix: zeroize clipboard secrets on every return path`
- `b9502874` — `fix: pass owned clipboard text to arboard`

The second commit is a compile-compatibility follow-up preserving the zeroization guard while passing an owned `String` to `arboard`.

## Current verification status

PR #1 is open and mergeable. The latest CI/CodeQL runs were queued/pending when this handoff was updated. Do not mark `0.1.0` stable until the newest branch commit is green; older green runs are not sufficient after a security-sensitive change.

Required automated evidence on the same release-candidate commit:

1. frontend dependency audit
2. secret scan
3. TypeScript typecheck
4. frontend lint
5. text hygiene
6. frontend unit tests
7. frontend production build
8. Rust formatting
9. Rust Clippy with warnings denied
10. Rust tests/property tests
11. cargo-deny
12. Tauri cargo check on Linux
13. Tauri cargo check on Windows
14. Tauri cargo check on macOS
15. CodeQL JavaScript/TypeScript
16. CodeQL Rust

Required release evidence after automated checks:

- package/build KeySmith on Windows, macOS, and Linux,
- smoke-test password, passphrase, batch, export, clipboard, onboarding, settings, themes, and About flows,
- perform keyboard/accessibility and 200% scaling review,
- verify reduced-motion behavior,
- confirm no unexpected network request/telemetry/password history,
- capture real screenshots from verified builds,
- commit verified lockfiles if produced by trusted clean resolution,
- enable `main` protection using the proven check names,
- finalize the changelog date,
- create `v0.1.0` only after all blocking evidence is green.

## Commands/checks represented by CI

```bash
npm install
npm audit --audit-level=high
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo generate-lockfile
cargo check -p keysmith --all-targets
```

Cargo dependency policy and CodeQL are also enforced through GitHub Actions.

## Known limitations / deliberate design decisions

- KeySmith is a generator, not a password manager; no password vault/history is planned.
- No cloud synchronization or telemetry is planned.
- Batch exports are plaintext by design and warn the user.
- Clipboard managers and other processes can observe clipboard content before clearing; auto-clear cannot provide OS-wide secrecy.
- No silent automatic update check is implemented because offline-by-default behavior is intentional.
- Real screenshots must come from verified packaged builds; placeholders are not represented as real captures.
- Signing/notarization requires external platform credentials and must not be faked or committed.

## Next exact tasks

1. Inspect CI and CodeQL results for the latest verification-branch commit.
2. For every failure, read the failing step/job log, fix the root cause, and add regression coverage where behavior changed.
3. Repeat until all automated jobs are green on one commit.
4. Retrieve and commit clean generated lockfiles when verification establishes them.
5. Build packaged apps on all three target operating systems and execute `docs/verification.md`.
6. Capture real screenshots from the verified builds and update README/release notes.
7. Enable branch protection with the actual successful check names.
8. Finalize `CHANGELOG.md` and this handoff, merge PR #1, then create `v0.1.0` and verify draft release artifacts.

## Migration notes

There is no credential database and therefore no secret-data migration. Non-secret local preferences currently include:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Future preference schema changes must preserve safe defaults and must never become a generated-secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 is an offline-first desktop password and passphrase generator with OS-backed cryptographic randomness, EFF Diceware passphrases, zxcvbn strength estimates, password-policy presets, batch generation, guarded plaintext export, conditional clipboard auto-clear, onboarding, privacy/accessibility/settings surfaces, cross-platform Tauri packaging, security documentation, and automated quality/security workflows.

No account, telemetry, cloud sync, or password-history service is included.

## Commit identity

Project-maintainer commits must use `Sanskar <sanskarin@outlook.in>`.
