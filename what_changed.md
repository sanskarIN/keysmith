# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `0.1.0-rc`
Current milestone: Phase 4 / release-candidate verification and hardening
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Verification branch: `verify/0.1.0-rc`
Pull request: `#1` — `ci: verify KeySmith 0.1.0 release candidate`
Required commit email: `sanskarin@outlook.in`

This file is the canonical continuation ledger. Read it before changing the repository. Do not call `0.1.0` stable until the exact candidate commit has passed the automated and packaged-application gates recorded below.

## Current implementation

### Repository and architecture

- Rust 2024 workspace with a framework-independent `keysmith-core` crate.
- Tauri 2 desktop adapter and Vanilla TypeScript/Vite presentation layer.
- Windows, macOS, and Linux packaging configuration.
- Apache-2.0 license, NOTICE, public/open-source repository metadata, support/funding metadata, issue forms, PR template, Dependabot, CI, CodeQL, and release workflow.
- Domain generation logic is isolated from Tauri IPC and presentation code.
- Security-sensitive validation is enforced in Rust rather than trusting HTML/webview constraints.
- Architecture decisions are documented under `docs/adr/`, including the Rust/Tauri boundary, OS-CSPRNG/no-secret-storage decision, and frontend localization boundary.

### Password generation

- Operating-system CSPRNG through `getrandom`.
- Unbiased bounded random selection using rejection sampling.
- Secure Fisher-Yates-style shuffle using the same unbiased source.
- Password length validation from 4 through 128 characters.
- Lowercase, uppercase, digit, symbol, custom-symbol, and ambiguity-exclusion controls.
- At least one character from every enabled class.
- Batch generation from 1 through 500 passwords.
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.
- Custom-symbol validation is enforced in the Rust core:
  - maximum 40 characters,
  - no control characters,
  - no whitespace,
  - invalid custom-symbol content is ignored when the symbol class itself is disabled because it is then irrelevant to generation.

### Passphrases and strength

- EFF large Diceware list through `eff-wordlist`.
- 3–12 word selection.
- Separator validation, optional capitalization, and optional two-digit suffix.
- Selection-space entropy estimate.
- zxcvbn strength scoring and guess estimates.
- Word-list source and security model documented in `docs/wordlists.md`.
- Frontend strength display maps stable zxcvbn scores to localized labels and preserves the backend label as a fallback for an unknown future score.

### Clipboard and export

- Explicit clipboard copy command through Rust/Tauri.
- Configurable conditional auto-clear: never, 15 seconds, 30 seconds, 1 minute, or 2 minutes.
- Auto-clear erases only when the clipboard still equals the copied secret.
- Manual clear action.
- Clipboard command wraps application-owned secret buffers in `Zeroizing<String>`, including early error paths and the delayed comparison copy where practical.
- Clipboard payload is bounded at 65,536 characters. This is large enough for the documented maximum batch of 500 passwords × 128 characters plus separators while still preventing unbounded IPC clipboard payloads.
- Unsupported clipboard-clear preference writes are normalized to the privacy-oriented 30-second default.
- Batch export is explicit plaintext and includes both an in-product warning and a warning header in the exported text file.

### UI/UX

- Responsive desktop layout and reusable design tokens.
- Password, Passphrase, and Batch modes.
- Live strength presentation.
- Policy preset selector and safe defaults.
- Light, dark, and system themes.
- First-run onboarding stored only as a non-secret local preference.
- Settings surface for appearance, privacy/data, accessibility, updates, and onboarding help.
- About surface with version, Apache-2.0, support/business contacts, GitHub, Buy Me a Coffee, and `Made by the Sanskar`.
- Keyboard tab navigation, roving tab focus, explicit `aria-controls`, skip link, visible focus, semantic controls, aria-live status, reduced-motion support, touch-friendly targets, and non-color-only status text.
- Mode switching synchronizes visual classes and the semantic `hidden` property.
- Editable SVG branding plus native PNG/ICO/ICNS icons.

### Internationalization readiness

English remains the only shipped locale for `0.1.0`, but the frontend no longer depends on scattered hard-coded interaction copy.

