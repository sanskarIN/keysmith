# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `0.1.0-rc`
Current milestone: Phase 4 / release-candidate verification and hardening
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Verification branch: `verify/0.1.0-rc`
Pull request: `#1` — `ci: verify KeySmith 0.1.0 release candidate`
Required commit email: `sanskarin@outlook.in`

This is the canonical continuation ledger. Read it before changing the repository. Do not mark `0.1.0` stable until the exact candidate commit passes all automated checks plus packaged-application verification.

## Current implementation

### Architecture and repository

- Rust 2024 workspace with framework-independent `keysmith-core`.
- Tauri 2 desktop adapter and Vanilla TypeScript/Vite presentation layer.
- Windows, macOS, and Linux packaging configuration.
- Apache-2.0 license, NOTICE, public/open-source repository metadata, support/funding information, issue forms, PR template, Dependabot, CI, CodeQL, and release workflow.
- Security-sensitive generation/validation logic is isolated in Rust and does not trust HTML input constraints.
- ADRs document the Rust/Tauri boundary, OS-CSPRNG/no-secret-storage policy, and presentation-layer localization boundary.
- `ROADMAP.md` now reflects actual release-candidate work rather than listing already-completed UI/accessibility coverage as future work.

### Password generation

- OS CSPRNG through `getrandom`.
- Rejection sampling for unbiased bounded selection.
- Secure Fisher-Yates-style shuffle using the same random source.
- Password length: 4–128.
- Lowercase, uppercase, digit, symbol, custom-symbol, and ambiguity-exclusion controls.
- At least one character from every enabled class.
- Batch generation: 1–500 passwords.
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.
- Rust-core custom-symbol validation:
  - at most 40 characters,
  - no control characters,
  - no whitespace,
  - no alphanumeric characters, so the enabled symbol class cannot silently become another letter/digit class,
  - irrelevant invalid custom-symbol text is ignored when the symbol class is disabled.

### Passphrases and strength

- EFF large Diceware list through `eff-wordlist`.
- 3–12 words.
- Separator validation, optional capitalization, optional two-digit suffix.
- Selection-space entropy estimate.
- zxcvbn strength scoring and guess estimates.
- Single-password and passphrase commands include strength metadata because those UI views display it.
- Frontend maps stable zxcvbn scores to localized display labels while retaining backend fallback text for unknown future scores.

### Batch performance

- Batch generation returns a lightweight `BatchSecretResult { secret }` for each item.
- The desktop adapter no longer runs zxcvbn for every batch item because the Batch UI does not display per-item strength.
- At the maximum 500-item batch, this removes up to 500 unnecessary zxcvbn evaluations while preserving cryptographic password generation unchanged.
- TypeScript batch state and IPC types are also strength-free, preventing accidental reliance on metadata that the UI does not use.
- `docs/performance.md` records this design and explicitly forbids invented benchmark numbers; release-build measurements remain required before publishing timing claims.

### Clipboard and batch export

- Explicit Rust/Tauri clipboard copy command.
- Auto-clear options: never, 15 seconds, 30 seconds, 1 minute, 2 minutes.
- Delayed clear occurs only if clipboard content still equals the copied value.
- Manual clipboard clear.
- Command-owned secret buffers use `Zeroizing<String>` so application-owned copies are cleared even on early error returns where practical.
- Clipboard payload cap is 65,536 characters, large enough for the maximum documented `500 × 128` password batch plus separators while still bounding IPC input.
- Unsupported clipboard-clear preference writes normalize to the privacy-oriented 30-second default.
- Batch export is explicit plaintext with both an in-product warning and warning header in the file.

### UI/UX and accessibility

- Responsive desktop layout and reusable design tokens.
- Password, Passphrase, and Batch modes.
- Live strength display and preset policy selector.
- Light, dark, and system themes.
- First-run onboarding with only a non-secret local completion flag.
- Settings: appearance, privacy/data, accessibility, updates, onboarding help.
- About: version, Apache-2.0, support/business contacts, GitHub, Buy Me a Coffee, `Made by the Sanskar`.
- Skip link, semantic labels/fieldsets, aria-live output/status, visible focus, reduced-motion support, touch-friendly controls, non-color-only status text.
- Generator tabs use `aria-controls`, roving tab focus, arrow-key navigation, and semantic panel `hidden` state.
- Static accessibility regression tests validate unique IDs, explicit label targets, tab/panel relationships, button accessible names, and dialog labelling against the real `index.html`.
- Primary-button foreground/background design tokens are tested against the WCAG AA 4.5:1 normal-text contrast target in light and dark themes.
- Light theme uses a white accent foreground; dark theme retains a dark accent foreground for sufficient contrast.
- Localized trust-list markup no longer inherits success coloring intended only for check icons.