- `src/i18n/en.ts` contains the canonical English catalog and runtime formatters.
- `src/i18n/index.ts` applies translations to static markup using `data-i18n`, `data-i18n-title`, `data-i18n-aria-label`, and `data-i18n-placeholder`.
- Unknown static translation keys preserve readable HTML fallback text rather than becoming blank.
- `src/i18n/presets.ts` maps stable built-in preset IDs to localized names/descriptions and preserves backend metadata for unknown future IDs.
- `src/i18n/strength.ts` maps score values `0..=4` to localized labels and preserves an unknown backend fallback.
- Runtime generation, clipboard, theme, preset, and entropy status copy now comes from the catalog.
- `docs/i18n.md` documents how another locale must be added without changing security-sensitive generation behavior.
- `docs/adr/0003-frontend-localization-boundary.md` records why localization stays in the presentation boundary.

### Privacy, logging, and security

- No account requirement.
- No telemetry or analytics.
- No password history.
- No generation-time network dependency.
- Restrictive Tauri CSP and explicit least-privilege capabilities.
- Typed core errors with user-safe IPC strings.
- `.env.example` contains no credentials.
- `deny.toml` provides advisory/license/source policy.
- Repository secret scanner and npm high-severity audit run in CI.
- CodeQL covers Rust and JavaScript/TypeScript.
- Structured frontend diagnostic redaction recursively covers common password/passphrase/secret/token/auth/cookie/email fields and now also credential, API-key, session, and private-key key variants.
- Threat model has been updated for IPC input validation, the maximum supported clipboard batch payload, preference normalization, and diagnostic redaction.

## Automated test coverage

### Rust core and desktop adapter

- Required enabled character classes are represented.
- Ambiguous-character exclusion.
- Batch-size limits.
- Passphrase word-count behavior.
- Property tests across supported password lengths.
- Restricted digits-only generation invariant.
- Invalid password lengths.
- Missing character sets.
- Exact custom-symbol policy behavior.
- Oversized/control/whitespace custom-symbol rejection.
- Invalid custom symbols ignored when symbols are disabled.
- Ambiguity filtering that empties a custom symbol pool.
- Invalid passphrase word counts and unsafe separators.
- Desktop clipboard limit accepts the largest supported batch text and rejects a value above the hard limit without requiring a real system clipboard.

### TypeScript unit and integration tests

- Clipboard preference default, supported persistence, invalid stored-value fallback, invalid write normalization, and non-integer write normalization.
- Theme persistence.
- Onboarding completion state.
- Tauri API command mapping and fail-closed behavior when the desktop bridge is unavailable.
- Deterministic batch export formatting and warning behavior.
- Structured diagnostic redaction and recursion-depth limiting.
- Expanded credential/API-key/session/private-key redaction.
- Static localization application for text/title/ARIA-label/placeholder attributes and unknown-key fallback.
- Localized built-in preset metadata and unknown-preset fallback.
- Localized zxcvbn score labels and unknown-score fallback.
- `src/app.integration.test.ts` loads the real `index.html` in jsdom, installs a narrow mocked Tauri bridge, waits for preset loading, verifies localized preset presentation, generates a fictional deterministic password result, copies it with the configured 30-second clear value, and exercises keyboard ArrowRight tab switching plus semantic panel visibility.