### Internationalization readiness

English is the only shipped locale for `0.1.0`, but visible frontend copy is externalized.

- `src/i18n/en.ts` — canonical English catalog and runtime formatters.
- `src/i18n/index.ts` — applies `data-i18n`, `data-i18n-title`, `data-i18n-aria-label`, and `data-i18n-placeholder` values.
- Unknown translation keys retain readable HTML fallback text.
- `src/i18n/presets.ts` — localized built-in preset metadata with backend fallback for future IDs.
- `src/i18n/strength.ts` — localized strength labels with fallback for future scores.
- Static markup and runtime status/preset/strength copy use the catalog.
- `docs/i18n.md` documents adding locales without changing security-sensitive generation behavior.
- `docs/adr/0003-frontend-localization-boundary.md` records the architecture decision.

### Privacy, diagnostics, and security

- No account requirement.
- No telemetry or analytics.
- No password history.
- No generation-time network dependency.
- Restrictive Tauri CSP and explicit least-privilege capabilities.
- Typed Rust errors with user-safe IPC messages.
- `.env.example` contains placeholders only.
- `deny.toml` enforces Rust advisory/license/source policy.
- CI runs npm high-severity audit and a high-confidence repository secret scanner.
- CodeQL covers Rust and JavaScript/TypeScript.
- Structured diagnostic redaction recursively protects password, passphrase, secret, token, authorization, cookie, email, credential, API-key, session, and private-key style fields.
- `THREAT_MODEL.md` is aligned with current clipboard bounds, IPC validation, custom-symbol punctuation policy, preference normalization, and diagnostic redaction.

## Automated test coverage

### Rust

- Required enabled character classes.
- Ambiguous-character exclusion.
- Batch-size limits.
- Passphrase word-count behavior.
- Property tests across password lengths and restricted character sets.
- Invalid password lengths and missing character sets.
- Exact custom-symbol policy behavior.
- Oversized/control/whitespace/alphanumeric custom-symbol rejection.
- Invalid custom symbols ignored when symbols are disabled.
- Ambiguity filtering that empties a symbol pool.
- Invalid passphrase word counts and separators.
- Desktop clipboard helper accepts maximum supported batch text and rejects over-limit input without requiring a real clipboard.

### TypeScript / frontend

- Clipboard preference defaults, persistence, invalid stored values, invalid writes, non-integer writes.
- Theme and onboarding persistence.
- Tauri command mapping and bridge-unavailable failure normalization.
- Lightweight secret-only batch IPC response shape.
- Batch export warning/formatting.
- Diagnostic redaction and recursion-depth bounds.
- Localization application and fallback behavior.
- Localized preset and strength metadata.
- Static accessibility structure against the real `index.html`.
- Design-token primary-button contrast budget.
- `src/app.integration.test.ts` loads the real `index.html` in jsdom, installs a typed mocked Tauri bridge, verifies localized preset metadata, generates and copies a password, switches mode from the keyboard, generates a passphrase and verifies entropy/strength presentation, switches to Batch, consumes lightweight secret-only batch results, verifies batch action enablement, and copies all batch secrets with the configured 30-second auto-clear value.

The jsdom/static checks do not replace packaged native testing.

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

### `.github/workflows/ci.yml`

Frontend job runs dependency resolution, `npm audit --audit-level=high`, repository secret scan, typecheck, ESLint, text hygiene, Vitest, Vite build, and publishes the generated `package-lock.json` as a short-lived artifact.

Rust job runs formatting, `keysmith-core` Clippy with warnings denied, core tests/property tests, lockfile generation, cargo-deny, and publishes the generated `Cargo.lock` as a short-lived artifact.

Desktop matrix runs `cargo check -p keysmith --all-targets` on Ubuntu, Windows, and macOS after frontend/Rust-core prerequisites succeed.

### `.github/workflows/codeql.yml`

- JavaScript/TypeScript analysis.
- Rust analysis with explicit `keysmith-core` build.

### `.github/workflows/release.yml`

- Tag-triggered Tauri draft release builds for Linux, Windows, and macOS.
- macOS universal target configuration.
- No signing/notarization secrets in source control.

## Current continuation work

This continuation audited the existing verification branch and added/fixed all of the following with atomic commits:

1. Clipboard secret zeroization on error paths and owned-string compatibility with `arboard`.
2. Clipboard payload bound compatible with the maximum documented batch plus Rust regression tests.
3. Clipboard auto-clear preference write normalization plus regression tests.
4. Typed Rust custom-symbol validation error.
5. Core validation for custom-symbol size/control/whitespace rules.
6. Regression coverage for custom-symbol validation.
7. Fix for irrelevant custom symbols when the symbol class is disabled.
8. Explicit custom-symbol punctuation-only policy so alphanumeric input cannot satisfy the symbol class.
9. Regression coverage adjusted for punctuation policy and ambiguity filtering.
10. Diagnostic redaction expansion and tests.
11. Threat-model synchronization.
12. English localization catalog expansion.
13. Static translation applicator and tests.
14. Localized preset metadata and tests.
15. Localized strength labels and tests.
16. Runtime UI localization wiring.
17. Static markup localization wiring.
18. Accessibility-label localization.
19. Immutable localization catalog typing.
20. Localization documentation and ADR.
21. README/development/architecture/testing documentation updates.
22. Real-markup frontend integration test and typed/lint-clean mocked Tauri bridge.
23. Static accessibility regression test suite.
24. Accessibility documentation update.
25. Trust-list styling regression fix after localization markup changes.
26. Primary-button contrast fix using theme-specific accent foreground tokens.
27. Automated design-token contrast regression test.
28. CHANGELOG updates for release-candidate hardening and accessibility work.
29. Clippy-oriented cleanup of the custom-symbol validation branch.
30. Roadmap audit and correction so completed regression/i18n/security work is no longer listed as future 0.2 scope.
31. Batch desktop result split from full strength-bearing `SecretResult` so maximum-size batch generation skips unused zxcvbn evaluations.
32. Lightweight `BatchSecretResult` contract added to TypeScript IPC types and UI state.
33. IPC regression coverage confirms batch responses are secret-only.
34. Real-markup integration coverage expanded to Password, Passphrase, and Batch workflows.
35. Performance documentation updated with the batch optimization and a no-invented-benchmark measurement policy.
36. Architecture/testing/changelog documentation synchronized with the new batch boundary and coverage.

## Verification status

PR `#1` remains the release-candidate PR. Repeated atomic commits intentionally trigger fresh CI/CodeQL runs; workflow concurrency cancels superseded runs. Older green/cancelled runs are not release evidence for a newer security-sensitive or performance-sensitive commit.

This ledger update is the final documentation commit for the current audit and therefore becomes the newest candidate requiring a fresh CI/CodeQL result. Do not merge or tag based on an older run.

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
13. same check on Windows
14. same check on macOS
15. CodeQL JavaScript/TypeScript
16. CodeQL Rust

### Required packaged-application evidence

On Windows, macOS, and Linux:

- clean launch,
- onboarding first-run/revisit,
- password/passphrase generation,
- strength/presets,
- maximum-size batch generation responsiveness,
- batch limits and plaintext export warning,
- clipboard copy/conditional auto-clear/manual clear,
- light/dark/system themes,
- Settings/About links and metadata,
- keyboard-only flow and focus visibility,
- screen-reader label review,
- 200% scaling/text expansion,
- reduced-motion behavior,
- no password history,
- no telemetry or unexpected automatic network request,
- real release screenshots.

## Commands and verification environment

The connected GitHub environment was used to inspect and mutate the real repository, branch, PR, workflow definitions, and workflow-run state. The available local shell has Node/npm and Git but no Rust/Cargo toolchain; external npm registry access also timed out. Therefore local clean dependency/build results are not fabricated.

Authoritative clean checks are configured in GitHub Actions:

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

Cargo dependency policy and CodeQL run through GitHub Actions.

## Known limitations / deliberate decisions

- KeySmith is a generator, not a password manager; no vault/history is planned.
- No cloud sync or telemetry is planned.
- Batch exports are plaintext by design and warn the user.
- Clipboard managers/processes may observe content before clearing; application auto-clear cannot provide OS-wide secrecy.
- `Zeroizing` protects application-owned buffers, not copies already handed to the operating system clipboard.
- No silent background update check because offline-by-default behavior is intentional.
- English is the only shipped UI locale in `0.1.0`; additional locales require translation and accessibility review.
- EFF Diceware remains English; another passphrase language requires a separately reviewed word-list source and entropy model.
- Verified lockfiles are not yet committed; CI is configured to generate and publish them after successful dependency resolution.
- Real screenshots must come from verified packaged builds.
- Signing/notarization requires external platform credentials and must not be faked or committed.
- Branch protection remains deferred until the successful current check names are known.
- Exact release-build performance numbers remain unclaimed until measured on representative supported hardware.

## Next exact tasks