The jsdom integration test does not replace packaged-app smoke testing of real native clipboard/webview/installer behavior.

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
- `docs/logging.md`
- `docs/i18n.md`
- `docs/verification.md`
- `docs/wordlists.md`
- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`
- `docs/adr/0003-frontend-localization-boundary.md`
- `.github/RELEASE_TEMPLATE.md`

## GitHub automation

### CI — `.github/workflows/ci.yml`

Frontend job:

1. resolve npm dependencies,
2. `npm audit --audit-level=high`,
3. repository secret scan,
4. TypeScript typecheck,
5. ESLint,
6. deterministic text hygiene,
7. Vitest suite,
8. Vite production build,
9. upload generated `package-lock.json` as a short-lived verification artifact.

Rust job:

1. Rust formatting,
2. Clippy for `keysmith-core` with warnings denied,
3. Rust core tests/property tests,
4. generate `Cargo.lock`,
5. cargo-deny advisory/license/source policy,
6. upload generated `Cargo.lock` as a short-lived verification artifact.

Desktop matrix runs `cargo check -p keysmith --all-targets` on Ubuntu, Windows, and macOS after the frontend and Rust-core jobs succeed.

### CodeQL — `.github/workflows/codeql.yml`

- JavaScript/TypeScript analysis.
- Rust analysis with explicit `keysmith-core` build.

### Release — `.github/workflows/release.yml`

- Tag-triggered draft release builds for Linux, Windows, and macOS.
- macOS uses the universal Apple target configuration.
- Signing/notarization credentials are intentionally not committed.

## Work completed in the current continuation

The continuation performed a file-by-file release audit across the Rust core, desktop adapter, frontend, CI/release configuration, threat model, and documentation, then made the following meaningful changes:

1. Fixed clipboard zeroization behavior inherited from the prior verification work and preserved ownership compatibility with `arboard`.
2. Raised the bounded clipboard payload to support the complete documented maximum batch and added Rust adapter regression tests.
3. Normalized unsupported clipboard preference writes and added frontend tests.
4. Added and enforced a typed custom-symbol validation error at the Rust trust boundary.
5. Added custom-symbol validation regression tests.
6. Fixed the edge case where irrelevant invalid custom-symbol text prevented generation after the symbol class was disabled.
7. Broadened diagnostic redaction coverage and tests.
8. Updated the threat model to reflect actual current limits and mitigations.
9. Externalized static and runtime frontend copy into an English catalog.
10. Added translation application helpers and tests.
11. Added localized preset metadata helpers and tests.
12. Added localized strength-label helpers and tests.
13. Wired the real UI to localization keys and catalog-backed runtime strings.
14. Improved tab semantics with `aria-controls`, roving initial tab focus, and synchronized semantic panel visibility on mode changes.
15. Added a real-markup frontend integration test for the primary password generation/copy/tab journey.
16. Added localization documentation and ADR.
17. Updated README, architecture, development, testing, threat-model, and changelog documentation to match actual implementation.

## Verification status

PR `#1` remains open and mergeable. Every branch write triggers fresh CI/CodeQL runs and the workflows use concurrency cancellation, so older queued/running executions are not release evidence for the newest commit.

Immediately before this ledger update, the previous branch head had new CI and CodeQL runs queued/pending. This ledger commit itself becomes a newer candidate and therefore requires its own fresh checks. Do not infer success from an older commit.

### Required automated evidence on one exact candidate commit