1. Inspect CI and CodeQL for the exact commit created by this ledger update.
2. Read every failed job/step log and fix root causes with regression coverage where behavior changes.
3. Repeat until all automated jobs are green on the same commit.
4. Retrieve CI-generated `package-lock.json` and `Cargo.lock` artifacts and commit verified lockfiles separately if artifact retrieval succeeds.
5. Run a final green CI/CodeQL pass with committed lockfiles.
6. Build/package Windows, macOS, and Linux applications and execute every item in `docs/verification.md`.
7. Record measured release-build performance according to `docs/performance.md` without inventing timings.
8. Capture real screenshots from verified builds and update README/release notes.
9. Enable `main` branch protection using proven successful check names.
10. Finalize the `0.1.0` date in `CHANGELOG.md`, update this ledger with release evidence, merge PR #1, and create `v0.1.0` only after every blocker is cleared.
11. Verify the tag-triggered release workflow creates the expected draft artifacts before publishing stable artifacts.

## Migration notes

There is no credential database and therefore no secret-data migration. Non-secret preferences currently use:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Future preference changes must preserve safe defaults and must never become generated-secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 is an offline-first desktop password and passphrase generator with OS-backed cryptographic randomness, EFF Diceware passphrases, zxcvbn strength estimates for interactive single-secret views, optimized strength-free batch generation, password-policy presets, guarded plaintext export, conditional clipboard auto-clear, onboarding, privacy/accessibility/settings surfaces, English-first internationalization-ready UI architecture, cross-platform Tauri packaging, security documentation, and automated quality/security workflows.

No account, telemetry, cloud sync, or password-history service is included.

## Recent meaningful commits

Newest performance/documentation work:

- `6c220d9a` — `docs: align integration coverage with all modes`
- `12ddf8f7` — `docs: document lightweight batch IPC boundary`
- `225de8e4` — `test: cover passphrase and batch UI journeys`
- `a8e30ca5` — `test: avoid unsafe batch result assertion`
- `135cb316` — `docs: record batch performance optimization`
- `df25fb97` — `docs: record batch generation performance optimization`
- `1d7321a7` — `test: cover strength-free batch IPC results`
- `53381718` — `perf: keep batch state strength-free`
- `fa802ba9` — `perf: use lightweight batch IPC result`
- `4e651c34` — `refactor: define lightweight batch result type`
- `641152f8` — `refactor: simplify batch result mapping`
- `1260635b` — `perf: skip strength scoring for batch output`
- `2479556a` — `docs: align roadmap with release candidate`

Earlier hardening/testing/docs work:

- `df8e68ae` — `docs: clarify custom symbol punctuation policy`
- `e00a24e8` — `refactor: keep custom symbol validation clippy-clean`
- `53817017` — `test: cover custom symbol punctuation policy`
- `6bcc9af5` — `fix: reject alphanumeric custom symbols`
- `4ebcd474` — `fix: define custom symbols as punctuation`
- `880877e1` — `docs: record accessibility hardening`
- `d2257774` — `docs: document accessibility and contrast tests`
- `b66fd364` — `test: enforce primary button contrast budget`
- `2920af25` — `fix: meet primary button contrast target`
- `705445cb` — `fix: preserve trust list text styling after localization`
- `d3ab5a1b` — `docs: document accessibility regression checks`
- `6d31ff9e` — `test: add static accessibility regression checks`
- `fc0a713e` — `refactor: type mocked Tauri bridge explicitly`
- `4d66d6ab` — `fix: keep integration bridge mock lint-clean`
- `f9f68078` — `test: cover primary frontend generation journey`
- `a8a57346` — `docs: record frontend localization boundary ADR`
- `ff08b401` — `docs: record release-candidate hardening`
- `2d705c12` — `feat: localize presets and strength output`
- `90e94945` — `test: cover localized strength labels`
- `ad38a361` — `feat: map strength scores to localized labels`
- `d5e70507` — `feat: localize built-in preset metadata`
- `2d8eafb1` — `test: cover localized preset metadata`
- `f9b4396e` — `fix: ignore unused custom symbols when disabled`
- `d9ff4623` — `test: allow irrelevant custom symbols when disabled`
- `947c8dbe` — `test: cover expanded diagnostic redaction`
- `b43ce6ac` — `security: broaden structured log redaction keys`
- `27059106` — `fix: validate custom symbols at core boundary`
- `7f4a4bc6` — `test: cover custom symbol validation`
- `596185a5` — `fix: support maximum batch clipboard output`
- `5aa26e08` — `fix: validate clipboard preference writes`
- `db644a9d` — `test: cover invalid clipboard preference writes`

Earlier clipboard zeroization fixes:

- `891545a1` — `test: document clipboard zeroization invariant`
- `b9502874` — `fix: pass owned clipboard text to arboard`
- `49358e95` — `fix: zeroize clipboard secrets on every return path`

## Commit identity

Project-maintainer commits must use `Sanskar <sanskarin@outlook.in>`. Connected GitHub writes use the repository maintainer identity; local release work must not introduce a different commit email.