1. `npm audit --audit-level=high`
2. `npm run secret:check`
3. `npm run typecheck`
4. `npm run lint`
5. `npm run format:check`
6. `npm test`
7. `npm run build`
8. `cargo fmt --all -- --check`
9. `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
10. `cargo test -p keysmith-core --all-features`
11. cargo-deny
12. `cargo check -p keysmith --all-targets` on Linux
13. `cargo check -p keysmith --all-targets` on Windows
14. `cargo check -p keysmith --all-targets` on macOS
15. CodeQL JavaScript/TypeScript
16. CodeQL Rust

### Required packaged-application evidence

On Windows, macOS, and Linux:

- fresh launch,
- onboarding first-run/revisit behavior,
- default password generation,
- passphrase generation,
- strength display,
- preset application,
- batch limits/output/export warning,
- clipboard copy,
- conditional clipboard auto-clear without erasing a newer unrelated clipboard value,
- manual clipboard clear,
- light/dark/system themes,
- Settings/About content and external links,
- keyboard-only navigation and visible focus,
- 200% text/display scaling,
- reduced-motion behavior,
- no password history,
- no telemetry or unexpected automatic network request,
- real release screenshots.

## Commands and checks

The connected GitHub environment was used to inspect repository files, the open verification PR, branch heads, workflow definitions, and workflow-run state. The current execution environment does not expose a trusted local checkout with installed Rust/npm dependency state, so local build output is not fabricated.

The authoritative clean checks are configured in GitHub Actions as:

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

Cargo dependency policy and CodeQL run through their GitHub workflows.

## Known limitations / deliberate design decisions

- KeySmith is a generator, not a password manager; no password vault/history is planned.
- No cloud synchronization or telemetry is planned.
- Batch exports are plaintext by design and warn the user.
- Clipboard managers and other processes can observe clipboard content before clearing; auto-clear cannot provide OS-wide secrecy.
- Clipboard contents written into the operating system cannot be retroactively zeroized by the application; `Zeroizing` protects only application-owned buffers where practical.
- No silent automatic update check is implemented because offline-by-default behavior is intentional.
- English is the only shipped UI locale in `0.1.0`; the architecture is ready for more locales but unreviewed translations are not shipped merely to increase feature count.
- The EFF Diceware word list remains English. A different passphrase language requires a separately reviewed word-list source and entropy model.
- Lockfiles are not yet committed because the project must obtain them from a trusted clean dependency resolution. CI is configured to publish them as artifacts when the prerequisite jobs succeed.
- Real screenshots must come from verified packaged builds; placeholder images are not represented as release evidence.
- Signing/notarization requires external platform credentials and must not be faked or committed.
- Branch protection is intentionally deferred until successful current check names are known from a green release-candidate run.

## Next exact tasks

1. Inspect CI and CodeQL for the exact commit produced by this `what_changed.md` update.
2. If any job fails, read the failing job/step logs, fix the root cause in an atomic commit, add regression coverage for behavior defects, update this ledger, and repeat.
3. Once frontend and Rust dependency jobs are green, retrieve their `package-lock.json` and `Cargo.lock` artifacts and commit the verified lockfiles in separate meaningful commits if artifact retrieval is supported.
4. Require a final green CI/CodeQL pass after lockfiles are committed.
5. Run/package Tauri release builds on Windows, macOS, and Linux.
6. Execute every item in `docs/verification.md` against packaged applications.
7. Capture real screenshots and replace the README screenshot note only with verified captures.
8. Enable `main` branch protection using the proven successful check names.
9. Set the `0.1.0` date in `CHANGELOG.md`, update this ledger with final evidence, merge PR #1, and create `v0.1.0` only after all blockers are cleared.
10. Verify the tag-triggered release workflow creates the expected draft artifacts before publishing a stable release.

## Migration notes

There is no credential database and therefore no secret-data migration. Non-secret local preferences currently include:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Future preference schema changes must preserve safe defaults and must never become a generated-secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 is an offline-first desktop password and passphrase generator with OS-backed cryptographic randomness, EFF Diceware passphrases, zxcvbn strength estimates, password-policy presets, batch generation, guarded plaintext export, conditional clipboard auto-clear, onboarding, privacy/accessibility/settings surfaces, English-first internationalization-ready UI architecture, cross-platform Tauri packaging, security documentation, and automated quality/security workflows.

No account, telemetry, cloud sync, or password-history service is included.

## Recent meaningful commits

Current continuation:

- `e41806ab` — `docs: link localization architecture decision`
- `a8a57346` — `docs: record frontend localization boundary ADR`
- `ff08b401` — `docs: record release-candidate hardening`
- `42d1609b` — `docs: document frontend integration coverage`
- `f9f68078` — `test: cover primary frontend generation journey`
- `352e3527` — `docs: document localization presentation boundary`
- `67d176f2` — `docs: add localization development rules`
- `cc428ef6` — `docs: document localization-ready frontend`
- `8ae3c20d` — `docs: document localization architecture`
- `2d705c12` — `feat: localize presets and strength output`
- `90e94945` — `test: cover localized strength labels`
- `ad38a361` — `feat: map strength scores to localized labels`
- `19200757` — `feat: localize password strength labels`
- `2d8eafb1` — `test: cover localized preset metadata`
- `d5e70507` — `feat: localize built-in preset metadata`
- `d9ff4623` — `test: allow irrelevant custom symbols when disabled`
- `f9b4396e` — `fix: ignore unused custom symbols when disabled`
- `e6fba988` — `feat: localize password preset copy`
- `a5ff8f26` — `refactor: keep localization catalogs immutable`
- `48f617a6` — `feat: localize generated secret accessibility label`
- `661abdca` — `feat: wire static UI to localization keys`
- `a6c11922` — `refactor: source runtime UI copy from locale catalog`
- `b900790c` — `test: cover localization applicator`
- `e3c524b0` — `feat: add document localization applicator`
- `f04a0665` — `feat: expand English localization catalog`
- `08df5fb4` — `docs: align threat model with IPC validation`
- `947c8dbe` — `test: cover expanded diagnostic redaction`
- `b43ce6ac` — `security: broaden structured log redaction keys`
- `7f4a4bc6` — `test: cover custom symbol validation`
- `27059106` — `fix: validate custom symbols at core boundary`
- `0a1d2459` — `feat: add custom symbol validation error`
- `db644a9d` — `test: cover invalid clipboard preference writes`
- `5aa26e08` — `fix: validate clipboard preference writes`
- `596185a5` — `fix: support maximum batch clipboard output`

Immediately preceding security fixes:

- `891545a1` — `test: document clipboard zeroization invariant`
- `b9502874` — `fix: pass owned clipboard text to arboard`
- `49358e95` — `fix: zeroize clipboard secrets on every return path`

## Commit identity

Project-maintainer commits must use `Sanskar <sanskarin@outlook.in>`. Connected GitHub writes continue to use the repository maintainer identity; do not introduce a different project commit email in local release work.
